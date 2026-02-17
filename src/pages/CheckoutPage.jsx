import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionManager } from '../utils/sessionManager';
import { orderService } from '../services/order_user';
import { cartService } from '../services/cartService';
import { CreditCard, Clock, CheckCircle, ShoppingBag, ArrowLeft, ExternalLink } from 'lucide-react';
import { FaMoneyBillWave } from 'react-icons/fa';
import Header from '../components/Header';
import Cart from '../components/Cart';
import CompleteOrderSuccessModal from '../components/CompleteOrderSuccessModal';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAmount, setSuccessAmount] = useState(null);
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [successTotalFoods, setSuccessTotalFoods] = useState(null);
  const [successTableNumber, setSuccessTableNumber] = useState(null);
  const [successItems, setSuccessItems] = useState([]);
  
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

  const handleCompleteOrder = async () => {
    try {
      setPaymentProcessing(true);
      setPaymentError(null);

      const orderId = sessionManager.getOrderId();
      if (!orderId) throw new Error('Order ID not found');

      const response = await orderService.completeOrder(parseInt(orderId));
      console.log('Complete order response:', response);

      if (response && response.StatusCode === 200) {
        // Clear local cart and session, then show success modal and redirect on close
        let itemsSnapshot = cartService.getCart();
        // Fallback: try snapshot saved by Cart, then session/local storage
        if ((!itemsSnapshot || itemsSnapshot.length === 0)) {
          const snap = sessionStorage.getItem('restaurant-cart-snapshot');
          const raw = snap || sessionStorage.getItem('restaurant-cart') || localStorage.getItem('restaurant-cart');
          try {
            itemsSnapshot = raw ? JSON.parse(raw) : [];
          } catch (e) {
            itemsSnapshot = [];
          }
        }
        // Fallback to in-memory cart state (loaded on page) if still empty
        if ((!itemsSnapshot || itemsSnapshot.length === 0) && cartItems && cartItems.length > 0) {
          itemsSnapshot = cartItems.slice();
        }
        const totalFoodsCount = (itemsSnapshot && itemsSnapshot.length > 0)
          ? itemsSnapshot.reduce((s, it) => s + (Number(it.quantity ?? it.Qty ?? it.qty ?? 0) || 0), 0)
          : cartService.getCartItemsCount();
        cartService.clearCart();
        // clear the temporary snapshot now that we've captured it
        try { sessionStorage.removeItem('restaurant-cart-snapshot'); } catch(e){}
        sessionManager.clearOrder();
        setSuccessAmount(order?.TotalAmount || null);
        setSuccessOrderId(order?.OrderId || orderId);
        setSuccessTotalFoods(totalFoodsCount);
        setSuccessTableNumber(order?.TableId || null);
        setSuccessItems(itemsSnapshot || []);
        setShowSuccessModal(true);
      } else {
        throw new Error(response?.Message || 'Failed to complete order');
      }
    } catch (error) {
      console.error('Complete order error:', error);
      setPaymentError(error.message || 'Failed to complete order. Please try again.');
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
              <FaMoneyBillWave className="w-7 h-7 mr-3 text-[#18749b]" />
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
              <div className="space-y-4">
                <div className="bg-white border border-[color:var(--border-lite,#E6EEF5)] rounded-2xl shadow-lg p-5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Complete Order</h3>
                      <p className="text-sm text-gray-600 mt-1">Tap the button below to complete your order. Your order will be confirmed immediately.</p>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-3">
                      <div className="text-sm text-gray-500">Amount</div>
                      <div className="text-2xl font-extrabold text-gray-900">{formatPrice(order.TotalAmount)}</div>

                      <button
                        onClick={handleCompleteOrder}
                        disabled={paymentProcessing}
                        aria-label="Complete Order"
                        className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-[#18749b] to-teal-600 hover:from-[#156285] hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-4 focus:ring-[#18749b]/25 transition-colors"
                      >
                        {paymentProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Complete Order
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                      <p className="text-sm text-red-700">{paymentError}</p>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    🔒 By completing this order, you agree to our terms of service and privacy policy.
                  </div>
                </div>
              </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FaMoneyBillWave className="w-10 h-10 text-gray-400" />
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
      <CompleteOrderSuccessModal
        isOpen={showSuccessModal}
        amount={successAmount}
        orderId={successOrderId}
        totalFoods={successTotalFoods}
        tableNumber={successTableNumber}
        items={successItems}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/');
        }}
      />
    </div>
  );
};

export default CheckoutPage;
