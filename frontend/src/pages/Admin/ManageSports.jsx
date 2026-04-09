import React, { useState, useEffect } from 'react';
import { 
    getSportEvents, createSportEvent, updateSportEvent, deleteSportEvent,
    getSportTypes, createSportType, updateSportType, deleteSportType,
    createAchievement, getAchievements, deleteAchievement
} from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import { 
    Plus, Trash2, Edit2, Trophy, Upload, Calendar, 
    Instagram, Twitter, Globe, Users, Award, Facebook, Linkedin, Image as ImageIcon,
    Layout, Info, Clock, CheckCircle2, AlertCircle, X, Save, Search, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageSports = () => {
    const [events, setEvents] = useState([]);
    const [sportTypes, setSportTypes] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(null); // 'event', 'type', 'achievement'
    const [editingAchievementId, setEditingAchievementId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, UPCOMING, PAST
    const [editingId, setEditingId] = useState(null);
    const [editingTypeId, setEditingTypeId] = useState(null);
    const [selectedSportForAchievement, setSelectedSportForAchievement] = useState(null);

    // Form Data States
    const [eventForm, setEventForm] = useState({
        sportType: '',
        eventTitle: '',
        eventDate: '',
        description: '',
        eventImage: null,
        images: [],
        existingEventImage: null,
        existingImages: [],
        matches: [{ teamA: '', teamB: '', matchDate: '' }],
        socialLinks: { instagram: '', twitter: '' }
    });

    const [typeForm, setTypeForm] = useState({ name: '', image: null });
    
    const [achievementForm, setAchievementForm] = useState({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        socialLinks: { instagram: '', linkedin: '', facebook: '' },
        cardImage: null,
        detailImage: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [evRes, typeRes, achRes] = await Promise.all([
                getSportEvents(),
                getSportTypes(),
                getAchievements({ type: 'sports' })
            ]);
            setEvents(evRes.data.events || []);
            setSportTypes(typeRes.data || []);
            setAchievements(achRes.data || []);
            
            if (typeRes.data.length > 0 && !eventForm.sportType) {
                setEventForm(prev => ({ ...prev, sportType: typeRes.data[0].name }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-calculate Status
    const getAutoStatus = (date) => {
        if (!date) return 'UPCOMING';
        const eventDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today ? 'UPCOMING' : 'PAST';
    };

    // Event Handlers
    const handleAddMatch = () => {
        setEventForm({ ...eventForm, matches: [...eventForm.matches, { teamA: '', teamB: '', matchDate: '' }] });
    };

    const handleRemoveMatch = (idx) => {
        setEventForm({ ...eventForm, matches: eventForm.matches.filter((_, i) => i !== idx) });
    };

    const handleMatchChange = (idx, field, val) => {
        const newMatches = [...eventForm.matches];
        newMatches[idx][field] = val;
        setEventForm({ ...eventForm, matches: newMatches });
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('eventType', 'sports');
        data.append('subcategory', eventForm.sportType.toLowerCase().trim());
        data.append('eventTitle', eventForm.eventTitle);
        data.append('eventDate', eventForm.eventDate);
        data.append('description', eventForm.description);
        
        if (eventForm.eventImage) data.append('eventImage', eventForm.eventImage);
        if (eventForm.images && eventForm.images.length > 0) {
            Array.from(eventForm.images).forEach(img => data.append('images', img));
        }
        
        data.append('matches', JSON.stringify(eventForm.matches));
        data.append('socialLinks', JSON.stringify(eventForm.socialLinks));

        try {
            if (editingId) {
                await updateSportEvent(editingId, data);
                alert('Event updated successfully!');
            } else {
                await createSportEvent(data);
                alert('Event created successfully!');
            }
            setShowModal(null);
            fetchData();
            resetEventForm();
        } catch (err) {
            console.error(err);
            alert('Error saving event: ' + err.message);
        }
    };

    const resetEventForm = () => {
        setEventForm({
            sportType: sportTypes[0]?.name || '',
            eventTitle: '',
            eventDate: '',
            description: '',
            eventImage: null,
            images: [],
            existingEventImage: null,
            existingImages: [],
            matches: [{ teamA: '', teamB: '', matchDate: '' }],
            socialLinks: { instagram: '', twitter: '' }
        });
        setEditingId(null);
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('🔴 ARE YOU SURE? This will permanently delete the event and remove it from all pages.')) {
            try {
                await deleteSportEvent(id);
                // Refresh both local state and unified events
                await fetchData();
                alert('Event deleted successfully.');
            } catch (err) {
                alert('Failed to delete: ' + err.message);
            }
        }
    };

    const openEditEvent = (ev) => {
        setEditingId(ev._id);
        setEventForm({
            sportType: ev.subcategory || ev.sportType || '',
            eventTitle: ev.eventTitle,
            eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '',
            description: ev.description,
            eventImage: null, // Keep nulled for new uploads
            images: [],
            existingEventImage: ev.eventImage || null,
            existingImages: ev.images || [],
            matches: ev.matches || [{ teamA: '', teamB: '', matchDate: '' }],
            socialLinks: ev.socialLinks || { instagram: '', twitter: '' }
        });
        setShowModal('event');
    };

    const handleTypeSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', typeForm.name);
        if (typeForm.image) data.append('image', typeForm.image);

        try {
            if (editingTypeId) {
                await updateSportType(editingTypeId, data);
                alert('Sport updated.');
            } else {
                await createSportType(data);
                alert('Sport created.');
            }
            fetchData();
            setTypeForm({ name: '', image: null });
            setEditingTypeId(null);
            setShowModal(null);
        } catch (err) {
            console.error(err);
            alert('Failed to save sport.');
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm('🔴 Delete this sport category? This may affect existing event filters.')) {
            try {
                await deleteSportType(id);
                fetchData();
            } catch (err) {
                alert('Failed to delete: ' + err.message);
            }
        }
    };

    const openEditType = (type) => {
        setEditingTypeId(type._id);
        setTypeForm({ name: type.name, image: null });
        setShowModal('type');
    };

    const openAchievementModal = (type) => {
        setSelectedSportForAchievement(type);
        setEditingAchievementId(null);
        setAchievementForm({
            title: '', description: '', year: new Date().getFullYear(),
            socialLinks: { instagram: '', linkedin: '', facebook: '' },
            cardImage: null, detailImage: null
        });
        setShowModal('achievement');
    };

    const openEditAchievement = (ach) => {
        const sport = sportTypes.find(t => t.name.toLowerCase() === ach.subcategory.toLowerCase());
        setSelectedSportForAchievement(sport || sportTypes[0]);
        setEditingAchievementId(ach._id);
        setAchievementForm({
            title: ach.title,
            description: ach.description,
            year: ach.year,
            socialLinks: ach.socialLinks || { instagram: '', linkedin: '', facebook: '' },
            cardImage: null,
            detailImage: null
        });
        setShowModal('achievement');
    };

    const handleAchievementSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', achievementForm.title);
        data.append('description', achievementForm.description);
        data.append('type', 'sports');
        data.append('subcategory', selectedSportForAchievement.name.toLowerCase().trim());
        data.append('year', achievementForm.year);
        data.append('socialLinks', JSON.stringify(achievementForm.socialLinks));

        if (achievementForm.cardImage) data.append('cardImage', achievementForm.cardImage);
        if (achievementForm.detailImage) data.append('detailImage', achievementForm.detailImage);

        try {
            if (editingAchievementId) {
                const { updateAchievement } = await import('../../services/api');
                await updateAchievement(editingAchievementId, data);
                alert('Achievement updated successfully!');
            } else {
                await createAchievement(data);
                alert('Achievement recorded successfully!');
            }
            setShowModal(null);
            setEditingAchievementId(null);
            fetchData();
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || 'Error saving achievement';
            alert('Error saving achievement: ' + errorMessage);
        }
    };

    const handleDeleteAchievement = async (id) => {
        if (window.confirm('Remove this achievement permanently?')) {
            try {
                await deleteAchievement(id);
                fetchData();
            } catch (err) {
                alert('Failed to delete achievement');
            }
        }
    };

    const filteredEvents = events.filter(ev => {
        const title = ev.eventTitle || '';
        const type = ev.sportType || '';
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             type.toLowerCase().includes(searchQuery.toLowerCase());
        const calculatedStatus = getAutoStatus(ev.eventDate);
        const matchesStatus = statusFilter === 'ALL' || calculatedStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 md:p-12 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto flex flex-col gap-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                            <Trophy className="text-primary w-12 h-12" /> SPORTS CENTER
                        </h1>
                        <p className="text-slate-500 font-bold text-lg">Simplified Event Management for RGUKT Ongole</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setShowModal('type')}
                            className="bg-white text-slate-700 border-2 border-slate-200 px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-primary transition-all flex items-center gap-2"
                        >
                            <Layout size={18} /> Manage Sports
                        </button>
                        <button
                            onClick={() => { 
                                if (sportTypes.length === 0) return alert('Please create a sport first!');
                                setSelectedSportForAchievement(sportTypes[0]);
                                setAchievementForm({
                                    title: '', description: '', year: new Date().getFullYear(),
                                    socialLinks: { instagram: '', linkedin: '', facebook: '' },
                                    cardImage: null, detailImage: null
                                });
                                setShowModal('achievement'); 
                            }}
                            className="bg-amber-500 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-500/20 hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            <Award size={20} /> Add Achievement
                        </button>
                        <button
                            onClick={() => { resetEventForm(); setShowModal('event'); }}
                            className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            <Plus size={20} /> Add Sports Event
                        </button>
                    </div>
                </header>

                {/* Search & Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search by title or sport (e.g. Cricket)..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-[24px] py-6 pl-16 pr-8 font-bold text-slate-800 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                />
                            </div>
                            <div className="flex bg-slate-100 p-2 rounded-[24px] w-full md:w-auto">
                                {['ALL', 'UPCOMING', 'PAST'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${statusFilter === s ? 'bg-white text-primary shadow-lg' : 'text-slate-400'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-4 bg-primary p-10 rounded-[48px] text-white flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Database Status</span>
                                <h2 className="text-3xl font-black">{events.length} Total Events</h2>
                            </div>
                            <Award size={32} className="opacity-40" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-xl font-black">{events.filter(e => getAutoStatus(e.eventDate) === 'UPCOMING').length}</span>
                                <span className="text-[8px] font-black uppercase opacity-60">Upcoming</span>
                            </div>
                            <div className="w-px h-8 bg-white/20 mx-2" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black">{events.filter(e => getAutoStatus(e.eventDate) === 'PAST').length}</span>
                                <span className="text-[8px] font-black uppercase opacity-60">Past</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-6 bg-white rounded-[48px] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.5em]">Synchronizing Arena...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Event Cards Section */}
                        <div className="lg:col-span-8 flex flex-col gap-10">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                                <CheckCircle2 className="text-emerald-500" /> Sport Categories
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {sportTypes.map((type, i) => (
                                    <motion.div 
                                        key={type._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="relative aspect-square rounded-[36px] overflow-hidden group shadow-xl transition-all duration-500 hover:shadow-primary/20"
                                    >
                                        {/* Background Image/Gradient */}
                                        <div className="absolute inset-0 z-0 bg-slate-100">
                                            {type.image ? (
                                                <img 
                                                    src={getImageUrl(type.image)} 
                                                    alt={type.name} 
                                                    className="w-full h-full object-cover brightness-[0.7] group-hover:scale-110 group-hover:brightness-50 transition-all duration-700"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/400x400/1e293b/ffffff?text=Icon+Missing';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                                    <Trophy size={48} className="text-white/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                        </div>

                                        {/* Content Overlay */}
                                        <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="w-12 h-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white font-black group-hover:bg-primary transition-colors">
                                                    {type.name[0]}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openAchievementModal(type)} className="w-10 h-10 backdrop-blur-md bg-amber-500/20 border border-amber-500/50 rounded-xl flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-lg shadow-amber-500/20" title="Add Achievement">
                                                        <Award size={16} />
                                                    </button>
                                                    <button onClick={() => openEditType(type)} className="w-10 h-10 backdrop-blur-md bg-black/30 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-primary transition-all">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteType(type._id)} className="w-10 h-10 backdrop-blur-md bg-black/30 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-rose-500 transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                                                    {type.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-[8px] font-black text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                                                    Manage Events <ChevronRight size={10} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                <button 
                                    onClick={() => { resetEventForm(); setEditingTypeId(null); setTypeForm({ name: '', image: null }); setShowModal('type'); }}
                                    className="aspect-square border-4 border-dashed border-slate-100 rounded-[36px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-primary hover:text-primary transition-all group"
                                >
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus size={32} />
                                    </div>
                                    <span className="font-black uppercase text-[10px] tracking-[0.4em]">New Category</span>
                                </button>
                            </div>

                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4 mt-8">
                                <CheckCircle2 className="text-emerald-500" /> Event Records
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {filteredEvents.map((ev) => (
                                        <motion.div 
                                            key={ev._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white p-8 rounded-[48px] shadow-sm border border-slate-100 flex flex-col gap-6 group hover:shadow-2xl hover:border-primary/20 transition-all duration-500"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-full w-fit uppercase tracking-widest">{ev.subcategory || ev.sportType}</span>
                                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{ev.eventTitle}</h3>
                                                </div>
                                                <div className={`p-4 rounded-3xl ${getAutoStatus(ev.eventDate) === 'UPCOMING' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    {getAutoStatus(ev.eventDate) === 'UPCOMING' ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-50 py-4">
                                                <div className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> {new Date(ev.eventDate).toLocaleDateString()}</div>
                                                <div className="flex items-center gap-2"><Users size={14} className="text-primary" /> {ev.matches?.length || 0} Matches</div>
                                            </div>

                                            <div className="flex items-center gap-4 mt-auto pt-4">
                                                <button 
                                                    onClick={() => openEditEvent(ev)}
                                                    className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"
                                                >
                                                    <Edit2 size={16} /> Edit Details
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteEvent(ev._id)}
                                                    className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-xl shadow-rose-100"
                                                >
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {filteredEvents.length === 0 && (
                                    <div className="col-span-2 bg-white p-20 rounded-[48px] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-6">
                                        <AlertCircle size={64} className="text-slate-200" />
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">No Matches Found</h3>
                                            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest mt-2">Adjust your filters or add a new event</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Achievements Side Section */}
                        <div className="lg:col-span-4 flex flex-col gap-10">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                                    <Award className="text-amber-500" /> Wall of Trophies
                                </h2>
                                <button onClick={() => setShowModal('achievement')} className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">
                                    <Plus size={24} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-6">
                                {achievements.map((ach) => (
                                    <div key={ach._id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex flex-col gap-4 group shadow-sm hover:shadow-xl transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest">{ach.year}</span>
                                                    <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase tracking-widest italic">{ach.subcategory}</span>
                                                </div>
                                                <h4 className="font-black text-slate-800 text-lg tracking-tight leading-tight group-hover:text-primary transition-colors uppercase italic">{ach.title}</h4>
                                            </div>
                                                <div className="flex gap-1">
                                                <button onClick={() => openEditAchievement(ach)} className="p-2 text-slate-300 hover:text-primary transition-colors bg-slate-50 rounded-lg">
                                                    <Edit2 size={12} />
                                                </button>
                                                <button onClick={() => handleDeleteAchievement(ach._id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors bg-slate-50 rounded-lg">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 relative">
                                            <img 
                                                src={getImageUrl(ach.cardImage) || 'https://placehold.co/400x300/1e293b/ffffff?text=Award+Missing'} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                alt="Trophy" 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/400x300/1e293b/ffffff?text=Award+Missing';
                                                }}
                                            />
                                        </div>
                                        <p className="text-slate-400 text-[10px] font-bold leading-relaxed line-clamp-2 italic">"{ach.description}"</p>
                                    </div>
                                ))}
                                {achievements.length === 0 && (
                                    <div className="p-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4 text-center">
                                        <Award className="text-slate-200 w-12 h-12" />
                                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No entries in the history books yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Structured Event Modal */}
            <AnimatePresence>
                {showModal === 'event' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
                        <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="bg-white w-full max-w-6xl rounded-[64px] shadow-2xl flex flex-col max-h-[95vh] relative overflow-hidden">
                            
                            {/* Modal Header */}
                            <div className="p-10 md:p-12 border-b border-slate-100 flex justify-between items-center bg-white z-20 sticky top-0">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary border-2 border-primary/10">
                                        <Save size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                                            {editingId ? 'Edit Sports Event' : 'Add New Sports Event'}
                                        </h2>
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Fill all mandatory sections to publish</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(null)} className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:rotate-90 transition-all duration-500">
                                    <X size={32} />
                                </button>
                            </div>

                            <form onSubmit={handleEventSubmit} className="flex-1 overflow-y-auto p-12 md:p-16 custom-scrollbar bg-white">
                                {sportTypes.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-8 py-20 text-center">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300">
                                            <AlertCircle size={48} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">No Sports Categories Found</h3>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">You must create at least one sport category before adding events.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setShowModal('type')}
                                            className="bg-primary text-white px-12 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 hover:-translate-y-2 transition-all flex items-center gap-3"
                                        >
                                            <Plus size={20} /> Create First Sport
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-24">
                                            {/* SECTION 1: BASIC INFO */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                                <div className="md:col-span-4 flex flex-col gap-4">
                                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-blue-100">1</div>
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Basic Info</h3>
                                                    <p className="text-slate-400 text-sm font-bold leading-relaxed">Enter primary identification details for this tournament or match event.</p>
                                                </div>
                                                <div className="md:col-span-8 bg-slate-50 p-10 rounded-[48px] flex flex-col gap-10">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2 flex items-center gap-2">Sport Type <Info size={12} className="text-primary" title="Add new sports using the Manage Sports button" /></label>
                                                            <select 
                                                                value={eventForm.sportType} 
                                                                onChange={e => setEventForm({ ...eventForm, sportType: e.target.value })} 
                                                                className="bg-white p-6 rounded-2xl border-2 border-slate-100 font-black text-slate-800 outline-none focus:border-primary transition-all cursor-pointer"
                                                                required
                                                            >
                                                                {sportTypes.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">Event Date</label>
                                                            <input 
                                                                type="date" 
                                                                value={eventForm.eventDate} 
                                                                onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })} 
                                                                className="bg-white p-6 rounded-2xl border-2 border-slate-100 font-black text-slate-800 outline-none focus:border-primary transition-all" 
                                                                required 
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">Event Title</label>
                                                        <input 
                                                            value={eventForm.eventTitle} 
                                                            onChange={e => setEventForm({ ...eventForm, eventTitle: e.target.value })} 
                                                            className="bg-white p-6 rounded-2xl border-2 border-slate-100 font-black text-slate-800 outline-none focus:border-primary transition-all" 
                                                            placeholder="e.g. Inter-College Cricket Championship 2024" 
                                                            required 
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">Description</label>
                                                        <textarea 
                                                            rows="4" 
                                                            value={eventForm.description} 
                                                            onChange={e => setEventForm({ ...eventForm, description: e.target.value })} 
                                                            className="bg-white p-6 rounded-2xl border-2 border-slate-100 font-black text-slate-800 outline-none focus:border-primary transition-all resize-none" 
                                                            placeholder="Provide details about the tournament, venue, and participation..." 
                                                            required 
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SECTION 2: AUTO LOGIC (UI ONLY) */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                                <div className="md:col-span-4 flex flex-col gap-4">
                                                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-amber-100">2</div>
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Event Status</h3>
                                                    <p className="text-slate-400 text-sm font-bold leading-relaxed">This is automatically calculated based on your event date.</p>
                                                </div>
                                                <div className="md:col-span-8 flex items-center gap-6">
                                                    <div className={`flex-1 p-10 rounded-[48px] border-4 border-dashed flex items-center justify-center gap-6 transition-all ${getAutoStatus(eventForm.eventDate) === 'UPCOMING' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                                        <Clock size={48} className={getAutoStatus(eventForm.eventDate) === 'UPCOMING' ? 'animate-pulse' : ''} />
                                                        <div className="flex flex-col">
                                                            <span className="text-3xl font-black uppercase tracking-tighter">
                                                                {getAutoStatus(eventForm.eventDate) === 'UPCOMING' ? 'Upcoming Event ✅' : 'Past Event ⏳'}
                                                            </span>
                                                            <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Calculated dynamically</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SECTION 3: MATCH DETAILS */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                                <div className="md:col-span-4 flex flex-col gap-4">
                                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-indigo-100">3</div>
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Match Details</h3>
                                                    <p className="text-slate-400 text-sm font-bold leading-relaxed">Specify exactly who is playing. Add individual matches within this tournament.</p>
                                                </div>
                                                <div className="md:col-span-8 flex flex-col gap-8">
                                                    <AnimatePresence>
                                                        {eventForm.matches.map((match, idx) => (
                                                            <motion.div 
                                                                initial={{ opacity: 0, x: -20 }} 
                                                                animate={{ opacity: 1, x: 0 }} 
                                                                key={idx} 
                                                                className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-xl shadow-slate-200/20 relative group/match"
                                                            >
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleRemoveMatch(idx)} 
                                                                    className="absolute top-6 right-6 bg-rose-50 text-rose-500 p-4 rounded-3xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-100"
                                                                >
                                                                    <Trash2 size={24} />
                                                                </button>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Team A</label>
                                                                        <input value={match.teamA} onChange={e => handleMatchChange(idx, 'teamA', e.target.value)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:bg-white outline-none" placeholder="Host Team" />
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Team B</label>
                                                                        <input value={match.teamB} onChange={e => handleMatchChange(idx, 'teamB', e.target.value)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:bg-white outline-none" placeholder="Guest Team" />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Match Date</label>
                                                                        <input 
                                                                            type="date" 
                                                                            value={match.matchDate && !isNaN(new Date(match.matchDate).getTime()) ? new Date(match.matchDate).toISOString().split('T')[0] : ''} 
                                                                            onChange={e => handleMatchChange(idx, 'matchDate', e.target.value)} 
                                                                            className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:bg-white outline-none" 
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col justify-end">
                                                                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 text-primary font-black text-[10px] uppercase tracking-widest text-center">🏆 Official League Match</div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                    <button 
                                                        type="button" 
                                                        onClick={handleAddMatch} 
                                                        className="w-full border-4 border-dashed border-slate-100 p-10 rounded-[48px] text-slate-300 font-black uppercase text-xs tracking-[0.4em] hover:border-primary hover:text-primary transition-all flex flex-col items-center gap-4 group"
                                                    >
                                                        <Plus size={48} className="group-hover:rotate-90 transition-transform duration-500" />
                                                        + Add Match Schedule
                                                    </button>
                                                </div>
                                            </div>

                                            {/* SECTION 4: IMAGES (CAROUSEL) */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                                <div className="md:col-span-4 flex flex-col gap-4">
                                                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-emerald-100">4</div>
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Event Images</h3>
                                                    <p className="text-slate-400 text-sm font-bold leading-relaxed">Upload 2–5 high-quality images. These will create the highlight slider for students.</p>
                                                </div>
                                                <div className="md:col-span-8 flex flex-col gap-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">Main Header Banner</label>
                                                            <label className="bg-slate-50 h-56 rounded-[40px] border-4 border-dashed border-slate-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors hover:bg-slate-100 group">
                                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                                                    <Upload size={32} className="text-primary" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                    {eventForm.eventImage ? eventForm.eventImage.name.slice(0, 15) + '...' : (eventForm.existingEventImage ? 'Current Image Active' : 'Choose Lead Image')}
                                                                </span>
                                                                <input type="file" className="hidden" onChange={e => setEventForm({ ...eventForm, eventImage: e.target.files[0] })} />
                                                                
                                                                {/* Existing Image Preview */}
                                                                {!eventForm.eventImage && eventForm.existingEventImage && (
                                                                    <div className="absolute inset-0 p-2 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                                                                        <img src={getImageUrl(eventForm.existingEventImage)} className="w-full h-full object-cover rounded-[32px]" alt="current" />
                                                                    </div>
                                                                )}
                                                            </label>
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">Carousel Highlights (Multiple)</label>
                                                            <label className="bg-slate-50 h-56 rounded-[40px] border-4 border-dashed border-slate-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors hover:bg-slate-100 group">
                                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                                                    <Layout size={32} className="text-emerald-500" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                    {eventForm.images.length > 0 ? `${eventForm.images.length} Photos Selected` : (eventForm.existingImages?.length > 0 ? `${eventForm.existingImages.length} Existing Photos` : 'Select 3+ Action Shots')}
                                                                </span>
                                                                <input type="file" multiple className="hidden" onChange={e => setEventForm({ ...eventForm, images: e.target.files })} />

                                                                {/* Existing Images Fade */}
                                                                {eventForm.images.length === 0 && eventForm.existingImages?.length > 0 && (
                                                                    <div className="absolute inset-0 p-4 pointer-events-none opacity-10 group-hover:opacity-30 transition-opacity flex gap-2 overflow-hidden">
                                                                        {eventForm.existingImages.slice(0, 3).map((img, i) => (
                                                                            <img key={i} src={getImageUrl(img)} className="h-full aspect-square object-cover rounded-xl" alt="existing" />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {/* Preview Strip */}
                                                    {eventForm.images.length > 0 && (
                                                        <div className="flex gap-4 p-4 bg-slate-50 rounded-3xl overflow-x-auto border border-slate-100">
                                                            {Array.from(eventForm.images).map((file, i) => (
                                                                <div key={i} className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-400 overflow-hidden text-center shrink-0">
                                                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="prev" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-20 flex flex-col gap-6 sticky bottom-0 z-30 bg-white/80 backdrop-blur-md p-10 border-t border-slate-100 rounded-b-[48px]">
                                            <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 flex items-center justify-center gap-4">
                                                <div className="w-8 h-px bg-slate-200" /> 
                                                <span>Review all details before publishing</span>
                                                <div className="w-8 h-px bg-slate-200" />
                                            </div>
                                            <button 
                                                type="submit" 
                                                className="w-full bg-primary text-white py-10 rounded-[32px] font-black uppercase text-xl md:text-2xl tracking-[0.5em] shadow-2xl shadow-primary/30 hover:-translate-y-2 hover:shadow-primary/50 transition-all flex items-center justify-center gap-6 active:scale-95"
                                            >
                                                <CheckCircle2 size={32} />
                                                {editingId ? 'Update & Save Event' : 'Launch Sports Event'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Achievement Modal (Unified) */}
                {showModal === 'achievement' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
                            <div className="flex justify-between items-center p-10 border-b border-slate-100 sticky top-0 bg-white z-10">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-3xl font-black text-amber-500 uppercase tracking-tighter flex items-center gap-3">
                                        <Award size={32} /> {editingAchievementId ? 'Edit victory' : 'Sport Achievement'}
                                    </h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-12 flex items-center gap-2">
                                        Awarding to <span className="text-amber-500 font-black">{selectedSportForAchievement?.name}</span>
                                    </p>
                                </div>
                                <X onClick={() => setShowModal(null)} className="text-slate-300 hover:text-rose-500 cursor-pointer" size={32} />
                            </div>
                            
                            <form onSubmit={handleAchievementSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar flex flex-col gap-10">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Awarding To (Sport)</label>
                                    <select 
                                        value={selectedSportForAchievement?._id || ''} 
                                        onChange={e => setSelectedSportForAchievement(sportTypes.find(c => c._id === e.target.value))}
                                        className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none cursor-pointer focus:border-primary/30 transition-colors"
                                        required
                                    >
                                        {sportTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Achievement Title</label>
                                            <input value={achievementForm.title} onChange={e => setAchievementForm({ ...achievementForm, title: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-amber-500 transition-colors" required placeholder="e.g. Gold Medalist 2024" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Year</label>
                                            <input type="number" min="2000" max="2100" value={achievementForm.year} onChange={e => setAchievementForm({ ...achievementForm, year: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-amber-500 transition-colors" required />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Description</label>
                                            <textarea rows="4" value={achievementForm.description} onChange={e => setAchievementForm({ ...achievementForm, description: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none resize-none focus:border-amber-500 transition-colors" required placeholder="Achievement details..." />
                                        </div>
                                        <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                                            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Social Echoes (Optional)</h4>
                                            <div className="relative">
                                                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                                                <input value={achievementForm.socialLinks.instagram} onChange={e => setAchievementForm(prev => ({ ...prev, socialLinks:{...prev.socialLinks, instagram: e.target.value} }))} className="w-full bg-slate-50 p-4 pl-12 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:border-amber-500 transition-colors" placeholder="Instagram Link" />
                                            </div>
                                            <div className="relative">
                                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                                                <input value={achievementForm.socialLinks.linkedin} onChange={e => setAchievementForm(prev => ({ ...prev, socialLinks:{...prev.socialLinks, linkedin: e.target.value} }))} className="w-full bg-slate-50 p-4 pl-12 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:border-amber-500 transition-colors" placeholder="LinkedIn Link" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex justify-between">
                                                <span>Card List Image (Required) <span className="text-amber-500">*</span></span>
                                                {achievementForm.cardImage && <span className="text-amber-500">Selected ✔</span>}
                                            </label>
                                            <label className={`bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all hover:border-amber-500/40 hover:bg-amber-500/5 ${!achievementForm.cardImage ? 'border-amber-200 bg-amber-50/50' : ''}`}>
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                                                    <ImageIcon size={28} className="text-amber-400" />
                                                </div>
                                                <div className="flex flex-col text-center">
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">Upload Card Image</span>
                                                    <span className="text-[10px] text-slate-400 font-bold mt-1">Resized to Square (1:1)</span>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={e => setAchievementForm({ ...achievementForm, cardImage: e.target.files[0] })} />
                                            </label>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex justify-between">
                                                <span>Detail Banner (Optional)</span>
                                                {achievementForm.detailImage && <span className="text-emerald-500">Selected ✔</span>}
                                            </label>
                                            <label className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all hover:border-amber-500/40 hover:bg-amber-500/5">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                                                    <Upload size={28} className="text-slate-400" />
                                                </div>
                                                <div className="flex flex-col text-center">
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">Upload Detail Banner</span>
                                                    <span className="text-[10px] text-slate-400 font-bold mt-1">Wide format for single view</span>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={e => setAchievementForm({ ...achievementForm, detailImage: e.target.files[0] })} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-8 border-t border-slate-100">
                                    <button type="submit" className="w-full bg-amber-500 text-white py-6 rounded-3xl font-black uppercase text-sm tracking-[4px] shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-1 transition-all">
                                        Publish Achievement
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Manage Sports Modal */}
                {showModal === 'type' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-xl rounded-[60px] p-12 shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Manage Sport Category</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure Category visual options</p>
                                </div>
                                <X onClick={() => setShowModal(null)} className="text-slate-300 hover:text-rose-500 cursor-pointer" size={32} />
                            </div>
                            <form onSubmit={handleTypeSubmit} className="flex flex-col gap-10">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Sport Name</label>
                                    <input value={typeForm.name} onChange={e => setTypeForm({ ...typeForm, name: e.target.value })} className="bg-slate-50 p-6 rounded-[24px] border-2 border-slate-100 font-bold outline-none focus:border-primary transition-all" placeholder="e.g. Volleyball" required />
                                </div>
                                
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Category Poster Image</label>
                                    <label className="bg-slate-50 h-40 rounded-[32px] border-4 border-dashed border-slate-100 cursor-pointer flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors group">
                                        <Upload size={24} className="text-primary" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{typeForm.image ? typeForm.image.name : 'Select Background Image'}</span>
                                        <input type="file" className="hidden" onChange={e => setTypeForm({ ...typeForm, image: e.target.files[0] })} />
                                    </label>
                                </div>

                                <button type="submit" className="bg-primary text-white py-8 rounded-[32px] font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-primary/30 hover:-translate-y-2 transition-all active:scale-95 flex items-center justify-center gap-3">
                                    <Save size={18} /> {editingTypeId ? 'Update Category' : 'Create Category'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageSports;
