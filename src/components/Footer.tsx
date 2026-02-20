import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & Description */}
        <div>
          <h2 className="text-2xl font-bold mb-3">EduSphere</h2>
          <p className="text-gray-400 text-sm">
            Smart, cloud-based school management platform helping schools save
            time, reduce errors, and operate like modern digital institutions.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4">
            <a href="#" className="p-3 rounded-full bg-green-500 hover:opacity-80 transition-opacity"><FaWhatsapp size={18} /></a>
            <a href="#" className="p-3 rounded-full bg-blue-600 hover:opacity-80 transition-opacity"><FaFacebookF size={18} /></a>
            <a href="#" className="p-3 rounded-full bg-pink-500 hover:opacity-80 transition-opacity"><FaInstagram size={18} /></a>
            <a href="#" className="p-3 rounded-full bg-blue-700 hover:opacity-80 transition-opacity"><FaLinkedinIn size={18} /></a>
            <a href="#" className="p-3 rounded-full bg-black hover:opacity-80 transition-opacity"><FaTiktok size={18} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} EduSphere. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
