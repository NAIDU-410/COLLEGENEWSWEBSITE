import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, deleteEvent } from '../../services/api';
import { Plus, Trash2, Edit2, Calendar, Layout, Info, Tag, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../utils/imageUrl';

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data } = await getEvents();
            setEvents(data.events || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await deleteEvent(id);
                fetchEvents();
            } catch (err) {
                console.error(err);
                alert('Failed to delete event.');
            }
        }
    };

    const filteredEvents = events.filter(event => {
        const title = event.eventTitle || event.eventName || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (event.subcategory && event.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || event.eventType === filterType;
        return matchesSearch && matchesType;
    });

    const getBadgeColor = (type) => {
        switch (type) {
            case 'sports': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'clubs': return 'bg-violet-50 text-violet-600 border-violet-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    return (
        <div className="p-10 bg-slate-50 min-h-screen pb-32">
            <div className="max-w-7xl mx-auto flex flex-col gap-12">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-[0.4em] bg-primary/5 px-4 py-2 rounded-full border border-primary/10 w-fit">
                            <Calendar size={14} /> Schedule Management
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter uppercase">Manage Events</h1>
                        <p className="text-slate-500 font-medium max-w-xl">Add, edit, or remove campus events dynamically. Support for General Events, Sports, and Clubs.</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/create-event')}
                        className="flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all"
                    >
                        <Plus size={20} /> Create New Event
                    </button>
                </header>

                {/* Filters & Search */}
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by event name or subcategory..."
                            className="w-full bg-slate-50 border border-slate-100 py-5 pl-16 pr-8 rounded-2xl outline-none focus:border-primary/20 font-bold text-slate-700 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Filter className="text-slate-400 hidden md:block" size={20} />
                        <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto overflow-x-auto no-scrollbar">
                            {['all', 'event', 'sports', 'clubs'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${filterType === type ? 'bg-white text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-40 gap-6">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest animate-pulse">Synchronizing Database...</p>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredEvents.map((event) => (
                            <motion.div
                                key={event._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[48px] shadow-xl border border-slate-100 flex flex-col overflow-hidden group hover:shadow-2xl transition-all duration-500"
                            >
                                {/* Event Image */}
                                <div className="h-64 w-full overflow-hidden relative">
                                    <img
                                        src={getImageUrl(event.image)}
                                        alt={event.eventTitle || event.eventName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute top-6 right-6 flex flex-col gap-2 scale-0 group-hover:scale-100 transition-transform duration-300 origin-top-right">
                                        <button onClick={() => handleDelete(event._id)} className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-rose-600 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                        <button onClick={() => navigate(`/admin/edit-event/${event._id}`)} className="w-12 h-12 bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-xl hover:bg-slate-50 transition-colors">
                                            <Edit2 size={20} />
                                        </button>
                                    </div>
                                    <div className={`absolute bottom-6 left-6 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest border backdrop-blur-md shadow-lg ${getBadgeColor(event.eventType)}`}>
                                        {event.eventType}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-10 flex flex-col gap-6 flex-1">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-primary font-black uppercase text-[9px] tracking-widest">
                                            <Calendar size={12} /> {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No Date Set'}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-primary transition-colors">{event.eventTitle || event.eventName}</h3>
                                    </div>

                                    {event.subcategory && (
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider bg-slate-50 px-4 py-2 rounded-lg w-fit">
                                            <Tag size={12} className="text-primary" /> {event.subcategory}
                                        </div>
                                    )}

                                    <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-3 italic">
                                        "{event.description}"
                                    </p>

                                    <div className="mt-auto pt-8 border-t border-slate-50 flex gap-4">
                                        <button onClick={() => navigate(`/admin/edit-event/${event._id}`)} className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2">
                                            <Edit2 size={14} /> Full Edit
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 p-32 rounded-[60px] flex flex-col items-center text-center gap-8">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                            <Plus size={48} className="text-slate-200" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">No Events Found</h3>
                            <p className="text-slate-400 font-medium max-w-xs">Start by creating your first campus event to see it appear here.</p>
                        </div>
                        <button onClick={() => navigate('/admin/create-event')} className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            Create Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageEvents;
