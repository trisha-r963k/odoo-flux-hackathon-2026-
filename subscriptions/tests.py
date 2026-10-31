from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import QuotationTemplate, QuotationTemplateLine, Subscription, SubscriptionLine


class SubscriptionModelTests(TestCase):
    """
    Test suite verifying Objective 4 business rules:
    - Unique subscription number generation
    - Lifecycle state machine (Draft -> Quotation -> Confirmed -> Active -> Closed)
    - Subtotal and total amount calculations
    """

    def test_unique_subscription_number_generation(self):
        """Verify automatic generation of SUB-YYYYMM-XXXX number."""
        num1 = Subscription.generate_unique_number()
        num2 = Subscription.generate_unique_number()
        self.assertTrue(num1.startswith('SUB-'))
        self.assertNotEqual(num1, num2)

    def test_state_machine_transitions(self):
        """Verify allowed and disallowed state transitions."""
        sub = Subscription(
            subscription_number='SUB-TEST-001',
            status=Subscription.STATUS_DRAFT,
            start_date=timezone.now().date()
        )
        # Draft can move to quotation or closed
        self.assertTrue(sub.can_transition_to(Subscription.STATUS_QUOTATION))
        self.assertTrue(sub.can_transition_to(Subscription.STATUS_CLOSED))
        # Draft CANNOT jump directly to active
        self.assertFalse(sub.can_transition_to(Subscription.STATUS_ACTIVE))

        # Test quotation state
        sub.status = Subscription.STATUS_QUOTATION
        self.assertTrue(sub.can_transition_to(Subscription.STATUS_CONFIRMED))
        self.assertFalse(sub.can_transition_to(Subscription.STATUS_DRAFT))

        # Test confirmed state
        sub.status = Subscription.STATUS_CONFIRMED
        self.assertTrue(sub.can_transition_to(Subscription.STATUS_ACTIVE))

        # Test active state
        sub.status = Subscription.STATUS_ACTIVE
        self.assertTrue(sub.can_transition_to(Subscription.STATUS_CLOSED))
        self.assertFalse(sub.can_transition_to(Subscription.STATUS_QUOTATION))

