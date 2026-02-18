import React, { useEffect, useState, useRef } from "react";
import jsQR from "jsqr";
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
  const [needAction, setNeedAction] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const videoRef = useRef(null);
  const scanInterval = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');

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
    // compute detected id for debug UI and decide action
    let id = null;
    try {
      id = getTableIdFromUrl();
      setDetectedId(id);
    } catch (e) {
      setDetectedId(null);
    }

    if (id) {
      // auto-init when id present
      initWithTableId(id);
    } else {
      // show UI to let user scan or enter table number
      setNeedAction(true);
    }

    return () => {
      stopScanner();
    };
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

  // Scanner helpers using BarcodeDetector when available
  const startScanner = async () => {
    setScanMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanMessage("Camera not available on this device.");
      return;
    }
    try {
      // Request stream first
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });

      // Ensure video element is rendered and mounted
      setShowScanner(true);

      // wait for the video element to mount (with a small timeout)
      const waitForVideo = async () => {
        for (let i = 0; i < 20; i++) {
          if (videoRef.current) return true;
          // wait 50ms
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 50));
        }
        return false;
      };

      const mounted = await waitForVideo();
      if (!mounted) {
        console.warn('Video element did not mount in time');
      }

      const video = videoRef.current;
      if (video) {
        try {
          video.srcObject = stream;
          // attempt to play; this may be blocked if browser denies autoplay
          // eslint-disable-next-line no-await-in-loop
          await video.play();
        } catch (playErr) {
          console.warn('Video play failed:', playErr);
        }
      }

      setScanning(true);

      // Use native BarcodeDetector if available, otherwise use jsQR fallback
      const hasDetector = typeof window.BarcodeDetector !== 'undefined';

      let detector = null;
      try {
        if (hasDetector) detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (detErr) {
        console.warn('BarcodeDetector initialization failed:', detErr);
      }

      // prepare a canvas for fallback decoding
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext && canvas.getContext('2d');

      scanInterval.current = setInterval(async () => {
        try {
          const videoEl = videoRef.current;
          if (!videoEl) return;

          if (detector) {
            const barcodes = await detector.detect(videoEl);
            if (barcodes && barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              stopScanner();
              setStatus('QR scanned. Initializing...');
              initWithTableId(code);
              return;
            }
          } else if (ctx) {
            // jsQR fallback: draw current frame and scan
            const w = videoEl.videoWidth || videoEl.clientWidth;
            const h = videoEl.videoHeight || videoEl.clientHeight;
            if (w === 0 || h === 0) return; // not ready yet
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(videoEl, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const code = jsQR(imageData.data, w, h);
            if (code && code.data) {
              stopScanner();
              setStatus('QR scanned. Initializing...');
              initWithTableId(code.data);
              return;
            }
          }
        } catch (dErr) {
          console.error('Barcode detect error:', dErr);
        }
      }, 500);

    } catch (err) {
      console.error('Failed to start camera:', err);
      // Provide more specific message based on error name
      const name = err && err.name ? err.name : 'UnknownError';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setScanMessage('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setScanMessage('No camera found on this device.');
      } else {
        setScanMessage('Failed to access camera. Please allow camera permission or enter table number manually.');
      }
    }
  };

  const toggleFacingMode = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    // If currently scanning, restart scanner with new facingMode
    if (scanning) {
      stopScanner();
      // small delay to ensure tracks are stopped
      setTimeout(() => {
        startScanner();
      }, 200);
    }
  };

  const stopScanner = () => {
    try {
      const video = videoRef.current;
      if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
        video.srcObject = null;
      }
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
        scanInterval.current = null;
      }
      setScanning(false);
      setShowScanner(false);
    } catch (e) {
      // ignore
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
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Error'}</h2>
              <p className="text-gray-600 text-center mb-4">Please try scanning the QR code again or enter your table number manually.</p>

              <div className="w-full mb-4 text-sm text-gray-700">
                <div className="mb-1"><strong>Detected id:</strong> {detectedId ?? "(none)"}</div>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => { setError(null); setNeedAction(true); setManualId(''); setDetectedId(null); }} className="px-6 py-2 bg-gradient-to-r from-[#18749b] to-teal-600 text-white rounded-lg hover:from-[#156285] hover:to-teal-700 transition-all">Try Again</button>
                <button onClick={() => { localStorage.removeItem('id'); setError(null); setNeedAction(true); setDetectedId(null); }} className="px-6 py-2 bg-white border rounded">Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (needAction && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <Header cartItemsCount={0} onCartClick={() => {}} onMenuToggle={() => {}} />

        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="text-center mb-6">
              <QrCode className="w-14 h-14 text-gray-400 mx-auto mb-2" />
              <h2 className="text-xl font-semibold text-gray-900">Scan QR or Enter Table Number</h2>
              <p className="text-sm text-gray-600 mt-1">Start your order by scanning the table QR or entering the table number.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Scan QR Code</h3>
                {showScanner ? (
                  <div>
                    <video ref={videoRef} className="w-full h-56 bg-black rounded mb-2" />
                    {scanMessage && <div className="text-sm text-red-600 mb-2">{scanMessage}</div>}
                    <div className="flex gap-2">
                      <button onClick={stopScanner} className="flex-1 px-4 py-2 bg-gray-100 rounded">Stop Scan</button>
                      <button onClick={toggleFacingMode} className="flex-1 px-4 py-2 bg-gray-100 rounded">Switch Camera</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {scanMessage && <div className="text-sm text-red-600 mb-2">{scanMessage}</div>}
                    <div className="flex gap-2">
                      <button onClick={startScanner} className="flex-1 px-4 py-2 bg-[#18749b] text-white rounded">Start Scan</button>
                      <button onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')} className="flex-1 px-4 py-2 bg-gray-100 rounded">Use {facingMode === 'environment' ? 'Front' : 'Back'}</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Enter Table Number</h3>
                <div className="flex gap-2">
                  <input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="e.g. 4" className="flex-1 px-3 py-2 border rounded" />
                  <button onClick={() => initWithTableId(manualId)} className="px-4 py-2 bg-[#18749b] text-white rounded">Enter</button>
                </div>
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
