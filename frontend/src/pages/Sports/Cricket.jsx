import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, History, Users, Target, Calendar, ChevronRight, Clock, Star } from 'lucide-react';
import { getEvents } from '../../services/api';

const Cricket = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        const fetchCricketEvents = async () => {
            try {
                const { data } = await getEvents({ type: 'sports', subcategory: 'Cricket' });
                setUpcomingEvents(data);
            } catch (err) {
                console.error('Error fetching cricket events:', err);
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchCricketEvents();
    }, []);

    const achievements = [
        { year: '2024', title: 'Champions - Interuniversity Gold', description: 'Defeated NIT Trichy in a thrilling final to lift the trophy for the 3rd year run.' },
        { year: '2023', title: 'Runner up - State Athletics Meet', description: 'Gave a tough fight to State University but lost in the final over by only 5 runs.' },
        { year: '2022', title: 'Semi-finalists - North Zone Cup', description: 'Reached the top 4 in the prestigious regional tournament among 64 other colleges.' },
    ];

    const gallery = [
        'https://images.unsplash.com/photo-1531415074968-036ba1b565da?q=80&w=2667&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540747913346-19e3adca174f?q=80&w=2690&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594470117722-de43583d3f7b?q=80&w=2670&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=2670&auto=format&fit=crop',
    ];

    return (
        <div className="flex flex-col gap-24 pb-32">
            {/* Sport Banner */}
            <section className="h-[60vh] bg-primary relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src={gallery[0]} alt="Cricket" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-20 gap-8">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                                <Target className="text-white w-10 h-10" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-blue-200 font-bold uppercase tracking-widest text-xs">Official Sports Club</span>
                                <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter">CRICKET</h1>
                            </div>
                        </div>
                        <p className="max-w-3xl text-blue-100 text-lg md:text-xl font-medium leading-relaxed drop-shadow-xl opacity-90">
                            Cricket at our college is more than just a sport; it's a legacy of passion and discipline. From rigorous practice sessions to high-stakes competitions, our team is committed to the pursuit of excellence on the pitch.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Info & Achievements Section */}
            <section className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Left Column: Details */}
                <div className="lg:col-span-8 flex flex-col gap-16">
                    <div className="flex flex-col gap-8">
                        <h2 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-6">
                            <span className="w-12 h-1 bg-primary rounded-full" />
                            Team Heritage
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
                                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                                    <Users className="text-primary w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Elite Squad</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">Our squad consists of 22 dedicated players selected through intensive trials held twice a year.</p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
                                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                                    <History className="text-primary w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Legacy</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">Founded in 1998, we have produced multiple state players and national level tournament participants.</p>
                            </div>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="flex flex-col gap-8">
                        <h2 className="text-4xl font-black text-gray-800 tracking-tight">On-Field Action</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {gallery.map((img, i) => (
                                <div key={i} className={`rounded-2xl overflow-hidden shadow-lg border-2 border-white group relative ${i === 0 ? 'col-span-2 row-span-2 h-[450px]' : 'h-[212px]'}`}>
                                    <img src={img} alt={`Action ${i}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Achievements & Stats */}
                <div className="lg:col-span-4 flex flex-col gap-10">
                    <div className="bg-primary-dark p-10 rounded-[40px] text-white flex flex-col gap-10 sticky top-32">
                        <div className="flex flex-col gap-2">
                            <Trophy className="text-blue-400 w-12 h-12" />
                            <h3 className="text-2xl font-black tracking-tight">Wall of Fame</h3>
                        </div>

                        <div className="flex flex-col gap-8">
                            {achievements.map((ach, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-blue-300 border border-white/5">
                                            {ach.year}
                                        </div>
                                        {idx !== achievements.length - 1 && <div className="w-px h-full bg-white/10 my-4" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-md font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">{ach.title}</h4>
                                        <p className="text-xs text-blue-100/60 font-medium leading-relaxed">{ach.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Dynamic Upcoming Events for Cricket */}
                        <div className="mt-10 pt-10 border-t border-white/10 flex flex-col gap-8">
                            <h3 className="text-xl font-black text-blue-400 uppercase tracking-tighter flex items-center gap-3">
                                <Clock size={20} /> Match Schedule
                            </h3>
                            
                            <div className="flex flex-col gap-6">
                                {loadingEvents ? (
                                    <div className="flex justify-center p-4">
                                        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : upcomingEvents.length > 0 ? (
                                    upcomingEvents.map((event, i) => (
                                        <div key={event._id} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col gap-4 group cursor-pointer hover:bg-white/10 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{event.date} {event.month}</span>
                                                    <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{event.eventName}</h4>
                                                </div>
                                                <Star size={14} className="text-amber-400" />
                                            </div>
                                            <p className="text-[10px] text-blue-100/40 leading-relaxed line-clamp-2 italic">"{event.description}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-blue-100/40 font-bold uppercase tracking-widest text-center py-4 border-2 border-dashed border-white/5 rounded-3xl">No upcoming matches</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-10 border-t border-white/10 flex flex-col gap-6">
                            <div className="flex justify-between items-center bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Total Victories</span>
                                <span className="text-2xl font-black">42</span>
                            </div>
                            <button className="bg-white text-primary w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:-translate-y-2 transition-all flex items-center justify-center gap-3">
                                Join the Team <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Cricket;
