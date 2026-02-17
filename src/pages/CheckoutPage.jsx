import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionManager } from '../utils/sessionManager';
import { orderService } from '../services/order_user';
import { paypalService } from '../services/paypalService';
import { cartService } from '../services/cartService';
import { CreditCard, Clock, Receipt, CheckCircle, ShoppingBag, ArrowLeft, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Cart from '../components/Cart';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  // Cart handlers
  const loadCart = () => {
    const items = cartService.getCart();
    setCartItems(items);
    setCartItemsCount(cartService.getCartItemsCount());
  };
  
  const handleCartClick = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);
  const handleUpdateQuantity = (itemId, newQuantity) => {
    cartService.updateQuantity(itemId, newQuantity);
    loadCart();
  };
  const handleRemoveItem = (itemId) => {
    cartService.removeFromCart(itemId);
    loadCart();
  };
  const handleCartUpdated = () => loadCart();

  useEffect(() => {
    loadOrderData();
    loadCart();
  }, []);

  const loadOrderData = async () => {
    try {
      const orderId = sessionManager.getOrderId();

      if (!orderId) {
        navigate('/');
        return;
      }

      // Get order details using the new endpoint
      const orderResponse = await orderService.getOrderDetails(orderId);
      
      if (orderResponse.StatusCode === 200 && orderResponse.ResultSet && orderResponse.ResultSet.length > 0) {
        // ResultSet is an array, extract the first element
        const orderData = orderResponse.ResultSet[0];
        
        // Convert string values to proper types
        setOrder({
          OrderId: parseInt(orderData.OrderId),
          TableId: parseInt(orderData.TableId),
          OrderStatus: orderData.OrderStatus,
          TotalAmount: parseFloat(orderData.TotalAmount),
          Status: orderData.Status
        });
      } else {
        console.error('Failed to get order details');
      }
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalCheckout = async () => {
    try {
      setPaymentProcessing(true);
      setPaymentError(null);

      const orderId = sessionManager.getOrderId();
      const amountLKR = order?.TotalAmount || 0;
      
      if (!orderId) {
        throw new Error('Order ID not found');
      }

      if (!amountLKR || amountLKR <= 0) {
        throw new Error('Invalid order amount');
      }

      // Convert LKR to USD (approximate rate: 1 USD = 300 LKR)
      const LKR_TO_USD_RATE = 300;
      const amountUSD = (amountLKR / LKR_TO_USD_RATE).toFixed(2);

      console.log(`💵 Converting ${amountLKR} LKR to ${amountUSD} USD`);
      console.log(`Creating PayPal order for Order: ${orderId}, Amount: ${amountUSD} USD`);

      // Call backend to create PayPal order
      const response = await paypalService.createOrder(parseInt(orderId), parseFloat(amountUSD));

      console.log('PayPal order creation response:', response);

      if (response.StatusCode === 200) {
        // Prefer the approval URL from response; fallback builds checkoutnow url
        const approvalUrl = paypalService.extractApprovalUrl(response);
        if (!approvalUrl) {
          throw new Error('Approval URL missing from backend/PayPal response');
        }
        window.location.href = approvalUrl;
      } else {
        throw new Error(response.Message || 'Failed to create PayPal order');
      }
    } catch (error) {
      console.error('❌ PayPal checkout error:', error);
      setPaymentError(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("LKR", "Rs.");

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          cartItemsCount={cartItemsCount}
          onCartClick={handleCartClick}
          onMenuToggle={() => {}}
        />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#18749b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900">Loading checkout...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          cartItemsCount={cartItemsCount}
          onCartClick={handleCartClick}
          onMenuToggle={() => {}}
        />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">No order data found.</p>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <Header
        cartItemsCount={cartItemsCount}
        onCartClick={handleCartClick}
        onMenuToggle={() => {}}
      />
      
      <Cart
        isOpen={isCartOpen}
        onClose={handleCartClose}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCartUpdated={handleCartUpdated}
      />

      <div className="container mx-auto px-4 max-w-4xl py-8">

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Receipt className="w-7 h-7 mr-3" />
            Order Summary
          </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#18749b] to-teal-600 rounded-full"></div>
          </div>
          {order.OrderStatus === 'Pending' && (
            <span className="flex items-center px-4 py-2 bg-gradient-to-r from-[#18749b] to-teal-600 text-white rounded-full text-sm font-semibold shadow-md">
              <CheckCircle className="w-4 h-4 mr-2" />
              Active
            </span>
          )}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-4 px-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-semibold flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Table Number
              </span>
              <span className="font-bold text-gray-900 text-xl  py-1 rounded-lg">
                #{order.TableId}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-4 px-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-semibold">Order ID</span>
              <span className="font-bold text-gray-900 text-xl  py-1 rounded-lg">#{order.OrderId}</span>
            </div>

            
            <div className="bg-gradient-to-r from-[#18749b] to-teal-600 rounded-2xl p-6 mt-6 shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total Amount</span>
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {formatPrice(order.TotalAmount)}
                </span>
              </div>
              <p className="text-blue-100 text-sm mt-2">
                ≈ ${(order.TotalAmount / 300).toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          
            <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <CreditCard className="w-7 h-7 mr-3" />
            Complete Payment
          </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#18749b] to-teal-600 rounded-full"></div>
            <div className="mb-6 flex justify-between items-center"></div>
          </div>
          
          {order.TotalAmount > 0 ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5 mb-4">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <span className="text-2xl mr-2">💡</span>
                  <strong className="text-base">Secure Payment</strong><br />
                  You'll be redirected to PayPal for secure payment processing.
                  Your order will be confirmed immediately after payment.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Amount:</strong> {formatPrice(order.TotalAmount)} (≈ ${(order.TotalAmount / 300).toFixed(2)} USD)
                </p>
              </div>

              {paymentError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-700 font-semibold text-sm">{paymentError}</p>
                </div>
              )}

              <button
                onClick={handlePayPalCheckout}
                disabled={paymentProcessing}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {paymentProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 4.002-.025.15a.806.806 0 01-.794.68h-1.914a.56.56 0 01-.556-.645l2.368-15.01a.806.806 0 01.794-.68h3.077c3.118 0 5.538.752 6.488 2.756z"/>
                    </svg>
                    Pay with PayPal
                  </>
                )}
              </button>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 mt-6">
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  🔒 By completing this payment, you agree to our terms of service and privacy policy.
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Receipt className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 font-medium mb-6">Add items to your cart to proceed with checkout.</p>
              <button
                onClick={() => navigate('/menu')}
                className="px-8 py-4 bg-gradient-to-r from-[#18749b] to-teal-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Browse Menu
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .paypal-button-container {
          position: relative;
          z-index: 10;
          overflow: visible !important;
        }
        
        .paypal-button-container * {
          z-index: 10 !important;
        }
        
        .paypal-button-container iframe {
          z-index: 10 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        /* Target PayPal container specifically */
        :global(.paypal-buttons) {
          z-index: 10 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        :global(.paypal-buttons iframe) {
          z-index: 10 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        /* PayPal button wrapper */
        :global([data-paypal-component]) {
          z-index: 10 !important;
          visibility: visible !important;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
