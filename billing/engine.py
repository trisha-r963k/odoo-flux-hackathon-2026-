from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from .models import Invoice, InvoiceLine, TaxRule


def calculate_period_end(start_date, billing_period='monthly'):
    """Calculates the end date of a billing cycle based on the plan's period."""
    period = (billing_period or 'monthly').lower()
    if period == 'daily':
        return start_date + timedelta(days=1)
    elif period == 'weekly':
        return start_date + timedelta(days=7)
    elif period == 'yearly':
        return start_date + timedelta(days=365)
    else:  # default monthly
        return start_date + timedelta(days=30)


def calculate_due_date(invoice_date, payment_terms='immediate'):
    """Calculates payment due date based on agreed terms."""
    terms = (payment_terms or 'immediate').lower()
    if terms == 'net15':
        return invoice_date + timedelta(days=15)
    elif terms == 'net30':
        return invoice_date + timedelta(days=30)
    else:
        return invoice_date  # Immediate


def run_billing_for_subscription(subscription, run_date=None):
    """
    Creates a recurring invoice from a single active subscription.
    Enforces the strict business rule:
    NEVER bill the same period twice (atomic check on period_start_date).
    """
    if run_date is None:
        run_date = timezone.now().date()

    period_start = subscription.next_billing_date or subscription.start_date
    billing_period = getattr(subscription.plan, 'billing_period', 'monthly') if subscription.plan else 'monthly'
    period_end = calculate_period_end(period_start, billing_period)
    due_date = calculate_due_date(run_date, subscription.payment_terms)

    # 1. Anti-Duplicate Check: Prevent billing if invoice for this period already exists
    if Invoice.objects.filter(subscription=subscription, period_start_date=period_start).exists():
        return None, "Already billed for this cycle."

    with transaction.atomic():
        # 2. Create the Draft Invoice
        invoice = Invoice.objects.create(
            subscription=subscription,
            customer=subscription.customer,
            invoice_date=run_date,
            period_start_date=period_start,
            period_end_date=period_end,
            due_date=due_date,
            status=Invoice.STATUS_DRAFT,
            notes=f"Recurring billing for {subscription.subscription_number} ({period_start} to {period_end})"
        )

        subtotal = Decimal('0.00')
        tax_total = Decimal('0.00')

        # 3. Copy Subscription lines into Invoice lines with automatic tax calculation
        for sub_line in subscription.lines.all():
            tax_rule = sub_line.tax_rule
            tax_rate = tax_rule.rate if (tax_rule and tax_rule.is_active) else Decimal('0.00')
            line_subtotal = Decimal(sub_line.quantity) * Decimal(sub_line.unit_price)
            line_tax = round((line_subtotal * tax_rate) / Decimal('100.00'), 2)
            line_total = line_subtotal + line_tax

            InvoiceLine.objects.create(
                invoice=invoice,
                product=sub_line.product,
                description=str(sub_line.product.name if sub_line.product else "Subscription Item"),
                quantity=sub_line.quantity,
                unit_price=sub_line.unit_price,
                tax_rule=tax_rule,
                tax_rate=tax_rate,
                subtotal=line_subtotal,
                tax_amount=line_tax,
                total_amount=line_total,
            )
            subtotal += line_subtotal
            tax_total += line_tax

        invoice.subtotal = subtotal
        invoice.tax_amount = tax_total
        invoice.total_amount = subtotal + tax_total
        invoice.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])

        # 4. Advance subscription's next_billing_date to period_end
        subscription.next_billing_date = period_end
        # Check auto-close on plan expiry if applicable
        if subscription.expiry_date and period_end >= subscription.expiry_date:
            auto_close = getattr(subscription.plan, 'auto_close', False) if subscription.plan else False
            if auto_close:
                subscription.status = 'closed'
        subscription.save(update_fields=['next_billing_date', 'status'])

    return invoice, "Success"


def run_all_due_billing(target_date=None):
    """
    Objective 5: One-click Billing Generator!
    Finds all active subscriptions due on or before target_date,
    creates their recurring invoices, and advances billing periods safely.
    """
    if target_date is None:
        target_date = timezone.now().date()

    from subscriptions.models import Subscription

    due_subscriptions = Subscription.objects.filter(
        status='active',
        next_billing_date__lte=target_date
    ).select_related('customer', 'plan').prefetch_related('lines__product', 'lines__tax_rule')

    generated_invoices = []
    skipped_count = 0

    for sub in due_subscriptions:
        invoice, message = run_billing_for_subscription(sub, target_date)
        if invoice:
            generated_invoices.append(invoice)
        else:
            skipped_count += 1

    return {
        'total_evaluated': due_subscriptions.count(),
        'created_count': len(generated_invoices),
        'skipped_count': skipped_count,
        'invoices': generated_invoices
    }

