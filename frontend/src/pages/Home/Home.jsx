import React, { useState, useEffect } from 'react';
import HomeCarouselSlider from '../../components/HomeCarouselSlider';
import UrgentMarquee from '../../components/UrgentMarquee';
import Card from '../../components/Card';

import { NavLink, Link } from 'react-router-dom';
import { getSportEvents, getEvents, getClubTypes, getAchievements, getBranding, getSocialMedia } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import {
    Trophy,
    Briefcase,
    Calendar,
    Users,
    GraduationCap,
    Rocket,
    ChevronRight,
    ChevronLeft,
    ArrowRight,
    TrendingUp,
    Award,
    BookOpen,
    Info,
    Instagram,
    Linkedin,
    Twitter,
    Youtube,
    Facebook,
    Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const PLATFORM_MAP = {
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    x: Twitter,
    youtube: Youtube,
    facebook: Facebook,
    website: Globe,
    globe: Globe,
};

const Home = () => {
    const [sportsHighlights, setSportsHighlights] = useState([]);
    const [events, setEvents] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [branding, setBranding] = useState(null);
    const [socialLinks, setSocialLinks] = useState([]);

    useEffect(() => {
        let retryTimeout;
        const fetchHomeData = async (isRetry = false) => {
            try {
                setLoading(true);
                const [sportsRes, eventsRes, clubsRes, achievementsRes, brandingRes, socialRes] = await Promise.all([
                    getSportEvents({ limit: 4 }),
                    getEvents({ type: 'ALL', limit: 3 }),
                    getClubTypes(),
                    getAchievements({ limit: 4 }),
                    getBranding(),
                    getSocialMedia()
                ]);
                setBranding(brandingRes.data);
                setSocialLinks(socialRes.data || []);

                // Sports Highlights
                const formattedSports = (sportsRes.data.events || []).map(ev => ({
                    title: ev.eventTitle,
                    date: new Date(ev.eventDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                    author: 'Sports Dept',
                    image: getImageUrl(ev.eventImage || ev.image),
                    description: ev.description || ev.eventDescription,
                    id: ev._id,
                    subcategory: ev.subcategory || ev.sportType
                }));
                setSportsHighlights(formattedSports);

                // Upcoming Events
                const formattedEvents = (eventsRes.data.events || [])
                    .filter(ev => ev.eventDate && ev.eventTitle)
                    .map(ev => ({
                        ...ev,
                        jsDate: new Date(ev.eventDate)
                    }))
                    .filter(ev => !isNaN(ev.jsDate.getTime()))
                    .slice(0, 3);
                setEvents(formattedEvents);

                // Clubs
                setClubs(clubsRes.data || []);
                
                // Achievements
                const formattedAchievements = (achievementsRes.data.activities || achievementsRes.data || []).map(ach => ({
                    title: ach.title,
                    date: new Date(ach.year ? `${ach.year}-01-01` : (ach.createdAt || new Date())).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    badge: ach.subcategory || ach.type,
                    author: ach.studentName || 'Student',
                    image: getImageUrl(ach.cardImage || ach.image),
                    description: ach.description,
                    id: ach._id
                }));
                setAchievements(formattedAchievements);
            } catch (err) {
                console.error('Error fetching home data:', err);
                // Auto-retry once after 7 seconds (Render cold start)
                if (!isRetry) {
                    retryTimeout = setTimeout(() => fetchHomeData(true), 7000);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
        return () => clearTimeout(retryTimeout);
    }, []);

    const categoryCards = [
        { title: 'Sports', description: 'Real-time updates on cricket, basketball, and more.', link: '/sports', icon: Trophy, color: 'bg-orange-500', img: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=2670&auto=format&fit=crop' },
        { title: 'Placements', description: 'Latest job openings, internship drives, and career news.', link: '/placements', icon: Briefcase, color: 'bg-emerald-500', img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2672&auto=format&fit=crop' },
        { title: 'Exam Schedule', description: 'Internal assessments, mid-terms, and final exam dates.', link: '/exams', icon: Calendar, color: 'bg-blue-500', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop' },
        { title: 'Upcoming Events', description: 'Workshops, hackathons, and cultural fests calendar.', link: '/events', icon: Rocket, color: 'bg-purple-500', img: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2670&auto=format&fit=crop' },
        { title: 'Achievements', description: 'Celebrating academic and co-curricular excellence.', link: '/achievements', icon: Award, color: 'bg-amber-500', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop' },
        { title: 'Campus Clubs', description: 'Join creative, technical, and sports-oriented clubs.', link: '/clubs', icon: Users, color: 'bg-rose-500', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2574&auto=format&fit=crop' },
    ];

    return (
        <div className="flex flex-col gap-10">
            {/* Branding / Hero Identity Section */}
            <section className="bg-white mt-8 py-12 border-b border-slate-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                        {/* Left: Logo + University name (horizontal) */}
                        <div className="flex flex-row items-center gap-5">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl border-4 border-red-100 bg-white shrink-0">
                                <img
                                    src={branding?.logo ? getImageUrl(branding.logo) : '/rgukt-logo.png'}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/rgukt-logo.png'; }}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-200">Official Portal</span>
                                    <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Est. 2008</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight uppercase">
                                    {branding?.heroTitle || 'Rajiv Gandhi University of Knowledge Technologies'}
                                </h1>
                                <p className="text-slate-400 font-bold uppercase text-[10px] sm:text-xs tracking-[0.22em]">
                                    {branding?.heroSubtitle || 'Catering to the Educational Needs of Gifted Rural Youth'}
                                </p>
                            </div>
                        </div>

                        {/* Right: Dynamic Social Icons or CTA button */}
                        <div className="flex items-center gap-3 shrink-0">
                            {socialLinks.length > 0 ? (
                                socialLinks.map(s => {
                                    const iconUrl = getImageUrl(s.icon);
                                    const SocialIcon = PLATFORM_MAP[s.name?.toLowerCase()];
                                    return (
                                        <a
                                            key={s._id}
                                            href={s.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            title={s.name}
                                            className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-red-700 transition-all hover:-translate-y-1 shadow-xl"
                                        >
                                            {SocialIcon ? <SocialIcon size={18} /> : <img src={iconUrl} alt={s.name} className="w-5 h-5 object-contain" onError={(e) => { e.target.onerror = null; }} />}
                                        </a>
                                    );
                                })
                            ) : (
                                <Link
                                    to={branding?.ctaLink || '/about'}
                                    className="shrink-0 bg-slate-900 text-white px-7 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-red-700 transition-all hover:-translate-y-1 flex items-center gap-2"
                                >
                                    {branding?.ctaText || 'More Details'} <Info size={15} className="text-red-400" />
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* Urgent Marquee — Live Upcoming Events */}
            <UrgentMarquee />

            {/* Hero Section */}
            <HomeCarouselSlider />

            {/* Category Section */}
            <section className="max-w-7xl mx-auto px-6 w-full">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em]">
                            <span className="w-8 h-1 bg-primary rounded-full" />
                            Quick Access
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tighter leading-none">
                            Portal Categories
                        </h2>
                        <p className="text-gray-500 font-medium max-w-lg leading-relaxed mt-2 text-lg">
                            Explore specialized sections for academic updates, career opportunities, and campus life activities.
                        </p>
                    </div>
                    <NavLink to="/all-categories" className="group flex items-center gap-4 bg-gray-100 hover:bg-primary px-8 py-5 rounded-2xl transition-all duration-500">
                        <span className="text-gray-600 font-bold uppercase tracking-widest text-xs group-hover:text-white">View Full Directory</span>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-white shadow-lg group-hover:rotate-12 transition-all">
                            <ArrowRight className="text-primary group-hover:scale-110 transition-transform" />
                        </div>
                    </NavLink>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryCards.map((cat, idx) => (
                        <motion.div
                            key={cat.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            {/* Entire card is clickable */}
                            <Link to={cat.link} className="block">
                                <Card
                                    variant="simple"
                                    title={cat.title}
                                    description={cat.description}
                                    image={cat.img}
                                >
                                    <div className={`w-12 h-12 ${cat.color} rounded-lg flex items-center justify-center text-white relative z-10`}>
                                        <cat.icon size={24} />
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Sports Highlights Section */}
            <section className="bg-primary-dark py-32 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-1/4 h-full bg-primary/20 -skew-x-12 -ml-20 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-white/10 pb-12">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3 text-blue-300 font-black uppercase text-xs tracking-[0.3em]">
                                <TrendingUp size={16} />
                                Sports Updates
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                                Athletic Excellence
                            </h2>
                        </div>
                        <Link to="/sports" className="px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-primary transition-all duration-500 shadow-2xl shadow-blue-500/10">
                            Go to Sports Portal
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {loading ? (
                             <div className="col-span-2 text-center text-white/20 font-black uppercase tracking-widest">Warming up the arena...</div>
                        ) : sportsHighlights.map((news, idx) => (
                            <Card
                                key={idx}
                                title={news.title}
                                date={news.date}
                                author={news.author}
                                image={news.image}
                                description={news.description}
                                link={`/sports/${(news.subcategory || news.sportType)?.toLowerCase()?.replace(/\s+/g, '-')}/${news.id}`}
                                badge="MATCH REPORT"
                                index={idx}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Join Clubs Section */}
            <section className="bg-slate-50 py-24 relative">
                <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-rose-500 font-black uppercase text-xs tracking-[0.3em]">
                                <Users size={16} /> Campus Life
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">
                                🚀 Join Clubs
                            </h2>
                            <p className="text-slate-500 font-medium max-w-lg mt-2 text-lg">
                                Discover your potential with our creative, technical, and cultural organizations.
                            </p>
                        </div>
                        <Link to="/clubs" className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 font-bold uppercase text-xs tracking-widest hover:border-rose-500 hover:text-rose-500 transition-all shadow-sm">
                            View All Clubs
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <div className="col-span-full text-center text-slate-400 font-bold uppercase">Loading clubs...</div>
                        ) : clubs.slice(0, 3).map((club, idx) => (
                            <Link 
                                to={`/clubs/${club.name.toLowerCase().replace(/\s+/g, '-')}`} 
                                key={club._id || idx}
                                className="bg-white rounded-3xl p-8 border border-slate-100 hover:border-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/5 transition-all group flex flex-col gap-6"
                            >
                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                    <Rocket size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-2">{club.name}</h3>
                                    <p className="text-slate-500 line-clamp-2">{club.description || 'Join this exciting club and explore new opportunities.'}</p>
                                </div>
                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-sm font-bold text-rose-500 uppercase tracking-widest group-hover:gap-4 transition-all w-fit">
                                    Explore Club <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="bg-white py-24 pb-32 relative">
                <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-amber-500 font-black uppercase text-xs tracking-[0.3em]">
                                <Award size={16} /> Hall of Fame
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">
                                🌟 Achieving New Heights
                            </h2>
                            <p className="text-slate-500 font-medium max-w-lg mt-2 text-lg">
                                Celebrating academic excellence, placement milestones, and stellar accomplishments.
                            </p>
                        </div>
                        <Link to="/achievements" className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 font-bold uppercase text-xs tracking-widest hover:border-amber-500 hover:text-amber-500 transition-all shadow-sm">
                            View All Achievements
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            <div className="col-span-full text-center text-slate-400 font-bold uppercase">Loading achievements...</div>
                        ) : achievements.map((ach, idx) => (
                            <Link 
                                to={`/achievements/${ach.id}`} 
                                key={ach.id || idx}
                                className="group relative rounded-3xl overflow-hidden bg-slate-900 aspect-[4/5] shadow-xl"
                            >
                                <img 
                                    src={getImageUrl(ach.image) || 'https://placehold.co/400x500/1e293b/ffffff?text=Achievement'} 
                                    alt={ach.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-110"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x500/1e293b/ffffff?text=Achievement'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
                                    <span className="text-[10px] bg-amber-500 text-white font-black uppercase tracking-widest px-2 py-1 rounded w-fit mb-3">
                                        {ach.badge}
                                    </span>
                                    <h3 className="text-lg font-black text-white leading-tight mb-1 line-clamp-2">{ach.title}</h3>
                                    <p className="text-amber-200/80 text-xs font-bold uppercase tracking-wider">{ach.author} • {ach.date}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
