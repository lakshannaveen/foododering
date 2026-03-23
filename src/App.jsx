import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store"; 
import MenuPage from "./pages/MenuPage";
import OrderTracking from "./pages/OrderTrackingPage";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckoutPage from "./pages/CheckoutPage";
import Footer from "./components/Footer";
import "./App.css";
import QRLandingPage from "./pages/QRLandingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PayPalReturn from "./pages/PayPalReturn"; 
import LicensePage from "./pages/LicensePage";
import { validateLicense } from "./services/licenseService";

function Layout() {
  const location = useLocation();

  // Hide footer on dashboard route
  const hideFooterRoutes = ["/dashboard", "/login"];

  return (
    <>
      <Routes>
        <Route path="/license" element={<LicensePage />} />
        <Route path="/" element={<QRLandingPage />} />

        <Route path="/menu" element={<MenuPage />} />
        <Route path="/track-order" element={<OrderTracking />} />
        <Route path="/track-order/:OrderId" element={<OrderTracking />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/paypal-return" element={<PayPalReturn />} /> {/* added */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {!hideFooterRoutes.includes(location.pathname) && <Footer />}

      {/*  Toastify container here so all routes can use it */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function LicenseGuard({ children }) {
  const [allowed, setAllowed] = React.useState(false);
  const [redirectTo, setRedirectTo] = React.useState(null);

  const location = useLocation();

  React.useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        // If we're already on the license page, skip validation
        if (location.pathname === "/license") return;

        const key = localStorage.getItem("licenseKey");

        if (!key) {
          // no key -> navigate to license entry page (no full reload)
          setRedirectTo("/license");
          return;
        }

        const valid = await validateLicense(key);

        if (!valid) {
          setRedirectTo("/license");
          return;
        }

        if (mounted) setAllowed(true);
      } catch (e) {
        console.error(e);
        setRedirectTo("/license");
      }
    }

    check();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  // Allow the license entry page to render without a valid license
  // so users can paste their account id and license key.
  if (location.pathname === "/license") return children;

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  if (!allowed) return null;
  return children;
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <LicenseGuard>
          <Layout />
        </LicenseGuard>
      </Router>
    </Provider>
  );
}

export default App;
