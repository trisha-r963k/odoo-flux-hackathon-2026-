from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from .models import Invoice, InvoiceLine, TaxRule
from .forms import TaxRuleForm, InvoiceForm, InvoiceLineForm
from .engine import run_all_due_billing, run_billing_for_subscription


def is_staff_or_admin(user):
    """Check if user has staff or admin role."""
    if not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    return getattr(user, 'role', '') in ['admin', 'staff']


def is_admin(user):
    """Check if user is specifically admin."""
    if not user.is_authenticated:
        return False
    return user.is_superuser or getattr(user, 'role', '') == 'admin'


# ==============================================================================
# INVOICE VIEWS
# ==============================================================================

@login_required
def invoice_list(request):
    """
    List invoices with search, status filters, and pagination (25 per page).
    Portal isolation: Customers only see their own invoices!
    """
    user = request.user
    queryset = Invoice.objects.select_related('customer', 'subscription').prefetch_related('lines').all()

    # Customer isolation
    if not is_staff_or_admin(user):
        queryset = queryset.filter(customer=user)

    # Search filter
    q = request.GET.get('q', '').strip()
    if q:
        queryset = queryset.filter(
            Q(invoice_number__icontains=q) |
            Q(customer__username__icontains=q) |
            Q(subscription__subscription_number__icontains=q)
        )

    # Status filter
    status = request.GET.get('status', '').strip()
    if status:
        queryset = queryset.filter(status=status)

    # Paginate (25 per page as required)
    paginator = Paginator(queryset, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'search_query': q,
        'status_filter': status,
        'is_staff_admin': is_staff_or_admin(user),
        'status_choices': Invoice.STATUS_CHOICES,
    }
    return render(request, 'billing/invoice_list.html', context)


@login_required
def invoice_detail(request, pk):
    """
    View invoice detail with line items, tax breakdowns, and action controls.
    """
    user = request.user
    invoice = get_object_or_404(
        Invoice.objects.select_related('customer', 'subscription').prefetch_related('lines__product', 'lines__tax_rule'),
        pk=pk
    )

    # Customer portal security check
    if not is_staff_or_admin(user) and invoice.customer != user:
        messages.error(request, "Permission denied.")
        return redirect('billing:invoice_list')

    context = {
        'invoice': invoice,
        'lines': invoice.lines.all(),
        'is_staff_admin': is_staff_or_admin(user),
    }
    return render(request, 'billing/invoice_detail.html', context)


@login_required
def invoice_print(request, pk):
    """
    Objective 5: Clean printable browser view for an invoice (window.print()).
    """
    user = request.user
    invoice = get_object_or_404(
        Invoice.objects.select_related('customer', 'subscription').prefetch_related('lines'),
        pk=pk
    )

    if not is_staff_or_admin(user) and invoice.customer != user:
        messages.error(request, "Permission denied.")
        return redirect('billing:invoice_list')

    return render(request, 'billing/invoice_print.html', {'invoice': invoice, 'lines': invoice.lines.all()})


@login_required
def invoice_confirm(request, pk):
    """Transition: Draft -> Confirmed (Staff/Admin only)."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('billing:invoice_detail', pk=pk)

    invoice = get_object_or_404(Invoice, pk=pk)
    if invoice.status == Invoice.STATUS_DRAFT:
        invoice.status = Invoice.STATUS_CONFIRMED
        invoice.save(update_fields=['status'])
        messages.success(request, f"Invoice {invoice.invoice_number} is now Confirmed.")
    else:
        messages.warning(request, f"Cannot confirm invoice in {invoice.get_status_display()} status.")

    return redirect('billing:invoice_detail', pk=pk)


@login_required
def invoice_cancel(request, pk):
    """Action: Cancel an invoice (Staff/Admin only)."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('billing:invoice_detail', pk=pk)

    invoice = get_object_or_404(Invoice, pk=pk)
    if invoice.status != Invoice.STATUS_PAID:
        invoice.status = Invoice.STATUS_CANCELLED
        invoice.save(update_fields=['status'])
        messages.success(request, f"Invoice {invoice.invoice_number} has been cancelled.")
    else:
        messages.error(request, "Cannot cancel an already paid invoice.")

    return redirect('billing:invoice_detail', pk=pk)


@login_required
def invoice_send(request, pk):
    """Action: Mark invoice as sent (records timestamp)."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('billing:invoice_detail', pk=pk)

    invoice = get_object_or_404(Invoice, pk=pk)
    invoice.sent_at = timezone.now()
    if invoice.status == Invoice.STATUS_DRAFT:
        invoice.status = Invoice.STATUS_CONFIRMED
    invoice.save(update_fields=['sent_at', 'status'])
    messages.success(request, f"Invoice {invoice.invoice_number} sent to {invoice.customer.email or invoice.customer.username}.")
    return redirect('billing:invoice_detail', pk=pk)


@login_required
def invoice_mark_paid(request, pk):
    """Transition: Confirmed/Draft -> Paid."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('billing:invoice_detail', pk=pk)

    invoice = get_object_or_404(Invoice, pk=pk)
    invoice.status = Invoice.STATUS_PAID
    invoice.save(update_fields=['status'])
    messages.success(request, f"Invoice {invoice.invoice_number} marked as PAID.")
    return redirect('billing:invoice_detail', pk=pk)


# ==============================================================================
# AUTOMATIC BILLING ENGINE TRIGGER
# ==============================================================================

@login_required
def generate_billing_run(request):
    """
    Objective 5: ONE-BUTTON Automatic Recurring Billing!
    Staff/Admin clicks this button to automatically create all invoices due today.
    Guarantees no duplicate billing for the same subscription period.
    """
    if not is_staff_or_admin(request.user):
        messages.error(request, "Only staff can execute billing runs.")
        return redirect('billing:invoice_list')

    if request.method == 'POST':
        results = run_all_due_billing()
        created = results['created_count']
        skipped = results['skipped_count']
        total = results['total_evaluated']
        messages.success(
            request,
            f"Billing run complete! Evaluated: {total} subscriptions. Created: {created} new invoices. Skipped: {skipped}."
        )
        return redirect('billing:invoice_list')

    from subscriptions.models import Subscription
    today = timezone.now().date()
    due_subs = Subscription.objects.filter(status='active', next_billing_date__lte=today)

    context = {
        'due_count': due_subs.count(),
        'due_subs': due_subs[:10],
        'today': today,
    }
    return render(request, 'billing/billing_run.html', context)


# ==============================================================================
# TAX RULES (Admin Only)
# ==============================================================================

@login_required
def tax_rule_list(request):
    """Manage tax rules (Admin only)."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('billing:invoice_list')

    rules = TaxRule.objects.all()
    return render(request, 'billing/tax_rule_list.html', {'rules': rules})


@login_required
def tax_rule_create(request):
    """Create a new tax rule."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('billing:tax_rule_list')

    if request.method == 'POST':
        form = TaxRuleForm(request.POST)
        if form.is_valid():
            rule = form.save()
            messages.success(request, f"Tax rule '{rule.name}' created.")
            return redirect('billing:tax_rule_list')
    else:
        form = TaxRuleForm()

    return render(request, 'billing/tax_rule_form.html', {'form': form, 'title': 'Create Tax Rule'})


@login_required
def tax_rule_edit(request, pk):
    """Edit an existing tax rule."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('billing:tax_rule_list')

    rule = get_object_or_404(TaxRule, pk=pk)
    if request.method == 'POST':
        form = TaxRuleForm(request.POST, instance=rule)
        if form.is_valid():
            form.save()
            messages.success(request, f"Tax rule '{rule.name}' updated.")
            return redirect('billing:tax_rule_list')
    else:
        form = TaxRuleForm(instance=rule)

    return render(request, 'billing/tax_rule_form.html', {'form': form, 'title': f'Edit {rule.name}', 'rule': rule})

