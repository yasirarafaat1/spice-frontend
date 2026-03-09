import { Truck, Shield, RotateCcw, Headphones, Users, Zap, Award } from 'lucide-react';

export default function Features() {
    const stats = [
        { label: 'Active Users', value: '1M+', icon: Users },
        { label: 'Global Stores', value: '50+', icon: Zap },
        { label: 'Quality Awards', value: '12', icon: Award },
    ];

    const features = [
        {
            icon: Truck,
            title: 'Express Delivery',
            description: 'Worldwide lightning shipping',
            accent: 'group-hover:text-orange-500'
        },
        {
            icon: Shield,
            title: 'Ironclad Security',
            description: 'AES-256 encrypted payments',
            accent: 'group-hover:text-amber-500'
        },
        {
            icon: RotateCcw,
            title: 'Seamless Returns',
            description: '30-day no-question policy',
            accent: 'group-hover:text-red-500'
        },
        {
            icon: Headphones,
            title: 'Elite Support',
            description: '24/7 priority concierge',
            accent: 'group-hover:text-blue-500'
        }
    ];

    return (
        <section className="bg-[#050505] py-24 border-t border-white/5 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/5 blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* 1M+ Customers Trust Bar */}
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 mb-24 border-b border-white/5 pb-16">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center group">
                            <div className="flex items-center gap-3 mb-1">
                                <stat.icon size={18} className="text-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                    {stat.value}
                                </span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-1">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group relative p-8 transition-all duration-500 hover:bg-white/[0.02] border border-transparent hover:border-white/5 rounded-[2rem]"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`mb-6 p-5 rounded-3xl bg-white/[0.03] text-white/40 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/[0.05] ${feature.accent}`}>
                                        <Icon size={32} strokeWidth={1.5} />
                                    </div>
                                    
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">
                                        {feature.title}
                                    </h3>
                                    
                                    <p className="text-xs text-white/40 leading-relaxed font-medium uppercase tracking-tighter">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Subtle corner accent for hover */}
                                <div className={`absolute top-4 right-4 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${feature.accent.replace('text', 'bg')}`} />
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Trust Badge */}
                <div className="mt-20 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20">
                        Authorized Global Retailer & Partner
                    </p>
                </div>
            </div>
        </section>
    );
}