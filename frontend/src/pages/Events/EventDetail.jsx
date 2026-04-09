import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Calendar, Clock, MapPin, ChevronLeft, 
    Share2, Info, AlertCircle, Bookmark,
    ExternalLink, Users, Bell
} from 'lucide-react';
import { getEventById } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const EventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await getEventById(id);
                setEvent(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const isUpcoming = (date) => {
        if (!date) return false;
        const eventDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-60 gap-8 bg-slate-50 min-h-screen">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.5em] animate-pulse">Initializing Event Matrix...</p>
        </div>
    );

    if (!event) return (
        <div className="flex flex-col items-center justify-center p-40 gap-6 bg-slate-50 min-h-screen text-center">
            <AlertCircle size={64} className="text-rose-500" />
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Event Not Detected</h2>
            <p className="text-slate-500 font-medium max-w-xs">The requested event data does not exist or has been archived.</p>
            <Link to="/events" className="text-primary font-black uppercase text-xs tracking-widest border-b-2 border-primary pb-1">Return to Calendar</Link>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pb-32">
            {/* Hero Section */}
            <div className="relative h-[60vh] overflow-hidden">
                <img 
                    src={getImageUrl(event.image)} 
                    className="w-full h-full object-cover" 
                    alt={event.eventTitle} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                
                <div className="absolute top-12 left-12">
                    <Link to="/events" className="flex items-center gap-3 text-slate-800 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl">
                        <ChevronLeft size={16} /> Back to Hub
                    </Link>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-12 -mt-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* Left: Main Details */}
                    <div className="lg:col-span-8 flex flex-col gap-12">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="bg-primary text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20">
                                    {event.eventType}
                                </span>
                                {event.subcategory && (
                                    <span className="bg-slate-100 text-slate-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                                        {event.subcategory}
                                    </span>
                                )}
                                <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${isUpcoming(event.eventDate) ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {isUpcoming(event.eventDate) ? 'Upcoming' : 'Past Event'}
                                </span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black text-slate-800 tracking-tighter leading-none uppercase italic">
                                {event.eventTitle}
                            </h1>

                            <div className="flex flex-wrap gap-10 text-slate-400 font-bold uppercase text-xs tracking-widest border-y border-slate-50 py-8">
                                <div className="flex items-center gap-4">
                                    <Calendar className="text-primary" size={20} />
                                    {new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-4">
                                    <MapPin className="text-primary" size={20} />
                                    Main Campus Arena
                                </div>
                                <div className="flex items-center gap-4">
                                    <Clock className="text-primary" size={20} />
                                    {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (TBA)
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-4">
                                <div className="w-12 h-[2px] bg-slate-100"></div> Event Briefing
                            </h3>
                            <p className="text-slate-600 text-2xl font-medium leading-relaxed italic border-l-8 border-primary/20 pl-10">
                                {event.description}
                            </p>
                        </div>
                    </div>

                    {/* Right: Sidebar Actions */}
                    <div className="lg:col-span-4 flex flex-col gap-10">
                        <div className="bg-slate-50 p-12 rounded-[60px] flex flex-col gap-10 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Engagement</h3>
                                <div className="h-1.5 w-16 bg-primary rounded-full"></div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button className="w-full bg-primary text-white py-6 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <Bell size={16} /> Set Reminder
                                </button>
                                <button className="w-full bg-white border border-slate-100 text-slate-800 py-6 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                                    <Bookmark size={16} /> Save Event
                                </button>
                            </div>

                            <div className="pt-6 border-t border-slate-200/60 flex flex-col gap-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Share Broadcast</span>
                                <div className="flex justify-center gap-6">
                                    <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md hover:text-primary transition-all"><Share2 size={24} /></button>
                                    <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md hover:text-primary transition-all"><ExternalLink size={24} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-12 rounded-[60px] text-white flex flex-col gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px]"></div>
                            <h4 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                                <Users size={20} className="text-primary" /> Campus Spirit
                            </h4>
                            <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-wider">
                                Join fellow students and faculty for this upcoming campus activity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
