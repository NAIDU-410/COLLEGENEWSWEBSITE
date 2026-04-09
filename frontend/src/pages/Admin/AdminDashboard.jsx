import React from 'react';
import {
    Plus,
    Settings,
    Users,
    Calendar,
    Trophy,
    FileText,
    TrendingUp,
    LayoutDashboard,
    Bell,
    Search,
    ArrowUpRight,
    Award,
    Image as ImageIcon,
    Link as LinkIcon,
    Share2,
    Palette,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getWebsiteStats } from '../../services/api';

const AdminDashboard = () => {
    const [statsData, setStatsData] = useState({
        totalEvents: 24,
        totalClubs: 12,
        totalStudents: '4.2K',
        totalPosts: 185,
        placedStudents: '450+'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getWebsiteStats();
                if (res.data) {
                    setStatsData({
                        totalEvents: res.data.clubs?.totalEvents || 24,
                        totalClubs: res.data.clubs?.totalClubs || 12,
                        totalStudents: res.data.clubs?.totalStudents 
                            ? (res.data.clubs.totalStudents / 1000).toFixed(1) + 'K' 
                            : '4.2K',
                        totalPosts: res.data.global?.totalNews || 185,
                        placedStudents: res.data.placements?.placedStudents || '450+'
                    });
                }
            } catch (err) {
                console.error('Error fetching admin stats:', err);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        { title: 'Total Events', count: statsData.totalEvents, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'Total Clubs', count: statsData.totalClubs, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { title: 'Total Students', count: statsData.totalStudents, icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' },
        { title: 'Total Posts', count: statsData.totalPosts, icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50' },
        { title: 'Placed Students', count: statsData.placedStudents, icon: Award, color: 'text-amber-600', bg: 'bg-amber-100/50' },
    ];

    const adminActions = [
        { title: 'Add Events', description: 'Schedule new workshops or fests', link: '/admin/manage-events', icon: Plus },
        { title: 'Upload Exam Schedules', description: 'Update mid-term and final dates', link: '/admin/upload-exam', icon: FileText },
        { title: 'Manage Clubs', description: 'Review club activities and memberships', link: '/admin/manage-clubs', icon: Users },
        { title: 'Manage Sports', description: 'Update match results, teams and achievements', link: '/admin/manage-sports', icon: Trophy },
        { title: 'Manage Placements', description: 'New recruitment drives and hires', link: '/admin/manage-placements', icon: TrendingUp },
        { title: 'Add Achievements', description: 'Highlight student & faculty success', link: '/admin/add-achievements', icon: Award },
        { title: 'Home Carousel', description: 'Manage dynamic images on the home page', link: '/admin/manage-home-carousel', icon: ImageIcon },
        { title: 'Manage Footer', description: 'Update footer sections and links dynamically', link: '/admin/manage-footer', icon: LinkIcon },
        { title: 'Social Links', description: 'Update campus social media presence', link: '/admin/manage-social', icon: Share2 },
        { title: 'Manage Branding', description: 'Upload logos for navbar, hero and footer', link: '/admin/manage-branding', icon: Palette },
        { title: 'Manage Admins', description: 'Create and manage administrative accounts', link: '/admin/manage-admins', icon: Shield },
    ];

    return (
        <div className="flex flex-col gap-10 bg-slate-50 min-h-screen pb-32 pt-10">
            <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-16">

                {/* Top Branding & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 py-10 border-b border-slate-200">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-4 uppercase">
                            <LayoutDashboard className="text-primary" size={36} /> Admin Central
                        </h1>
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full border border-primary/10 w-fit">
                            <Settings size={14} /> Operations Management
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="group relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search logs or results..."
                                className="bg-white border-2 border-slate-100 py-4 pl-16 pr-8 rounded-2xl outline-none focus:border-primary/20 w-full md:w-[350px] shadow-sm font-semibold"
                            />
                        </div>
                        <button className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                            <Bell size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 flex items-center gap-8 group hover:shadow-2xl transition-all duration-500 overflow-hidden relative"
                        >
                            <div className={`w-16 h-16 ${stat.bg} rounded-3xl flex items-center justify-center ${stat.color} transition-transform group-hover:rotate-12`}>
                                <stat.icon size={32} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-black text-gray-800 tracking-tighter">{stat.count}</span>
                                <span className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mt-1">{stat.title}</span>
                            </div>
                            <div className="absolute top-2 right-2 text-emerald-500 bg-emerald-50 p-2 rounded-xl text-[10px] font-bold flex items-center gap-1">
                                <ArrowUpRight size={12} /> 12%
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Actions Grid */}
                <div className="flex flex-col gap-10">
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight px-6 border-l-8 border-primary">Essential Controls</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {adminActions.map((action, i) => (
                            <Link to={action.link} key={i} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-lg text-left group hover:bg-primary transition-all duration-500 flex flex-col gap-8 min-h-[300px]">
                                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-white transition-colors">
                                    <action.icon size={32} />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-2xl font-black text-gray-800 group-hover:text-white transition-colors">{action.title}</h4>
                                    <p className="text-primary/40 font-semibold group-hover:text-blue-100 transition-colors uppercase text-[10px] tracking-widest">{action.description}</p>
                                </div>
                                <div className="mt-auto pt-6 border-t border-primary/5 group-hover:border-white/10 flex justify-between items-center w-full">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-primary group-hover:text-white">Access Portal</span>
                                    <Plus className="text-gray-300 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default AdminDashboard;
