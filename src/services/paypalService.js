import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://foodorderingbackend.dockyardsoftware.com';
const PAYPAL_ENV = (import.meta.env.VITE_PAYPAL_ENV || 'sandbox').toLowerCase();
const DEBUG = (import.meta.env.VITE_DEBUG_PAYPAL || 'false') === 'true';

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: false, // set true if your backend uses cookies/session
  headers: { 'Content-Type': 'application/json' },
});

const log = (...a) => DEBUG && console.log('%c[paypalService]', 'color:#0070ba', ...a);
const err = (...a) => console.error('%c[paypalService:ERROR]', 'color:#ef4444', ...a);

const normalizeAmount = (amount) => {
  const n = Number(amount || 0);
  if (!Number.isFinite(n)) throw new Error('Invalid amount');
  return n.toFixed(2);
};

export async function createOrder(orderId, amount) {
  const payload = { OrderId: orderId, Amount: normalizeAmount(amount) };
  log('➡️ POST /Payment/CreateOrder', payload);
  try {
    const { status, data } = await http.post('/Payment/CreateOrder', payload);
    log('✅ createOrder:', status, data);
    return data;
  } catch (e) {
    err('createOrder failed:', e.response?.data || e.message);
    throw e;
  }
}

export async function capturePayment(payPalOrderId, orderId) {
  const payload = { PayPalOrderId: payPalOrderId, OrderId: orderId };
  log('➡️ POST /Payment/CapturePayment', payload);
  try {
    const { status, data } = await http.post('/Payment/CapturePayment', payload);
    log('✅ capturePayment:', status, data);
    return data;
  } catch (e) {
    err('capturePayment failed:', e.response?.data || e.message);
    throw e;
  }
}

// Helper to get the approval URL from backend result (with fallback)
export function extractApprovalUrl(result) {
  const rs = result?.ResultSet || result;
  if (rs?.ApprovalUrl) return rs.ApprovalUrl;
  if (Array.isArray(rs?.links)) {
    const link = rs.links.find(l => l.rel === 'approve' || l.rel === 'payer-action');
    if (link?.href) return link.href;
  }
  if (rs?.OrderId) {
    const host = PAYPAL_ENV === 'live'
      ? 'https://www.paypal.com/checkoutnow'
      : 'https://www.sandbox.paypal.com/checkoutnow';
    return `${host}?token=${rs.OrderId}`;
  }
  return null;
}

export const paypalService = { createOrder, capturePayment, extractApprovalUrl };
