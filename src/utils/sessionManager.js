// UPDATED: Single-order-per-table system (no more session tokens)
const ORDER_ID_KEY = 'active_order_id';
const TABLE_ID_KEY = 'id'; // Reuse existing localStorage key
const PAYMENT_SUCCESS_KEY = 'payment_success_order';
const CHECKOUT_INIT_KEY = 'checkout_initiated_order';

export const sessionManager = {
  // Save active order info
  saveOrder(orderId) {
    sessionStorage.setItem(ORDER_ID_KEY, orderId.toString());
  },

  // Get active order ID
  getOrderId() {
    const orderId = sessionStorage.getItem(ORDER_ID_KEY);
    return orderId ? parseInt(orderId) : null;
  },

  // Get table ID (from localStorage, set by QR landing page)
  getTableId() {
    const tableId = localStorage.getItem(TABLE_ID_KEY);
    return tableId ? parseInt(tableId) : null;
  },

  // Check if order exists
  hasOrder() {
    return !!this.getOrderId();
  },

  // Clear order (after payment or logout)
  clearOrder() {
    sessionStorage.removeItem(ORDER_ID_KEY);
  },

  // Clear everything including table
  clearAll() {
    this.clearOrder();
    localStorage.removeItem(TABLE_ID_KEY);
  },

  // Mark a payment success so other pages (e.g., /menu) can show a modal
  markPaymentSuccess(orderId) {
    if (!orderId) return;
    sessionStorage.setItem(PAYMENT_SUCCESS_KEY, orderId.toString());
  },

  // Mark that the checkout flow has been initiated for an order
  markCheckoutInitiated(orderId) {
    if (!orderId) return;
    sessionStorage.setItem(CHECKOUT_INIT_KEY, orderId.toString());
  },

  // Check whether checkout was initiated for the given order
  isCheckoutInitiated(orderId) {
    if (!orderId) return false;
    const v = sessionStorage.getItem(CHECKOUT_INIT_KEY);
    if (!v) return false;
    return parseInt(v, 10) === parseInt(orderId, 10);
  },

  // Consume the checkout-initiated flag (read and remove)
  consumeCheckoutInitiated(orderId) {
    const v = sessionStorage.getItem(CHECKOUT_INIT_KEY);
    if (!v) return false;
    const matches = parseInt(v, 10) === parseInt(orderId, 10);
    try { sessionStorage.removeItem(CHECKOUT_INIT_KEY); } catch (e) {}
    return matches;
  },

  // Consume the payment success flag (read and remove)
  consumePaymentSuccess() {
    const v = sessionStorage.getItem(PAYMENT_SUCCESS_KEY);
    if (!v) return null;
    sessionStorage.removeItem(PAYMENT_SUCCESS_KEY);
    const n = parseInt(v, 10);
    return isNaN(n) ? v : n;
  },

  // LEGACY COMPATIBILITY: Keep old methods for gradual migration
  getToken() {
    return sessionStorage.getItem('dining_session_token');
  },

  getSessionId() {
    return this.getOrderId(); // Map to orderId for backward compatibility
  },

  hasSession() {
    return this.hasOrder();
  },

  clearSession() {
    this.clearOrder();
  }
};
