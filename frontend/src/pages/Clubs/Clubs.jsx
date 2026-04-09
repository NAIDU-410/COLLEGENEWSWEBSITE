import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, ChevronRight, Search, Layout, Filter, AlertCircle, Rocket
} from 'lucide-react';
import { getClubTypes } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const Clubs = () => {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                setLoading(true);
                const { data } = await getClubTypes();
                setClubs(data);
            } catch (err) {
                console.error('Error fetching clubs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchClubs();
    }, []);

    const filteredClubs = clubs.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex flex-col min-h-screen bg-slate-950">
            {/* ── Hero Banner ── */}
            <section className="relative pt-32 pb-60 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[160px] -ml-96 -mt-96 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] -mr-96 -mb-96 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8 }} 
                        className="max-w-4xl flex flex-col gap-8"
                    >
                        <div className="flex items-center gap-4 text-blue-400 font-black uppercase text-xs tracking-[0.4em]">
                            <Users size={18} /> THE CAMPUS DIRECTORY
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter">
                            FIND YOUR <span className="text-primary italic">PRIDE</span>.
                        </h1>
                        <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
                            Connect with {clubs.length} official student-led communities. Lead projects, master skills, and build your legacy beyond the classroom.
                        </p>

                        {/* Search Bar Interface */}
                        <div className="relative max-w-2xl mt-8">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                            <input 
                                type="text"
                                placeholder="Search by name or field (e.g. Coding)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 backdrop-blur-2xl border-2 border-white/10 rounded-[32px] py-8 pl-20 pr-10 text-white font-black text-lg outline-none focus:border-primary/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Grid Section ── */}
            <section className="max-w-7xl mx-auto px-6 w-full -mt-40 relative z-20 pb-32">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8 bg-slate-900/50 backdrop-blur-md rounded-[64px] border border-white/5">
                        <div className="w-20 h-20 border-8 border-primary border-t-transparent rounded-full animate-spin shadow-2xl shadow-primary/20"></div>
                        <p className="text-slate-500 font-black uppercase text-xs tracking-[0.6em]">Synchronizing Network...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredClubs.map((club, i) => (
                                <motion.div
                                    key={club._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group"
                                >
                                    <Link
                                        to={`/clubs/${club.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="relative aspect-square rounded-[48px] overflow-hidden flex flex-col shadow-2xl transition-all duration-700 hover:shadow-primary/30 bg-slate-900 border border-white/5"
                                    >
                                        {/* Background Image with Kinetic Hover */}
                                        <div className="absolute inset-0 z-0">
                                            {club.image ? (
                                                <img 
                                                    src={getImageUrl(club.image)} 
                                                    alt={club.name} 
                                                    className="w-full h-full object-cover brightness-[0.6] group-hover:scale-110 group-hover:brightness-50 transition-all duration-1000"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                                    <Users size={64} className="text-white/10" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                        </div>

                                        {/* Card content */}
                                        <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="w-16 h-16 backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center text-white font-black text-2xl group-hover:bg-primary transition-all duration-500 shadow-2xl uppercase">
                                                    {club.name[0]}
                                                </div>
                                                <div className="backdrop-blur-md bg-black/40 border border-white/5 px-4 py-2 rounded-full flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Active Org</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 transform group-hover:-translate-y-4 transition-transform duration-700">
                                                <div className="flex flex-col">
                                                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                                                        {club.name}
                                                    </h3>
                                                </div>

                                                <p className="text-slate-400 text-sm font-bold leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 line-clamp-2 max-w-[90%]">
                                                    {club.description || 'Shaping the future of the university through collaboration and leadership.'}
                                                </p>

                                                <div className="mt-6 flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-[0.3em] group-hover:gap-6 transition-all duration-500">
                                                    Explore Space <ChevronRight size={16} className="text-primary" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Interactive Glow */}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredClubs.length === 0 && (
                            <div className="col-span-full bg-slate-900 p-32 rounded-[64px] border-2 border-dashed border-white/5 flex flex-col items-center gap-8 text-center">
                                <AlertCircle size={80} className="text-slate-800" />
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">No Organizations Found</h3>
                                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-4">Try widening your search horizons</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-32 bg-slate-900 rounded-[64px] p-16 md:p-32 flex flex-col items-center text-center gap-12 relative overflow-hidden border border-white/5 shadow-2xl shadow-black"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
                    
                    <Rocket size={64} className="text-primary animate-bounce relative z-10" />
                    
                    <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter uppercase relative z-10">
                        THE <span className="text-primary italic">FUTURE</span> IS LEAD BY <br />THOSE WHO JOIN.
                    </h2>
                    
                    <p className="text-slate-400 text-sm font-black uppercase tracking-[0.5em] max-w-xl relative z-10">
                        Become a founding member of something great today.
                    </p>
                    
                    <button className="relative z-10 bg-white text-slate-900 px-16 py-6 rounded-2xl font-black uppercase text-sm tracking-[0.3em] hover:bg-primary hover:text-white hover:-translate-y-2 transition-all shadow-2xl">
                        Register Your Interest
                    </button>
                </motion.div>
            </section>
        </div>
    );
};

export default Clubs;
