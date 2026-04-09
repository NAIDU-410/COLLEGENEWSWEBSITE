import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, ChevronRight, Building, MapPin, Users, Target, Rocket, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAchievements, getWebsiteStats } from '../../services/api';
import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';

const Placements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ partnerCompanies: '150+', placedStudents: '1200+', placementRate: '94%', avgPackage: '6.5 LPA' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAchievements({ type: 'placements' });
                setAchievements(res.data || []);
                
                try {
                    const statsRes = await getWebsiteStats();
                    if (statsRes.data?.placements) {
                        setStats({
                            partnerCompanies: `${statsRes.data.placements.partnerCompanies}+`,
                            placedStudents: `${statsRes.data.placements.placedStudents}+`,
                            placementRate: `${statsRes.data.placements.placementRate}`,
                            avgPackage: `${statsRes.data.placements.avgPackage} LPA`
                        });
                    }
                } catch (statErr) {
                    console.error('Error fetching global stats:', statErr);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const categories = [
        {
            title: "Internships",
            description: "Kickstart your career with hands-on experience at top companies. Explore summer and long-term internship opportunities.",
            icon: <GraduationCap size={40} />,
            link: "/placements/internships",
            color: "from-emerald-400 to-cyan-500",
            stats: "200+ Active Roles",
            tag: "Learning"
        },
        {
            title: "Full-Time Jobs",
            description: "Direct campus placement opportunities with industry leaders. Secure your future with competitive packages and roles.",
            icon: <Briefcase size={40} />,
            link: "/placements/jobs",
            color: "from-primary to-indigo-600",
            stats: "50+ Top Recruiters",
            tag: "Career"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-6 text-center lg:text-left lg:max-w-2xl"
                    >
                        <span className="text-primary font-black uppercase tracking-[5px] text-xs">Career Gateway</span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                            Your Future <br/> Starts <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Here.</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-lg md:text-xl">
                            The official Placement and Internship Portal of RGUKT Ongole. Connecting talented students with world-class opportunities.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Selection Cards */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 pb-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 }}
                        >
                            <Link to={cat.link} className="group block h-full">
                                <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 h-full flex flex-col justify-between hover:shadow-primary/10 transition-all duration-500 relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-bl-[100px]`}></div>
                                    
                                    <div>
                                        <div className={`w-20 h-20 bg-gradient-to-br ${cat.color} rounded-3xl flex items-center justify-center text-white shadow-lg mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                            {cat.icon}
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">{cat.tag}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cat.stats}</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-800 mb-4 group-hover:text-primary transition-colors">{cat.title}</h2>
                                        <p className="text-slate-500 text-lg leading-relaxed mb-8">{cat.description}</p>
                                    </div>

                                    <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest group-hover:gap-5 transition-all">
                                        Explore Opportunities <ChevronRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-16">
                    {[
                        { icon: <Building size={20}/>, label: "Partner Companies", val: stats.partnerCompanies },
                        { icon: <Users size={20}/>, label: "Placed Students", val: stats.placedStudents },
                        { icon: <Target size={20}/>, label: "Placement Rate", val: stats.placementRate },
                        { icon: <Rocket size={20}/>, label: "Avg Package", val: stats.avgPackage }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary">{stat.icon}</div>
                            <div>
                                <h4 className="text-xl font-black text-slate-800">{stat.val}</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Achievements section */}
                <div className="mt-24 flex flex-col gap-10">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-4">
                            <Award className="text-emerald-500 w-10 h-10" /> Success Stories
                        </h3>
                        <div className="h-1.5 w-24 bg-emerald-500 rounded-full" />
                    </div>

                    {achievements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {achievements.slice(0, 3).map((ach) => (
                                <Link to={`/achievements/${ach._id}`} key={ach._id} className="bg-white p-6 rounded-[48px] shadow-xl shadow-slate-200/20 border border-slate-100 flex flex-col gap-6 group hover:-translate-y-2 transition-all duration-500">
                                    <div className="h-48 rounded-[40px] overflow-hidden relative">
                                        {ach.cardImage ? (
                                            <img src={getImageUrl(ach.cardImage)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="Victory" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                                <Award size={48} className="text-slate-200" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">{ach.year}</div>
                                    </div>
                                    <div className="px-4 pb-4">
                                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors italic line-clamp-2">{ach.title}</h4>
                                        <p className="text-slate-400 text-[10px] font-bold mt-3 leading-relaxed line-clamp-2 italic">"{ach.description}"</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 bg-white rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4 text-center">
                            <Award className="text-slate-200 w-12 h-12" />
                            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Our placement records are being updated...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Placements;
