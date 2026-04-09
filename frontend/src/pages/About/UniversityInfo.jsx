import React from 'react';
import { motion } from 'framer-motion';
import {
    School,
    History,
    Award,
    Globe,
    CheckCircle,
    ArrowRight,
    Users,
    ShieldCheck,
    MapPin,
    Trophy
} from 'lucide-react';

const UniversityInfo = () => {
    return (
        <div className="flex flex-col gap-24 pb-32">
            {/* Hero Section */}
            <section className="bg-primary pt-48 pb-64 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center gap-8">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                        <div className="flex justify-center">
                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
                                <School className="text-primary w-12 h-12" />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter">
                            A LEGACY OF <span className="text-blue-300">EXCELLENCE</span>
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed opacity-80">
                            Founded in , our university has been a beacon of innovation, research, and holistic development for over three decades.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="max-w-7xl mx-auto px-6 w-full -mt-40 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Founded', value: '1995', icon: History, color: 'bg-blue-500' },
                        { label: 'Students', value: '15,000+', icon: Users, color: 'bg-emerald-500' },
                        { label: 'Faculty', value: '800+', icon: Award, color: 'bg-amber-500' },
                        { label: 'Global Rank', value: '#120', icon: Globe, color: 'bg-rose-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 flex flex-col items-center justify-center gap-6 group hover:-translate-y-4 transition-all duration-500">
                            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                                <stat.icon size={30} />
                            </div>
                            <div className="text-center">
                                <span className="text-4xl font-black text-gray-800 block">{stat.value}</span>
                                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Content Sections */}
            <section className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.4em]">
                            <span className="w-12 h-1 bg-primary rounded-full" />
                            Our Vision
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-800 tracking-tighter leading-none">
                            Defining the Future of <br />Education.
                        </h2>
                    </div>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">
                        We believe in empowering the next generation of leaders through a curriculum that blends rigorous academic theory with real-world application. Our campus is a diverse ecosystem where creativity meets technology.
                    </p>
                    <div className="flex flex-col gap-6">
                        {[
                            'Research-First Academic Philosophy',
                            'Industry-Aligned Course Modules',
                            'Global Exchange Programs',
                            'State-of-the-Art Laboratory Infrastructure'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 text-gray-700 font-bold tracking-tight">
                                <CheckCircle className="text-emerald-500" size={24} /> {item}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative group perspective-1000">
                    <div className="aspect-video bg-gray-200 rounded-[56px] overflow-hidden shadow-2xl relative transform group-hover:rotate-0 rotate-2 transition-all duration-1000">
                        <img src="https://images.unsplash.com/photo-1541339907198-e08759dfc3f0?q=80&w=2670&auto=format&fit=crop" alt="University Campus" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white p-10 rounded-[48px] shadow-2xl hidden md:flex flex-col items-center justify-center text-center border border-slate-100">
                        <Trophy className="text-amber-500 mb-2" size={32} />
                        <span className="text-xs font-black leading-tight uppercase">Top 10 Research Uni</span>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-primary-dark py-32 relative overflow-hidden text-white">
                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-20">
                    <div className="flex flex-col gap-4 text-center">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">OUR GUIDING PRINCIPLES</h2>
                        <div className="h-1.5 w-40 bg-blue-400 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: 'Inclusivity', desc: 'A campus for everyone, regardless of background or orientation.', icon: Users },
                            { title: 'Innovation', desc: 'Pushing the boundaries of what is possible through technology.', icon: ShieldCheck },
                            { title: 'Integrity', desc: 'Upholding the highest standards of academic honesty.', icon: School },
                        ].map((v, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 p-12 rounded-[48px] flex flex-col gap-8 hover:bg-white hover:text-primary transition-all duration-500 group">
                                <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-2xl">
                                    <v.icon size={32} />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-2xl font-black tracking-tight uppercase">{v.title}</h3>
                                    <p className="text-blue-100/60 font-medium group-hover:text-gray-500 transition-colors leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Campus Locations */}
            <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                    <h2 className="text-4xl font-black text-gray-800 tracking-tight">WHERE WE OPERATE</h2>
                    <p className="text-gray-500 font-medium">Spanning across 400 acres of lush green integrated township.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="group relative rounded-[40px] overflow-hidden h-[400px]">
                        <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dee7a?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex flex-col justify-end p-12">
                            <span className="text-xs font-black tracking-widest text-blue-300 uppercase mb-2 flex items-center gap-2"><MapPin size={14} /> Main Campus</span>
                            <h4 className="text-3xl font-black text-white uppercase tracking-tighter">NORTH WING ACADEMICS</h4>
                        </div>
                    </div>
                    <div className="group relative rounded-[40px] overflow-hidden h-[400px]">
                        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2573&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex flex-col justify-end p-12">
                            <span className="text-xs font-black tracking-widest text-blue-300 uppercase mb-2 flex items-center gap-2"><MapPin size={14} /> Research Wing</span>
                            <h4 className="text-3xl font-black text-white uppercase tracking-tighter">INNOVATION TOWERS</h4>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UniversityInfo;
