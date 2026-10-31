from django.urls import path
from . import views

app_name = 'subscriptions'

urlpatterns = [
    # Subscriptions
    path('', views.subscription_list, name='subscription_list'),
    path('create/', views.subscription_create, name='subscription_create'),
    path('<int:pk>/', views.subscription_detail, name='subscription_detail'),
    path('<int:pk>/edit/', views.subscription_edit, name='subscription_edit'),
    path('<int:pk>/transition/<str:target_status>/', views.subscription_transition, name='subscription_transition'),
    path('<int:pk>/add-line/', views.subscription_add_line, name='subscription_add_line'),
    path('<int:pk>/delete-line/<int:line_pk>/', views.subscription_delete_line, name='subscription_delete_line'),

    # Quotation Templates
    path('templates/', views.template_list, name='template_list'),
    path('templates/create/', views.template_create, name='template_create'),
    path('templates/<int:pk>/', views.template_detail, name='template_detail'),
    path('templates/<int:pk>/add-line/', views.template_add_line, name='template_add_line'),
    path('from-template/', views.create_from_template, name='create_from_template'),
]

