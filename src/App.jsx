import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
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
import PayPalReturn from "./pages/PayPalReturn"; // added

function Layout() {
  const location = useLocation();

  // Hide footer on dashboard route
  const hideFooterRoutes = ["/dashboard", "/login"];

  return (
    <>
      <Routes>
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

      {/* ✅ Toastify container here so all routes can use it */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      {" "}
      {/* ✅ wrap with Provider */}
      <Router>
        <Layout />
      </Router>
    </Provider>
  );
}

export default App;
