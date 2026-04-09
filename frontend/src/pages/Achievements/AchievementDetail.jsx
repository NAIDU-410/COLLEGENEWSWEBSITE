import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAchievementById } from '../../services/api';
import { ArrowLeft, Award, Calendar, Share2, Instagram, Linkedin, Globe, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../utils/imageUrl';

const AchievementDetail = () => {
    const { id } = useParams();
    const [achievement, setAchievement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const { data } = await getAchievementById(id);
                setAchievement(data);
            } catch (err) {
                console.error('Error fetching achievement:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!achievement) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
            <Award size={64} className="text-slate-300" />
            <h1 className="text-3xl font-black text-slate-400 uppercase tracking-tighter">Achievement Not Found</h1>
            <Link to="/achievements" className="text-primary font-bold hover:underline py-4">Return to Wall of Fame</Link>
        </div>
    );

    const bannerImage = achievement.detailImage || achievement.cardImage;
    const { socialLinks } = achievement;

    return (
        <div className="bg-slate-50 min-h-screen pb-32">
            {/* Hero Image / Banner */}
            <div className="w-full h-[50vh] min-h-[400px] bg-slate-900 relative">
                {bannerImage ? (
                    <img src={getImageUrl(bannerImage)} className="w-full h-full object-cover opacity-50 mix-blend-overlay" alt={achievement.title} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-20">
                        <ImageIcon size={64} className="text-white" />
                        <span className="text-white font-black uppercase tracking-widest text-sm">No Image</span>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent" />
                
                <div className="absolute top-10 left-10 z-20">
                    <Link to="/achievements" className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-all">
                        <ArrowLeft size={24} />
                    </Link>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-5xl mx-auto px-6 relative z-30 -mt-32">
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 md:p-16 rounded-[48px] shadow-2xl flex flex-col gap-10">
                    
                    <header className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="px-5 py-2 rounded-full border border-amber-200 bg-amber-50 text-amber-600 font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-sm">
                                <Award size={16} /> {achievement.type}
                            </span>
                            {achievement.subcategory && (
                                <span className="px-5 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-600 font-black uppercase text-xs tracking-widest shadow-sm">
                                    {achievement.subcategory}
                                </span>
                            )}
                            <span className="px-5 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-400 font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-sm">
                                <Calendar size={16} /> {achievement.year}
                            </span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black text-slate-800 uppercase tracking-tighter leading-[1.1]">
                            {achievement.title}
                        </h1>
                    </header>

                    <hr className="border-slate-100" />

                    <div className="prose prose-slate prose-lg max-w-none">
                        <p className="text-slate-600 font-medium leading-loose text-lg whitespace-pre-wrap">
                            {achievement.description}
                        </p>
                    </div>

                    {socialLinks && (socialLinks.instagram || socialLinks.linkedin || socialLinks.facebook) && (
                        <>
                            <hr className="border-slate-100" />
                            <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Connect:</span>
                                <div className="flex gap-4">
                                    {socialLinks.instagram && (
                                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-pink-500 shadow-sm hover:scale-110 transition-transform">
                                            <Instagram size={20} />
                                        </a>
                                    )}
                                    {socialLinks.linkedin && (
                                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm hover:scale-110 transition-transform">
                                            <Linkedin size={20} />
                                        </a>
                                    )}
                                    {socialLinks.facebook && (
                                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-800 shadow-sm hover:scale-110 transition-transform">
                                            <Globe size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AchievementDetail;
