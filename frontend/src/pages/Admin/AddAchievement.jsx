import React, { useState, useEffect } from 'react';
import { getAchievements, createAchievement, updateAchievement, deleteAchievement, getSportTypes, getClubTypes } from '../../services/api';
import { Plus, Trash2, Edit2, Award, Upload, ExternalLink, ChevronRight, Filter, Search, Globe, Instagram, Linkedin, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../utils/imageUrl';

const AddAchievement = () => {
    const [achievements, setAchievements] = useState([]);
    const [sportTypes, setSportTypes] = useState([]);
    const [clubTypes, setClubTypes] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Filtering states
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'sports',
        subcategory: '',
        year: new Date().getFullYear(),
        socialLinks: { instagram: '', linkedin: '', facebook: '' },
        cardImage: null,
        detailImage: null
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [achRes, sportsRes, clubsRes] = await Promise.all([
                getAchievements(),
                getSportTypes(),
                getClubTypes()
            ]);
            setAchievements(achRes.data);
            setSportTypes(sportsRes.data || []);
            setClubTypes(clubsRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLinkChange = (network, value) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [network]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.type === 'sports' && !formData.subcategory && sportTypes.length === 0) {
            alert('⚠ Please create a sport type first!');
            return;
        }
        if (formData.type === 'clubs' && !formData.subcategory && clubTypes.length === 0) {
            alert('⚠ Please create a club first!');
            return;
        }
        if ((formData.type === 'sports' || formData.type === 'clubs') && !formData.subcategory) {
             alert('Please select a subcategory!');
             return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('type', formData.type);
        if (formData.subcategory) data.append('subcategory', formData.subcategory);
        data.append('year', formData.year);
        data.append('socialLinks', JSON.stringify(formData.socialLinks));

        if (formData.cardImage) data.append('cardImage', formData.cardImage);
        if (formData.detailImage) data.append('detailImage', formData.detailImage);

        try {
            if (editingId) {
                await updateAchievement(editingId, data);
            } else {
                await createAchievement(data);
            }
            setShowModal(false);
            fetchData();
            resetForm();
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || 'Error saving achievement';
            alert('Error saving achievement: ' + errorMessage);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'sports',
            subcategory: '',
            year: new Date().getFullYear(),
            socialLinks: { instagram: '', linkedin: '', facebook: '' },
            cardImage: null,
            detailImage: null
        });
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this achievement?')) {
            await deleteAchievement(id);
            fetchData();
        }
    };

    const openEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            title: item.title,
            description: item.description,
            type: item.type,
            subcategory: item.subcategory || '',
            year: item.year || new Date().getFullYear(),
            socialLinks: item.socialLinks || { instagram: '', linkedin: '', facebook: '' },
            cardImage: null,
            detailImage: null
        });
        setShowModal(true);
    };

    const renderSubcategoryOptions = () => {
        if (formData.type === 'sports') {
            if (sportTypes.length === 0) {
                return <option value="" disabled>⚠ No sports available. Create one first.</option>;
            }
            return (
                <>
                    <option value="" disabled>Select Sport</option>
                    {sportTypes.map(s => <option key={s._id} value={s.name.toLowerCase()}>{s.name}</option>)}
                </>
            );
        }
        if (formData.type === 'clubs') {
            if (clubTypes.length === 0) {
                return <option value="" disabled>⚠ No clubs available. Create one first.</option>;
            }
            return (
                <>
                    <option value="" disabled>Select Club</option>
                    {clubTypes.map(c => <option key={c._id} value={c.name.toLowerCase()}>{c.name}</option>)}
                </>
            );
        }
        return null;
    };

    // Auto-select first subcategory if available
    useEffect(() => {
        if (formData.type === 'sports' && sportTypes.length > 0 && !formData.subcategory) {
            setFormData(prev => ({ ...prev, subcategory: sportTypes[0].name.toLowerCase() }));
        } else if (formData.type === 'clubs' && clubTypes.length > 0 && !formData.subcategory) {
            setFormData(prev => ({ ...prev, subcategory: clubTypes[0].name.toLowerCase() }));
        } else if (formData.type === 'placements' || formData.type === 'others') {
            setFormData(prev => ({ ...prev, subcategory: '' }));
        }
    }, [formData.type, sportTypes, clubTypes]);

    const filteredAchievements = achievements.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'ALL' || item.type.toUpperCase() === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const getTypeColor = (type) => {
        switch(type) {
            case 'sports': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'clubs': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            case 'placements': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'others': return 'bg-violet-50 text-violet-600 border-violet-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="p-4 md:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                            <Award size={14} /> Master Directory
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase">Achievements Wall</h1>
                        <p className="text-slate-500 font-medium">Highlight student & faculty excellence across all domains.</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-primary text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center gap-3 w-full md:w-auto justify-center"
                    >
                        <Plus size={20} /> Add Excellence
                    </button>
                </header>

                <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search achievements..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-[24px] py-5 pl-16 pr-8 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>
                    
                    <div className="flex flex-wrap flex-1 w-full items-center gap-2 bg-slate-50 p-2 rounded-[24px] border border-slate-100 md:w-auto">
                        <div className="px-4 py-2 border-r border-slate-200 shrink-0">
                            <Filter size={16} className="text-slate-400" />
                        </div>
                        {['ALL', 'SPORTS', 'CLUBS', 'PLACEMENTS', 'OTHERS'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex-1 min-w-[70px] px-2 py-2.5 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all ${activeFilter === filter ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-32"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAchievements.map((item) => (
                            <div key={item._id} className="bg-white p-10 rounded-[48px] shadow-xl border border-slate-100 flex flex-col justify-between group h-full hover:shadow-2xl transition-all duration-500 hover:border-primary/20">
                                <div className="flex flex-col gap-6">
                                    <div className="flex justify-between items-start">
                                        <div className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-widest w-fit px-4 py-1.5 rounded-full border ${getTypeColor(item.type)}`}>
                                            <Award size={14} /> {item.type} {item.subcategory && `• ${item.subcategory}`}
                                        </div>
                                        <span className="text-slate-300 font-black text-xl">{item.year}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{item.title}</h3>
                                    
                                    <div className="w-full h-48 rounded-3xl overflow-hidden mt-2 border border-slate-100 bg-slate-50 flex items-center justify-center">
                                        {item.cardImage ? (
                                            <img src={getImageUrl(item.cardImage)} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <ImageIcon size={32} className="text-slate-300" />
                                        )}
                                    </div>
                                    
                                    <p className="text-slate-500 font-medium leading-relaxed italic text-sm line-clamp-3">"{item.description}"</p>
                                </div>
                                <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-50">
                                    <button onClick={() => openEdit(item)} className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">Edit</button>
                                    <button onClick={() => handleDelete(item._id)} className="w-14 h-14 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                                </div>
                            </div>
                        ))}
                        {filteredAchievements.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <Award size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">No Achievements Found</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-8 md:p-10 border-b border-slate-100 sticky top-0 z-10 bg-white">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter">
                                        {editingId ? 'Edit Achievement' : 'Launch Achievement'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Single Source Profile</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:rotate-90 hover:bg-rose-50 hover:text-rose-500 transition-all"><Plus size={24} className="rotate-45" /></button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-6">
                                        <h3 className="text-xs font-black uppercase tracking-[3px] text-primary flex items-center gap-2">
                                            <div className="w-6 h-[2px] bg-primary"></div> Primary Details
                                        </h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Achievement Title</label>
                                            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" required placeholder="e.g. Winner of Smart India Hackathon" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Description</label>
                                            <textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none resize-none focus:border-primary/30 transition-colors" required placeholder="Full details of the achievement..." />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Type</label>
                                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, subcategory: '' })} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none cursor-pointer focus:border-primary/30 transition-colors">
                                                    <option value="sports">Sports</option>
                                                    <option value="clubs">Clubs</option>
                                                    <option value="placements">Placements</option>
                                                    <option value="others">Others</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Year</label>
                                                <input type="number" min="1900" max="2100" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" required />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-primary tracking-widest px-1">
                                                {formData.type === 'others' ? 'Custom Type Name' : 'Category (Subcategory)'}
                                            </label>
                                            {(formData.type === 'sports' || formData.type === 'clubs') ? (
                                                <>
                                                    <select value={formData.subcategory} onChange={e => setFormData({ ...formData, subcategory: e.target.value.toLowerCase() })} className="bg-primary/5 p-4 rounded-2xl border border-primary/20 font-bold text-primary outline-none cursor-pointer focus:border-primary/40 transition-colors" required>
                                                        {renderSubcategoryOptions()}
                                                    </select>
                                                    <span className="text-[9px] font-bold text-slate-400 px-1 mt-1">This connects the achievement directly to the specific {formData.type} page.</span>
                                                </>
                                            ) : (
                                                <>
                                                    <input 
                                                        value={formData.subcategory} 
                                                        onChange={e => setFormData({ ...formData, subcategory: e.target.value })} 
                                                        className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                        placeholder={formData.type === 'others' ? 'e.g. Cultural, NCC, Seminar' : 'e.g. IT Branch (Optional Classification)'} 
                                                        required={formData.type === 'others'}
                                                    />
                                                    <span className="text-[9px] font-bold text-slate-400 px-1 mt-1">
                                                        {formData.type === 'others' ? 'Specify the custom achievement type name.' : `Optional tag for ${formData.type} achievements.`}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-8">
                                        <div className="flex flex-col gap-6">
                                            <h3 className="text-xs font-black uppercase tracking-[3px] text-primary flex items-center gap-2">
                                                <div className="w-6 h-[2px] bg-primary"></div> Visuals & Media
                                            </h3>
                                            
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-rose-500 tracking-widest px-1 flex justify-between">
                                                    <span>Card List Image (Required) <span className="text-rose-500">*</span></span>
                                                    {formData.cardImage && <span className="text-emerald-500">Selected ✔</span>}
                                                </label>
                                                <label className={`bg-slate-50 p-4 rounded-2xl border border-slate-200 cursor-pointer flex items-center gap-4 transition-all hover:border-primary/40 hover:bg-primary/5 ${!formData.cardImage && !editingId ? 'border-rose-200 bg-rose-50' : ''}`}>
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                                        <ImageIcon size={20} className="text-slate-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Upload Square Card Image</span>
                                                        <span className="text-[9px] text-slate-400 font-bold">Resizes to 1:1 aspect ratio.</span>
                                                    </div>
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => setFormData({ ...formData, cardImage: e.target.files[0] })} />
                                                </label>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex justify-between">
                                                    <span>Detail Big Image (Optional)</span>
                                                    {formData.detailImage && <span className="text-emerald-500">Selected ✔</span>}
                                                </label>
                                                <label className="bg-slate-50 p-4 rounded-2xl border border-slate-200 cursor-pointer flex items-center gap-4 transition-all hover:border-primary/40 hover:bg-primary/5">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                                        <Upload size={20} className="text-slate-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Upload Ultra-wide Image</span>
                                                        <span className="text-[9px] text-slate-400 font-bold">For detail page hero section.</span>
                                                    </div>
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => setFormData({ ...formData, detailImage: e.target.files[0] })} />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-6">
                                            <h3 className="text-xs font-black uppercase tracking-[3px] text-primary flex items-center gap-2">
                                                <div className="w-6 h-[2px] bg-primary"></div> External Links
                                            </h3>
                                            
                                            <div className="flex flex-col gap-3">
                                                <div className="relative">
                                                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                                                    <input value={formData.socialLinks.instagram} onChange={e => handleSocialLinkChange('instagram', e.target.value)} className="w-full bg-slate-50 p-3 pl-12 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:border-primary/30 transition-colors" placeholder="Instagram URL" />
                                                </div>
                                                <div className="relative">
                                                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                                                    <input value={formData.socialLinks.linkedin} onChange={e => handleSocialLinkChange('linkedin', e.target.value)} className="w-full bg-slate-50 p-3 pl-12 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:border-primary/30 transition-colors" placeholder="LinkedIn URL" />
                                                </div>
                                                <div className="relative">
                                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                                                    <input value={formData.socialLinks.facebook} onChange={e => handleSocialLinkChange('facebook', e.target.value)} className="w-full bg-slate-50 p-3 pl-12 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:border-primary/30 transition-colors" placeholder="Facebook / Other URL" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-slate-100">
                                    <button type="submit" className="w-full bg-primary text-white py-6 rounded-3xl font-black uppercase text-sm tracking-[4px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] active:scale-[0.99] transition-all">
                                        {editingId ? 'Update Achievement' : 'Publish Achievement'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddAchievement;
