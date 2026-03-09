import { Instagram, Mail, Phone, MapPin, Images, MessagesSquare, Flame } from 'lucide-react';
import { useNavigation } from "../../utils/navigation";

export default function Footer() {
  const { go } = useNavigation();

  return (
    <footer className="bg-[#050505] text-white/50 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
               <Flame size={24} className="text-orange-600 fill-orange-600" />
               <h3 className="text-white text-xl font-black uppercase tracking-tighter">
                Pure Fire <span className="text-orange-600">Masale</span>
              </h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed font-medium uppercase tracking-tight text-white/30">
              Igniting kitchens across the globe with premium, hand-picked spices. Authenticity in every grain, fire in every soul.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Images, href: "https://pin.it/5BJuVrWiZ" },
                { icon: Instagram, href: "https://www.instagram.com/kiswah_kabah_islamic_store_33" },
                { icon: MessagesSquare, href: "https://wa.me/message/IYL55KOEQJ4GK1" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/[0.03] border border-white/5 hover:border-orange-500/50 hover:text-orange-500 rounded-2xl transition-all duration-300 group"
                >
                  <social.icon size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div>
              <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">Catalog</h4>
              <ul className="space-y-4">
                {['All Spices', 'Gift Boxes', 'Signature Blends', 'New Arrivals'].map((item) => (
                  <li key={item}>
                    <button onClick={() => go('/category-list')} className="hover:text-orange-500 transition-colors text-xs font-bold uppercase tracking-tighter">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">Concierge</h4>
              <ul className="space-y-4">
                {['Track Order', 'Shipping Info', 'Returns', 'Contact'].map((item) => (
                  <li key={item}>
                    <button onClick={() => go(`/${item.toLowerCase().replace(' ', '-')}`)} className="hover:text-orange-500 transition-colors text-xs font-bold uppercase tracking-tighter">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">Contact Info</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <MapPin size={18} className="text-orange-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-tighter leading-tight">
                  Gomti Nagar,<br /> Lucknow – 110006
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={18} className="text-orange-600 shrink-0" />
                <a href="tel:+917317322775" className="text-xs font-bold uppercase tracking-tighter hover:text-orange-500 transition-colors">
                  +91 7317322775
                </a>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={18} className="text-orange-600 shrink-0" />
                <a href="mailto:abdullahislamicstore88@gmail.com" className="text-xs font-bold uppercase tracking-tighter hover:text-orange-500 transition-colors truncate">
                  purefire@info.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8">
            <button onClick={() => go('/privacy')} className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Privacy</button>
            <button onClick={() => go('/terms')} className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Terms</button>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
              © 2026 Pure Fire Masale. All rights reserved.
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1">
              Developed by <span className="text-white">Akamify</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}