from django.contrib import admin
from .models import QuotationTemplate, QuotationTemplateLine, Subscription, SubscriptionLine


class QuotationTemplateLineInline(admin.TabularInline):
    model = QuotationTemplateLine
    extra = 1


@admin.register(QuotationTemplate)
class QuotationTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan', 'validity_days', 'created_at')
    inlines = [QuotationTemplateLineInline]


class SubscriptionLineInline(admin.TabularInline):
    model = SubscriptionLine
    extra = 1


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('subscription_number', 'customer', 'plan', 'status', 'start_date', 'next_billing_date')
    list_filter = ('status', 'start_date', 'plan')
    search_fields = ('subscription_number', 'customer__username', 'customer__email')
    inlines = [SubscriptionLineInline]

