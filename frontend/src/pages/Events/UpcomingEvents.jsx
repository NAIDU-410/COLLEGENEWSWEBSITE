import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { getEvents } from '../../services/api';
import {
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Users,
    X,
    ArrowRight,
    ChevronRight,
    Star,
    CheckCircle
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

const UpcomingEvents = () => {
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // Added filter state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch all events (Type: ALL) to show clubs, sports, and general events on the calendar
                const { data } = await getEvents({ type: 'ALL' });
                
                if (data && Array.isArray(data.events)) {
                    const processedEvents = data.events
                        .filter(e => e.eventDate) // Only keep events with dates
                        .map(e => ({
                            ...e,
                            jsDate: new Date(e.eventDate)
                        }))
                        .filter(e => !isNaN(e.jsDate.getTime())); // Remove invalid dates
                    setEvents(processedEvents);
                }
            } catch (err) {
                console.error('Error fetching calendar events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleDateChange = (newDate) => {
        setDate(newDate);
        const event = events.find(e => e.jsDate.toDateString() === newDate.toDateString());
        if (event) {
            setSelectedEvent(event);
        } else {
            setSelectedEvent(null);
        }
    };

    const handleEventClick = (event) => {
        const id = event._id;
        const subSlug = (event.subcategory || event.clubName || event.sportType)?.toLowerCase().replace(/\s+/g, '-');
        
        if (event.eventType === 'clubs') {
            navigate(`/clubs/${subSlug}`); // Clubs detail page usually uses the club type slug
        } else if (event.eventType === 'sports') {
            navigate(`/sports/${subSlug}/${id}`);
        } else {
            navigate(`/events/${event._id}`);
        }
    };

    const isEventDay = (date) => {
        return events.some(e => e.jsDate.toDateString() === date.toDateString());
    };

    return (
        <div className="flex flex-col gap-24 pb-32">
            {/* Event Banner */}
            <section className="h-[400px] bg-primary relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
                <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col gap-8">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl md:text-7xl font-black text-white leading-none tracking-tighter mb-4 shadow-xl">
                            CAMPUS CALENDAR
                        </h1>
                        <p className="text-blue-100/70 text-lg font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-widest text-xs font-black">
                            Track Workshops, Fests, & Guest Lectures
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Calendar & Details Grid */}
            <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 w-full -mt-32 relative z-20">
                {/* Left Side: Calendar Container */}
                <div className="lg:col-span-12 flex flex-col lg:flex-row gap-16 bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100">

                    <div className="lg:w-1/2 flex flex-col gap-10">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-4 uppercase">
                                <CalendarIcon size={28} className="text-primary" /> Month Overview
                            </h2>
                            <p className="text-gray-500 font-medium font-bold text-xs uppercase tracking-widest">Select a date to view activities.</p>
                        </div>

                        <div className="calendar-styled border border-slate-100 rounded-[32px] p-6 shadow-sm overflow-hidden">
                            <Calendar
                                onChange={handleDateChange}
                                value={date}
                                className="w-full !border-none !font-sans overflow-hidden"
                                tileClassName={({ date, view }) =>
                                    view === 'month' && isEventDay(date) ? 'bg-primary/10 text-primary font-black rounded-xl relative before:content-[""] before:absolute before:bottom-2 before:left-1/2 before:-translate-x-1/2 before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full' : null
                                }
                            />
                        </div>
                    </div>

                    <div className="lg:w-1/2 flex flex-col gap-10">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Activities for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                            <div className="h-2 w-20 bg-primary rounded-full mt-2" />
                        </div>

                        <div className="flex-grow">
                            {selectedEvent ? (
                                <motion.div
                                    key={selectedEvent._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-slate-900 p-10 rounded-[40px] text-white flex flex-col gap-8 shadow-2xl relative overflow-hidden h-full min-h-[400px]"
                                >
                                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                                        <Star size={120} />
                                    </div>

                                    <div className="relative z-10 flex flex-col gap-6">
                                        {(selectedEvent.image || selectedEvent.eventImage) && (
                                            <div className="w-full h-40 rounded-3xl overflow-hidden mb-4 shadow-xl">
                                                <img src={getImageUrl(selectedEvent.image || selectedEvent.eventImage)} alt={selectedEvent.eventTitle} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <span className={`text-[10px] font-black tracking-widest bg-white/10 px-4 py-2 rounded-lg border border-white/10 mb-2 inline-block uppercase w-fit ${selectedEvent.eventType === 'clubs' ? 'text-emerald-400' : selectedEvent.eventType === 'sports' ? 'text-amber-400' : 'text-primary'}`}>
                                            {selectedEvent.subcategory || selectedEvent.eventType}
                                        </span>
                                        <h4 className="text-4xl font-black leading-tight tracking-tight mb-4 uppercase italic">{selectedEvent.eventTitle}</h4>
                                        <p className="text-blue-100/70 text-lg leading-relaxed mb-8">{selectedEvent.description}</p>
                                    </div>

                                    <div className="relative z-10 grid grid-cols-2 gap-6 mt-auto pt-10 border-t border-white/10">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest"><Clock size={14} /> Schedule</div>
                                            <span className="text-sm font-bold uppercase tracking-tighter">
                                                {selectedEvent.jsDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest"><MapPin size={14} /> Venue</div>
                                            <span className="text-sm font-bold uppercase tracking-tighter">Main Campus</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleEventClick(selectedEvent)}
                                        className="mt-8 bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-3"
                                    >
                                        View Details <ArrowRight size={16} />
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                    <CalendarIcon className="text-slate-300" size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                                    {filter === 'ALL' ? 'No Events Available' : 
                                     filter === 'sports' ? 'No Sports Available' : 
                                     filter === 'clubs' ? 'No Clubs Available' : 'No Events Available'}
                                </h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 italic">Check back later for updates</p>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured list below */}
            <section className="max-w-7xl mx-auto px-6 w-full">
                <div className="flex flex-col gap-10">
                    <h2 className="text-4xl font-black text-gray-800 tracking-tight px-4 border-l-8 border-primary uppercase">All Campus Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {events.length > 0 ? (
                            events.map((e, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => handleEventClick(e)}
                                    className="bg-white p-10 rounded-[40px] flex flex-col gap-8 shadow-xl border border-slate-100 hover:-translate-y-4 group cursor-pointer transition-all duration-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex flex-col items-center justify-center border-2 border-primary/10 group-hover:bg-primary transition-colors">
                                            <span className="text-xl font-black text-primary group-hover:text-white leading-none tracking-tighter">{e.jsDate.getDate()}</span>
                                            <span className="text-[10px] font-black text-primary/60 group-hover:text-white uppercase tracking-widest">{e.jsDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full ${e.eventType === 'clubs' ? 'text-emerald-500' : e.eventType === 'sports' ? 'text-amber-500' : 'text-primary'}`}>
                                            <Users size={14} /> {e.eventType.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-800 leading-tight mb-2 group-hover:text-primary transition-colors uppercase tracking-tighter italic">{e.eventTitle}</h4>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3 font-bold italic">{e.description}</p>
                                    </div>
                                    <div className="mt-4 pt-6 border-t border-slate-50 flex justify-between items-center group-hover:border-primary/20 transition-colors">
                                        <div className="flex items-center gap-2 text-xs font-black text-primary group-hover:translate-x-2 transition-transform uppercase tracking-widest">More Details <ChevronRight size={14} /></div>
                                        <CheckCircle size={20} className="text-emerald-500" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-3 py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                                <CalendarIcon className="text-slate-300 w-16 h-16" />
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest mt-2">No Upcoming Schedule</h3>
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">The campus grounds are at rest</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UpcomingEvents;
