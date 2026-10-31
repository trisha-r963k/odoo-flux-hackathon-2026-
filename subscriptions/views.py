from datetime import timedelta
from decimal import Decimal
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from .models import QuotationTemplate, QuotationTemplateLine, Subscription, SubscriptionLine
from .forms import (
    QuotationTemplateForm,
    QuotationTemplateLineForm,
    SubscriptionForm,
    SubscriptionLineForm,
    CreateFromTemplateForm,
)


def is_staff_or_admin(user):
    """Check if user has staff or admin role."""
    if not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    return getattr(user, 'role', '') in ['admin', 'staff']


# ==============================================================================
# SUBSCRIPTIONS VIEWS
# ==============================================================================

@login_required
def subscription_list(request):
    """
    List subscriptions with search, filter, and pagination (25 per page).
    Portal isolation: Customers only see their own subscriptions!
    """
    user = request.user
    queryset = Subscription.objects.select_related('customer', 'plan').prefetch_related('lines').all()

    # Customer isolation
    if not is_staff_or_admin(user):
        queryset = queryset.filter(customer=user)

    # Search filter
    q = request.GET.get('q', '').strip()
    if q:
        queryset = queryset.filter(
            Q(subscription_number__icontains=q) |
            Q(customer__username__icontains=q) |
            Q(customer__email__icontains=q)
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
        'status_choices': Subscription.STATUS_CHOICES,
    }
    return render(request, 'subscriptions/subscription_list.html', context)


@login_required
def subscription_detail(request, pk):
    """
    View subscription details.
    Portal security: Customers cannot view another customer's subscription.
    """
    user = request.user
    subscription = get_object_or_404(
        Subscription.objects.select_related('customer', 'plan').prefetch_related('lines__product', 'lines__tax_rule'),
        pk=pk
    )

    # Security check: portal customer restriction
    if not is_staff_or_admin(user) and subscription.customer != user:
        messages.error(request, "You do not have permission to view this subscription.")
        return redirect('subscriptions:subscription_list')

    line_form = SubscriptionLineForm() if is_staff_or_admin(user) else None

    context = {
        'subscription': subscription,
        'lines': subscription.lines.all(),
        'line_form': line_form,
        'is_staff_admin': is_staff_or_admin(user),
    }
    return render(request, 'subscriptions/subscription_detail.html', context)


@login_required
def subscription_create(request):
    """Create a new blank subscription (Staff/Admin only)."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Only staff and administrators can create subscriptions.")
        return redirect('subscriptions:subscription_list')

    if request.method == 'POST':
        form = SubscriptionForm(request.POST)
        if form.is_valid():
            sub = form.save()
            messages.success(request, f"Subscription {sub.subscription_number} created successfully.")
            return redirect('subscriptions:subscription_detail', pk=sub.pk)
    else:
        form = SubscriptionForm(initial={'start_date': timezone.now().date()})

    return render(request, 'subscriptions/subscription_form.html', {'form': form, 'title': 'Create New Subscription'})


@login_required
def subscription_edit(request, pk):
    """Edit subscription details (Staff/Admin only)."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('subscriptions:subscription_list')

    subscription = get_object_or_404(Subscription, pk=pk)
    if request.method == 'POST':
        form = SubscriptionForm(request.POST, instance=subscription)
        if form.is_valid():
            form.save()
            messages.success(request, f"Subscription {subscription.subscription_number} updated.")
            return redirect('subscriptions:subscription_detail', pk=subscription.pk)
    else:
        form = SubscriptionForm(instance=subscription)

    return render(request, 'subscriptions/subscription_form.html', {
        'form': form,
        'title': f'Edit {subscription.subscription_number}',
        'subscription': subscription
    })


@login_required
def subscription_transition(request, pk, target_status):
    """
    Handle lifecycle transitions: Draft -> Quotation -> Confirmed -> Active -> Closed.
    """
    if not is_staff_or_admin(request.user):
        messages.error(request, "Only staff can change subscription status.")
        return redirect('subscriptions:subscription_detail', pk=pk)

    subscription = get_object_or_404(Subscription, pk=pk)
    if request.method == 'POST':
        if subscription.can_transition_to(target_status):
            subscription.status = target_status
            if target_status == Subscription.STATUS_ACTIVE and not subscription.next_billing_date:
                subscription.next_billing_date = subscription.start_date
            subscription.save()
            messages.success(request, f"Subscription moved to {subscription.get_status_display()}.")
        else:
            messages.error(request, f"Cannot transition from {subscription.get_status_display()} to {target_status}.")

    return redirect('subscriptions:subscription_detail', pk=pk)


@login_required
def subscription_add_line(request, pk):
    """Add a product line to an existing subscription (Staff/Admin only)."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('subscriptions:subscription_list')

    subscription = get_object_or_404(Subscription, pk=pk)
    if request.method == 'POST':
        form = SubscriptionLineForm(request.POST)
        if form.is_valid():
            line = form.save(commit=False)
            line.subscription = subscription
            line.save()
            messages.success(request, "Product line added.")
        else:
            messages.error(request, "Failed to add line. Please verify details.")

    return redirect('subscriptions:subscription_detail', pk=pk)


@login_required
def subscription_delete_line(request, pk, line_pk):
    """Remove a product line from subscription."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('subscriptions:subscription_list')

    subscription = get_object_or_404(Subscription, pk=pk)
    line = get_object_or_404(SubscriptionLine, pk=line_pk, subscription=subscription)
    line.delete()
    messages.success(request, "Line removed successfully.")
    return redirect('subscriptions:subscription_detail', pk=pk)


# ==============================================================================
# QUOTATION TEMPLATES VIEWS
# ==============================================================================

@login_required
def template_list(request):
    """List quotation templates (Staff/Admin only)."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Access restricted to staff.")
        return redirect('subscriptions:subscription_list')

    templates = QuotationTemplate.objects.select_related('plan').prefetch_related('lines').all()
    return render(request, 'subscriptions/template_list.html', {'templates': templates})


@login_required
def template_create(request):
    """Create quotation template."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('subscriptions:subscription_list')

    if request.method == 'POST':
        form = QuotationTemplateForm(request.POST)
        if form.is_valid():
            tmpl = form.save()
            messages.success(request, f"Template '{tmpl.name}' created.")
            return redirect('subscriptions:template_detail', pk=tmpl.pk)
    else:
        form = QuotationTemplateForm()

    return render(request, 'subscriptions/template_form.html', {'form': form, 'title': 'Create Quotation Template'})


@login_required
def template_detail(request, pk):
    """View quotation template and manage its lines."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('subscriptions:subscription_list')

    template = get_object_or_404(QuotationTemplate.objects.prefetch_related('lines__product'), pk=pk)
    line_form = QuotationTemplateLineForm()

    return render(request, 'subscriptions/template_detail.html', {
        'template': template,
        'lines': template.lines.all(),
        'line_form': line_form
    })


@login_required
def template_add_line(request, pk):
    """Add a product line to quotation template."""
    if not is_staff_or_admin(request.user):
        messages.error(request, "Permission denied.")
        return redirect('subscriptions:subscription_list')

    template = get_object_or_404(QuotationTemplate, pk=pk)
    if request.method == 'POST':
        form = QuotationTemplateLineForm(request.POST)
        if form.is_valid():
            line = form.save(commit=False)
            line.template = template
            line.save()
            messages.success(request, "Product line added to template.")
        else:
            messages.error(request, "Error adding line to template.")

    return redirect('subscriptions:template_detail', pk=pk)


@login_required
def create_from_template(request):
    """
    Objective 4: Quick Action - Sales rep turns quotation template into a concrete Subscription.
    Copies all pre-configured product lines and sets validity expiry date.
    """
    if not is_staff_or_admin(request.user):
        messages.error(request, "Only staff can generate subscriptions from templates.")
        return redirect('subscriptions:subscription_list')

    if request.method == 'POST':
        form = CreateFromTemplateForm(request.POST)
        if form.is_valid():
            tmpl = form.cleaned_data['template']
            customer = form.cleaned_data['customer']
            start_date = form.cleaned_data['start_date']
            payment_terms = form.cleaned_data['payment_terms']

            # Calculate expiry date based on template's validity_days
            expiry_date = start_date + timedelta(days=tmpl.validity_days)

            # Create subscription in 'quotation' status
            sub = Subscription.objects.create(
                customer=customer,
                template=tmpl,
                plan=tmpl.plan,
                start_date=start_date,
                expiry_date=expiry_date,
                payment_terms=payment_terms,
                status=Subscription.STATUS_QUOTATION,
                notes=f"Generated from Quotation Template: {tmpl.name}"
            )

            # Copy template lines to SubscriptionLine
            for t_line in tmpl.lines.all():
                SubscriptionLine.objects.create(
                    subscription=sub,
                    product=t_line.product,
                    quantity=t_line.quantity,
                    unit_price=t_line.unit_price,
                    amount=Decimal(t_line.quantity) * Decimal(t_line.unit_price)
                )

            messages.success(request, f"Successfully created Quotation #{sub.subscription_number} from template '{tmpl.name}'.")
            return redirect('subscriptions:subscription_detail', pk=sub.pk)
    else:
        template_id = request.GET.get('template')
        initial_data = {'start_date': timezone.now().date()}
        if template_id:
            initial_data['template'] = template_id
        form = CreateFromTemplateForm(initial=initial_data)

    return render(request, 'subscriptions/from_template.html', {'form': form})

