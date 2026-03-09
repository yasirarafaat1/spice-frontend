import { ArrowRight, ShoppingBag, Leaf, Zap, Award } from 'lucide-react';

export default function SpiceHero() {
  return (
    <div className="relative min-h-screen bg-[#0f0f0f] text-white overflow-hidden flex items-center">
      
      {/* Dynamic Background: The "Heat" Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/20 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-6 w-full pt-20 pb-12">
        <div className="flex flex-col items-center text-center">
          
          {/* Floating Badge */}
          <div className="mb-6 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md flex items-center gap-2 animate-bounce-slow">
            <Zap size={14} className="text-orange-500" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-orange-200">Freshly Grounded Today</span>
          </div>

          {/* Bold Typography with Text-Clipping */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6">
            PURE <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-700">FIRE</span>
          </h1>
          
          <p className="max-w-2xl text-gray-400 text-lg md:text-xl font-light mb-10 leading-relaxed">
            Forget supermarket dust. We source raw spices directly from farmers and stone-grind them in small batches. <span className="text-white font-medium italic">Smell the difference.</span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-6 mb-20">
            <button className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-full font-black flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(234,88,12,0.4)]">
              SHOP THE COLLECTION <ShoppingBag size={20} />
            </button>
            <button className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/5 font-bold transition-all">
              OUR PROCESS
            </button>
          </div>

          {/* Visual Showcase: The Floating Spices */}
          <div className="relative w-full max-w-4xl h-[400px] mt-10">
            {/* Centerpiece Image (Replace with a PNG of a Masala bowl or pouch) */}
            {/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-64 h-64 md:w-80 md:h-80 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]">
               <img 
                src="/hero.jpg" 
                alt="Main Product" 
                className="w-full h-full object-contain rotate-12 hover:rotate-0 transition-transform duration-700"
               />
            </div> */}

            {/* Floating Ingredient Cards */}
            <div className="absolute top-0 left-4 md:left-20 animate-float-slow z-30">
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center font-bold">🌶️</div>
                <div className="text-left">
                  <p className="text-sm font-bold">Byadgi Chilli</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">High Color • Low Heat</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 right-4 md:right-20 animate-float-delayed z-30">
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center font-bold">✨</div>
                <div className="text-left">
                  <p className="text-sm font-bold">Salem Turmeric</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">3.5% Curcumin content</p>
                </div>
              </div>
            </div>

            {/* Background Decorative Text */}
            <div className="absolute inset-0 flex items-center justify-center select-none opacity-[0.03] pointer-events-none">
              <span className="text-[20vw] font-black uppercase">ORGANIC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="absolute bottom-0 w-full py-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center opacity-50">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest"><Leaf size={14}/> NO PRESERVATIVES</div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest"><Award size={14}/> ISO CERTIFIED</div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest"><ArrowRight size={14}/> FARM TO TABLE</div>
        </div>
      </div>

      {/* Tailwind Animations Needed in global.css:
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
      */}
    </div>
  );
}