
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { register } from "../actions/authActions";
import { REGISTER_RESET } from "../constants/authConstants";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const Register = () => {
  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ pull success instead of userInfo
  const { loading, error, success } = useSelector((state) => state.auth);

  // ✅ Reset state when component mounts
  useEffect(() => {
    dispatch({ type: REGISTER_RESET });
  }, [dispatch]);

  // ✅ Redirect only when registration was successful
  useEffect(() => {
    if (success) {
      navigate("/login");
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          onLoadedData={() => setIsVideoLoaded(true)}
        >
          <source
            src="https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-[#18749b]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Fallback Background */}
      {!isVideoLoaded && (
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-[#18749b] via-[#2E5A94] to-[#1E3A5F]"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-[#18749b]/40"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#18749b] to-[#5A8FD1] shadow-2xl mb-4 sm:mb-6 ring-4 ring-white/20 animate-float">
              <BuildingStorefrontIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 animate-in">
              <span className="bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
                Ocean Breeze
              </span>
            </h1>
            <p className="text-blue-100 text-sm sm:text-base font-medium">
              Restaurant Management Portal
            </p>
            <div className="flex items-center justify-center mt-2 space-x-1">
              <SparklesIcon className="w-4 h-4 text-blue-200" />
              <span className="text-xs sm:text-sm text-blue-200">
                Admin Registration
              </span>
              <SparklesIcon className="w-4 h-4 text-blue-200" />
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/20 animate-in">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Create Admin Account
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Join the Ocean Breeze management team
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 text-center cursor-pointer transition-all duration-200 hover:bg-red-100 animate-in fade-in slide-in-from-top-2"
                onClick={clearError}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm sm:text-base">{error}</span>
                  <span className="text-xs opacity-70">(Click to dismiss)</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 text-center animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="text-sm sm:text-base font-medium">
                    Registration successful! Redirecting to login...
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-semibold text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="Name"
                    type="text"
                    value={formData.Name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-all duration-200 bg-white/90 backdrop-blur-sm placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-semibold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="admin@oceanbreeze.com"
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-all duration-200 bg-white/90 backdrop-blur-sm placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a strong password"
                    className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-all duration-200 bg-white/90 backdrop-blur-sm placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-[#18749b] transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 sm:space-x-3">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#18749b] border-gray-300 rounded focus:ring-[#18749b] focus:ring-2 mt-0.5"
                />
                <label className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-[#18749b] hover:text-[#2E5A94] font-medium underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-[#18749b] hover:text-[#2E5A94] font-medium underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#18749b] to-[#5A8FD1] hover:from-[#2E5A94] hover:to-[#4A7BC1] text-white py-3 sm:py-4 px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-[#18749b]/30"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Create Admin Account</span>
                  </div>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <span className="px-3">Already have an account?</span>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#18749b] hover:text-[#2E5A94] font-semibold text-sm sm:text-base transition-colors duration-200 hover:underline"
                >
                  Sign in to your account
                </button>
              </div>
            </form>

            {/* Additional Info */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                This registration is exclusively for authorized restaurant
                staff.
                <br className="hidden sm:block" />
                Contact your manager if you need assistance.
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-4 sm:mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure SSL Connection</span>
            </div>
          </div>
        </div>

        {/* Floating Elements for Visual Appeal */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse hidden lg:block"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#18749b]/20 rounded-full blur-2xl animate-pulse hidden lg:block"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-blue-300/20 rounded-full blur-lg animate-pulse hidden lg:block"></div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-in {
          animation: fadeInUp 0.6s ease-out;
        }

        .fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .slide-in-from-top-2 {
          animation: slide-in-from-top-2 0.3s ease-out;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .backdrop-blur-md {
            backdrop-filter: blur(8px);
          }
        }

        /* Focus styles for better accessibility */
        input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(61, 116, 182, 0.1);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(61, 116, 182, 0.3);
          border-radius: 2px;
        }

        /* Touch optimization for mobile */
        @media (max-width: 768px) {
          button,
          input {
            touch-action: manipulation;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
