import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Calendar, Clock, Layout, ArrowLeft, Instagram, 
    Twitter, Globe, Award, Info, ChevronRight, Share2, 
    CheckCircle2, AlertCircle, Users, Star
} from 'lucide-react';
import { getClubEvent } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const ClubEventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [renderError, setRenderError] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const { data } = await getClubEvent(id);
                console.log('Fetched Club Event:', data);
                setEvent(data);
            } catch (err) {
                console.error('Error fetching event detail:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchEvent();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-60 gap-8 bg-slate-950 min-h-screen">
            <div className="w-20 h-20 border-8 border-primary border-t-transparent rounded-full animate-spin shadow-2xl shadow-primary/20"></div>
            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.5em] italic">Decompressing Event Data...</p>
        </div>
    );

    if (!event || renderError) return (
        <div className="flex flex-col items-center justify-center p-40 gap-6 bg-slate-50 min-h-screen font-sans">
            <AlertCircle size={64} className="text-rose-500" />
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
                {renderError ? 'Render System Failure' : 'Event Not Found'}
            </h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center max-w-md">
                The intelligence matrix encountered a corruption while processing this event. 
                Our team has been notified.
            </p>
            <Link to="/clubs" className="text-primary font-black uppercase text-xs tracking-widest border-b-2 border-primary pb-1 mt-4">Return to Hub</Link>
        </div>
    );

    // --- Safety Helpers ---
    const getSafeDate = (d) => {
        if (!d) return 'Date TBA';
        try {
            const dateObj = new Date(d);
            return isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        } catch (e) { return 'Invalid Date'; }
    };

    const getSafeUpcoming = (d) => {
        if (!d) return false;
        try {
            const dateObj = new Date(d);
            if (isNaN(dateObj.getTime())) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return dateObj >= today;
        } catch (e) { return false; }
    };


    const subcategoryValue = event.subcategory || 'Club';
    const subcategorySlug = (subcategoryValue || '').toString().toLowerCase().replace(/\s+/g, '-');

    // --- Main Safely Guarded Render ---
    try {
        return (
            <div className="flex flex-col pb-32 bg-slate-50 min-h-screen font-sans">
                {/* ── Event Hero Banner ── */}
                <section className="h-[70vh] relative overflow-hidden bg-slate-900 border-b-8 border-primary">
                    <div className="absolute inset-0">
                        <img 
                            src={getImageUrl(event.image)} 
                            alt={event.eventTitle || 'Event'} 
                            className="w-full h-full object-cover opacity-60 scale-105" 
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-32 gap-10">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <Link to={`/clubs/${subcategorySlug}`} className="inline-flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-[0.5em] mb-10 hover:-translate-x-2 transition-transform bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                                <ArrowLeft size={16} /> {subcategoryValue} Arena
                            </Link>
                            
                            <div className="flex flex-col gap-6">
                                <div className={`w-fit px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl ${getSafeUpcoming(event.eventDate) ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                    {getSafeUpcoming(event.eventDate) ? 'Upcoming Deployment' : 'Mission Completed'}
                                </div>
                                <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase italic">{event.eventTitle || 'Event Untitled'}</h1>
                                
                                <div className="flex flex-wrap items-center gap-10 mt-10">
                                    <div className="flex items-center gap-4 text-white/60 font-black uppercase text-xs tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                        <Calendar size={20} className="text-primary" /> {getSafeDate(event.eventDate)}
                                    </div>
                                    <div className="flex items-center gap-4 text-white/60 font-black uppercase text-xs tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                        <Users size={20} className="text-primary" /> {subcategoryValue}
                                    </div>
                                    <div className="flex items-center gap-4 text-white/60 font-black uppercase text-xs tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                        <Layout size={20} className="text-primary" /> {(event.activities || []).length} Phases
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Main Layout ── */}
                <section className="max-w-7xl mx-auto px-6 w-full -mt-20 relative z-20 flex flex-col gap-24 font-sans">
                    
                    {/* Executive Summary */}
                    <div className="bg-white p-12 md:p-20 rounded-[64px] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col gap-10">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4 text-blue-500 font-black uppercase text-[10px] tracking-[0.3em]">
                                <Info size={16} /> Briefing
                            </div>
                            <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">Executive Summary</h2>
                            <p className="text-slate-500 text-xl font-medium leading-relaxed italic border-l-8 border-primary pl-10 max-w-4xl">
                                {event.description || 'No detailed intelligence available for this mission summary. Please refer to club leaders for field data.'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        
                        {/* LEFT: Phases and Itinerary */}
                        <div className="lg:col-span-8 flex flex-col gap-20">
                            
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-4 h-12 bg-indigo-500 rounded-full" />
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight uppercase italic">Event Itinerary</h3>
                                </div>

                                <div className="flex flex-col gap-10 relative pl-8 border-l-4 border-slate-100 py-4">
                                    {event.activities && Array.isArray(event.activities) && event.activities.length > 0 ? (
                                        event.activities.map((act, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                className="relative bg-white p-10 rounded-[48px] border border-slate-100 shadow-lg group hover:shadow-2xl hover:border-primary/20 transition-all duration-500"
                                            >
                                                <div className="absolute top-1/2 -left-[44px] -translate-y-1/2 w-8 h-8 rounded-full bg-white border-4 border-blue-500 group-hover:bg-primary transition-colors shadow-lg z-10" />
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-full w-fit uppercase tracking-widest">{act.time || 'TBA'}</span>
                                                        <h4 className="text-3xl font-black text-slate-800 uppercase tracking-tight italic group-hover:translate-x-2 transition-transform leading-none">{act.name || 'Untitled Phase'}</h4>
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 font-medium leading-relaxed italic">{act.description || 'Phase details are currently classified or pending release.'}</p>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="bg-slate-50 p-20 rounded-[64px] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-6">
                                            <Clock className="text-slate-200 w-16 h-16" />
                                            <span className="text-slate-300 font-black uppercase text-xs tracking-[0.3em]">Phases under active development</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Event Photo Reel */}
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-4 h-12 bg-rose-500 rounded-full" />
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight uppercase italic">Digital Gallery</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {event.images && Array.isArray(event.images) && event.images.length > 0 ? (
                                        event.images.map((img, i) => (
                                            <motion.div 
                                                key={i}
                                                whileHover={{ scale: 1.02 }}
                                                className="aspect-[4/3] rounded-[48px] overflow-hidden shadow-2xl border-4 border-white"
                                            >
                                                <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="Gallery" />
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full h-80 bg-slate-100 rounded-[64px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 opacity-40 grayscale">
                                            <Layout size={64} className="text-slate-300" />
                                            <span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">Awaiting visual synchronization</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Achievements & Socials */}
                        <div className="lg:col-span-4 flex flex-col gap-16">
                            
                            {/* Event Specific Achievements */}
                            <div className="bg-white p-12 rounded-[64px] shadow-xl border border-slate-100 flex flex-col gap-10">
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-4">
                                        <Award className="text-amber-500 w-10 h-10" /> The Honors
                                    </h3>
                                    <div className="h-1.5 w-24 bg-amber-500 rounded-full" />
                                </div>
                                <div className="flex flex-col gap-10">
                                    {event.achievements && Array.isArray(event.achievements) && event.achievements.length > 0 ? (
                                        event.achievements.map((ach, i) => (
                                            <div key={i} className="flex gap-6 group">
                                                <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 shrink-0 shadow-lg border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                                                    <Star size={28} />
                                                </div>
                                                <div className="flex flex-col gap-1 justify-center">
                                                    <h5 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none italic group-hover:text-amber-600 transition-colors">{ach.title || 'Official Merit'}</h5>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{ach.recipient || 'Community Member'}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-300 font-black uppercase text-[9px] tracking-[0.4em] text-center py-10 italic opacity-50 bg-slate-50 rounded-3xl border border-slate-100">Awaiting Recognition Matrix</p>
                                    )}
                                </div>
                            </div>

                            {/* Connect Matrix */}
                            <div className="bg-slate-950 p-12 rounded-[64px] text-white flex flex-col gap-12 shadow-2xl shadow-black relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px]" />
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Broadcast</h3>
                                    <div className="h-1.5 w-20 bg-primary rounded-full" />
                                </div>
                                <div className="flex flex-col gap-6">
                                    <button className="w-full bg-white/5 border border-white/10 hover:bg-primary py-8 rounded-[36px] flex items-center justify-center gap-6 group transition-all">
                                        <Instagram size={28} className="text-primary group-hover:text-white" />
                                        <span className="font-black uppercase text-[11px] tracking-[0.2em]">Share to Stories</span>
                                    </button>
                                    <button className="w-full bg-white/5 border border-white/10 hover:bg-white hover:text-slate-950 py-8 rounded-[36px] flex items-center justify-center gap-6 group transition-all">
                                        <Share2 size={28} />
                                        <span className="font-black uppercase text-[11px] tracking-[0.2em]">Intel Link</span>
                                    </button>
                                </div>
                                <div className="flex gap-4 pt-10 border-t border-white/10">
                                    {event.socialLinks?.instagram && <a href={event.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-xl"><Instagram size={28} /></a>}
                                    {event.socialLinks?.twitter && <a href={event.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-xl"><Twitter size={28} /></a>}
                                    {event.socialLinks?.website && <a href={event.socialLinks.website} target="_blank" rel="noreferrer" className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-xl"><Globe size={28} /></a>}
                                </div>
                            </div>

                        </div>

                    </div>

                </section>
            </div>
        );
    } catch (err) {
        console.error('Critical Render Error in ClubEventDetail:', err);
        setRenderError(true);
        return null;
    }
};

export default ClubEventDetail;
