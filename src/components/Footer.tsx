import React from 'react';
import { Hammer, Phone, Mail, MapPin, ShieldCheck, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-yellow-500/20 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-400 p-2 rounded text-black font-black">
                <Hammer className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-wider text-white">
                CHHOTAN RAM CONSTRUCTION
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Delivering premium, ultra-durable commercial and residential construction projects. From foundation to final premium finish, we shape masterpieces with structural integrity.
            </p>
            <div className="flex items-center space-x-2 text-xs text-yellow-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Licensed, Insured & Guarantee-Backed</span>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-bold tracking-wider text-sm uppercase border-b border-yellow-500/20 pb-2">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <a href="tel:+919798133589" className="hover:text-yellow-400 transition">+91 97981 33589</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <a href="mailto:ramchhotan63@gmail.com" className="hover:text-yellow-400 transition">ramchhotan63@gmail.com</a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>Patna, Bihar, India</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-white font-bold tracking-wider text-sm uppercase border-b border-yellow-500/20 pb-2">
              Working Hours
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <span>Mon - Fri: 8:00 AM - 6:00 PM</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <span>Saturday: 9:00 AM - 4:00 PM</span>
              </li>
              <li className="text-xs text-yellow-400/80 italic">
                * Emergency structural support available 24/7.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>© {new Date().getFullYear()} Chhotan Ram Construction. All Rights Reserved.</p>
          <p className="mt-4 sm:mt-0 text-yellow-400/60 hover:text-yellow-400 transition cursor-pointer">
            Built with supreme engineering & structural design standards.
          </p>
        </div>
      </div>
    </footer>
  );
}
