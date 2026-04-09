import React, { useState, useEffect, useRef } from 'react';
import { getBranding, updateBranding } from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    Palette, Upload, Building, Image, Loader2, CheckCircle, Eye,
    Type, AlignLeft, Link as LinkIcon, MousePointer
} from 'lucide-react';

import { getImageUrl } from '../../utils/imageUrl';

const ImageUploadBox = ({ label, field, preview, onFileChange, icon: Icon }) => {
    const inputRef = useRef();
    return (
        <div className="flex flex-col gap-3">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Icon size={14} className="text-primary" /> {label}
            </label>
            <div
                onClick={() => inputRef.current.click()}
                className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 p-8 min-h-[180px] group"
            >
                {preview ? (
                    <>
                        <img src={preview} alt={label} className="max-h-28 object-contain rounded-lg" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x100?text=Logo'; }} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to change</span>
                    </>
                ) : (
                    <>
                        <div className="w-14 h-14 bg-white rounded-2xl shadow flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors"><Upload size={24} /></div>
                        <span className="text-sm font-bold text-slate-400">Upload {label}</span>
                        <span className="text-[10px] font-bold text-slate-300">PNG, JPG</span>
                    </>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(field, e.target.files[0])} />
            </div>
        </div>
    );
};

const FieldInput = ({ label, icon: Icon, value, onChange, placeholder, note, type = 'text' }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Icon size={14} className="text-primary" /> {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-2 border-slate-100 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-primary/40 transition-all"
        />
        {note && <p className="text-xs text-slate-400">{note}</p>}
    </div>
);

const ManageBranding = () => {
    const [fields, setFields] = useState({
        collegeName: '',
        heroTitle: '',
        heroSubtitle: '',
        ctaText: '',
        ctaLink: '',
    });
    const [files, setFiles] = useState({ logo: null, navbarLogo: null, heroLogo: null });
    const [previews, setPreviews] = useState({ logo: '', navbarLogo: '', heroLogo: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await getBranding();
                setFields({
                    collegeName: data.collegeName || '',
                    heroTitle: data.heroTitle || '',
                    heroSubtitle: data.heroSubtitle || '',
                    ctaText: data.ctaText || '',
                    ctaLink: data.ctaLink || '',
                });
                const makeUrl = (p) => getImageUrl(p);
                setPreviews({ logo: makeUrl(data.logo), navbarLogo: makeUrl(data.navbarLogo), heroLogo: makeUrl(data.heroLogo) });
            } catch {
                toast.error('Failed to load branding');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFileChange = (field, file) => {
        if (!file) return;
        setFiles(prev => ({ ...prev, [field]: file }));
        setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    };

    const setField = (key) => (val) => setFields(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
            if (files.logo) formData.append('logo', files.logo);
            if (files.navbarLogo) formData.append('navbarLogo', files.navbarLogo);
            if (files.heroLogo) formData.append('heroLogo', files.heroLogo);

            await updateBranding(formData);
            toast.success('✅ Branding updated successfully!');
            setFiles({ logo: null, navbarLogo: null, heroLogo: null });
        } catch {
            toast.error('Failed to save branding settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-16">
            <div className="max-w-4xl mx-auto px-6 flex flex-col gap-10">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Palette size={28} /></div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Manage Branding</h1>
                        <p className="text-slate-500 font-medium">Control logos, college name, and hero section text from here.</p>
                    </div>
                </div>

                {/* College Identity */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-5">
                    <h2 className="font-black text-slate-800 text-xl flex items-center gap-2"><Building size={18} className="text-primary" /> College Identity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FieldInput label="College Name (Navbar)" icon={Type} value={fields.collegeName} onChange={setField('collegeName')} placeholder="e.g. RGUKT Ongole" note="Shown in Navbar and Footer" />
                        <FieldInput label="Hero Title" icon={AlignLeft} value={fields.heroTitle} onChange={setField('heroTitle')} placeholder="Rajiv Gandhi University..." note="Large heading on the home page" />
                    </div>
                    <FieldInput label="Hero Subtitle / Tagline" icon={AlignLeft} value={fields.heroSubtitle} onChange={setField('heroSubtitle')} placeholder="Catering to the Educational Needs..." note="Displayed below the hero title" />
                </div>

                {/* CTA Button */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-5">
                    <h2 className="font-black text-slate-800 text-xl flex items-center gap-2"><MousePointer size={18} className="text-primary" /> CTA Button (Fallback)</h2>
                    <p className="text-sm text-slate-400 -mt-2">Shown only if no social links are added in Manage Social Links.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FieldInput label="Button Text" icon={Type} value={fields.ctaText} onChange={setField('ctaText')} placeholder="More Details" />
                        <FieldInput label="Button Link" icon={LinkIcon} value={fields.ctaLink} onChange={setField('ctaLink')} placeholder="/about" type="text" />
                    </div>
                </div>

                {/* Logo Uploads */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
                    <h2 className="font-black text-slate-800 text-xl">Logo Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ImageUploadBox label="College Logo (Home)" field="logo" preview={previews.logo} onFileChange={handleFileChange} icon={Image} />
                        <ImageUploadBox label="Navbar Logo" field="navbarLogo" preview={previews.navbarLogo} onFileChange={handleFileChange} icon={Image} />
                        <ImageUploadBox label="Hero Logo" field="heroLogo" preview={previews.heroLogo} onFileChange={handleFileChange} icon={Image} />
                    </div>
                </div>

                {/* Live Navbar Preview */}
                {(previews.navbarLogo || previews.logo || fields.collegeName) && (
                    <div className="bg-slate-900 rounded-3xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex items-center justify-center p-1">
                            {(previews.navbarLogo || previews.logo)
                                ? <img src={previews.navbarLogo || previews.logo} alt="Logo" className="w-full h-full object-contain" />
                                : <Palette size={20} className="text-slate-400" />
                            }
                        </div>
                        <span className="text-white font-black text-xl">{fields.collegeName || 'College Name'}</span>
                        <span className="ml-auto text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2"><Eye size={12} /> Navbar Preview</span>
                    </div>
                )}

                {/* Hero Section Preview */}
                {(fields.heroTitle || fields.heroSubtitle) && (
                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-col gap-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2"><Eye size={12} /> Hero Section Preview</span>
                        <h1 className="text-3xl font-black text-slate-900">{fields.heroTitle || 'Your Hero Title'}</h1>
                        <p className="text-slate-500 font-semibold text-sm">{fields.heroSubtitle || 'Your subtitle here'}</p>
                        <div className="mt-3">
                            <span className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-sm inline-block">{fields.ctaText || 'More Details'}</span>
                        </div>
                    </div>
                )}

                {/* Save */}
                <motion.button
                    onClick={handleSubmit}
                    disabled={saving}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-primary text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-60"
                >
                    {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><CheckCircle size={18} /> Save All Branding Settings</>}
                </motion.button>
            </div>
        </div>
    );
};

export default ManageBranding;
