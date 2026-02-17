import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  ChefHat,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative mt-auto bg-gradient-to-br from-white/70 to-teal-50/80 backdrop-blur-xl shadow-2xl border-t border-blue-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500/90 text-sm backdrop-blur-sm">
          <p className="text-center md:text-left mb-3 md:mb-0">
            © {new Date().getFullYear()} Ocean Breeze. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
            <a href="#" className="hover:text-[#18749b] hover:underline underline-offset-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#18749b]/30">Privacy Policy</a>
            <a href="#" className="hover:text-[#18749b] hover:underline underline-offset-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#18749b]/30">Terms of Service</a>
            <a href="#" className="hover:text-[#18749b] hover:underline underline-offset-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#18749b]/30">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
