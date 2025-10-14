import React, { useEffect, useRef, useCallback } from 'react';

export default function RazorpayButton({ paymentButtonId }) {
  const containerRef = useRef(null);

  const cleanup = useCallback((container) => {
    if (container && container.parentElement) {
      container.innerHTML = '';
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    cleanup(container);

    // Create form and script elements
    const form = document.createElement('form');
    const script = document.createElement('script');
    
    // Set script attributes
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.dataset.payment_button_id = paymentButtonId;
    script.async = true;
    
    // Append script to form and form to container
    form.appendChild(script);
    container.appendChild(form);

    // Cleanup function
    return () => cleanup(container);
  }, [paymentButtonId]);

  return <div ref={containerRef} className="razorpay-container w-full" />;
}