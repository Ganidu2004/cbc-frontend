import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaPinterestP, 
  FaInstagram, 
  FaTiktok, 
  FaYoutube, 
  FaAt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-[#161f2c] text-gray-200 pt-12 pb-6 px-4 md:px-12 border-t border-gray-800 relative select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 pb-12">
        
        {/* Column 1: Brand & Slogan & Socials (cols 4) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Cosmetics Logo" 
              className="w-12 h-12 rounded-full object-cover border border-amber-400/40 shadow-sm"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-serif">
                Cosmetics<span className="text-amber-400 font-normal text-xl">.lk</span>
              </h2>
              <p className="text-[10px] tracking-wider uppercase text-amber-400 font-semibold">
                The Ultimate Beauty Mantra
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-300 font-light max-w-sm leading-relaxed">
            Buy Original & Premium Beauty Products from Cosmetics.lk
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2">
            {[
              { icon: <FaFacebookF size={15} />, href: 'https://facebook.com', label: 'Facebook' },
              { icon: <FaPinterestP size={15} />, href: 'https://pinterest.com', label: 'Pinterest' },
              { icon: <FaInstagram size={15} />, href: 'https://instagram.com', label: 'Instagram' },
              { icon: <FaTiktok size={15} />, href: 'https://tiktok.com', label: 'TikTok' },
              { icon: <FaYoutube size={15} />, href: 'https://youtube.com', label: 'YouTube' },
              { icon: <FaAt size={15} />, href: 'https://threads.net', label: 'Threads' },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-400 hover:text-gray-900 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Awards / Badges (cols 3) */}
        <div className="lg:col-span-3 flex items-center justify-start lg:justify-center gap-3 sm:gap-4 my-2 lg:my-0">
          {/* Badge 1: Gold Winner 2022 */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 p-[2px] shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-[#182230] p-1.5 flex flex-col items-center justify-center text-center border border-amber-300/30">
                <span className="text-[7px] font-extrabold uppercase tracking-tighter text-amber-300 leading-none">GOLD WINNER</span>
                <div className="w-full border-t border-amber-400/40 my-0.5" />
                <span className="text-[6px] text-gray-300 leading-tight">Best e-Commerce</span>
                <span className="text-[10px] font-black text-amber-300">2022</span>
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-[1px] bg-gradient-to-r from-amber-500 to-amber-700 rounded text-[7px] font-black text-gray-950 uppercase tracking-widest whitespace-nowrap shadow">
                WINNER
              </div>
            </div>
          </div>

          {/* Badge 2: Winner 2023 */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 p-[2px] shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-[#182230] p-1.5 flex flex-col items-center justify-center text-center border border-amber-300/30">
                <span className="text-[7px] font-extrabold uppercase tracking-tighter text-amber-300 leading-none">WINNER</span>
                <div className="w-full border-t border-amber-400/40 my-0.5" />
                <span className="text-[6px] text-gray-300 leading-tight">Most Popular</span>
                <span className="text-[10px] font-black text-amber-300">2023</span>
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-[1px] bg-gradient-to-r from-amber-500 to-amber-700 rounded text-[7px] font-black text-gray-950 uppercase tracking-widest whitespace-nowrap shadow">
                AWARDS
              </div>
            </div>
          </div>

          {/* Badge 3: Top Web.lk April 2025 */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-lg bg-gradient-to-b from-blue-400 via-blue-600 to-indigo-900 p-[2px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-md bg-[#16202c] p-1 flex flex-col items-center justify-center text-center">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mb-0.5 text-white text-[10px] font-bold">
                  ✓
                </div>
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider leading-none">TOP</span>
                <span className="text-[8px] font-bold text-gray-200 leading-none">WEB.LK</span>
                <span className="text-[7px] text-gray-400 mt-1 uppercase font-semibold">APRIL 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: QUICK LINKS (cols 2) */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <h3 className="text-sm font-bold tracking-wider text-white uppercase border-b border-gray-700/60 pb-1.5 inline-block">
            QUICK LINKS
          </h3>
          <ul className="space-y-2 text-xs text-gray-300 font-medium">
            {[
              { label: 'Deliveries', path: '/track-order' },
              { label: 'Return Policy', path: '/about' },
              { label: 'Store Locator', path: '/contact' },
              { label: 'Loyalty Customer', path: '/profile' },
              { label: 'Privacy Policy', path: '/about' },
              { label: 'Contact Us', path: '/contact' },
              { label: 'About us', path: '/about' },
            ].map((item, index) => (
              <li key={index}>
                <Link 
                  to={item.path} 
                  className="hover:text-amber-400 transition-colors duration-200 inline-block py-0.5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: CONTACT US (cols 3) */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-white uppercase border-b border-gray-700/60 pb-1.5 inline-block">
            CONTACT US
          </h3>
          
          <div className="space-y-3 text-xs text-gray-300 font-normal">
            <div className="flex items-start gap-2.5">
              <FaMapMarkerAlt className="text-amber-400 text-sm mt-0.5 flex-shrink-0" />
              <span>No: 7/1A Pepiliyana Mawatha, Nugegoda 10250</span>
            </div>

            <div className="flex items-center gap-2.5">
              <FaPhoneAlt className="text-amber-400 text-sm flex-shrink-0" />
              <a href="tel:0112818191" className="hover:text-amber-400 transition-colors">
                0112 81 81 91 / 076 626 8658
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <FaEnvelope className="text-amber-400 text-sm flex-shrink-0" />
              <a href="mailto:sales@cosmetics.lk" className="hover:text-amber-400 transition-colors">
                sales@cosmetics.lk
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="max-w-7xl mx-auto pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
        <p>© 2026, Cosmetics.lk Powered by Shopify</p>
      </div>

      {/* Floating WhatsApp Widget Button (Bottom Right) */}
      <a
        href="https://wa.me/94766268658"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-300 group cursor-pointer"
        title="Chat with us on WhatsApp"
      >
        <FaWhatsapp size={32} className="drop-shadow-sm" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-300 animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400" />
      </a>
    </footer>
  );
}
