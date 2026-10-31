from django import forms
from django.contrib.auth import get_user_model
from .models import TaxRule, Invoice, InvoiceLine


class TaxRuleForm(forms.ModelForm):
    class Meta:
        model = TaxRule
        fields = ['name', 'rate', 'is_active', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., GST 18%'}),
            'rate': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '18.00'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }


class InvoiceForm(forms.ModelForm):
    class Meta:
        model = Invoice
        fields = ['customer', 'invoice_date', 'period_start_date', 'period_end_date', 'due_date', 'status', 'notes']
        widgets = {
            'customer': forms.Select(attrs={'class': 'form-select'}),
            'invoice_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'period_start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'period_end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'due_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
        }


class InvoiceLineForm(forms.ModelForm):
    class Meta:
        model = InvoiceLine
        fields = ['product', 'description', 'quantity', 'unit_price', 'tax_rule']
        widgets = {
            'product': forms.Select(attrs={'class': 'form-select'}),
            'description': forms.TextInput(attrs={'class': 'form-control'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'min': 1}),
            'unit_price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'tax_rule': forms.Select(attrs={'class': 'form-select'}),
        }

