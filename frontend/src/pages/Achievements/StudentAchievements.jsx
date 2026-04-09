import React, { useState, useEffect } from 'react';
import { Award, ChevronRight, Trophy, Zap, Users, ChevronLeft, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievements } from '../../services/api';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';

const StudentAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await getAchievements();
                setAchievements(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Carousel logic
    const topAchievements = achievements.slice(0, 5);

    useEffect(() => {
        if (topAchievements.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % topAchievements.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [topAchievements.length]);

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % topAchievements.length);
    };

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev === 0 ? topAchievements.length - 1 : prev - 1));
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'sports': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'clubs': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'placements': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'others': return 'bg-violet-100 text-violet-700 border-violet-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const categories = [
        { title: 'Sports Triumphs', count: achievements.filter(a => a.type === 'sports').length || '0', icon: Trophy, color: 'bg-orange-500' },
        { title: 'Club Milestones', count: achievements.filter(a => a.type === 'clubs').length || '0', icon: Users, color: 'bg-indigo-500' },
        { title: 'Stellar Placements', count: achievements.filter(a => a.type === 'placements').length || '0', icon: Zap, color: 'bg-emerald-500' },
    ];

    const filteredAchievements = achievements.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (item.subcategory && item.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = activeFilter === 'ALL' || item.type.toUpperCase() === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col gap-24 pb-32 bg-slate-50 min-h-screen">

            {/* ── Hero Banner ── */}
            <section className="bg-white py-32 relative overflow-hidden text-center border-b border-slate-100">
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-8">
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center justify-center gap-3 text-primary font-black uppercase text-xs tracking-[0.4em] mb-4">
                            <div className="w-12 h-1 bg-primary rounded-full" />
                            Official Wall of Fame
                            <div className="w-12 h-1 bg-primary rounded-full" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tighter leading-none mb-6 uppercase">
                            Celebrating <span className="text-primary italic">Excellence</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed text-lg">
                            Recognizing the extraordinary milestones of our campus stars across academics, sports, clubs, and professional placements.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Category Stats ── */}
            <section className="max-w-7xl mx-auto px-6 w-full -mt-32 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center justify-center gap-4 hover:-translate-y-2 transition-transform duration-500"
                        >
                            <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                <cat.icon size={28} />
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-slate-800 tracking-tighter">{cat.count}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{cat.title}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Spotlight Carousel ── */}
            {!loading && topAchievements.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 w-full">
                    <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em] mb-6">
                        <span className="w-8 h-1 bg-primary rounded-full" />
                        Trending Spotlights
                    </div>
                    
                    <div className="relative w-full h-[500px] rounded-[48px] overflow-hidden shadow-2xl group bg-slate-900 border border-slate-800">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(e, { offset }) => {
                                    if (offset.x < -50) handleNext();
                                    else if (offset.x > 50) handlePrev();
                                }}
                            >
                                <img 
                                    src={getImageUrl(topAchievements[currentSlide].detailImage || topAchievements[currentSlide].cardImage)} 
                                    className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                                    alt="Spotlight"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                                
                                <div className="absolute bottom-0 left-0 p-12 w-full md:w-2/3 flex flex-col gap-6">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border bg-white/10 text-white border-white/20 backdrop-blur-md`}>
                                            {topAchievements[currentSlide].type}
                                        </span>
                                        <span className="text-white/60 font-black tracking-widest text-sm">{topAchievements[currentSlide].year}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight uppercase">
                                        {topAchievements[currentSlide].title}
                                    </h2>
                                    <p className="text-slate-300 font-medium leading-relaxed italic line-clamp-2 max-w-xl">
                                        "{topAchievements[currentSlide].description}"
                                    </p>
                                    <Link 
                                        to={`/achievements/${topAchievements[currentSlide]._id}`}
                                        className="w-fit mt-4 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-2"
                                    >
                                        Read Full Story <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Carousel Controls */}
                        {topAchievements.length > 1 && (
                            <div className="absolute bottom-12 right-12 flex gap-4 z-20">
                                <button onClick={handlePrev} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors">
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={handleNext} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors">
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                        
                        {/* Indicators */}
                        {topAchievements.length > 1 && (
                            <div className="absolute top-12 left-12 flex gap-2 z-20">
                                {topAchievements.map((_, idx) => (
                                    <div key={idx} className={`w-12 h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'bg-primary' : 'bg-white/30'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── Achievement Grid ── */}
            <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-16">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-slate-400 font-black uppercase text-xs tracking-[0.3em]">
                        <span className="w-8 h-1 bg-slate-300 rounded-full" />
                        Comprehensive Archive
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">Every Milestone</h2>
                </div>

                <div className="bg-white p-3 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4 mt-2">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search achievements..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-[24px] py-4 pl-14 pr-8 font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-[24px] border border-slate-100 w-full md:w-auto">
                        <div className="px-4 py-2 border-r border-slate-200 shrink-0">
                            <Filter size={16} className="text-slate-400" />
                        </div>
                        {['ALL', 'SPORTS', 'CLUBS', 'PLACEMENTS', 'OTHERS'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex-1 min-w-[70px] px-3 py-2.5 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all ${activeFilter === filter ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-32">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAchievements.map((item, i) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-[40px] shadow-xl shadow-slate-100/50 border border-slate-100 flex flex-col overflow-hidden hover:-translate-y-2 group transition-all duration-500"
                            >
                                <div className="w-full h-56 overflow-hidden relative bg-slate-100">
                                    {item.cardImage && (
                                        <img
                                            src={getImageUrl(item.cardImage)}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    )}
                                    <div className="absolute top-6 right-6">
                                        <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-sm text-slate-800 shadow-xl">
                                            {item.year.toString().slice(-2)}'
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5 p-8 flex-1">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border w-fit flex items-center gap-2 ${getTypeColor(item.type)}`}>
                                        <Award size={12} /> {item.type} {item.subcategory && `• ${item.subcategory}`}
                                    </span>

                                    <h3 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-primary transition-colors tracking-tight uppercase">
                                        {item.title}
                                    </h3>
                                    
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed italic flex-1 line-clamp-3">
                                        "{item.description}"
                                    </p>

                                    <div className="pt-6 mt-4 border-t border-slate-100">
                                        <Link
                                            to={`/achievements/${item._id}`}
                                            className="flex items-center justify-between w-full text-slate-400 font-black uppercase text-[10px] tracking-widest group-hover:text-primary transition-colors"
                                        >
                                            View Achievement <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                {filteredAchievements.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-24 bg-white rounded-[64px] border-4 border-dashed border-slate-100 flex flex-col items-center gap-8 text-center shadow-xl shadow-slate-200/20">
                        <Trophy className="text-slate-200 w-24 h-24" />
                        <div>
                            <h4 className="text-3xl font-black text-slate-300 uppercase tracking-widest">Awaiting First Victory</h4>
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] mt-4 max-w-lg mx-auto leading-relaxed">The stage is set. Our campus starts are grinding. Highlights will appear here soon.</p>
                        </div>
                    </motion.div>
                )}
            </section>
        </div>
    );
};

export default StudentAchievements;
