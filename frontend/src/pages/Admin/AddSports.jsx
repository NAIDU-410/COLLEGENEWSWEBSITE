import React, { useState, useEffect } from 'react';
import { getSports, createSports, updateSports, deleteSports } from '../../services/api';
import { Plus, Trash2, Edit2, Trophy, Upload, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../utils/imageUrl';

const AddSports = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(null);
    const [formData, setFormData] = useState({ sportName: 'Cricket', eventName: '', date: '', month: '', year: '', teamDetails: '', description: '', pictures: [], existingPictures: [] });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSportsNews();
    }, []);

    const fetchSportsNews = async () => {
        try {
            setLoading(true);
            const { data } = await getSports();
            setNews(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'pictures') {
                Array.from(formData.pictures).forEach(file => data.append('pictures', file));
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingId) {
                await updateSports(editingId, data);
            } else {
                await createSports(data);
            }
            setShowModal(null);
            fetchSportsNews();
            setFormData({ sportName: 'Cricket', eventName: '', date: '', month: '', year: '', teamDetails: '', description: '', pictures: [], existingPictures: [] });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this sports news?')) {
            await deleteSports(id);
            fetchSportsNews();
        }
    };

    const openEdit = (item) => {
        setEditingId(item._id);
        setFormData({ 
            sportName: item.sportName, 
            eventName: item.eventName, 
            date: item.date, 
            month: item.month, 
            year: item.year, 
            teamDetails: item.teamDetails || '', 
            description: item.description || '', 
            pictures: [],
            existingPictures: item.pictures || []
        });
        setShowModal('edit');
    };

    return (
        <div className="p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
                <header className="flex justify-between items-end">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Sports Updates</h1>
                        <p className="text-slate-500 font-medium">Manage athletic achievements and match results.</p>
                    </div>
                    <button
                        onClick={() => { setEditingId(null); setShowModal('create'); }}
                        className="bg-primary text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3"
                    >
                        <Plus size={20} /> Add Sports News
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center p-32"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item) => (
                            <div key={item._id} className="bg-white p-10 rounded-[48px] shadow-xl border border-slate-100 flex flex-col justify-between group h-full">
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                                        <Trophy size={14} /> {item.sportName}
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter group-hover:text-primary transition-colors">{item.eventName}</h3>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                                        <Calendar size={12} /> {item.date} {item.month}, {item.year}
                                    </p>
                                    {item.pictures?.[0] && (
                                        <img 
                                            src={getImageUrl(item.pictures[0])} 
                                            className="w-full h-40 object-cover rounded-3xl" 
                                            onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }}
                                        />
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-50">
                                    <button onClick={() => openEdit(item)} className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">Edit</button>
                                    <button onClick={() => handleDelete(item._id)} className="w-14 h-14 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl overflow-hidden p-12">
                            <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-8">
                                <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Sports News Entry</h2>
                                <button onClick={() => setShowModal(null)} className="text-slate-400 hover:rotate-90 transition-transform"><Plus size={32} className="rotate-45" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-8 h-[60vh] overflow-y-auto pr-4">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Sport Name</label>
                                        <input value={formData.sportName} onChange={e => setFormData({ ...formData, sportName: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none" required placeholder="e.g. Cricket" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Event/Tournament Name</label>
                                        <input value={formData.eventName} onChange={e => setFormData({ ...formData, eventName: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none" required placeholder="e.g. State Level Championship" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="flex flex-col gap-3"><label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Day</label><input value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none" required placeholder="DD" /></div>
                                    <div className="flex flex-col gap-3"><label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Month</label><input value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none" required placeholder="MMM" /></div>
                                    <div className="flex flex-col gap-3"><label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Year</label><input value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none" required placeholder="YYYY" /></div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Team Details / Highlights</label>
                                    <textarea rows="3" value={formData.teamDetails} onChange={e => setFormData({ ...formData, teamDetails: e.target.value })} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none resize-none" placeholder="e.g. Beat MIT Pune by 4 wickets..." />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Update Pictures (Replaces current)</label>
                                    <label className="bg-slate-50 h-32 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer flex flex-col items-center justify-center gap-2 group transition-colors hover:border-primary">
                                        <Upload size={24} className="text-primary" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {formData.pictures.length > 0 ? `${formData.pictures.length} New Selected` : (formData.existingPictures.length > 0 ? `${formData.existingPictures.length} Existing (Stored)` : 'Replace / Add Photos')}
                                        </span>
                                        <input type="file" multiple className="hidden" onChange={e => setFormData({ ...formData, pictures: e.target.files })} />
                                    </label>
                                    
                                    {/* Existing Pictures Strip */}
                                    {formData.pictures.length === 0 && formData.existingPictures.length > 0 && (
                                        <div className="flex gap-3 overflow-x-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            {formData.existingPictures.map((url, i) => (
                                                <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                                    <img src={getImageUrl(url)} className="w-full h-full object-cover" alt="prev" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button type="submit" className="bg-primary text-white py-6 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl hover:scale-[1.02] transition-all sticky bottom-0">
                                    Publish Sports News
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddSports;
