import { motion } from "framer-motion";
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok } from "react-icons/fa";

export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-bg text-text px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl sm:text-4xl md:text-[2.6rem] font-semibold tracking-tight mb-3"
        >
          Contact <span className="text-primary">Us</span>
        </motion.h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-sm sm:text-base text-text/70">
          Have a question or want to partner with us? Send a message and our team will get back to you shortly.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-bg p-5 sm:p-7 shadow-sm ring-1 ring-border/70"
          >
            <h3 className="mb-5 text-xl sm:text-2xl font-semibold">Send us a Message</h3>
            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text/80">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-xl bg-bg px-4 py-3 text-sm sm:text-base text-text placeholder:text-text/40 outline-none ring-1 ring-border/80 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text/80">Email</label>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-xl bg-bg px-4 py-3 text-sm sm:text-base text-text placeholder:text-text/40 outline-none ring-1 ring-border/80 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text/80">Message</label>
                <textarea
                  rows={4}
                  placeholder="Your message"
                  className="w-full rounded-xl bg-bg px-4 py-3 text-sm sm:text-base text-text placeholder:text-text/40 outline-none ring-1 ring-border/80 focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-400 hover:shadow-md"
              >
                Send Message
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="rounded-2xl bg-bg p-5 sm:p-7 shadow-sm ring-1 ring-border/70">
              <h3 className="mb-4 text-xl sm:text-2xl font-semibold">Connect with us</h3>
              <p className="mb-5 text-sm sm:text-base text-text/70">
                Follow us on social media for tips, updates, and announcements.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="rounded-full bg-green-500 p-3 text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                >
                  <FaWhatsapp size={20} />
                </a>
                <a
                  href="#"
                  className="rounded-full bg-blue-600 p-3 text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                >
                  <FaFacebookF size={20} />
                </a>
                <a
                  href="#"
                  className="rounded-full bg-pink-500 p-3 text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                >
                  <FaInstagram size={20} />
                </a>
                <a
                  href="#"
                  className="rounded-full bg-blue-700 p-3 text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                >
                  <FaLinkedinIn size={20} />
                </a>
                <a
                  href="#"
                  className="rounded-full bg-black p-3 text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                >
                  <FaTiktok size={20} />
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-bg p-5 sm:p-7 shadow-sm ring-1 ring-border/70">
              <h3 className="mb-4 text-xl sm:text-2xl font-semibold">Contact Info</h3>
              <ul className="space-y-3 text-sm sm:text-base text-text/85">
                <li className="rounded-lg bg-bg px-3 py-2 ring-1 ring-border/60">
                  <span className="mr-2 font-medium text-text">Email:</span>
                  support@edusphere.com
                </li>
                <li className="rounded-lg bg-bg px-3 py-2 ring-1 ring-border/60">
                  <span className="mr-2 font-medium text-text">Phone:</span>
                  +234 800 123 4567
                </li>
                <li className="rounded-lg bg-bg px-3 py-2 ring-1 ring-border/60">
                  <span className="mr-2 font-medium text-text">Address:</span>
                  123 Edu Street, Kano, Nigeria
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
