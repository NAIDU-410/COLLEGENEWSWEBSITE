import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, Star, ArrowRight, ChevronLeft, ExternalLink } from 'lucide-react';
import { getEvents } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

/**
 * Shared template for every club detail page.
 * Props:
 *  name, tagline, description, icon (lucide component), color (tailwind gradient classes),
 *  accentBg (solid bg class), accentText, heroImage, galleryImages [4],
 *  stats [{label, value}], events [{title, date, description}],
 *  about (longer paragraph), features [{icon, title, desc}], meetTime
 */
const ClubTemplate = ({
    name,
    tagline,
    description,
    icon: Icon,
    color = 'from-blue-500 to-blue-800',
    accentBg = 'bg-blue-600',
    accentText = 'text-blue-600',
    heroImage,
    galleryImages = [],
    stats = [],
    events: initialEvents = [], // Rename prop to avoid conflict
    about = '',
    features = [],
    meetTime = '',
}) => {
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        const fetchClubEvents = async () => {
            try {
                const { data } = await getEvents({ type: 'clubs', subcategory: name });
                // If we have API events, use those, otherwise fallback to static prop events
                setEvents(data.length > 0 ? data.map(e => ({
                    title: e.eventName,
                    date: `${e.date} ${e.month}, ${e.year}`,
                    description: e.description
                })) : initialEvents);
            } catch (err) {
                console.error(`Error fetching events for ${name}:`, err);
                setEvents(initialEvents);
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchClubEvents();
    }, [name, initialEvents]);

    return (
        <div className="flex flex-col gap-20 pb-32">
            {/* ── Hero Banner ── */}
            <section className="relative h-[55vh] overflow-hidden flex items-end pb-12">
                <div className="absolute inset-0 z-0">
                    <img src={getImageUrl(heroImage)} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-40`} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col gap-6">
                    <Link
                        to="/clubs"
                        className="flex items-center gap-2 text-white/60 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors w-fit group"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        All Clubs
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-white/50 font-black uppercase text-[10px] tracking-[0.4em]">
                            <Icon size={14} /> {tagline}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase">
                            {name}
                        </h1>
                        <p className="text-white/70 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
                            {description}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Stats Row ── */}
            {stats.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 w-full -mt-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {stats.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-[24px] border border-slate-100 shadow-lg p-6 flex flex-col gap-1 text-center"
                            >
                                <div className="text-3xl font-black text-slate-800 tracking-tighter">{s.value}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Main Content ── */}
            <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-14 w-full">

                {/* Left col */}
                <div className="lg:col-span-8 flex flex-col gap-14">

                    {/* About */}
                    <div className="flex flex-col gap-6">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                            <span className={`w-8 h-1.5 ${accentBg} rounded-full`} />
                            About the Club
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed">{about || description}</p>
                    </div>

                    {/* Feature cards */}
                    {features.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {features.map((f, i) => {
                                const FIcon = f.icon;
                                return (
                                    <div key={i} className={`p-7 rounded-[24px] border flex flex-col gap-4 bg-white shadow-sm hover:shadow-lg transition-shadow`} style={{ borderColor: 'rgb(241,245,249)' }}>
                                        <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center text-white`}>
                                            <FIcon size={18} />
                                        </div>
                                        <h4 className="text-base font-black text-slate-800">{f.title}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Gallery */}
                    {galleryImages.length > 0 && (
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                                <span className={`w-8 h-1.5 ${accentBg} rounded-full`} />
                                Gallery
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {galleryImages.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`rounded-[20px] overflow-hidden shadow-md border-4 border-white group relative ${i === 0 ? 'col-span-2 row-span-1' : ''}`}
                                        style={{ height: i === 0 ? '220px' : '160px' }}
                                    >
                                        <img src={getImageUrl(img)} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ExternalLink size={20} className="text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right sidebar — Events */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 flex flex-col gap-8 sticky top-28">
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Upcoming Events</h3>
                            <div className={`h-1 w-12 ${accentBg} rounded-full`} />
                        </div>

                        <div className="flex flex-col gap-6">
                            {events.map((e, i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                                    <div className="shrink-0">
                                        <div className={`w-10 h-10 bg-slate-100 group-hover:${accentBg} rounded-xl flex items-center justify-center transition-colors duration-300`}>
                                            <span className={`text-sm font-black ${accentText} group-hover:text-white transition-colors`}>{i + 1}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className={`text-sm font-black text-slate-800 group-hover:${accentText} transition-colors`}>{e.title}</h4>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <Calendar size={9} /> {e.date}
                                        </span>
                                        <p className="text-xs text-slate-400 leading-relaxed">{e.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {meetTime && (
                            <div className="bg-slate-50 rounded-2xl p-5 flex items-center gap-3 border border-slate-100">
                                <Star size={16} className={accentText} />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regular Meet</p>
                                    <p className="text-sm font-black text-slate-700">{meetTime}</p>
                                </div>
                            </div>
                        )}

                        <button className={`${accentBg} text-white w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3`}>
                            Become a Member <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ClubTemplate;
