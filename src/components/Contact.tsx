import { motion } from "framer-motion";
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok } from "react-icons/fa";

export default function Contact() {
  return (
    <section
      id="contact"
      className="min-h-screen bg-bg text-text px-6 py-20 flex items-center justify-center"
    >
      <div className="max-w-6xl w-full">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-12 text-center"
        >
          Contact <span className="text-primary">Us</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-bg border border-border rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-3xl font-bold mb-6">Send us a Message</h3>
            <form className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Message</label>
                <textarea
                  rows={5}
                  placeholder="Your message"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text focus:outline-none focus:border-primary"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-400 transition-colors"
              >
                Send Message
              </button>
            </form>
          </motion.div>

          {/* Right Side - Social & Contact */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center gap-8"
          >
            <div className="">
              <h3 className="text-2xl  font-bold mb-4 md:text-4xl font-poppins">Connect with us</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="p-4 rounded-full bg-green-500 text-white hover:opacity-90 transition-opacity"
                >
                  <FaWhatsapp size={28} />
                </a>
                <a
                  href="#"
                  className="p-4 rounded-full bg-blue-600 text-white hover:opacity-90 transition-opacity"
                >
                  <FaFacebookF size={28} />
                </a>
                <a
                  href="#"
                  className="p-4 rounded-full bg-pink-500 text-white hover:opacity-90 transition-opacity"
                >
                  <FaInstagram size={28} />
                </a>
                <a
                  href="#"
                  className="p-4 rounded-full bg-blue-700 text-white hover:opacity-90 transition-opacity"
                >
                  <FaLinkedinIn size={28} />
                </a>
                <a
                  href="#"
                  className="p-4 rounded-full bg-black text-white hover:opacity-90 transition-opacity"
                >
                  <FaTiktok size={28} />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 md:text-4xl font-poppins">Contact Info</h3>
              <ul className="space-y-3 md:text-xl font-roboto-mono">
                <li>
                  <span className="font-medium">Email:</span> support@edusphere.com
                </li>
                <li>
                  <span className="font-medium">Phone:</span> +234 800 123 4567
                </li>
                <li>
                  <span className="font-medium">Address:</span> 123 Edu Street, Kano, Nigeria
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
