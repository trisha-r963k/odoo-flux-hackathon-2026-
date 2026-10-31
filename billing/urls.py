from django.urls import path
from . import views

app_name = 'billing'

urlpatterns = [
    # Invoices
    path('', views.invoice_list, name='invoice_list'),
    path('<int:pk>/', views.invoice_detail, name='invoice_detail'),
    path('<int:pk>/print/', views.invoice_print, name='invoice_print'),
    path('<int:pk>/confirm/', views.invoice_confirm, name='invoice_confirm'),
    path('<int:pk>/cancel/', views.invoice_cancel, name='invoice_cancel'),
    path('<int:pk>/send/', views.invoice_send, name='invoice_send'),
    path('<int:pk>/mark-paid/', views.invoice_mark_paid, name='invoice_mark_paid'),

    # Billing Engine trigger
    path('run-billing/', views.generate_billing_run, name='run_billing'),

    # Tax Rules (Admin)
    path('taxes/', views.tax_rule_list, name='tax_rule_list'),
    path('taxes/create/', views.tax_rule_create, name='tax_rule_create'),
    path('taxes/<int:pk>/edit/', views.tax_rule_edit, name='tax_rule_edit'),
]

