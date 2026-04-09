import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Calendar, Trophy, Users, MapPin, 
    ChevronLeft, Instagram, Twitter, Globe, 
    Award, CheckCircle2, Clock 
} from 'lucide-react';
import { getSportEvent } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const SportEventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await getSportEvent(id);
                setEvent(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return <div className="flex justify-center p-32"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!event) return <div className="text-center p-32 font-black uppercase text-slate-400">Event Not Found</div>;

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col gap-16">
                {/* Back Link */}
                <Link to="/sports" className="flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-primary transition-all">
                    <ChevronLeft size={16} /> Back to Sports
                </Link>

                {/* Header Content */}
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    <div className="flex-1 flex flex-col gap-10">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{event.sportType}</span>
                                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${event.status === 'upcoming' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{event.status}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tighter leading-none uppercase italic">{event.eventTitle}</h1>
                            <div className="flex flex-wrap gap-8 text-slate-400 font-bold uppercase text-xs tracking-widest">
                                <p className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Campus Arena</p>
                            </div>
                        </div>

                        <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-xl shadow-slate-200/40">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3"><div className="w-8 h-[2px] bg-primary"></div> Event Overview</h3>
                            <p className="text-slate-600 text-lg font-medium leading-relaxed">{event.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-slate-50">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Teams Participation</span>
                                    <span className="text-2xl font-black text-slate-800">{event.teams?.length || 0} Professional Sqauds</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Match Count</span>
                                    <span className="text-2xl font-black text-slate-800">{event.matches?.length || 0} High Intensity Matches</span>
                                </div>
                                {event.socialLinks && (
                                    <div className="flex flex-col gap-4">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Social Connect</span>
                                        <div className="flex gap-4">
                                            {event.socialLinks.instagram && <a href={event.socialLinks.instagram} className="text-slate-400 hover:text-primary transition-colors"><Instagram size={20} /></a>}
                                            {event.socialLinks.twitter && <a href={event.socialLinks.twitter} className="text-slate-400 hover:text-primary transition-colors"><Twitter size={20} /></a>}
                                            {event.socialLinks.website && <a href={event.socialLinks.website} className="text-slate-400 hover:text-primary transition-colors"><Globe size={20} /></a>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[450px] flex flex-col gap-8">
                        <div className="overflow-hidden rounded-[48px] shadow-2xl shadow-primary/20 aspect-[4/5]">
                            <img src={getImageUrl(event.eventImage)} className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>
                </div>

                {/* Event Sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Matches */}
                    <div className="lg:col-span-7 flex flex-col gap-10">
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                            <Award className="text-primary" /> Match Report & Schedule
                        </h2>
                        <div className="flex flex-col gap-6">
                            {event.matches?.map((match, i) => (
                                <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-lg flex flex-col gap-8 group hover:-translate-y-2 transition-all">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-300 tracking-widest">
                                        <span>Game {i + 1}</span>
                                        <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-10">
                                        <div className="flex flex-col items-center gap-4 flex-1">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center font-black text-xl text-slate-800 border border-slate-100">{match.teamA[0]}</div>
                                            <span className="font-black uppercase tracking-tight text-center">{match.teamA}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="text-2xl font-black text-primary italic">VS</div>
                                            {match.score && <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-xl">{match.score}</div>}
                                        </div>
                                        <div className="flex flex-col items-center gap-4 flex-1">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center font-black text-xl text-slate-800 border border-slate-100">{match.teamB[0]}</div>
                                            <span className="font-black uppercase tracking-tight text-center">{match.teamB}</span>
                                        </div>
                                    </div>
                                    {match.result && (
                                        <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-3 text-emerald-600 font-black uppercase text-[10px] tracking-widest">
                                            <CheckCircle2 size={16} /> Result: {match.result}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Squads */}
                    <div className="lg:col-span-5 flex flex-col gap-10">
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                            <Users className="text-primary" /> Competing Squads
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            {event.teams?.map((team, i) => (
                                <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-8 group">
                                    <div className="w-20 h-20 bg-primary/5 rounded-[24px] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <Users size={32} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{team.name}</h4>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{team.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Event Gallery Highlights */}
                        {event.images?.length > 0 && (
                            <div className="mt-10 flex flex-col gap-10">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Event Highlights</h3>
                                <div className="columns-2 gap-4">
                                    {event.images.map((img, i) => (
                                        <img key={i} src={getImageUrl(img)} className="w-full rounded-3xl mb-4 shadow-xl border-4 border-white" alt="" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SportEventDetail;
