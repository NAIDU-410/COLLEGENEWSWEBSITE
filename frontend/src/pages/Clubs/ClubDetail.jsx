import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Calendar, ChevronRight, Clock, Star, 
    Instagram, Twitter, Globe, Info, Award, 
    ArrowLeft, Layout, CheckCircle2, Zap
} from 'lucide-react';
import { getClubEvents, getClubTypes, getAchievements } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const ClubDetail = () => {
    const { clubName } = useParams();
    // Convert url-slug back to proper name (e.g. coding-club -> Coding Club)
    const formattedName = clubName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    const [events, setEvents] = useState([]);
    const [clubInfo, setClubInfo] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [evRes, typeRes, achRes] = await Promise.all([
                    getClubEvents({ subcategory: formattedName.toLowerCase() }),
                    getClubTypes(),
                    getAchievements({ type: 'clubs', subcategory: formattedName.toLowerCase() })
                ]);
                
                const rawEvents = evRes.data.events || [];
                const validEvents = rawEvents
                    .filter(ev => ev.eventDate)
                    .map(ev => ({ ...ev, jsDate: new Date(ev.eventDate) }))
                    .filter(ev => !isNaN(ev.jsDate.getTime()));
                
                setEvents(validEvents);
                setAchievements(achRes.data || []);
                const currentClub = typeRes.data.find(c => c.name.toLowerCase() === formattedName.toLowerCase());
                setClubInfo(currentClub);
            } catch (err) {
                console.error('Error fetching club details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [formattedName]);

    const isUpcoming = (jsDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return jsDate >= today;
    };

    const upcomingEvents = events.filter(ev => isUpcoming(ev.jsDate));
    const pastEvents = events.filter(ev => !isUpcoming(ev.jsDate));

    // Gallery from first few event images
    const gallery = events.flatMap(ev => ev.images || []).slice(0, 6);
    const mainBanner = clubInfo?.image || (events[0]?.image || events[0]?.eventImage) || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2670&auto=format&fit=crop';

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-60 gap-8 bg-slate-950 min-h-screen">
            <div className="w-20 h-20 border-8 border-primary border-t-transparent rounded-full animate-spin shadow-2xl shadow-primary/20"></div>
            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.5em] italic">Synchronizing {formattedName}...</p>
        </div>
    );

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen">
            {/* ── Dynamic Hero Header ── */}
            <section className="h-[65vh] bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src={getImageUrl(mainBanner)} 
                        alt={formattedName} 
                        className="w-full h-full object-cover opacity-40 scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-24 gap-8">
                    <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        <Link to="/clubs" className="flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-[0.4em] mb-8 hover:-translate-x-2 transition-transform">
                            <ArrowLeft size={16} /> Directory Hub
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-primary/20 uppercase border-2 border-white/10">
                                {formattedName[0]}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-blue-400 font-black uppercase text-xs tracking-[0.4em] mb-2">RGUKT Official Organization</span>
                                <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase italic">{formattedName}</h1>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Main Content Grid ── */}
            <section className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 -mt-20 relative z-20 pb-40">
                
                {/* LEFT: About & Events */}
                <div className="lg:col-span-8 flex flex-col gap-24">
                    
                    {/* Club Intro Card */}
                    <div className="bg-white p-12 rounded-[64px] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col gap-10">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 text-emerald-500 font-black uppercase text-[10px] tracking-[0.3em]">
                                <Info size={14} /> Mission Statement
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">About the {formattedName}</h2>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed italic">
                                "{clubInfo?.description || 'This organization is dedicated to fostering excellence, collaboration, and innovation within our campus community.'}"
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-50">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Phases</span>
                                <span className="text-2xl font-black text-slate-800 italic">{events.length}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming</span>
                                <span className="text-2xl font-black text-primary italic">{upcomingEvents.length}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                <span className="text-2xl font-black text-emerald-500 italic">VERIFIED</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                                <span className="text-2xl font-black text-slate-800 italic">OFFICIAL</span>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events: Vertical Stack */}
                    <div className="flex flex-col gap-12">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-4 h-12 bg-amber-400 rounded-full" />
                                <h3 className="text-4xl font-black text-slate-800 tracking-tight uppercase italic">Active Launches</h3>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{upcomingEvents.length} Scheduled</div>
                        </div>

                        {upcomingEvents.length > 0 ? (
                            <div className="flex flex-col gap-8">
                                {upcomingEvents.map((ev) => (
                                    <Link 
                                        to={`/clubs/${clubName}/${ev._id}`} 
                                        key={ev._id} 
                                        className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-10 group hover:-translate-y-2 transition-all duration-500"
                                    >
                                        <div className="w-full md:w-72 h-72 rounded-[40px] overflow-hidden shrink-0 relative">
                                            <img 
                                                src={getImageUrl(ev.image || ev.eventImage)} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" 
                                                alt={ev.eventTitle} 
                                            />
                                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-primary shadow-xl">
                                                Active
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center gap-6 flex-1 pr-6">
                                            <div className="flex items-center gap-4 text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                                                <Calendar size={16} /> {ev.jsDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <h4 className="text-4xl font-black text-slate-800 uppercase tracking-tighter leading-none group-hover:text-primary transition-colors italic">{ev.eventTitle}</h4>
                                            <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed italic">{ev.description}</p>
                                            <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase"><Layout size={14} className="text-primary" /> {ev.activities?.length || 0} Phases</div>
                                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase"><Star size={14} className="text-amber-400" /> Featured</div>
                                                <div className="ml-auto text-primary animate-bounce-horizontal"><ChevronRight size={24} /></div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-32 bg-white rounded-[64px] border-4 border-dashed border-slate-100 flex flex-col items-center gap-8 text-center">
                                <Zap className="text-slate-100 w-24 h-24" />
                                <div>
                                    <h4 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Quiet in the sector</h4>
                                    <p className="text-slate-200 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">New projects are being formulated</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Past Archives: Horizontal Grid */}
                    <div className="flex flex-col gap-12">
                        <div className="flex items-center gap-6">
                            <div className="w-4 h-12 bg-slate-300 rounded-full" />
                            <h3 className="text-4xl font-black text-slate-800 tracking-tight uppercase italic opacity-60 text-emerald-500">The Legacy Archives</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {pastEvents.length > 0 ? pastEvents.map(ev => (
                                <Link to={`/clubs/${clubName}/${ev._id}`} key={ev._id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col gap-6 group hover:shadow-2xl transition-all">
                                    <div className="h-56 rounded-[36px] overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700">
                                        <img 
                                            src={getImageUrl(ev.image || ev.eventImage)} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-all" 
                                            alt="" 
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-transparent transition-all" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ev.jsDate.getFullYear()} Legacy</span>
                                        <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-tight italic group-hover:text-primary transition-colors">{ev.eventTitle}</h4>
                                    </div>
                                </Link>
                            )) : (
                                <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.4em] px-10">No archives currently stored.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Stats, Gallery & Media */}
                <div className="lg:col-span-4 flex flex-col gap-12">
                    
                    {/* Club Stats Card */}
                    <div className="bg-slate-900 p-12 rounded-[64px] text-white flex flex-col gap-12 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
                        <div className="flex flex-col gap-2">
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic">Vitals</h3>
                            <div className="h-1 w-20 bg-primary rounded-full" />
                        </div>
                        <div className="flex flex-col gap-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-primary shadow-xl border border-white/10"><Users size={28} /></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black italic">VERIFIED</span>
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Membership Status</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-amber-500 shadow-xl border border-white/10"><CheckCircle2 size={28} /></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black italic">GOLD TIER</span>
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Activity Ranking</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-8 border-t border-white/10">
                            <a href="#" className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all"><Instagram size={24} /></a>
                            <a href="#" className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all"><Twitter size={24} /></a>
                            <a href="#" className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all"><Globe size={24} /></a>
                        </div>
                    </div>

                    {/* Spotlight Gallery */}
                    <div className="flex flex-col gap-8">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-4">
                            <Star className="text-primary" /> Visual Echoes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gallery.length > 0 ? gallery.map((img, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                                    className="aspect-square rounded-[32px] overflow-hidden border-4 border-white shadow-xl"
                                >
                                    <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="Gallery" />
                                </motion.div>
                            )) : (
                                <div className="col-span-2 aspect-video bg-slate-100 rounded-[40px] flex items-center justify-center text-slate-300 font-black uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-200">
                                    No highlights found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Club Achievements Section */}
                    <div className="flex flex-col gap-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-4 h-12 bg-amber-500 rounded-full" />
                                <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase italic">Triumphs & milestones</h2>
                            </div>
                            <Link to="/achievements" className="text-amber-600 font-black uppercase text-[10px] tracking-widest hover:text-amber-700 transition-colors flex items-center gap-2">View Wall <ChevronRight size={14} /></Link>
                        </div>
                        
                        {achievements.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {achievements.map((ach) => (
                                    <Link to={`/achievements/${ach._id}`} key={ach._id} className="bg-white p-6 rounded-[48px] shadow-xl shadow-slate-200/20 border border-slate-100 flex flex-col gap-6 group hover:-translate-y-2 transition-all duration-500">
                                        <div className="h-56 rounded-[40px] overflow-hidden relative">
                                            {ach.cardImage ? (
                                                <img src={getImageUrl(ach.cardImage)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="Victory" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                    <Award size={64} className="text-slate-200" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-amber-500 text-white px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">{ach.year}</div>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors italic">{ach.title}</h4>
                                            <p className="text-slate-400 text-xs font-bold mt-4 leading-relaxed line-clamp-2 italic">"{ach.description}"</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 bg-white rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4 text-center">
                                <Award className="text-slate-200 w-12 h-12" />
                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Our legacy is being written...</p>
                            </div>
                        )}
                    </div>

                </div>

            </section>
        </div>
    );
};

export default ClubDetail;
