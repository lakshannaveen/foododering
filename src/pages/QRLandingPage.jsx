import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, AlertCircle } from "lucide-react";
import { sessionManager } from "../utils/sessionManager";
import { orderService } from "../services/order_user";
import Header from "../components/Header";

const QRLandingPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  const [manualId, setManualId] = useState("");
  const [detectedId, setDetectedId] = useState(null);

  // Expose URL parsing so we can show/debug detected id in UI
  const getTableIdFromUrl = () => {
    const href = window.location.href || "";

    // 1) standard search params
    const searchParams = new URLSearchParams(window.location.search);
    let t = searchParams.get("id") || searchParams.get("tableId") || searchParams.get("table");
    if (t) return t;

    // 2) hash-based routing where query is after '#'
    const hash = window.location.hash || "";
    const qm = hash.indexOf("?");
    if (qm !== -1) {
      const hashQuery = hash.substring(qm);
      const hashParams = new URLSearchParams(hashQuery);
      t = hashParams.get("id") || hashParams.get("tableId") || hashParams.get("table");
      if (t) return t;
    }

    // 3) common path patterns: /table/123 or /t/123 or /tables/123
    const pathPatterns = [
      /\/table\/(\d+)/i,
      /\/t\/(\d+)/i,
      /\/tables?\/(\d+)/i,
      /\/(\d+)(?:$|[?#])/,
    ];
    for (const p of pathPatterns) {
      const m = href.match(p);
      if (m) return m[1];
    }

    // 4) fallback: search the whole href for id= param (non-numeric allowed)
    const hrefMatch = href.match(/[?&]id=([^&#]+)/);
    if (hrefMatch) return hrefMatch[1];

    return null;
  };

  useEffect(() => {
    initOrder();
    // compute detected id for debug UI
    try { setDetectedId(getTableIdFromUrl()); } catch (e) { setDetectedId(null); }
  }, []);

  const initOrder = async () => {
    try {
      // Get tableId from URL. Support many formats used by QR generators and hash routers
      const getTableIdFromUrl = () => {
        const href = window.location.href || "";

        // 1) standard search params
        const searchParams = new URLSearchParams(window.location.search);
        let t = searchParams.get("id") || searchParams.get("tableId") || searchParams.get("table") ;
        if (t) return t;

        // 2) hash-based routing where query is after '#'
        const hash = window.location.hash || "";
        const qm = hash.indexOf("?");
        if (qm !== -1) {
          const hashQuery = hash.substring(qm);
          const hashParams = new URLSearchParams(hashQuery);
          t = hashParams.get("id") || hashParams.get("tableId") || hashParams.get("table");
          if (t) return t;
        }

        // 3) common path patterns: /table/123 or /t/123 or /tables/123
        const pathPatterns = [
          /\/table\/(\d+)/i,
          /\/t\/(\d+)/i,
          /\/tables?\/(\d+)/i,
          /\/(\d+)(?:$|[?#])/,
        ];
        for (const p of pathPatterns) {
          const m = href.match(p);
          if (m) return m[1];
        }

        // 4) fallback: search the whole href for id= param (non-numeric allowed)
        const hrefMatch = href.match(/[?&]id=([^&#]+)/);
        if (hrefMatch) return hrefMatch[1];

        return null;
      };

      const tableId = getTableIdFromUrl();

      if (!tableId) {
        setError("No table ID provided. Please scan a valid QR code.");
        return;
      }

      setStatus("Setting up your table...");
      
      // Save table ID to localStorage
      localStorage.setItem("id", tableId);

      setStatus("Loading your order...");

      // Get or create active order for this table (NEW: single order per table)
      const orderData = await orderService.getOrCreateActiveOrder(parseInt(tableId));

      if (orderData && orderData.OrderId) {
        // Save order ID to sessionStorage
        sessionManager.saveOrder(orderData.OrderId);

        console.log(
          `✅ Order ${orderData.IsNewOrder ? 'created' : 'retrieved'}:`,
          `OrderId: ${orderData.OrderId}, Status: ${orderData.OrderStatus}, Total: ${orderData.TotalAmount}`
        );

        setStatus("Order ready! Redirecting to menu...");

        // Navigate to menu after brief delay
        setTimeout(() => {
          navigate("/menu");
        }, 500);
      } else {
        setError("Failed to initialize order. Please try again.");
      }
    } catch (err) {
      console.error("Order init error:", err);
      setError("Failed to initialize order. Please try scanning the QR code again.");
    }
  };

  // Allow manual init when debugging: attempt to start using a provided id
  const initWithTableId = async (manualId) => {
    setError(null);
    try {
      if (!manualId) return setError("Please enter a table id to continue.");
      localStorage.setItem("id", manualId);
      setStatus("Loading your order...");
      const orderData = await orderService.getOrCreateActiveOrder(parseInt(manualId));
      if (orderData && orderData.OrderId) {
        sessionManager.saveOrder(orderData.OrderId);
        setStatus("Order ready! Redirecting to menu...");
        setTimeout(() => navigate("/menu"), 500);
      } else {
        setError("Failed to initialize order. Please try again.");
      }
    } catch (err) {
      console.error("Manual init error:", err);
      setError("Failed to initialize order. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <Header
          cartItemsCount={0}
          onCartClick={() => {}}
          onMenuToggle={() => {}}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex flex-col items-center justify-center py-8">
              <QrCode className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No QR Code Scanned</h2>
              <p className="text-gray-600 text-center mb-4">
                Please scan a valid QR code at your table to get started.
              </p>

              <div className="w-full text-left text-xs text-gray-500 bg-gray-50 p-3 rounded mb-4">
                <div className="mb-2 font-medium">Debug info</div>
                <div className="break-words mb-1"><strong>URL:</strong> {window.location.href}</div>
                <div className="mb-1"><strong>Detected id:</strong> {detectedId ?? "(none)"}</div>
                <div className="text-xs text-gray-400">Parser checks: query, hash-query, /table/:id, numeric tail, fallback id=</div>
              </div>

              <div className="w-full mb-4">
                <label className="block text-xs text-gray-600 mb-1">Manual table id (for testing)</label>
                <div className="flex space-x-2">
                  <input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="e.g. 12" className="w-full px-3 py-2 border rounded" />
                  <button onClick={() => initWithTableId(manualId)} className="px-4 py-2 bg-[#18749b] text-white rounded">Use</button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gradient-to-r from-[#18749b] to-teal-600 text-white rounded-lg hover:from-[#156285] hover:to-teal-700 transition-all">Try Again</button>
                <button onClick={() => { localStorage.removeItem('id'); window.location.href = '/'; }} className="px-6 py-2 bg-white border rounded">Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <Header
        cartItemsCount={0}
        onCartClick={() => {}}
        onMenuToggle={() => {}}
      />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-md p-8">
          {/* Animated loading spinner */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-[#18749b]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#18749b] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#18749b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">{status}</h2>
          <p className="text-gray-600 leading-relaxed">
            Please wait while we prepare your dining experience.
          </p>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-[#18749b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#18749b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#18749b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRLandingPage;
