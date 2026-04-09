import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, User, LogOut, Search, Bell, ChevronDown, Mail, ShieldCheck, ChevronRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getSports, getClubs, getBranding } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, logout, isAdmin, isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const [sports, setSports] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [navbarLogo, setNavbarLogo] = useState('/rgukt-logo.png');
    const [collegeName, setCollegeName] = useState('RGUKT ONGOLE');
    const [hoveredMenu, setHoveredMenu] = useState(null);
    const [mobileExpanded, setMobileExpanded] = useState(null);

    useEffect(() => {
        const fetchNavData = async () => {
            const sportsFallback = ["Basketball", "Cricket", "Football", "Volleyball"];
            const clubsFallback = ["Coding Club", "Dance Club", "Music Club", "Photography Club"];

            try {
                const [sportsRes, clubsRes, brandingRes] = await Promise.all([
                    getSports(),
                    getClubs(),
                    getBranding()
                ]);

                // Use DB data if available, otherwise fallback
                const dbSports = sportsRes.data || [];
                setSports(dbSports.length > 0 ? dbSports : sportsFallback);

                const dbClubs = clubsRes.data || [];
                setClubs(dbClubs.length > 0 ? dbClubs : clubsFallback);

                const branding = brandingRes.data;
                if (branding) {
                    if (branding.collegeName) setCollegeName(branding.collegeName);
                    const logo = branding.navbarLogo || branding.logo;
                    if (logo) {
                        setNavbarLogo(getImageUrl(logo));
                    }
                }
                console.log("Navbar API Data Loaded:", { sports: dbSports, clubs: dbClubs });
            } catch (error) {
                console.error("Failed to fetch nav data, using fallbacks", error);
                setSports(sportsFallback);
                setClubs(clubsFallback);
            }
        };
        fetchNavData();
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Sports', path: '/sports' },
        { name: 'Placements', path: '/placements' },
        { name: 'Exams', path: '/exams' },
        { name: 'Clubs', path: '/clubs' },
        { name: 'Events', path: '/events' },
        { name: 'Achievements', path: '/achievements' },
    ];

    // Derive initials or first letter of email
    const emailInitial = user?.email ? user.email[0].toUpperCase() : '?';
    const displayEmail = user?.email || 'Unknown';
    const displayName = user?.name || user?.email?.split('@')[0] || 'Student';

    return (
        <nav className="fixed w-full z-[100] transition-all duration-300">


            {/* Main Navbar */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border-b border-primary/10 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300 bg-white border border-red-100">
                                <img src={navbarLogo} alt="RGUKT Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.target.onerror = null; e.target.src = '/rgukt-logo.png'; }} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm sm:text-base md:text-lg font-black text-red-700 tracking-tight leading-tight">{collegeName}</span>
                                <span className="text-[7px] sm:text-[9px] text-gray-400 font-semibold tracking-wide uppercase leading-tight">Gifted Rural Youth</span>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-2">
                            {navLinks.map((link) => (
                                <div
                                    key={link.name}
                                    className="relative group"
                                    onMouseEnter={() => setHoveredMenu(link.name.toLowerCase())}
                                    onMouseLeave={() => setHoveredMenu(null)}
                                >
                                    <NavLink
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-1 ${isActive
                                                ? 'bg-primary text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                                            }`
                                        }
                                    >
                                        {link.name}
                                        {(link.name === 'Sports' || link.name === 'Clubs') && (
                                            <ChevronDown size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </NavLink>

                                    {/* Desktop Dropdowns */}
                                    {((link.name === 'Sports' && sports.length > 0) || (link.name === 'Clubs' && clubs.length > 0)) && (
                                        <AnimatePresence>
                                            {hoveredMenu === link.name.toLowerCase() && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50"
                                                >
                                                    <div className="bg-white rounded-[24px] shadow-2xl border border-slate-100 p-4 grid grid-cols-2 gap-2 min-w-[300px]">
                                                        {(link.name === 'Sports' ? sports : clubs).slice(0, 8).map(item => (
                                                            <Link
                                                                key={item._id || item}
                                                                to={`/${link.name.toLowerCase()}/${(item.name || item).toLowerCase().replace(/\s+/g, '-')}`}
                                                                onClick={() => setHoveredMenu(null)}
                                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group/item"
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                                                    <span className="font-bold text-xs">{(item.name || item)[0].toUpperCase()}</span>
                                                                </div>
                                                                <span className="font-semibold text-sm text-slate-700 group-hover/item:text-primary transition-colors">{item.name || item}</span>
                                                            </Link>
                                                        ))}
                                                        <div className="col-span-2 pt-2 mt-2 border-t border-slate-100">
                                                            <Link
                                                                to={`/${link.name.toLowerCase()}`}
                                                                onClick={() => setHoveredMenu(null)}
                                                                className="flex items-center justify-center gap-2 w-full p-2 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                            >
                                                                View All {link.name} <ChevronRight size={14} />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </div>
                            ))}

                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                            <button onClick={toggleTheme} className="p-2 mr-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>

                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    {isAdmin && (
                                        <Link to="/admin" className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                            ADMIN
                                        </Link>
                                    )}

                                    {/* ── Profile Dropdown ── */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setProfileOpen(prev => !prev)}
                                            className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-full transition-all duration-200 shadow-sm group"
                                        >
                                            {/* Avatar circle with initial */}
                                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-black flex-shrink-0 shadow">
                                                {emailInitial}
                                            </div>
                                            <div className="flex flex-col items-start max-w-[130px]">
                                                <span className="text-xs font-black text-slate-800 leading-tight truncate w-full">{displayName}</span>
                                                <span className="text-[9px] text-slate-400 font-medium truncate w-full">{displayEmail}</span>
                                            </div>
                                            <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Panel */}
                                        <AnimatePresence>
                                            {profileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                                                >
                                                    {/* User info header */}
                                                    <div className="bg-gradient-to-br from-primary to-primary/80 p-5 flex flex-col gap-2">
                                                        <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xl font-black">
                                                            {emailInitial}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-black text-sm leading-tight">{displayName}</p>
                                                            <p className="text-blue-200 text-xs mt-0.5 flex items-center gap-1.5 break-all">
                                                                <Mail size={10} className="shrink-0" /> {displayEmail}
                                                            </p>
                                                        </div>
                                                        {isAdmin && (
                                                            <span className="flex items-center gap-1 bg-red-500/20 text-red-200 border border-red-400/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit">
                                                                <ShieldCheck size={9} /> Admin
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="p-2 flex flex-col gap-1">
                                                        {isAdmin && (
                                                            <Link
                                                                to="/admin"
                                                                onClick={() => setProfileOpen(false)}
                                                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-bold text-sm transition-colors"
                                                            >
                                                                <ShieldCheck size={16} /> Admin Dashboard
                                                            </Link>
                                                        )}
                                                        <button
                                                            onClick={() => { logout(); setProfileOpen(false); }}
                                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 font-bold text-sm transition-colors w-full text-left"
                                                        >
                                                            <LogOut size={16} /> Logout
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="btn-primary flex items-center gap-2">
                                        <User size={16} />
                                        Login
                                    </Link>
                                    <Link to="/register" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center gap-2 text-sm uppercase tracking-widest">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button className="lg:hidden p-2 text-primary" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-b border-gray-100 overflow-hidden shadow-2xl"
                    >
                        <div className="px-6 py-8 flex flex-col gap-4">
                            {/* Mobile profile strip */}
                            {isAuthenticated && (
                                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 mb-2 border border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-base shrink-0">
                                        {emailInitial}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-black text-slate-800 truncate">{displayName}</span>
                                        <span className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                                            <Mail size={9} /> {displayEmail}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {navLinks.map((link) => (
                                <div key={link.name} className="flex flex-col border-b border-gray-50">
                                    <div className="flex justify-between items-center py-2">
                                        <Link
                                            to={link.path}
                                            onClick={() => setIsOpen(false)}
                                            className="text-lg font-bold text-gray-800 hover:text-primary flex-grow"
                                        >
                                            {link.name}
                                        </Link>

                                        {/* Mobile Accordion Toggle for Sports and Clubs */}
                                        {(link.name === 'Sports' || link.name === 'Clubs') && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setMobileExpanded(mobileExpanded === link.name.toLowerCase() ? null : link.name.toLowerCase());
                                                }}
                                                className="p-2 bg-slate-50 rounded-lg text-slate-400"
                                            >
                                                <ChevronDown size={18} className={`transition-transform duration-300 ${mobileExpanded === link.name.toLowerCase() ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Mobile Accordion Content */}
                                    <AnimatePresence>
                                        {mobileExpanded === link.name.toLowerCase() && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex flex-col gap-2 pl-4 py-2 border-l-2 border-primary/20 ml-2 mb-2">
                                                    {(link.name === 'Sports' ? sports : clubs).slice(0, 5).map(item => (
                                                        <Link
                                                            key={item._id || item}
                                                            to={`/${link.name.toLowerCase()}/${(item.name || item).toLowerCase().replace(/\s+/g, '-')}`}
                                                            onClick={() => setIsOpen(false)}
                                                            className="text-sm font-semibold text-slate-600 hover:text-primary py-1"
                                                        >
                                                            {item.name || item}
                                                        </Link>
                                                    ))}
                                                    <Link
                                                        to={`/${link.name.toLowerCase()}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="text-xs font-bold text-primary uppercase tracking-widest mt-2"
                                                    >
                                                        View All
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                            {isAuthenticated ? (
                                <>
                                    {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="text-lg font-bold text-red-600 py-2 border-b border-gray-50">Admin Dashboard</Link>}
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-lg font-bold text-red-500 py-2 flex items-center gap-2">
                                        <LogOut size={18} /> Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-4 mt-4">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="btn-primary text-center py-4 text-lg">
                                        Login
                                    </Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="px-6 py-4 bg-slate-900 text-white font-bold rounded-xl text-center text-lg uppercase tracking-widest">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
