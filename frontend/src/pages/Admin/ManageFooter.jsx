import React, { useState, useEffect } from 'react';
import { getFooter, updateFooter, getSocialMedia, createSocialMedia, updateSocialMedia, deleteSocialMedia } from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    Link as LinkIcon, Plus, Trash2, Save, Loader2,
    ChevronDown, ChevronUp, Building, Copyright, AlignLeft,
    Share2, Edit2, Check, X, Instagram, Linkedin, Twitter, Youtube, Facebook, Globe
} from 'lucide-react';

const PLATFORM_OPTIONS = [
    { value: 'instagram', label: 'Instagram', Icon: Instagram, color: '#E1306C' },
    { value: 'facebook', label: 'Facebook', Icon: Facebook, color: '#1877F2' },
    { value: 'twitter', label: 'Twitter / X', Icon: Twitter, color: '#1DA1F2' },
    { value: 'linkedin', label: 'LinkedIn', Icon: Linkedin, color: '#0077B5' },
    { value: 'youtube', label: 'YouTube', Icon: Youtube, color: '#FF0000' },
    { value: 'website', label: 'Website', Icon: Globe, color: '#4A90E2' },
];
const PLATFORM_MAP = Object.fromEntries(PLATFORM_OPTIONS.map(p => [p.value, p]));

const ManageFooter = () => {
    const [brandName, setBrandName] = useState('');
    const [description, setDescription] = useState('');
    const [copyright, setCopyright] = useState('');
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);

    // Social links state
    const [socials, setSocials] = useState([]);
    const [addingPlatform, setAddingPlatform] = useState('instagram');
    const [addingUrl, setAddingUrl] = useState('');
    const [addingRow, setAddingRow] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editUrl, setEditUrl] = useState('');
    const [socialSaving, setSocialSaving] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [footerRes, socialRes] = await Promise.all([getFooter(), getSocialMedia()]);
                setBrandName(footerRes.data.brandName || '');
                setDescription(footerRes.data.description || '');
                setCopyright(footerRes.data.copyright || '');
                setSections(footerRes.data.sections || []);
                setSocials(socialRes.data || []);
            } catch {
                toast.error('❌ Failed to load footer data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await updateFooter({ brandName, description, copyright, sections });
            toast.success('✅ Footer saved successfully!');
        } catch (err) {
            console.error(err);
            toast.error('❌ Failed to save footer. Check section data.');
        } finally {
            setSaving(false);
        }
    };

    // — Social CRUD —
    const addSocial = async () => {
        if (!addingUrl.trim()) return toast.error('Enter a URL');
        setSocialSaving(true);
        try {
            const { data } = await createSocialMedia({ name: addingPlatform, link: addingUrl.trim(), icon: addingPlatform });
            setSocials(prev => [...prev, data]);
            setAddingUrl('');
            setAddingRow(false);
            toast.success('Social link added!');
        } catch { toast.error('Failed to add'); }
        finally { setSocialSaving(false); }
    };

    const saveEditSocial = async (social) => {
        setSocialSaving(true);
        try {
            const { data } = await updateSocialMedia(social._id, { name: social.name, link: editUrl.trim(), icon: social.name });
            setSocials(prev => prev.map(s => s._id === data._id ? data : s));
            setEditingId(null);
            toast.success('Updated!');
        } catch { toast.error('Failed to update'); }
        finally { setSocialSaving(false); }
    };

    const removeSocial = async (id) => {
        if (!window.confirm('Remove this social link?')) return;
        try {
            await deleteSocialMedia(id);
            setSocials(prev => prev.filter(s => s._id !== id));
            toast.success('Removed!');
        } catch { toast.error('Failed to remove'); }
    };

    // — Footer sections CRUD —
    const addSection = () => {
        const newSections = [...sections, { title: '', links: [] }];
        setSections(newSections);
        setExpandedSection(newSections.length - 1);
    };
    const removeSection = (si) => setSections(prev => prev.filter((_, i) => i !== si));
    const updateSectionTitle = (si, value) =>
        setSections(prev => prev.map((s, i) => i === si ? { ...s, title: value } : s));
    const addLink = (si) =>
        setSections(prev => prev.map((s, i) => i === si ? { ...s, links: [...s.links, { label: '', url: '' }] } : s));
    const removeLink = (si, li) =>
        setSections(prev => prev.map((s, i) => i === si ? { ...s, links: s.links.filter((_, j) => j !== li) } : s));
    const updateLink = (si, li, field, value) =>
        setSections(prev => prev.map((s, i) =>
            i === si ? { ...s, links: s.links.map((l, j) => j === li ? { ...l, [field]: value } : l) } : s
        ));

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-16">
            <div className="max-w-4xl mx-auto px-6 flex flex-col gap-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <LinkIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Manage Footer</h1>
                        <p className="text-slate-500 font-medium">Control your footer brand info and link sections.</p>
                    </div>
                </div>

                {/* Brand Info */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
                    <h2 className="font-black text-slate-800 text-xl flex items-center gap-2">
                        <Building size={18} className="text-primary" /> Brand Info
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Brand Name</label>
                            <input
                                value={brandName}
                                onChange={e => setBrandName(e.target.value)}
                                placeholder="College News"
                                className="border-2 border-slate-100 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-primary/40 transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Copyright size={11} /> Copyright
                            </label>
                            <input
                                value={copyright}
                                onChange={e => setCopyright(e.target.value)}
                                placeholder="© 2026 College News"
                                className="border-2 border-slate-100 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-primary/40 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <AlignLeft size={11} /> Description
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Short description about the portal..."
                            className="border-2 border-slate-100 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-primary/40 transition-all resize-none"
                        />
                    </div>

                    {/* ─── Social Icons ─── */}
                    <div className="flex flex-col gap-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <Share2 size={12} className="text-primary" /> Social Icons
                            </label>
                            {!addingRow && (
                                <button
                                    onClick={() => setAddingRow(true)}
                                    className="flex items-center gap-1.5 text-primary text-xs font-bold border-2 border-primary/20 rounded-xl px-3.5 py-1.5 hover:bg-primary hover:text-white transition-all"
                                >
                                    <Plus size={13} /> Add
                                </button>
                            )}
                        </div>

                        {/* Existing icons */}
                        {socials.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {socials.map(social => {
                                    const pKey = (social.name || social.icon || '').toLowerCase();
                                    const p = PLATFORM_MAP[pKey] || PLATFORM_OPTIONS[0];
                                    const isEditing = editingId === social._id;
                                    return (
                                        <div key={social._id} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: p.color + '18', color: p.color }}>
                                                <p.Icon size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700 text-sm w-24 shrink-0">{p.label}</span>
                                            {isEditing ? (
                                                <>
                                                    <input
                                                        autoFocus
                                                        value={editUrl}
                                                        onChange={e => setEditUrl(e.target.value)}
                                                        className="flex-1 text-sm border-2 border-primary/30 rounded-xl px-3 py-1.5 font-medium focus:outline-none"
                                                        placeholder="URL"
                                                    />
                                                    <button onClick={() => saveEditSocial(social)} disabled={socialSaving} className="text-green-500 hover:text-green-700 p-1.5 rounded-lg hover:bg-green-50">
                                                        {socialSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                                                        <X size={15} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <a href={social.link} target="_blank" rel="noreferrer" className="flex-1 text-sm text-primary hover:underline truncate">{social.link}</a>
                                                    <button onClick={() => { setEditingId(social._id); setEditUrl(social.link); }} className="text-slate-400 hover:text-primary p-1.5 rounded-lg hover:bg-slate-100">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => removeSocial(social._id)} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Add new row */}
                        {addingRow && (
                            <div className="flex flex-col gap-3 bg-primary/5 border-2 border-primary/20 rounded-2xl p-4">
                                <p className="text-xs font-black text-primary uppercase tracking-wider">Choose Platform</p>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {PLATFORM_OPTIONS.map(p => {
                                        const sel = addingPlatform === p.value;
                                        return (
                                            <button
                                                key={p.value}
                                                type="button"
                                                onClick={() => setAddingPlatform(p.value)}
                                                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${sel ? 'border-primary bg-white text-primary shadow-md' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                                            >
                                                <p.Icon size={18} style={{ color: sel ? undefined : p.color }} />
                                                <span className="leading-none text-[10px]">{p.label.split('/')[0]}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-2 mt-1">
                                    <input
                                        value={addingUrl}
                                        onChange={e => setAddingUrl(e.target.value)}
                                        placeholder={`https://${addingPlatform}.com/yourpage`}
                                        className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-primary/40"
                                    />
                                    <button
                                        onClick={addSocial}
                                        disabled={socialSaving}
                                        className="bg-primary text-white rounded-xl px-5 font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60"
                                    >
                                        {socialSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                        Add
                                    </button>
                                    <button onClick={() => { setAddingRow(false); setAddingUrl(''); }} className="bg-slate-100 text-slate-500 rounded-xl px-4 font-bold text-sm hover:bg-slate-200 transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {socials.length === 0 && !addingRow && (
                            <p className="text-xs text-slate-400 font-bold">No social links yet. Click "+ Add"</p>
                        )}
                    </div>
                </div>

                {/* Link Sections */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-black text-slate-800 text-xl flex items-center gap-2">
                            <LinkIcon size={18} className="text-primary" /> Link Sections
                        </h2>
                        <button
                            onClick={addSection}
                            className="flex items-center gap-2 text-primary border-2 border-primary/20 rounded-2xl px-5 py-2.5 font-bold text-sm hover:bg-primary hover:text-white transition-all"
                        >
                            <Plus size={16} /> Add Section
                        </button>
                    </div>

                    {sections.length === 0 && (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center">
                            <p className="text-slate-400 font-bold text-sm">No sections yet. Click "+ Add Section"</p>
                        </div>
                    )}

                    {sections.map((section, si) => (
                        <div key={si} className="border-2 border-slate-100 rounded-2xl overflow-hidden">
                            <div
                                className="flex items-center gap-4 px-5 py-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => setExpandedSection(expandedSection === si ? null : si)}
                            >
                                <input
                                    value={section.title}
                                    onChange={e => { e.stopPropagation(); updateSectionTitle(si, e.target.value); }}
                                    onClick={e => e.stopPropagation()}
                                    placeholder="Section Title (e.g., Academics)"
                                    className="font-black text-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg px-2 py-1 flex-1 text-base"
                                />
                                <span className="text-xs font-bold text-slate-400 shrink-0">{section.links.length} link{section.links.length !== 1 ? 's' : ''}</span>
                                {expandedSection === si
                                    ? <ChevronUp size={18} className="text-slate-400 shrink-0" />
                                    : <ChevronDown size={18} className="text-slate-400 shrink-0" />
                                }
                                <button
                                    onClick={e => { e.stopPropagation(); removeSection(si); }}
                                    className="text-rose-400 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-50 shrink-0"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {expandedSection === si && (
                                <div className="p-5 flex flex-col gap-3 bg-white border-t border-slate-100">
                                    {section.links.length === 0 && (
                                        <p className="text-xs text-slate-400 font-bold">No links yet. Click "Add Link" below.</p>
                                    )}
                                    {section.links.map((link, li) => (
                                        <div key={li} className="flex items-center gap-3">
                                            <input
                                                value={link.label}
                                                onChange={e => updateLink(si, li, 'label', e.target.value)}
                                                placeholder="Link Label (e.g., Courses)"
                                                className="border-2 border-slate-100 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-primary/40 flex-1 text-sm"
                                            />
                                            <input
                                                value={link.url}
                                                onChange={e => updateLink(si, li, 'url', e.target.value)}
                                                placeholder="URL (e.g., /courses)"
                                                className="border-2 border-slate-100 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-primary/40 flex-1 text-sm"
                                            />
                                            <button
                                                onClick={() => removeLink(si, li)}
                                                className="text-rose-400 hover:text-rose-600 transition-colors p-2 rounded-xl hover:bg-rose-50 shrink-0"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addLink(si)}
                                        className="flex items-center gap-2 text-primary text-sm font-bold px-4 py-2 rounded-xl border-2 border-dashed border-primary/20 hover:bg-primary/5 transition-all w-fit mt-1"
                                    >
                                        <Plus size={14} /> Add Link
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Save Footer Button */}
                <motion.button
                    onClick={save}
                    disabled={saving}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-primary text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-60"
                >
                    {saving
                        ? <><Loader2 className="animate-spin" size={18} /> Saving...</>
                        : <><Save size={18} /> Save Footer Settings</>
                    }
                </motion.button>
            </div>
        </div>
    );
};

export default ManageFooter;
