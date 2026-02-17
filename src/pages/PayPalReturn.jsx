import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paypalService } from '../services/paypalService';
import { orderService } from '../services/order_user';
import { sessionManager } from '../utils/sessionManager';
import PaymentSuccessModal from '../components/PaymentSuccessModal';

export default function PayPalReturn() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Finalizing your payment...');
  const [success, setSuccess] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState(null);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const token = qs.get('token'); // PayPal order id

    const orderIdRaw = sessionManager.getOrderId();
    const orderId = orderIdRaw ? parseInt(orderIdRaw, 10) : null;

    if (!token) {
      setMessage('Missing PayPal token.');
      return;
    }
    if (!orderId) {
      setMessage('Missing order.');
      return;
    }

    const run = async () => {
      try {
        // Capture PayPal payment
        const res = await paypalService.capturePayment(token, orderId);

        if (res?.StatusCode === 200) {
          // Ensure the user went through checkout before allowing completion
          if (!sessionManager.isCheckoutInitiated(orderId)) {
            setMessage('Checkout flow not initiated. Please complete checkout first.');
            return;
          }

          // Complete the order (marks it Complete and sets CompletedAt)
          await orderService.completeOrder(orderId);

          // Mark payment success so Menu page can show the modal
          sessionManager.markPaymentSuccess(orderId);

          // Clear the order from storage
          sessionManager.clearOrder();

          // Redirect user to Menu where the modal will be shown
          navigate('/menu', { replace: true });
        } else {
          setMessage(res?.Message || 'Payment capture failed.');
        }
      } catch (e) {
        setMessage('Payment capture failed.');
      }
    };

    run();
  }, [navigate]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-bold mb-2">PayPal</h1>
          <p className="text-gray-700">{message}</p>
        </div>
      </div>

      <PaymentSuccessModal
        isOpen={success}
        onClose={() => setSuccess(false)}
        orderId={paidOrderId}
      />
    </>
  );
}
