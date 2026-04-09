import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSinglePlacement } from '../../services/api';
import { motion } from 'framer-motion';
import { 
    Laptop, Users, Award, Layers, ChevronLeft, Building, Briefcase, MapPin, 
    Share2, Bookmark, DollarSign, Clock, GraduationCap, Calendar, Info, 
    Rocket, CheckCircle2, ExternalLink, Linkedin, Twitter, Globe, Instagram 
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

const PlacementDetail = () => {
    const { id } = useParams();
    const [placement, setPlacement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const { data } = await getSinglePlacement(id);
                setPlacement(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Fetching Opportunity...</p>
        </div>
    );

    if (!placement) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <h2 className="text-3xl font-black text-slate-800 mb-4">OPPORTUNITY NOT FOUND</h2>
                <Link to="/placements" className="text-primary font-bold uppercase tracking-widest flex items-center gap-2 justify-center">
                    <ChevronLeft size={18} /> Back to Portal
                </Link>
            </div>
        </div>
    );

    const isInternship = placement.type === 'Internship';

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Hero Section */}
            <div className={`relative h-[50vh] min-h-[400px] overflow-hidden flex items-end pb-20 px-4 md:px-10 lg:px-20 ${isInternship ? 'bg-emerald-900' : 'bg-slate-900'}`}>
                {/* Abstract Background */}
                <div className="absolute top-0 right-0 w-[60%] h-full bg-primary/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/2"></div>
                <div className="absolute bottom-1/4 left-0 w-1/3 h-1/2 bg-white/5 blur-[80px] rounded-full -translate-x-1/2"></div>
                
                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-end justify-between gap-10">
                        <div className="flex flex-col items-start gap-6">
                            <Link to={isInternship ? "/placements/internships" : "/placements/jobs"} className="text-white/60 font-black uppercase text-[10px] tracking-[4px] mb-2 hover:text-white transition-colors flex items-center gap-2">
                                <ChevronLeft size={14} /> Back to Listings
                            </Link>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-white rounded-[32px] p-5 shadow-2xl flex items-center justify-center border-4 border-white/10 shrink-0 overflow-hidden">
                                    {placement.logo ? (
                                        <img src={getImageUrl(placement.logo)} className="w-full h-full object-contain" alt={placement.companyName} />
                                    ) : (
                                        <Building size={32} className="text-slate-300" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full w-fit ${isInternship ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary/20 text-primary-light border border-primary/30'}`}>
                                        {placement.type}
                                    </span>
                                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">{placement.companyName}</h1>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                <div className="flex items-center gap-2 text-white/70 font-bold uppercase text-[10px] tracking-widest">
                                    <Briefcase size={14} className="text-primary" /> {placement.role}
                                </div>
                                <div className="flex items-center gap-2 text-white/70 font-bold uppercase text-[10px] tracking-widest">
                                    <MapPin size={14} className="text-primary" /> {placement.location}
                                </div>
                                <div className="flex items-center gap-2 text-white/70 font-bold uppercase text-[10px] tracking-widest">
                                    <Laptop size={14} className="text-primary" /> {placement.mode}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-6 w-full md:w-auto">
                            <div className="flex gap-3">
                                <button className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all border border-white/20">
                                    <Share2 size={24} />
                                </button>
                                <button className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all border border-white/20">
                                    <Bookmark size={24} />
                                </button>
                            </div>
                            <a 
                                href={placement.applyLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-full md:w-auto bg-primary text-white px-12 py-6 rounded-3xl font-black uppercase text-sm tracking-[4px] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-center"
                            >
                                Apply Now
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 flex flex-col gap-10">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: isInternship ? "STIPEND" : "SALARY", val: placement.stipendOrSalary, icon: <DollarSign size={20}/>, color: "text-emerald-500" },
                                { label: isInternship ? "DURATION" : "EXPERIENCE", val: placement.duration || placement.experience || "N/A", icon: <Clock size={20}/>, color: "text-blue-500" },
                                { label: "ELIGIBILITY", val: placement.cgpa || "Any", icon: <GraduationCap size={20}/>, color: "text-violet-500" },
                                { label: "DEADLINE", val: placement.deadline ? new Date(placement.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "Open", icon: <Calendar size={20}/>, color: "text-rose-500" }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i + 0.3 }}
                                    className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100 flex flex-col gap-3"
                                >
                                    <div className={`w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl ${item.color}`}>{item.icon}</div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                        <h4 className="text-lg font-black text-slate-800 tracking-tight">{item.val}</h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* About Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white p-10 md:p-14 rounded-[48px] shadow-sm border border-slate-100"
                        >
                            <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
                                <Info className="text-primary" size={28} /> About the Role
                            </h2>
                            <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                {placement.description}
                            </div>
                        </motion.div>

                        {/* Required Skills */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-white p-10 md:p-14 rounded-[48px] shadow-sm border border-slate-100"
                        >
                            <h2 className="text-3xl font-black text-slate-800 mb-10 flex items-center gap-4 tracking-tight">
                                <Rocket className="text-primary" size={28} /> Required Skills
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                {placement.skills && Array.isArray(placement.skills) && placement.skills.map((skill, i) => (
                                    <div 
                                        key={i} 
                                        className="bg-slate-50 border border-slate-100 px-8 py-4 rounded-3xl flex items-center gap-3 group hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
                                    >
                                        <CheckCircle2 size={18} className="text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-slate-700 font-black uppercase text-xs tracking-widest">{skill}</span>
                                    </div>
                                ))}
                                {(!placement.skills || !Array.isArray(placement.skills) || placement.skills.length === 0) && (
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No specific skills listed.</p>
                                )}
                            </div>
                        </motion.div>

                        {/* Selection Process */}
                        {placement.processDescription && (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="bg-white p-10 md:p-14 rounded-[48px] shadow-sm border border-slate-100"
                            >
                                <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
                                    <Layers className="text-primary" size={28} /> Selection Process
                                </h2>
                                <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                    {placement.processDescription}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="flex flex-col gap-8">
                        {/* Company Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                            <h3 className="text-xs font-black uppercase tracking-[4px] text-primary mb-10">Company Insight</h3>
                            
                            <div className="flex flex-col gap-10 relative z-10">
                                <div className="flex flex-col gap-6">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center p-4 border border-white/10 shadow-xl overflow-hidden">
                                        {placement.logo ? (
                                            <img src={getImageUrl(placement.logo)} className="w-full h-full object-contain" alt={placement.companyName} />
                                        ) : (
                                            <Building size={32} className="text-slate-900" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-3xl font-black tracking-tight mb-2">{placement.companyName}</h4>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">World Class Recruiter</p>
                                        <a href={placement.companyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:gap-4 transition-all w-fit bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl group-hover:bg-primary group-hover:text-white group-hover:border-transparent">
                                            Visit Portfolio <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 pt-10">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[3px] mb-6">Social Connect</p>
                                    <div className="grid grid-cols-4 gap-4">
                                        {placement.socialLinks && placement.socialLinks.linkedin && (
                                            <a href={placement.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all border border-white/10">
                                                <Linkedin size={20} />
                                            </a>
                                        )}
                                        {placement.socialLinks && placement.socialLinks.twitter && (
                                            <a href={placement.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all border border-white/10">
                                                <Twitter size={20} />
                                            </a>
                                        )}
                                        {placement.socialLinks && placement.socialLinks.website && (
                                            <a href={placement.socialLinks.website} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all border border-white/10">
                                                <Globe size={20} />
                                            </a>
                                        )}
                                        {placement.socialLinks && placement.socialLinks.instagram && (
                                            <a href={placement.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all border border-white/10">
                                                <Instagram size={20} />
                                            </a>
                                        )}
                                        {(!placement.socialLinks || (!placement.socialLinks.linkedin && !placement.socialLinks.twitter && !placement.socialLinks.website && !placement.socialLinks.instagram)) && (
                                            <p className="text-[9px] font-bold text-slate-500 italic">No social links</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Facts */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                            className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100"
                        >
                            <h3 className="text-xs font-black uppercase tracking-[4px] text-primary mb-8">Quick Facts</h3>
                            <div className="flex flex-col gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400"><Users size={20}/></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Batches</p>
                                        <p className="text-sm font-black text-slate-800 uppercase">
                                            {placement.eligibleBatches && placement.eligibleBatches.length > 0 ? placement.eligibleBatches.join(' | ') : "2023 | 2024 | 2025"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400"><Layers size={20}/></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Branches</p>
                                        <p className="text-sm font-black text-slate-800 uppercase">
                                            {placement.eligibleBranches && placement.eligibleBranches.length > 0 ? placement.eligibleBranches.join(' | ') : "CSE | ECE | MECH | CIVIL"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400"><Award size={20}/></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Process</p>
                                        <p className="text-sm font-black text-slate-800 uppercase">
                                            {placement.processDescription ? "Detailed Process Shared" : "Shortlisting → Interview"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlacementDetail;
