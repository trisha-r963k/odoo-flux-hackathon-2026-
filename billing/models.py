import random
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone


class TaxRule(models.Model):
    """
    Objective 5: Admin-defined tax rules (e.g. GST 18%, VAT 5%).
    Taxes calculate automatically when invoices are generated.
    """
    name = models.CharField(max_length=100, help_text="e.g., GST 18%, State VAT 5%")
    rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Percentage tax rate (e.g. 18.00 for 18%)"
    )
    is_active = models.BooleanField(default=True, help_text="Inactive tax rules are not applied to new invoices")
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.rate}%)"


class Invoice(models.Model):
    """
    Objective 5: Recurring Invoice generated from a Subscription.
    Status flow: Draft -> Confirmed -> Paid (and Cancelled).
    Guarantees that a subscription period can NEVER be billed twice.
    """
    STATUS_DRAFT = 'draft'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_PAID = 'paid'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_PAID, 'Paid'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text="Unique invoice identifier (e.g. INV-202610-0001)"
    )
    subscription = models.ForeignKey(
        'subscriptions.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
        help_text="The originating subscription"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='invoices',
        db_index=True,
        null=True,
        blank=True,
        help_text="Customer billed"
    )
    invoice_date = models.DateField(default=timezone.now)
    period_start_date = models.DateField(help_text="Billing period start")
    period_end_date = models.DateField(help_text="Billing period end")
    due_date = models.DateField(db_index=True, help_text="Payment due date")

    # Financial totals
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
        db_index=True
    )
    notes = models.TextField(blank=True, help_text="Terms, payment instructions, or remarks")
    sent_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when invoice was marked sent")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-invoice_date', '-created_at']
        constraints = [
            # CRUCIAL CONSTRAINT: The exact same subscription period can NEVER be billed twice!
            models.UniqueConstraint(
                fields=['subscription', 'period_start_date'],
                name='unique_subscription_period_billing'
            )
        ]

    def __str__(self):
        return f"{self.invoice_number} - {self.customer} (₹{self.total_amount})"

    @classmethod
    def generate_unique_number(cls):
        """Generates a sequential human-readable invoice number INV-YYYYMM-XXXX."""
        prefix = timezone.now().strftime('INV-%Y%m-')
        random_suffix = f"{random.randint(1000, 9999)}"
        num = f"{prefix}{random_suffix}"
        try:
            while cls.objects.filter(invoice_number=num).exists():
                random_suffix = f"{random.randint(1000, 9999)}"
                num = f"{prefix}{random_suffix}"
        except Exception:
            pass
        return num

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self.generate_unique_number()
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Check if invoice is overdue (past due date and not paid)."""
        if self.status != self.STATUS_PAID and self.status != self.STATUS_CANCELLED:
            return self.due_date < timezone.now().date()
        return False

    def recalculate_totals(self):
        """Recalculate subtotal, taxes, and grand total from line items."""
        lines = self.lines.all()
        self.subtotal = sum(line.subtotal for line in lines)
        self.tax_amount = sum(line.tax_amount for line in lines)
        self.total_amount = max(Decimal('0.00'), (self.subtotal + self.tax_amount) - self.discount_amount)
        self.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])


class InvoiceLine(models.Model):
    """
    Individual billable line item on an invoice with automatic tax snapshot.
    """
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='lines'
    )
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoice_lines'
    )
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_rule = models.ForeignKey(
        TaxRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    def save(self, *args, **kwargs):
        self.subtotal = Decimal(self.quantity) * Decimal(self.unit_price)
        if self.tax_rule and self.tax_rule.is_active:
            self.tax_rate = self.tax_rule.rate
            self.tax_amount = round((self.subtotal * self.tax_rate) / Decimal('100.00'), 2)
        else:
            self.tax_rate = Decimal('0.00')
            self.tax_amount = Decimal('0.00')
        self.total_amount = self.subtotal + self.tax_amount
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} (x{self.quantity}) - ₹{self.total_amount}"

