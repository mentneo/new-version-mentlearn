// src/utils/paymentClient.js
import { getAuth } from 'firebase/auth';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

export async function createOrder(courseId) {
  if (!courseId) throw new Error('courseId required');

  const auth = getAuth();
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken(/* forceRefresh */ false) : null;

  // Minimal headers -- do not send cookies by default
  const headers = {
    'Content-Type': 'application/json',
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
  };

  const res = await fetch(`${API_BASE}/api/payment/create-order`, {
    method: 'POST',
    credentials: 'omit', // IMPORTANT: prevents cookies (and large Cookie header)
    headers,
    body: JSON.stringify({ courseId })
  });

  // handle non-JSON or non-2xx responses
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = { raw: text }; }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data; // expected { order }
}

// src/someOtherFile.js
import { createOrder } from './utils/paymentClient';

async function onBuy(courseId) {
  try {
    const data = await createOrder(courseId);
    // open Razorpay checkout with data.order
  } catch(err) {
    console.error(err);
    alert(err.message || 'Payment initialization failed');
  }
}