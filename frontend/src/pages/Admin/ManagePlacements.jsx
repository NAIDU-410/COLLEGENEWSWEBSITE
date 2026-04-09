import React, { useState, useEffect } from 'react';
import { getPlacements, createPlacement, updatePlacement, deletePlacement } from '../../services/api';
import { Plus, Trash2, Edit2, Briefcase, Building, Upload, ExternalLink, Globe, Linkedin, Twitter, Instagram, MapPin, Clock, DollarSign, Award, BookOpen, Layers, CheckCircle, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../utils/imageUrl';

const ManagePlacements = () => {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(null);
    const [formData, setFormData] = useState({
        type: 'Internship',
        companyName: '',
        role: '',
        location: '',
        duration: '',
        stipendOrSalary: '',
        description: '',
        skills: '',
        deadline: '',
        experience: '',
        cgpa: '',
        mode: 'Offline',
        companyUrl: '',
        applyLink: '',
        socialLinks: {
            linkedin: '',
            twitter: '',
            website: '',
            instagram: ''
        },
        eligibleBatches: '',
        eligibleBranches: '',
        processDescription: '',
        logo: null
    });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => {
        fetchPlacements();
    }, []);

    const fetchPlacements = async () => {
        try {
            setLoading(true);
            const { data } = await getPlacements();
            setPlacements(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [key]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'socialLinks') {
                data.append(key, JSON.stringify(formData[key]));
            } else if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingId) {
                await updatePlacement(editingId, data);
            } else {
                await createPlacement(data);
            }
            setShowModal(null);
            fetchPlacements();
            resetForm();
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'Internship',
            companyName: '',
            role: '',
            location: '',
            duration: '',
            stipendOrSalary: '',
            description: '',
            skills: '',
            deadline: '',
            experience: '',
            cgpa: '',
            mode: 'Offline',
            companyUrl: '',
            applyLink: '',
            socialLinks: {
                linkedin: '',
                twitter: '',
                website: '',
                instagram: ''
            },
            eligibleBatches: '',
            eligibleBranches: '',
            processDescription: '',
            logo: null
        });
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this placement update?')) {
            try {
                await deletePlacement(id);
                setPlacements(prev => prev.filter(p => p._id !== id));
            } catch (err) {
                console.error('Delete error:', err);
                alert('Failed to delete placement: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const openEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            type: item.type,
            companyName: item.companyName,
            role: item.role,
            location: item.location,
            duration: item.duration || '',
            stipendOrSalary: item.stipendOrSalary,
            description: item.description,
            skills: Array.isArray(item.skills) ? item.skills.join(', ') : item.skills,
            deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
            experience: item.experience || '',
            cgpa: item.cgpa || '',
            mode: item.mode || 'Offline',
            companyUrl: item.companyUrl || '',
            applyLink: item.applyLink || '',
            socialLinks: item.socialLinks || { linkedin: '', twitter: '', website: '', instagram: '' },
            eligibleBatches: Array.isArray(item.eligibleBatches) ? item.eligibleBatches.join(', ') : (item.eligibleBatches || ''),
            eligibleBranches: Array.isArray(item.eligibleBranches) ? item.eligibleBranches.join(', ') : (item.eligibleBranches || ''),
            processDescription: item.processDescription || '',
            logo: null
        });
        setShowModal('edit');
    };

    const filteredPlacements = placements.filter(item => {
        const matchesSearch = item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.skills && Array.isArray(item.skills) && item.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
        
        const matchesType = filterType === 'ALL' || item.type?.toUpperCase() === filterType;
        
        return matchesSearch && matchesType;
    });

    return (
        <div className="p-4 md:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Award size={14} />
                            Admin Control Panel
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase">Manage Placements</h1>
                        <p className="text-slate-500 font-medium">Create and manage internship and placement opportunities.</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal('create'); }}
                        className="bg-primary text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl transition-all flex items-center gap-3 w-full md:w-auto justify-center"
                    >
                        <Plus size={20} /> Add New Portal
                    </button>
                </header>

                {/* Search & Filter UI (Matching Manage Events Style) */}
                <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-xl border border-slate-100 flex flex-col lg:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by company, role or skills..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 py-5 pl-16 pr-8 rounded-2xl outline-none focus:border-primary/20 font-bold text-slate-700 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <Filter className="text-slate-400 hidden md:block" size={20} />
                        <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full lg:w-auto overflow-x-auto no-scrollbar">
                            {['ALL', 'INTERNSHIP', 'PLACEMENT'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${filterType === type ? 'bg-white text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-4">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Records...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredPlacements.length > 0 ? (
                            filteredPlacements.map((item) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={item._id} 
                                    className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-3/4">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center border-2 border-slate-100 overflow-hidden shrink-0 group-hover:border-primary/20 transition-colors">
                                            {item.logo ? (
                                                <img src={getImageUrl(item.logo)} className="w-full h-full object-contain p-4" alt={item.companyName} />
                                            ) : (
                                                <Building size={32} className="text-slate-300 group-hover:text-primary transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex flex-col text-center md:text-left overflow-hidden">
                                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${item.type?.toLowerCase() === 'internship' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary'}`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                                                    {item.mode}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{item.companyName}</h3>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5">
                                                    <Briefcase size={12} /> {item.role}
                                                </p>
                                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5">
                                                    <MapPin size={12} /> {item.location}
                                                </p>
                                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5">
                                                    <DollarSign size={12} /> {item.stipendOrSalary}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-1/4 justify-between md:justify-end">
                                        <button 
                                            onClick={() => openEdit(item)} 
                                            className="flex-1 md:flex-none justify-center bg-slate-50 text-slate-500 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white hover:shadow-lg transition-all flex items-center gap-2"
                                        >
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item._id)} 
                                            className="w-12 h-12 md:w-14 md:h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white hover:shadow-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white p-20 rounded-[48px] text-center border-2 border-dashed border-slate-200">
                                <Building size={64} className="mx-auto text-slate-200 mb-6" />
                                <h2 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">No placements found</h2>
                                <p className="text-slate-400 mt-2">Start by adding a new placement or internship update.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center p-8 md:p-10 border-b border-slate-100 bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter">
                                        {editingId ? 'Edit Portal Entry' : 'New Portal Entry'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fill in the details below</p>
                                </div>
                                <button 
                                    onClick={() => setShowModal(null)} 
                                    className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:rotate-90 hover:bg-rose-50 hover:text-rose-500 transition-all"
                                >
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Core Info */}
                                    <div className="flex flex-col gap-6">
                                        <h3 className="text-xs font-black uppercase tracking-[3px] text-primary flex items-center gap-2">
                                            <div className="w-6 h-[2px] bg-primary"></div> Basic Information
                                        </h3>
                                        
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Type</label>
                                            <select 
                                                value={formData.type} 
                                                onChange={e => setFormData({ ...formData, type: e.target.value })} 
                                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none cursor-pointer focus:border-primary/30 transition-colors"
                                            >
                                                <option>Internship</option>
                                                <option>Placement</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Company Name</label>
                                            <input 
                                                value={formData.companyName} 
                                                onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
                                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                required 
                                                placeholder="e.g. Google India" 
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Job/Role Title</label>
                                            <input 
                                                value={formData.role} 
                                                onChange={e => setFormData({ ...formData, role: e.target.value })} 
                                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                required 
                                                placeholder="e.g. Software Development Engineer" 
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Location</label>
                                                <input 
                                                    value={formData.location} 
                                                    onChange={e => setFormData({ ...formData, location: e.target.value })} 
                                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                    required 
                                                    placeholder="Bangalore / Hybrid" 
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Mode</label>
                                                <select 
                                                    value={formData.mode} 
                                                    onChange={e => setFormData({ ...formData, mode: e.target.value })} 
                                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors"
                                                >
                                                    <option>Offline</option>
                                                    <option>Remote</option>
                                                    <option>Online</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specifics */}
                                    <div className="flex flex-col gap-6">
                                        <h3 className="text-xs font-black uppercase tracking-[3px] text-primary flex items-center gap-2">
                                            <div className="w-6 h-[2px] bg-primary"></div> Requirements & Compensation
                                        </h3>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">
                                                {formData.type === 'Internship' ? 'Stipend (Monthly)' : 'Salary (CTC in LPA)'}
                                            </label>
                                            <input 
                                                value={formData.stipendOrSalary} 
                                                onChange={e => setFormData({ ...formData, stipendOrSalary: e.target.value })} 
                                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                required 
                                                placeholder={formData.type === 'Internship' ? "e.g. 50,000 / month" : "e.g. 12.5 LPA"} 
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Duration / Exp</label>
                                                <input 
                                                    value={formData.duration || formData.experience} 
                                                    onChange={e => setFormData({ ...formData, duration: e.target.value, experience: e.target.value })} 
                                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                    placeholder="6 Months / 0-2 Years" 
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Min CGPA</label>
                                                <input 
                                                    value={formData.cgpa} 
                                                    onChange={e => setFormData({ ...formData, cgpa: e.target.value })} 
                                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                    placeholder="e.g. 7.5+" 
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Deadline Date</label>
                                            <input 
                                                type="date"
                                                value={formData.deadline} 
                                                onChange={e => setFormData({ ...formData, deadline: e.target.value })} 
                                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Company Logo</label>
                                            <div className="relative group/upload">
                                                <input 
                                                    type="file" 
                                                    onChange={e => setFormData({ ...formData, logo: e.target.files[0] })} 
                                                    className="absolute inset-0 opacity-0 z-10 cursor-pointer" 
                                                />
                                                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-3 transition-all group-hover/upload:border-primary/40 group-hover/upload:bg-primary/5">
                                                    <Upload size={18} className="text-slate-400 group-hover/upload:text-primary" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/upload:text-primary">
                                                        {formData.logo ? formData.logo.name : 'Choose Logo File'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Width Fields */}
                                <div className="flex flex-col gap-8 mt-10">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex items-center gap-2">
                                            Skills <span className="text-[8px] font-bold text-slate-300 normal-case">(Comma separated)</span>
                                        </label>
                                        <input 
                                            value={formData.skills} 
                                            onChange={e => setFormData({ ...formData, skills: e.target.value })} 
                                            className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                            placeholder="React, Node.js, Python, Figma..." 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Career/Company URL</label>
                                            <input 
                                                value={formData.companyUrl} 
                                                onChange={e => setFormData({ ...formData, companyUrl: e.target.value })} 
                                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                placeholder="https://google.com/careers" 
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Quick Apply Link</label>
                                            <input 
                                                value={formData.applyLink} 
                                                onChange={e => setFormData({ ...formData, applyLink: e.target.value })} 
                                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                placeholder="https://form.jotform.com/..." 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex items-center gap-2">
                                                Eligible Batches <span className="text-[8px] font-bold text-slate-300 normal-case">(e.g. 2024, 2025)</span>
                                            </label>
                                            <input 
                                                value={formData.eligibleBatches} 
                                                onChange={e => setFormData({ ...formData, eligibleBatches: e.target.value })} 
                                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                placeholder="2024, 2025, 2026" 
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex items-center gap-2">
                                                Eligible Branches <span className="text-[8px] font-bold text-slate-300 normal-case">(e.g. CSE, ECE)</span>
                                            </label>
                                            <input 
                                                value={formData.eligibleBranches} 
                                                onChange={e => setFormData({ ...formData, eligibleBranches: e.target.value })} 
                                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors" 
                                                placeholder="CSE, ECE, CIVIL, MECH" 
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Selection Process Description</label>
                                        <textarea 
                                            rows="4" 
                                            value={formData.processDescription} 
                                            onChange={e => setFormData({ ...formData, processDescription: e.target.value })} 
                                            className="bg-slate-50 p-5 rounded-3xl border border-slate-100 font-bold outline-none resize-none focus:border-primary/30 transition-colors" 
                                            placeholder="Aptitude Test → Coding Round → Technical Interview → HR..." 
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Description / About</label>
                                        <textarea 
                                            rows="5" 
                                            value={formData.description} 
                                            onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                            className="bg-slate-50 p-5 rounded-3xl border border-slate-100 font-bold outline-none resize-none focus:border-primary/30 transition-colors" 
                                            required 
                                            placeholder="Detailed job description, responsibilities, and about company..." 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex items-center gap-1"><Linkedin size={10}/> LinkedIn</label>
                                            <input value={formData.socialLinks.linkedin} onChange={e => handleSocialChange('linkedin', e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold outline-none" placeholder="Link" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex items-center gap-1"><Globe size={10}/> Website</label>
                                            <input value={formData.socialLinks.website} onChange={e => handleSocialChange('website', e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold outline-none" placeholder="Link" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex items-center gap-1"><Twitter size={10}/> Twitter</label>
                                            <input value={formData.socialLinks.twitter} onChange={e => handleSocialChange('twitter', e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold outline-none" placeholder="Link" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1 flex items-center gap-1"><Instagram size={10}/> Instagram</label>
                                            <input value={formData.socialLinks.instagram} onChange={e => handleSocialChange('instagram', e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold outline-none" placeholder="Link" />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full bg-primary text-white py-6 rounded-3xl font-black uppercase text-sm tracking-[4px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] active:scale-[0.99] transition-all sticky bottom-0 z-10"
                                >
                                    {editingId ? 'Update Opportunity' : 'Publish Opportunity'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManagePlacements;
