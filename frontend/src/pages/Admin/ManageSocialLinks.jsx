import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Link as LinkIcon, Share2, Instagram, Linkedin, Youtube, Facebook, Globe } from 'lucide-react';
import { getSocialMedia, createSocialMedia, updateSocialMedia, deleteSocialMedia } from '../../services/api';
import toast from 'react-hot-toast';
import XIcon from '../../components/XIcon';

// Map platform names to Lucide icon components
const PLATFORM_OPTIONS = [
    { value: 'instagram', label: 'Instagram', Icon: Instagram, color: '#E1306C' },
    { value: 'facebook', label: 'Facebook', Icon: Facebook, color: '#1877F2' },
    { value: 'twitter', label: 'X', Icon: XIcon, color: '#000000' },
    { value: 'linkedin', label: 'LinkedIn', Icon: Linkedin, color: '#0077B5' },
    { value: 'youtube', label: 'YouTube', Icon: Youtube, color: '#FF0000' },
    { value: 'website', label: 'Website', Icon: Globe, color: '#4A90E2' },
];

const PLATFORM_MAP = Object.fromEntries(PLATFORM_OPTIONS.map(p => [p.value, p.Icon]));

const ManageSocialLinks = () => {
    const [links, setLinks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const emptyForm = { name: 'instagram', link: '' };
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => { fetchLinks(); }, []);

    const fetchLinks = async () => {
        try {
            const { data } = await getSocialMedia();
            setLinks(data);
        } catch {
            toast.error('Failed to load social links');
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ name: item.name || item.platform || 'instagram', link: item.link });
        } else {
            setEditingItem(null);
            setFormData(emptyForm);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setEditingItem(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Send as JSON — icon is the platform name key
            const payload = { name: formData.name, link: formData.link, icon: formData.name };

            if (editingItem) {
                await updateSocialMedia(editingItem._id, payload);
                toast.success('Social link updated!');
            } else {
                await createSocialMedia(payload);
                toast.success('Social link added!');
            }
            fetchLinks();
            closeModal();
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this social link?')) return;
        try {
            await deleteSocialMedia(id);
            toast.success('Deleted!');
            fetchLinks();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const selectedPlatform = PLATFORM_OPTIONS.find(p => p.value === formData.name) || PLATFORM_OPTIONS[0];

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-6 pb-32">
            <div className="max-w-5xl mx-auto flex flex-col gap-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-4">
                            <Share2 className="text-primary" size={36} />
                            Manage Social Links
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Add and organize your campus social media presence.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-lg"
                    >
                        <Plus size={20} /> Add Platform
                    </button>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : links.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 flex flex-col items-center gap-4">
                        <Share2 size={48} className="text-slate-200" />
                        <h3 className="text-2xl font-bold text-gray-500">No social links yet</h3>
                        <p className="text-gray-400 max-w-xs">Add platforms like Instagram, LinkedIn, Twitter to connect your students.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {links.map((item, index) => {
                            const platformKey = (item.name || item.platform || item.icon || '').toLowerCase();
                            const match = PLATFORM_OPTIONS.find(p => p.value === platformKey);
                            const Icon = match?.Icon || Share2;
                            const color = match?.color || '#6366f1';
                            return (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.07 }}
                                    className="bg-white rounded-3xl p-7 shadow-lg border border-slate-100 flex items-center gap-5 relative group hover:shadow-xl transition-all"
                                >
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal(item)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: color + '15', color }}>
                                        <Icon size={28} />
                                    </div>
                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        <h3 className="font-black text-lg text-gray-800">{match?.label || item.name || item.platform}</h3>
                                        <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate max-w-[160px]">{item.link}</a>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-2xl font-black text-gray-800">{editingItem ? 'Edit' : 'Add'} Social Link</h2>
                                <button onClick={closeModal} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                                {/* Platform Dropdown */}
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Platform *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {PLATFORM_OPTIONS.map(p => {
                                            const isSelected = formData.name === p.value;
                                            return (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, name: p.value }))}
                                                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 font-bold text-sm transition-all ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                                                >
                                                    <p.Icon size={20} style={{ color: isSelected ? undefined : p.color }} />
                                                    {p.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: selectedPlatform.color }}>
                                        <selectedPlatform.Icon size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800">{selectedPlatform.label}</p>
                                        <p className="text-xs text-slate-400">Selected platform</p>
                                    </div>
                                </div>

                                {/* Link URL */}
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Profile URL *</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="url"
                                            required
                                            value={formData.link}
                                            onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                            placeholder={`https://${formData.name}.com/yourpage`}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                                    <button type="button" onClick={closeModal} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 flex items-center gap-2 min-w-[120px] justify-center"
                                    >
                                        {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageSocialLinks;
