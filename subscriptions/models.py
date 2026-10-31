import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone


class QuotationTemplate(models.Model):
    """
    Objective 4: Quotation template with pre-configured plan and product lines.
    Allows sales reps to quickly create consistent quotes valid for X days.
    """
    name = models.CharField(max_length=200, help_text="Template title, e.g., 'Standard SaaS Onboarding'")
    plan = models.ForeignKey(
        'catalog.Plan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotation_templates',
        help_text="Default subscription plan"
    )
    validity_days = models.PositiveIntegerField(
        default=30,
        help_text="Number of days quotation stays valid"
    )
    description = models.TextField(blank=True, help_text="Internal notes or terms")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (Valid: {self.validity_days} days)"


class QuotationTemplateLine(models.Model):
    """
    Individual product line inside a quotation template.
    """
    template = models.ForeignKey(
        QuotationTemplate,
        on_delete=models.CASCADE,
        related_name='lines'
    )
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.CASCADE,
        related_name='+',
        null=True,
        blank=True
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return f"Line for {self.template.name} - Qty {self.quantity}"

    @property
    def total_amount(self):
        return Decimal(self.quantity) * Decimal(self.unit_price)


class Subscription(models.Model):
    """
    Objective 4: Central Subscription model.
    Full lifecycle: Draft -> Quotation -> Confirmed -> Active -> Closed.
    """
    STATUS_DRAFT = 'draft'
    STATUS_QUOTATION = 'quotation'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_ACTIVE = 'active'
    STATUS_CLOSED = 'closed'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_QUOTATION, 'Quotation'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_CLOSED, 'Closed'),
    ]

    PAYMENT_TERMS = [
        ('immediate', 'Immediate Payment'),
        ('net15', 'Net 15 Days'),
        ('net30', 'Net 30 Days'),
    ]

    # Unique human-readable number e.g. SUB-202610-0001
    subscription_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text="Unique subscription number"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        db_index=True,
        null=True,
        blank=True,
        help_text="The customer who owns this subscription"
    )
    template = models.ForeignKey(
        QuotationTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions',
        help_text="Original template if generated from one"
    )
    plan = models.ForeignKey(
        'catalog.Plan',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='subscriptions',
        help_text="Associated billing plan"
    )
    start_date = models.DateField(default=timezone.now)
    expiry_date = models.DateField(
        null=True,
        blank=True,
        help_text="Expiry date for quotation or subscription duration"
    )
    next_billing_date = models.DateField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Date when next recurring invoice must be created"
    )
    payment_terms = models.CharField(
        max_length=50,
        choices=PAYMENT_TERMS,
        default='immediate'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
        db_index=True
    )
    notes = models.TextField(blank=True, help_text="Internal notes or customer remarks")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subscription_number} - {self.customer} ({self.get_status_display()})"

    @classmethod
    def generate_unique_number(cls):
        """Generates a sequential human-readable subscription number SUB-XXXX."""
        import random
        prefix = timezone.now().strftime('SUB-%Y%m-')
        random_suffix = f"{random.randint(1000, 9999)}"
        num = f"{prefix}{random_suffix}"
        try:
            while cls.objects.filter(subscription_number=num).exists():
                random_suffix = f"{random.randint(1000, 9999)}"
                num = f"{prefix}{random_suffix}"
        except Exception:
            pass
        return num

    def save(self, *args, **kwargs):
        if not self.subscription_number:
            self.subscription_number = self.generate_unique_number()
        # Set next_billing_date if active and not set
        if self.status == self.STATUS_ACTIVE and not self.next_billing_date:
            self.next_billing_date = self.start_date
        super().save(*args, **kwargs)

    @property
    def subtotal(self):
        """Calculate line totals without tax."""
        return sum(line.amount for line in self.lines.all())

    @property
    def total_tax(self):
        """Calculate total tax from line items."""
        total = Decimal('0.00')
        for line in self.lines.all():
            if line.tax_rule and line.tax_rule.is_active:
                total += (line.amount * line.tax_rule.rate) / Decimal('100.00')
        return round(total, 2)

    @property
    def grand_total(self):
        return self.subtotal + self.total_tax

    # State Transition Validations
    def can_transition_to(self, new_status):
        """
        Validates allowed lifecycle moves:
        Draft -> Quotation -> Confirmed -> Active -> Closed
        Can also close from any state.
        """
        allowed = {
            self.STATUS_DRAFT: [self.STATUS_QUOTATION, self.STATUS_CLOSED],
            self.STATUS_QUOTATION: [self.STATUS_CONFIRMED, self.STATUS_CLOSED],
            self.STATUS_CONFIRMED: [self.STATUS_ACTIVE, self.STATUS_CLOSED],
            self.STATUS_ACTIVE: [self.STATUS_CLOSED],
            self.STATUS_CLOSED: [self.STATUS_ACTIVE], # Can be reopened/renewed
        }
        return new_status in allowed.get(self.status, [])


class SubscriptionLine(models.Model):
    """
    Line items on a subscription: product, quantity, unit price, tax, and calculated amount.
    """
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='lines'
    )
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscription_lines'
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_rule = models.ForeignKey(
        'billing.TaxRule',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscription_lines'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Calculated line total (quantity * unit_price)"
    )

    def save(self, *args, **kwargs):
        # Always keep amount updated = qty * unit_price
        self.amount = Decimal(self.quantity) * Decimal(self.unit_price)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product} (x{self.quantity}) - {self.amount}"
