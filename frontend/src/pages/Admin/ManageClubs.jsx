import React, { useState, useEffect } from 'react';
import { 
    getClubEvents, createClubEvent, updateClubEvent, deleteClubEvent,
    getClubTypes, createClubType, updateClubType, deleteClubType,
    createAchievement, getAchievements, deleteAchievement
} from '../../services/api';
import { 
    Plus, Trash2, Edit2, Users, Upload, Calendar, 
    Instagram, Twitter, Globe, Info, Clock, 
    CheckCircle2, AlertCircle, X, Save, Search, ChevronRight, Layout, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../utils/imageUrl';

const ManageClubs = () => {
    const [events, setEvents] = useState([]);
    const [clubTypes, setClubTypes] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(null); // 'event', 'type', 'achievement'
    const [editingAchievementId, setEditingAchievementId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, UPCOMING, PAST
    const [editingId, setEditingId] = useState(null);
    const [editingTypeId, setEditingTypeId] = useState(null);
    const [selectedClubForAchievement, setSelectedClubForAchievement] = useState(null);

    // Form Data States
    const [eventForm, setEventForm] = useState({
        clubName: '',
        eventTitle: '',
        eventDate: '',
        description: '',
        eventImage: null,
        images: [],
        existingEventImage: '',
        existingImages: [],
        activities: [{ name: '', description: '', time: '' }],
        achievements: [{ title: '', recipient: '', description: '' }],
        socialLinks: { instagram: '', twitter: '', website: '' }
    });

    const [typeForm, setTypeForm] = useState({ name: '', image: null, description: '' });

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
                getClubEvents(),
                getClubTypes(),
                getAchievements({ type: 'clubs' })
            ]);
            setEvents(evRes.data.events || []);
            setClubTypes(typeRes.data || []);
            setAchievements(achRes.data || []);
            
            if (typeRes.data.length > 0 && !eventForm.clubName) {
                setEventForm(prev => ({ ...prev, clubName: typeRes.data[0].name }));
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

    // Activity Handlers
    const handleAddActivity = () => {
        setEventForm({ ...eventForm, activities: [...eventForm.activities, { name: '', description: '', time: '' }] });
    };

    const handleRemoveActivity = (idx) => {
        setEventForm({ ...eventForm, activities: eventForm.activities.filter((_, i) => i !== idx) });
    };

    const handleActivityChange = (idx, field, val) => {
        const newActivities = [...eventForm.activities];
        newActivities[idx][field] = val;
        setEventForm({ ...eventForm, activities: newActivities });
    };

    // Achievement Handlers
    const handleAddAchievement = () => {
        setEventForm({ ...eventForm, achievements: [...eventForm.achievements, { title: '', recipient: '', description: '' }] });
    };

    const handleRemoveAchievement = (idx) => {
        setEventForm({ ...eventForm, achievements: eventForm.achievements.filter((_, i) => i !== idx) });
    };

    const handleAchievementChange = (idx, field, val) => {
        const newAchievements = [...eventForm.achievements];
        newAchievements[idx][field] = val;
        setEventForm({ ...eventForm, achievements: newAchievements });
    };
    
    // Image Removal
    const removeNewImage = (type, index) => {
        if (type === 'banner') {
            setEventForm({ ...eventForm, eventImage: null });
        } else {
            const newFiles = Array.from(eventForm.images);
            newFiles.splice(index, 1);
            setEventForm({ ...eventForm, images: newFiles });
        }
    };

    const removeExistingImage = (type, index) => {
        if (type === 'banner') {
            setEventForm({ ...eventForm, existingEventImage: '' });
        } else {
            const newExisting = [...eventForm.existingImages];
            newExisting.splice(index, 1);
            setEventForm({ ...eventForm, existingImages: newExisting });
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('eventType', 'clubs');
        data.append('subcategory', eventForm.clubName.toLowerCase().trim());
        data.append('eventTitle', eventForm.eventTitle);
        data.append('eventDate', eventForm.eventDate);
        data.append('description', eventForm.description);
        
        if (eventForm.eventImage) data.append('eventImage', eventForm.eventImage);
        if (eventForm.images && eventForm.images.length > 0) {
            Array.from(eventForm.images).forEach(img => data.append('images', img));
        }

        if (editingId) {
            data.append('existingEventImage', eventForm.existingEventImage);
            data.append('existingImages', JSON.stringify(eventForm.existingImages));
        }
        
        data.append('activities', JSON.stringify(eventForm.activities));
        data.append('achievements', JSON.stringify(eventForm.achievements));
        data.append('socialLinks', JSON.stringify(eventForm.socialLinks));

        try {
            if (editingId) {
                await updateClubEvent(editingId, data);
                alert('Club event updated successfully!');
            } else {
                await createClubEvent(data);
                alert('Club event launched successfully!');
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
            clubName: clubTypes[0]?.name || '',
            eventTitle: '',
            eventDate: '',
            description: '',
            eventImage: null,
            images: [],
            existingEventImage: '',
            existingImages: [],
            activities: [{ name: '', description: '', time: '' }],
            achievements: [{ title: '', recipient: '', description: '' }],
            socialLinks: { instagram: '', twitter: '', website: '' }
        });
        setEditingId(null);
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('🔴 ARE YOU SURE? This will permanently delete the club event.')) {
            try {
                await deleteClubEvent(id);
                alert('Event deleted.');
                fetchData();
            } catch (err) {
                alert('Failed to delete: ' + err.message);
            }
        }
    };

    const openEditEvent = (ev) => {
        setEditingId(ev._id);
        setEventForm({
            clubName: ev.subcategory || ev.clubName || '',
            eventTitle: ev.eventTitle,
            eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '',
            description: ev.description,
            eventImage: null,
            images: [],
            existingEventImage: ev.image || ev.eventImage || '',
            existingImages: ev.images || [],
            activities: ev.activities || [{ name: '', description: '', time: '' }],
            achievements: ev.achievements || [{ title: '', recipient: '', description: '' }],
            socialLinks: ev.socialLinks || { instagram: '', twitter: '', website: '' }
        });
        setShowModal('event');
    };

    const handleTypeSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', typeForm.name);
        data.append('description', typeForm.description);
        if (typeForm.image) data.append('image', typeForm.image);

        try {
            if (editingTypeId) {
                await updateClubType(editingTypeId, data);
            } else {
                await createClubType(data);
            }
            fetchData();
            setTypeForm({ name: '', image: null, description: '' });
            setEditingTypeId(null);
            setShowModal(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm('🔴 Delete this club category?')) {
            try {
                await deleteClubType(id);
                fetchData();
            } catch (err) {
                alert('Failed to delete: ' + err.message);
            }
        }
    };

    const handleDeleteAchievement = async (id) => {
        if (window.confirm('🔴 Delete this club achievement?')) {
            try {
                await deleteAchievement(id);
                fetchData();
            } catch (err) {
                alert('Failed to delete: ' + err.message);
            }
        }
    };

    const openEditType = (type) => {
        setEditingTypeId(type._id);
        setTypeForm({ name: type.name, description: type.description || '', image: null });
        setShowModal('type');
    };

    const openAchievementModal = (club) => {
        setSelectedClubForAchievement(club);
        setEditingAchievementId(null);
        setAchievementForm({
            title: '', description: '', year: new Date().getFullYear(),
            socialLinks: { instagram: '', linkedin: '', facebook: '' },
            cardImage: null, detailImage: null
        });
        setShowModal('achievement');
    };

    const openEditAchievement = (ach) => {
        const club = clubTypes.find(c => c.name.toLowerCase() === ach.subcategory.toLowerCase());
        setSelectedClubForAchievement(club || clubTypes[0]);
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
        data.append('type', 'clubs');
        data.append('subcategory', selectedClubForAchievement.name.toLowerCase().trim());
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
            alert('Error saving achievement');
        }
    };

    const filteredEvents = events.filter(ev => {
        const title = ev.eventTitle || '';
        const club = ev.clubName || '';
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             club.toLowerCase().includes(searchQuery.toLowerCase());
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
                            <Users className="text-primary w-12 h-12" /> CLUBS HUB
                        </h1>
                        <p className="text-slate-500 font-bold text-lg">Manage Campus Organizations & Events</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setShowModal('type')}
                            className="bg-white text-slate-700 border-2 border-slate-200 px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-primary transition-all flex items-center gap-2"
                        >
                            <Layout size={18} /> Manage Clubs
                        </button>
                        <button
                            onClick={() => { 
                                if (clubTypes.length === 0) return alert('Please create a club first!');
                                setSelectedClubForAchievement(clubTypes[0]);
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
                            <Plus size={20} /> Launch Club Event
                        </button>
                    </div>
                </header>

                {/* Search & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search by event title or club..." 
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
                    <div className="lg:col-span-4 bg-primary p-10 rounded-[48px] text-white flex flex-col justify-between shadow-2xl shadow-primary/20">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Directory Size</span>
                                <h2 className="text-3xl font-black">{clubTypes.length} Registered Clubs</h2>
                            </div>
                            <Users size={32} className="opacity-40" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-xl font-black">{events.length}</span>
                                <span className="text-[8px] font-black uppercase opacity-60">Total Events</span>
                            </div>
                            <div className="w-px h-8 bg-white/20 mx-2" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black">{events.filter(e => getAutoStatus(e.eventDate) === 'UPCOMING').length}</span>
                                <span className="text-[8px] font-black uppercase opacity-60">Active/Upcoming</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-6 bg-white rounded-[48px] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.5em]">Synchronizing Directory...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {/* Club Categories (Square Posters) */}
                        <div className="flex flex-col gap-8">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                                <Layout className="text-indigo-500" /> Active Organizations
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {clubTypes.map((type, i) => (
                                    <motion.div 
                                        key={type._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="relative aspect-square rounded-[36px] overflow-hidden group shadow-xl transition-all duration-500 hover:shadow-primary/20"
                                    >
                                        <div className="absolute inset-0 z-0 bg-slate-100">
                                            {type.image ? (
                                                <img 
                                                    src={getImageUrl(type.image)} 
                                                    alt={type.name} 
                                                    className="w-full h-full object-cover brightness-[0.7] group-hover:scale-110 group-hover:brightness-50 transition-all duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                                    <Users size={48} className="text-white/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                        </div>

                                        <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="w-12 h-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white font-black group-hover:bg-primary transition-colors uppercase">
                                                    {type.name[0]}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditType(type)} className="w-10 h-10 backdrop-blur-md bg-black/30 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-primary transition-all rounded-full" title="Edit Club">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => openAchievementModal(type)} className="w-10 h-10 backdrop-blur-md bg-black/30 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-amber-500 transition-all rounded-full" title="Add Achievement">
                                                        <Award size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteType(type._id)} className="w-10 h-10 backdrop-blur-md bg-black/30 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-rose-500 transition-all rounded-full" title="Delete Club">
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
                                    onClick={() => { setEditingTypeId(null); setTypeForm({ name: '', description: '', image: null }); setShowModal('type'); }}
                                    className="aspect-square border-4 border-dashed border-slate-200 rounded-[36px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-primary hover:text-primary transition-all group bg-white"
                                >
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus size={32} />
                                    </div>
                                    <span className="font-black uppercase text-[10px] tracking-[0.4em]">New Club</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Events Grid */}
                        <div className="flex flex-col gap-8">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                                <Calendar className="text-emerald-500" /> Event Records
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                                    <span className="text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-full w-fit uppercase tracking-widest">{ev.subcategory || ev.clubName}</span>
                                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors line-clamp-2">{ev.eventTitle}</h3>
                                                </div>
                                                <div className={`p-4 rounded-3xl ${getAutoStatus(ev.eventDate) === 'UPCOMING' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    {getAutoStatus(ev.eventDate) === 'UPCOMING' ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-50 py-4">
                                                <div className="flex items-center gap-2 text-slate-600"><Calendar size={14} className="text-primary" /> {new Date(ev.eventDate).toLocaleDateString()}</div>
                                                <div className="flex items-center gap-2"><Layout size={14} className="text-primary" /> {ev.activities?.length || 0} Phases</div>
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
                                    <div className="col-span-full bg-white p-20 rounded-[48px] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-6">
                                        <AlertCircle size={64} className="text-slate-200" />
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">No Events Found</h3>
                                            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest mt-2">Try adjusting your filters or search query</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* ── Club Achievements Directory ── */}
                <div className="flex flex-col gap-12 mt-20">
                    <div className="flex items-center gap-6">
                        <div className="w-4 h-12 bg-amber-500 rounded-full" />
                        <div>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase italic">Club Achievements</h2>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage all club-related milestones</p>
                        </div>
                    </div>
                    
                    {achievements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {achievements.map((ach) => (
                                <div key={ach._id} className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex flex-col gap-6 group hover:-translate-y-2 transition-all duration-500">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200 truncate max-w-[120px]">
                                                {ach.subcategory}
                                            </span>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditAchievement(ach)} className="text-slate-300 hover:text-primary transition-colors p-2 bg-slate-50 rounded-full hover:bg-primary/5"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteAchievement(ach._id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2 bg-slate-50 rounded-full hover:bg-rose-50"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    <div className="h-40 rounded-[24px] overflow-hidden bg-slate-100 relative">
                                        {ach.cardImage ? <img src={getImageUrl(ach.cardImage)} alt="card" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center"><Award className="text-slate-200 w-12 h-12" /></div>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-slate-300 font-black text-sm">{ach.year}</span>
                                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2 italic">{ach.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 bg-white rounded-[48px] border-dashed border-4 border-slate-100 flex flex-col items-center gap-6 text-center">
                            <Award className="text-slate-200 w-16 h-16" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">No achievements posted yet</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Club Event Modal */}
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
                                            {editingId ? 'Edit Club Event' : 'Launch New Event'}
                                        </h2>
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Define the future of your organization</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(null)} className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:rotate-90 transition-all duration-500">
                                    <X size={32} />
                                </button>
                            </div>

                            <form onSubmit={handleEventSubmit} className="flex-1 overflow-y-auto p-12 md:p-16 custom-scrollbar bg-white">
                                {clubTypes.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-8 py-20 text-center">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300">
                                            <AlertCircle size={48} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">No Clubs Registered</h3>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">You must create a club profile before you can host any events.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setShowModal('type')}
                                            className="bg-primary text-white px-12 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 hover:-translate-y-2 transition-all flex items-center gap-3"
                                        >
                                            <Plus size={20} /> Create First Club
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-24">
                                    
                                    {/* SECTION 1: BASIC INFO */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                        <div className="md:col-span-4 flex flex-col gap-4">
                                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-blue-100">1</div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Essential Info</h3>
                                            <p className="text-slate-400 text-sm font-bold leading-relaxed">Provide the core identity and schedule for this club activity.</p>
                                        </div>
                                        <div className="md:col-span-8 bg-slate-50 p-10 rounded-[48px] flex flex-col gap-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="flex flex-col gap-3">
                                                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">Host Club</label>
                                                    <select 
                                                        value={eventForm.clubName} 
                                                        onChange={e => setEventForm({ ...eventForm, clubName: e.target.value })} 
                                                        className="bg-white p-6 rounded-2xl border-2 border-slate-100 font-black text-slate-800 outline-none focus:border-primary transition-all cursor-pointer"
                                                        required
                                                    >
                                                        {clubTypes.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
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
                                                    placeholder="e.g. Annual Tech Symposium 2024" 
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
                                                    placeholder="What can participants expect from this event?" 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2: STATUS */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                        <div className="md:col-span-4 flex flex-col gap-4">
                                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-amber-100">2</div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Timeline Logic</h3>
                                            <p className="text-slate-400 text-sm font-bold leading-relaxed">Status is handled dynamically by our engine based on the event date.</p>
                                        </div>
                                        <div className="md:col-span-8 flex items-center gap-6">
                                            <div className={`flex-1 p-10 rounded-[48px] border-4 border-dashed flex items-center justify-center gap-6 transition-all ${getAutoStatus(eventForm.eventDate) === 'UPCOMING' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                                <Clock size={48} className={getAutoStatus(eventForm.eventDate) === 'UPCOMING' ? 'animate-pulse' : ''} />
                                                <div className="flex flex-col">
                                                    <span className="text-3xl font-black uppercase tracking-tighter">
                                                        {getAutoStatus(eventForm.eventDate) === 'UPCOMING' ? 'Upcoming Activity ✅' : 'Completed Legacy ⏳'}
                                                    </span>
                                                    <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Calculated in real-time</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 3: ACTIVITIES */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                        <div className="md:col-span-4 flex flex-col gap-4">
                                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-indigo-100">3</div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Event Itinerary</h3>
                                            <p className="text-slate-400 text-sm font-bold leading-relaxed">Break down the event into specific phases, sessions or sub-activities.</p>
                                        </div>
                                        <div className="md:col-span-8 flex flex-col gap-8">
                                            <AnimatePresence>
                                                {eventForm.activities.map((act, idx) => (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: -20 }} 
                                                        animate={{ opacity: 1, x: 0 }} 
                                                        key={idx} 
                                                        className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-xl shadow-slate-200/20 relative"
                                                    >
                                                        <button type="button" onClick={() => handleRemoveActivity(idx)} className="absolute top-6 right-6 bg-rose-50 text-rose-500 p-4 rounded-3xl hover:bg-rose-500 hover:text-white transition-all">
                                                            <Trash2 size={24} />
                                                        </button>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Activity Name</label>
                                                                <input value={act.name} onChange={e => handleActivityChange(idx, 'name', e.target.value)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 outline-none focus:bg-white" placeholder="e.g. Workshop Session A" />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Time / Duration</label>
                                                                <input value={act.time} onChange={e => handleActivityChange(idx, 'time', e.target.value)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:bg-white" placeholder="e.g. 10:00 AM - 12:00 PM" />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Brief Description</label>
                                                            <textarea rows="2" value={act.description} onChange={e => handleActivityChange(idx, 'description', e.target.value)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 outline-none focus:bg-white resize-none" placeholder="What happens here?" />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            <button type="button" onClick={handleAddActivity} className="w-full border-4 border-dashed border-slate-100 p-10 rounded-[48px] text-slate-300 font-black uppercase text-xs tracking-[0.4em] hover:border-primary hover:text-primary transition-all flex flex-col items-center gap-4">
                                                <Plus size={48} />
                                                + Add Phase / Session
                                            </button>
                                        </div>
                                    </div>

                                    {/* SECTION 4: MEDIA */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                        <div className="md:col-span-4 flex flex-col gap-4">
                                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-emerald-100">4</div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Visual Assets</h3>
                                            <p className="text-slate-400 text-sm font-bold leading-relaxed">The main banner and carousel images highlight the club's vibrancy.</p>
                                        </div>
                                        <div className="md:col-span-8 flex flex-col gap-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="flex flex-col gap-3">
                                                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">Lead Promotion Banner</label>
                                                    <label className="bg-slate-50 h-56 rounded-[40px] border-4 border-dashed border-slate-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors hover:bg-slate-100 group overflow-hidden relative">
                                                        {(eventForm.eventImage || eventForm.existingEventImage) ? (
                                                            <div className="absolute inset-0">
                                                                <img 
                                                                    src={eventForm.eventImage ? URL.createObjectURL(eventForm.eventImage) : getImageUrl(eventForm.existingEventImage)} 
                                                                    className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" 
                                                                    alt="preview"
                                                                />
                                                                <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center gap-2">
                                                                    <div className="flex gap-2">
                                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg"><Upload size={24} className="text-primary" /></div>
                                                                        <button 
                                                                            type="button"
                                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); eventForm.eventImage ? removeNewImage('banner') : removeExistingImage('banner'); }}
                                                                            className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg text-white hover:bg-rose-600 transition-all"
                                                                        >
                                                                            <X size={24} />
                                                                        </button>
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Update Banner</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                                                    <Upload size={32} className="text-primary" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Visual</span>
                                                            </>
                                                        )}
                                                        <input type="file" className="hidden" onChange={e => setEventForm({ ...eventForm, eventImage: e.target.files[0] })} />
                                                    </label>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-2">Photo Gallery (Carousel)</label>
                                                    <label className="bg-slate-50 h-56 rounded-[40px] border-4 border-dashed border-slate-100 cursor-pointer flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors hover:bg-slate-100 group">
                                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                                            <Layout size={32} className="text-indigo-500" />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            {eventForm.images.length > 0 ? `${eventForm.images.length} Selected` : (eventForm.existingImages.length > 0 ? `${eventForm.existingImages.length} Existing` : 'Multi-Image Select')}
                                                        </span>
                                                        <input type="file" multiple className="hidden" onChange={e => setEventForm({ ...eventForm, images: e.target.files })} />
                                                    </label>
                                                </div>
                                            </div>
                                            {(eventForm.images.length > 0 || eventForm.existingImages.length > 0) && (
                                                <div className="flex gap-6 p-6 bg-slate-50 rounded-[40px] overflow-x-auto border border-slate-100 custom-scrollbar">
                                                    {/* Existing Images */}
                                                    {eventForm.existingImages.map((url, i) => (
                                                        <div key={`exist-${i}`} className="w-24 h-24 rounded-3xl bg-white border-2 border-slate-200 overflow-hidden shrink-0 relative group">
                                                            <img src={getImageUrl(url)} className="w-full h-full object-cover" alt="existing" />
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); removeExistingImage('gallery', i); }}
                                                                className="absolute -top-1 -right-1 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {/* New Images */}
                                                    {Array.from(eventForm.images).map((file, i) => (
                                                        <div key={`new-${i}`} className="w-24 h-24 rounded-3xl bg-white border-2 border-primary/30 overflow-hidden shrink-0 relative group">
                                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="new" />
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); removeNewImage('gallery', i); }}
                                                                className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* SECTION 5: ACHIEVEMENTS */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                        <div className="md:col-span-4 flex flex-col gap-4">
                                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-amber-100">5</div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Achievements</h3>
                                            <p className="text-slate-400 text-sm font-bold leading-relaxed">Highlight winners, awards, or major milestones achieved during this event.</p>
                                        </div>
                                        <div className="md:col-span-8 flex flex-col gap-8">
                                            <AnimatePresence>
                                                {eventForm.achievements.map((ach, idx) => (
                                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={idx} className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-xl shadow-slate-200/20 relative">
                                                        <button type="button" onClick={() => handleRemoveAchievement(idx)} className="absolute top-6 right-6 bg-rose-50 text-rose-500 p-4 rounded-3xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={24} /></button>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Award/Title</label>
                                                                <input value={ach.title} onChange={e => handleAchievementChange(idx, 'title', e.target.value)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:bg-white outline-none" placeholder="e.g. Best Innovator" />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Recipient</label>
                                                                <input value={ach.recipient} onChange={e => handleAchievementChange(idx, 'recipient', e.target.value)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:bg-white outline-none" placeholder="e.g. John Doe & Team" />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Brief Summary</label>
                                                            <textarea rows="2" value={ach.description} onChange={e => handleAchievementChange(idx, 'description', e.target.value)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-800 outline-none focus:bg-white resize-none" placeholder="How did they win?" />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            <button type="button" onClick={handleAddAchievement} className="w-full border-4 border-dashed border-slate-100 p-10 rounded-[48px] text-slate-300 font-black uppercase text-xs tracking-[0.4em] hover:border-primary hover:text-primary transition-all flex flex-col items-center gap-4">
                                                <Award size={48} />
                                                + Record Achievement
                                            </button>
                                        </div>
                                    </div>

                                    {/* SECTION 6: SOCIAL */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                        <div className="md:col-span-4 flex flex-col gap-4">
                                            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-rose-100">6</div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Social Connect</h3>
                                            <p className="text-slate-400 text-sm font-bold leading-relaxed">Direct students to the official club pages for more real-time engagement.</p>
                                        </div>
                                        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-slate-50 p-8 rounded-[40px] flex flex-col gap-4 border-2 border-slate-100 group hover:border-primary transition-colors">
                                                <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><Instagram size={24} /></div>
                                                <input value={eventForm.socialLinks.instagram} onChange={e => setEventForm({ ...eventForm, socialLinks: { ...eventForm.socialLinks, instagram: e.target.value } })} className="bg-transparent border-none font-black text-slate-800 outline-none placeholder:text-slate-200 text-xs" placeholder="Instagram URL" />
                                            </div>
                                            <div className="bg-slate-50 p-8 rounded-[40px] flex flex-col gap-4 border-2 border-slate-100 group hover:border-primary transition-colors">
                                                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl"><Twitter size={24} /></div>
                                                <input value={eventForm.socialLinks.twitter} onChange={e => setEventForm({ ...eventForm, socialLinks: { ...eventForm.socialLinks, twitter: e.target.value } })} className="bg-transparent border-none font-black text-slate-800 outline-none placeholder:text-slate-200 text-xs" placeholder="Twitter URL" />
                                            </div>
                                            <div className="bg-slate-50 p-8 rounded-[40px] flex flex-col gap-4 border-2 border-slate-100 group hover:border-primary transition-colors">
                                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><Globe size={24} /></div>
                                                <input value={eventForm.socialLinks.website} onChange={e => setEventForm({ ...eventForm, socialLinks: { ...eventForm.socialLinks, website: e.target.value } })} className="bg-transparent border-none font-black text-slate-800 outline-none placeholder:text-slate-200 text-xs" placeholder="Official Website" />
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="mt-20 flex flex-col gap-6 sticky bottom-0 z-30 bg-white/80 backdrop-blur-md p-10 border-t border-slate-100 rounded-b-[48px]">
                                    <button 
                                        type="submit" 
                                        className="w-full bg-primary text-white py-10 rounded-[32px] font-black uppercase text-xl tracking-[0.5em] shadow-2xl shadow-primary/30 hover:-translate-y-2 transition-all flex items-center justify-center gap-6"
                                    >
                                        <CheckCircle2 size={32} />
                                        {editingId ? 'Update Club Event' : 'Publish to Portal'}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Manage Club Type Modal */}
                {showModal === 'type' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-xl rounded-[60px] p-12 shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Configuration</h1>
                                <X onClick={() => setShowModal(null)} className="text-slate-300 hover:text-rose-500 cursor-pointer" size={32} />
                            </div>
                            <form onSubmit={handleTypeSubmit} className="flex flex-col gap-8">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Club Name</label>
                                    <input value={typeForm.name} onChange={e => setTypeForm({ ...typeForm, name: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:bg-white" required />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Description</label>
                                    <textarea rows="3" value={typeForm.description} onChange={e => setTypeForm({ ...typeForm, description: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:bg-white resize-none" />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Club Visual (Posters)</label>
                                    <label className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 cursor-pointer flex flex-col items-center gap-3">
                                        <Upload size={32} className="text-primary" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">{typeForm.image ? typeForm.image.name : 'Select High-Res Logo'}</span>
                                        <input type="file" className="hidden" onChange={e => setTypeForm({ ...typeForm, image: e.target.files[0] })} />
                                    </label>
                                </div>
                                <button type="submit" className="bg-primary text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">{editingTypeId ? 'Update Club' : 'Create Organization'}</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Achievement Modal */}
                {showModal === 'achievement' && selectedClubForAchievement && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-2xl rounded-[60px] p-12 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                                <div>
                                    <h1 className="text-3xl font-black text-amber-500 uppercase tracking-tighter flex items-center gap-3">
                                        <Award size={32} /> {editingAchievementId ? 'Edit achievement' : 'Club Achievement'}
                                    </h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                        Adding to: <span className="text-primary">{selectedClubForAchievement.name}</span>
                                    </p>
                                </div>
                                <X onClick={() => setShowModal(null)} className="text-slate-300 hover:text-rose-500 cursor-pointer" size={32} />
                            </div>
                            <form onSubmit={handleAchievementSubmit} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Awarding To (Club)</label>
                                    <select 
                                        value={selectedClubForAchievement?._id || ''} 
                                        onChange={e => setSelectedClubForAchievement(clubTypes.find(c => c._id === e.target.value))}
                                        className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none cursor-pointer focus:border-primary/30 transition-colors"
                                        required
                                    >
                                        {clubTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Achievement Title</label>
                                        <input value={achievementForm.title} onChange={e => setAchievementForm({ ...achievementForm, title: e.target.value })} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none" required placeholder="e.g. Best Robotics Team" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Year</label>
                                        <input type="number" value={achievementForm.year} onChange={e => setAchievementForm({ ...achievementForm, year: e.target.value })} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none" required />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Description</label>
                                    <textarea rows="3" value={achievementForm.description} onChange={e => setAchievementForm({ ...achievementForm, description: e.target.value })} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none resize-none" required placeholder="Full details..." />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-2 flex justify-between">
                                            <span>Card Image *</span>
                                            {achievementForm.cardImage && <span className="text-emerald-500">✔</span>}
                                        </label>
                                        <label className={`bg-slate-50 p-4 rounded-2xl border border-slate-200 cursor-pointer flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all ${!achievementForm.cardImage ? 'border-rose-200 bg-rose-50' : ''}`}>
                                            <Upload size={20} className="text-primary" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-full">
                                                {achievementForm.cardImage ? achievementForm.cardImage.name : 'Upload (Required)'}
                                            </span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => setAchievementForm({ ...achievementForm, cardImage: e.target.files[0] })} />
                                        </label>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex justify-between">
                                            <span>Detail Banner</span>
                                            {achievementForm.detailImage && <span className="text-emerald-500">✔</span>}
                                        </label>
                                        <label className="bg-slate-50 p-4 rounded-2xl border border-slate-200 cursor-pointer flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                                            <Upload size={20} className="text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-full">
                                                {achievementForm.detailImage ? achievementForm.detailImage.name : 'Upload (Optional)'}
                                            </span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => setAchievementForm({ ...achievementForm, detailImage: e.target.files[0] })} />
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" className="bg-amber-500 text-white py-6 mt-4 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-500/20 hover:-translate-y-1 transition-all">
                                    {editingAchievementId ? 'Update Record' : 'Record Achievement'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageClubs;
