import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { createEvent, updateEvent, getEvents } from '../../services/api';
import { Layout, Calendar, Type, FileText, Upload, ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        eventType: 'event',
        subcategory: '',
        eventTitle: '',
        date: '',
        month: 'January',
        year: new Date().getFullYear(),
        description: '',
        image: null
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [sportsTypes, setSportsTypes] = useState([]);
    const [clubTypes, setClubTypes] = useState([]);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const [sRes, cRes] = await Promise.all([
                    api.get('/sport-types'),
                    api.get('/club-types')
                ]);
                setSportsTypes(sRes.data || []);
                setClubTypes(cRes.data || []);
            } catch (err) {
                console.error('Error fetching types:', err);
            }
        };
        fetchTypes();

        if (isEdit) {
            const fetchEvent = async () => {
                try {
                    const { data } = await getEvents({ type: 'ALL' });
                    // Handle paginated or direct array response
                    const eventList = Array.isArray(data) ? data : (data.events || []);
                    const event = eventList.find(e => e._id === id);
                    if (event) {
                        const ed = new Date(event.eventDate);
                        setFormData({
                            ...event,
                            eventTitle: event.eventTitle || event.eventName,
                            date: ed.getDate(),
                            month: months[ed.getMonth()],
                            year: ed.getFullYear(),
                            image: null
                        });
                    }
                } catch (err) {
                    console.error('Error fetching event:', err);
                } finally {
                    setFetching(false);
                }
            };
            fetchEvent();
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const monthIndex = months.indexOf(formData.month);
        const eventDate = new Date(formData.year, monthIndex, formData.date);
        
        const jsonFields = ['matches', 'teams', 'activities', 'achievements', 'socialLinks', 'images'];
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            // Skip metadata and explicitly handled fields
            if (['_id', '__v', 'createdAt', 'updatedAt', 'eventDate', 'image', 'date', 'month', 'year'].includes(key)) return;

            if (key === 'subcategory' && formData.eventType === 'event') {
                data.append(key, 'general');
            } else if (jsonFields.includes(key)) {
                data.append(key, JSON.stringify(formData[key] || (key === 'socialLinks' ? {} : [])));
            } else if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });
        
        if (formData.image instanceof File) {
            data.append('image', formData.image);
        }
        
        data.append('eventDate', eventDate.toISOString());

        try {
            if (isEdit) {
                await updateEvent(id, data);
            } else {
                await createEvent(data);
            }
            navigate('/admin/manage-events');
        } catch (err) {
            console.error('Error saving event:', err);
            alert('Failed to save event. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Loading Event Data...</div>;

    return (
        <div className="p-10 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto flex flex-col gap-12">
                <header className="flex items-center justify-between">
                    <button onClick={() => navigate('/admin/manage-events')} className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-primary transition-colors">
                        <ChevronLeft size={16} /> Back to Management
                    </button>
                    <div className="text-right">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
                        <p className="text-slate-500 font-medium">Capture every detail for the campus community.</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="bg-white p-16 rounded-[60px] shadow-2xl border border-slate-100 flex flex-col gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        
                        {/* Event Type */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                                <Type size={14} className="text-primary" /> Event Type
                            </label>
                            <select
                                required
                                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/20 transition-all appearance-none"
                                value={formData.eventType}
                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value, subcategory: '' })}
                            >
                                <option value="event">Event</option>
                                <option value="sports">Sports</option>
                                <option value="clubs">Clubs</option>
                            </select>
                        </div>

                        {/* Subcategory - Dynamic */}
                        {formData.eventType !== 'event' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                                    <Layout size={14} className="text-primary" /> Subcategory
                                </label>
                                {(formData.eventType === 'sports' ? sportsTypes : clubTypes).length > 0 ? (
                                    <select
                                        required
                                        className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/20 transition-all appearance-none"
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                    >
                                        <option value="" disabled>Select {formData.eventType === 'sports' ? 'Sport' : 'Club'}</option>
                                        {(formData.eventType === 'sports' ? sportsTypes : clubTypes).map(sub => (
                                            <option key={sub._id} value={sub.name}>{sub.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600 font-bold text-sm">
                                        <AlertCircle size={18} />
                                        ⚠ No data available. Please create first.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <div className="flex flex-col gap-3 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                                <FileText size={14} className="text-primary" /> Event Title
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Annual Tech Fest 2024"
                                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/20 transition-all"
                                value={formData.eventTitle}
                                onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                            />
                        </div>

                        {/* Date Props */}
                        <div className="grid grid-cols-3 gap-6 md:col-span-2">
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Date</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="31"
                                    placeholder="DD"
                                    className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/20 transition-all"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Month</label>
                                <select
                                    required
                                    className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/20 transition-all appearance-none"
                                    value={formData.month}
                                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                >
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Year</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="YYYY"
                                    className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/20 transition-all"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="flex flex-col gap-3 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                                <Upload size={14} className="text-primary" /> Event Image
                            </label>
                            <label className="flex items-center justify-center gap-4 bg-slate-50 p-10 rounded-[32px] border-2 border-dashed border-slate-200 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group">
                                <div className="flex flex-col items-center gap-2">
                                    <Upload size={32} className="text-slate-300 group-hover:text-primary transition-colors" />
                                    <span className="text-slate-400 font-bold text-sm">{formData.image ? formData.image.name : 'Click to upload event thumbnail'}</span>
                                    <span className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em]">JPG, JPEG or PNG</span>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                />
                            </label>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-3 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Description</label>
                            <textarea
                                rows="6"
                                required
                                placeholder="Describe the event, venue, and what to expect..."
                                className="bg-slate-50 p-8 rounded-3xl border border-slate-100 font-bold outline-none focus:border-primary/20 transition-all resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-6 mt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/manage-events')}
                            className="flex-1 bg-slate-50 text-slate-500 py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (formData.eventType !== 'event' && (formData.eventType === 'sports' ? sportsTypes : clubTypes).length === 0)}
                            className="flex-[2] bg-primary text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <><Save size={20} /> {isEdit ? 'Update Changes' : 'Publish Event'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
