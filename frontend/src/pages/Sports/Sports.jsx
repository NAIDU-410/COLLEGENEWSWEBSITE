import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    Trophy,
    ChevronRight,
    Target,
    Dribbble,
    Activity,
    Flame,
    Star,
    Users,
    Newspaper,
    Calendar,
    MapPin,
    Search,
    Filter,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSportEvents, getSportTypes, getWebsiteStats } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const Sports = () => {
    const [events, setEvents] = useState([]);
    const [sportTypes, setSportTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [stats, setStats] = useState({ activeAthletes: 1500, championshipTitles: 42 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [evRes, typeRes] = await Promise.all([
                    getSportEvents(),
                    getSportTypes()
                ]);
                const rawEvents = evRes.data.events || [];
            const validEvents = rawEvents
                .filter(ev => ev.eventDate)
                .map(ev => ({ ...ev, jsDate: new Date(ev.eventDate) }))
                .filter(ev => !isNaN(ev.jsDate.getTime()));
            
            setEvents(validEvents);
                setSportTypes(typeRes.data || []);
                
                try {
                    const statsRes = await getWebsiteStats();
                    if (statsRes.data?.sports) {
                        setStats(statsRes.data.sports);
                    }
                } catch (statErr) {
                    console.error('Error fetching global stats:', statErr);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getIcon = (name) => {
        if (!name) return Trophy;
        const lower = name.toLowerCase();
        if (lower.includes('cricket')) return Target;
        if (lower.includes('basket')) return Dribbble;
        if (lower.includes('kabaddi')) return Activity;
        if (lower.includes('badminton')) return Flame;
        if (lower.includes('running') || lower.includes('athletic')) return Star;
        if (lower.includes('volley')) return Dribbble;
        return Trophy;
    };

    const getAutoStatus = (dateString) => {
        if (!dateString) return 'UPCOMING';
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate < today ? 'PAST' : 'UPCOMING';
    };

    const filteredEvents = events.filter(ev => {
        const title = ev.eventTitle || '';
        const sub = ev.subcategory || ev.sportType || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             sub.toLowerCase().includes(searchTerm.toLowerCase());
        const autoStatus = getAutoStatus(ev.eventDate);
        const matchesFilter = activeFilter === 'ALL' || autoStatus === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col gap-24 pb-32 bg-white">
            {/* Elite Banner */}
            <section className="h-[60vh] bg-slate-900 relative overflow-hidden flex items-center">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1541252260730-0412e3e2104e?q=80&w=2674&auto=format&fit=crop" alt="Sports Banner" className="w-full h-full object-cover opacity-40 scale-105 active:scale-110 transition-transform duration-[10000ms]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                    <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
                        <div className="flex items-center gap-4 text-primary font-black uppercase text-sm tracking-[0.5em] mb-6">
                            <div className="w-12 h-[2px] bg-primary"></div>
                            RGUKT Athletics Excellence
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none mb-8 italic uppercase">
                           Beyond <span className="text-primary not-italic">Limits.</span>
                        </h1>
                        <p className="text-blue-100 text-xl font-bold max-w-2xl leading-relaxed opacity-80 font-black uppercase tracking-[0.2em] italic">
                            Experience the passion, grit, and victory of our campus champions.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Global Search & Filters Hub */}
            <section className="max-w-7xl mx-auto px-6 w-full -mt-20 relative z-20">
                <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="relative w-full md:w-1/2 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search sports, events, or tournaments..." 
                            className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-3xl font-black text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase text-xs tracking-widest"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-slate-50 p-2 rounded-3xl gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {['ALL', 'UPCOMING', 'PAST'].map(filter => (
                            <button 
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${activeFilter === filter ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-slate-200'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium Sport Categories Grid - High Impact */}
            <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-4 h-12 bg-primary rounded-full transition-transform group-hover:scale-y-125" />
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Explore Our <span className="text-primary">Disciplines</span></h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {sportTypes.map((sport, i) => (
                        <Link 
                            to={`/sports/${sport.name.toLowerCase()}`} 
                            key={sport._id}
                            className="block group"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative aspect-square rounded-[60px] overflow-hidden shadow-2xl hover:shadow-primary/20 transition-all duration-500"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0 bg-slate-100">
                                    {sport.image ? (
                                        <img 
                                            src={getImageUrl(sport.image)} 
                                            alt={sport.name} 
                                            className="w-full h-full object-cover brightness-[0.7] group-hover:scale-110 group-hover:brightness-50 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-primary/10 flex items-center justify-center">
                                            {React.createElement(getIcon(sport.name), { size: 64, className: "text-primary/20" })}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80" />
                                </div>

                                {/* Floating Badge (Icon) */}
                                <div className="absolute top-10 left-10 w-16 h-16 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white z-10 group-hover:bg-primary transition-colors">
                                    {React.createElement(getIcon(sport.name), { size: 32 })}
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 z-10 p-12 flex flex-col justify-end">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500">Discover Arena</span>
                                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none group-hover:-translate-y-2 transition-transform duration-500">
                                        {sport.name}
                                    </h3>
                                    <div className="mt-6 flex items-center gap-4 text-white/40 group-hover:text-white transition-colors duration-500">
                                        <div className="h-[1px] w-12 bg-white/20 group-hover:bg-primary group-hover:w-20 transition-all duration-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-500 flex items-center gap-2">
                                            View Dashboard <ChevronRight size={14} className="text-primary" />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Main Content Grid */}
            <section className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Left: Latest Headlines */}
                <div className="lg:col-span-8 flex flex-col gap-12">
                     <div className="flex items-center gap-6">
                        <div className="w-4 h-12 bg-emerald-500 rounded-full transition-transform group-hover:scale-y-125" />
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">The Arena <span className="text-emerald-500 underline underline-offset-8 decoration-8 decoration-emerald-100">Live</span></h2>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => <div key={i} className="h-[400px] w-full bg-slate-50 rounded-[48px] animate-pulse" />)
                        ) : filteredEvents.length > 0 ? filteredEvents.map((ev, i) => (
                            <motion.div
                                key={ev._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <Link to={`/sports/${(ev.subcategory || ev.sportType)?.toLowerCase()?.replace(/\s+/g, '-')}/${ev._id}`} className="bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative">
                                    <div className="h-64 relative overflow-hidden">
                                        <img 
                                            src={getImageUrl(ev.image || ev.eventImage)} 
                                            alt={ev.eventTitle} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" 
                                        />
                                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-xl">
                                            {ev.subcategory || ev.sportType}
                                        </div>
                                    </div>
                                    <div className="p-10 flex flex-col flex-1 gap-6">
                                        <div className="flex items-center gap-4 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">
                                            <Calendar size={14} className="text-primary" /> {new Date(ev.eventDate).toLocaleDateString()}
                                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <div className="flex items-center gap-2 text-emerald-500"><MapPin size={14} /> Main Arena</div>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 leading-tight tracking-tighter uppercase italic group-hover:text-primary transition-colors">{ev.eventTitle}</h3>
                                        <p className="text-slate-500 text-sm font-bold leading-relaxed line-clamp-3">
                                            {ev.description}
                                        </p>
                                        <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary group-hover:translate-x-2 transition-transform">Read Analysis</span>
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-45 transition-all">
                                                <ArrowUpRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-40 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-6">
                                <Search size={64} className="text-slate-200" />
                                <p className="text-slate-400 font-black uppercase tracking-[0.3em] italic">No headlines matching your search criteria...</p>
                            </div>
                        )}
                     </div>
                </div>

                {/* Right: Stats & Contacts */}
                <div className="lg:col-span-4 flex flex-col gap-12">
                     {/* Athletics Engagement Stats */}
                     <div className="bg-slate-900 p-12 rounded-[60px] text-white flex flex-col gap-12 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[80px] group-hover:bg-primary/40 transition-all duration-700" />
                         <div className="relative z-10 flex flex-col gap-4">
                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Athletics <span className="text-primary">Impact</span></h3>
                            <div className="h-1 w-20 bg-primary rounded-full transition-all duration-500 group-hover:w-40" />
                         </div>
                         
                         <div className="relative z-10 flex flex-col gap-8">
                             <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 flex flex-col gap-6 hover:bg-white/10 transition-all">
                                 <Users className="text-primary" size={40} />
                                 <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-bold text-blue-100/40 uppercase tracking-[0.3em]">Total Active Athletes</p>
                                    <span className="text-6xl font-black tracking-tighter">
                                        {stats.activeAthletes >= 1000 ? (stats.activeAthletes/1000).toFixed(1) + 'K' : stats.activeAthletes}
                                        <span className="text-primary text-3xl">+</span>
                                    </span>
                                 </div>
                                 <p className="text-xs font-bold text-blue-100/60 leading-relaxed italic">Leading the way in collegiate sports dominance across the region.</p>
                             </div>

                             <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 flex flex-col gap-6 hover:bg-white/10 transition-all">
                                 <Trophy className="text-emerald-500" size={40} />
                                 <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-bold text-blue-100/40 uppercase tracking-[0.3em]">Championship Titles</p>
                                    <span className="text-6xl font-black tracking-tighter text-white">
                                        {stats.championshipTitles}
                                        <span className="text-emerald-500 text-3xl">+</span>
                                    </span>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Department Contacts */}
                     <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-xl flex flex-col gap-8">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-4">
                            <Activity className="text-primary" /> Coaching Staff
                        </h3>
                        <div className="flex flex-col gap-6">
                            {[
                                { name: "Dr. K. Srinivas", role: "Physical Director", office: "Stadium Block" },
                                { name: "Mr. R. Prasad", role: "Cricket Coach", office: "Ground A" },
                                { name: "Ms. L. Devi", role: "Physical Education", office: "Indoor Arena" }
                            ].map((staff, i) => (
                                <div key={i} className="flex flex-col gap-1 group cursor-default">
                                    <span className="text-sm font-black text-slate-800 uppercase tracking-tighter group-hover:text-primary transition-colors">{staff.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{staff.role} • {staff.office}</span>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            </section>
        </div>
    );
};

export default Sports;
