import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, History, Users, Target, Calendar, ChevronRight, Clock, Star, Instagram, Twitter, Globe, Info, Award } from 'lucide-react';
import { getSportEvents, getAchievements } from '../../services/api';
import SportCarousel from '../../components/SportCarousel';
import { getImageUrl } from '../../utils/imageUrl';

const SportDetail = () => {
    const { sportType } = useParams();
    const [events, setEvents] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    const sportName = sportType.charAt(0).toUpperCase() + sportType.slice(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [evRes, achRes] = await Promise.all([
                    getSportEvents({ subcategory: sportType.replace(/-/g, ' ') }),
                    getAchievements({ type: 'sports', subcategory: sportType.replace(/-/g, ' ') })
                ]);
                setEvents(evRes.data.events || []);
                setAchievements(achRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sportName]);

    // Simplified Status Logic
    const isUpcoming = (date) => {
        const eventDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
    };

    const upcomingMatches = events.flatMap(ev => 
        isUpcoming(ev.eventDate) ? (ev.matches || []).map(m => ({ ...m, eventTitle: ev.eventTitle, date: m.matchDate || ev.eventDate })) : []
    ).sort((a,b) => new Date(a.date) - new Date(b.date));

    const pastEvents = events.filter(ev => !isUpcoming(ev.eventDate));
    const upcomingEvents = events.filter(ev => isUpcoming(ev.eventDate));

    // Gallery & Banner
    const gallery = events.flatMap(ev => ev.images || []).slice(0, 5);
    const mainBanner = (events[0]?.image || events[0]?.eventImage) || 'https://images.unsplash.com/photo-1541252260730-0412e3e2104e?q=80&w=2674&auto=format&fit=crop';

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-40 gap-6">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Loading {sportName} Arena...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-24 pb-32 bg-slate-50 min-h-screen">
            {/* Sport Header Section */}
            <section className="h-[60vh] bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src={getImageUrl(mainBanner)} 
                        alt={sportName} 
                        className="w-full h-full object-cover opacity-30" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center gap-8">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="bg-primary/20 backdrop-blur-xl border border-primary/20 px-8 py-3 rounded-full text-primary font-black uppercase text-xs tracking-[0.4em] mb-8 inline-block">
                           RGUKT Ongole Athletics
                        </div>
                        <h1 className="text-8xl md:text-9xl font-black text-white leading-none tracking-tighter uppercase italic drop-shadow-2xl">{sportName}</h1>
                        <p className="max-w-3xl mx-auto mt-8 text-blue-100/60 text-lg font-bold leading-relaxed uppercase tracking-widest italic">
                            Building champions through discipline, integrity, and relentless passion.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Layout Grid */}
            <section className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                {/* Left Side: Events and Action */}
                <div className="lg:col-span-8 flex flex-col gap-24">
                    
                    {/* Upcoming Section */}
                    <div className="flex flex-col gap-10">
                        <div className="flex items-center gap-6">
                           <div className="w-4 h-12 bg-amber-400 rounded-full" />
                           <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">Upcoming Matches & Events</h2>
                        </div>
                        {upcomingEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {upcomingEvents.map(ev => (
                                    <Link to={`/sports/${sportType?.toLowerCase()}/${ev._id}`} key={ev._id} className="bg-white p-6 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col gap-6 group hover:-translate-y-2 transition-all">
                                        <div className="h-56 rounded-[40px] overflow-hidden relative">
                                            <img src={getImageUrl(ev.image || ev.eventImage)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="" />
                                            <div className="absolute top-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Upcoming</div>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                                                <Calendar size={14} /> {new Date(ev.eventDate).toLocaleDateString()}
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-tight">{ev.eventTitle}</h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 bg-white rounded-[48px] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                                <Clock className="text-slate-200 w-12 h-12" />
                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No major upcoming events scheduled</p>
                            </div>
                        )}
                    </div>

                    {/* Image Carousel: Event Highlights */}
                    <div className="flex flex-col gap-10">
                        <div className="flex items-center gap-6">
                           <div className="w-4 h-12 bg-indigo-500 rounded-full" />
                           <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase italic">Triumphs in {sportName}</h2>
                        </div>
                        <div className="bg-white p-8 rounded-[60px] shadow-2xl shadow-slate-200">
                             <SportCarousel items={achievements.length > 0 ? achievements.slice(0, 5).map(ach => ({
                                title: ach.title,
                                year: ach.year,
                                image: ach.detailImage || ach.cardImage || mainBanner 
                            })) : [{ 
                                title: `${sportName} Training & Discipline`, 
                                year: '2024', 
                                image: gallery[0] || mainBanner 
                            }]} />
                        </div>
                    </div>

                    {/* Past Events Section */}
                    <div className="flex flex-col gap-10">
                        <div className="flex items-center gap-6">
                           <div className="w-4 h-12 bg-slate-300 rounded-full" />
                           <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">Past Events</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {pastEvents.length > 0 ? pastEvents.slice(0, 4).map(ev => (
                                <Link to={`/sports/${sportType?.toLowerCase()}/${ev._id}`} key={ev._id} className="bg-white p-6 rounded-[48px] border border-slate-100 flex items-center gap-6 group hover:shadow-xl transition-all">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0">
                                        <img src={getImageUrl(ev.image || ev.eventImage)} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt="" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(ev.eventDate).getFullYear()}</span>
                                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">{ev.eventTitle}</h4>
                                    </div>
                                </Link>
                            )) : (
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-8">No past archives available for this category.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Side: Achievements and Schedule */}
                <div className="lg:col-span-4 flex flex-col gap-12">
                    
                    {/* Achievements Section */}
                    <div className="bg-white p-10 rounded-[60px] shadow-xl shadow-slate-200 border border-slate-100 flex flex-col gap-12">
                         <div className="flex flex-col gap-2">
                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                                <Award className="text-amber-500 w-10 h-10" /> Achievements
                            </h3>
                            <div className="h-1 w-20 bg-amber-500 rounded-full" />
                         </div>
                         <div className="flex flex-col gap-10">
                            {achievements.length > 0 ? achievements.slice(0, 5).map((ach) => (
                                <div key={ach._id} className="flex gap-6 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center font-black text-amber-600 border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                            {ach.year.toString().slice(-2)}
                                        </div>
                                        <div className="w-px h-full bg-slate-100 my-4" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-tight group-hover:text-amber-600 transition-colors">{ach.title}</h4>
                                        <p className="text-slate-400 text-[10px] font-bold leading-relaxed">{ach.description}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-30">
                                    <Trophy size={48} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">History in the making...</p>
                                </div>
                            )}
                         </div>
                    </div>

                    {/* Match Schedule / Hub */}
                    <div className="bg-slate-900 p-10 rounded-[60px] text-white flex flex-col gap-10 shadow-2xl shadow-slate-900/30">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                                <Target className="text-primary w-8 h-8" /> Match Schedule
                            </h3>
                            <div className="h-1 w-16 bg-primary rounded-full" />
                        </div>
                        <div className="flex flex-col gap-6">
                            {upcomingMatches.length > 0 ? upcomingMatches.slice(0, 4).map((match, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-[32px] border border-white/5 flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-primary/60">
                                        <span>League Match</span>
                                        <span>{new Date(match.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-black text-white truncate max-w-[80px]">{match.teamA}</span>
                                        <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black">VS</div>
                                        <span className="text-xs font-black text-white truncate max-w-[80px]">{match.teamB}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-white/20 font-black uppercase tracking-widest text-[9px] text-center py-10">No upcoming match fixtures</p>
                            )}
                        </div>
                        <Link to="/events" className="w-full bg-white text-slate-900 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all text-center">
                            Full Calendar View
                        </Link>
                    </div>

                </div>

            </section>
        </div>
    );
};

export default SportDetail;
