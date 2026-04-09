import React, { useState, useEffect } from 'react';
import { getPlacements } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building, Calendar, DollarSign, ChevronRight, Filter, Laptop, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';

const Internships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        fetchInternships();
    }, []);

    const fetchInternships = async () => {
        try {
            setLoading(true);
            const { data } = await getPlacements(); // Fetch all initially for client-side filtering or we can fetch by type
            setInternships(data);
            
            // Initial filter for Internships if we are on the Internships page
            // Actually, the user wants ALL, INTERNSHIP, PLACEMENT filters on this page now.
            // So we fetch all and filter by "Internship" by default if it's the Internship page?
            // User requested: ALL, INTERNSHIP, PLACEMENT tabs.
            setFilterType('INTERNSHIP');
            const initialFiltered = data.filter(item => item.type === 'Internship');
            setFilteredData(initialFiltered);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters(searchTerm, filterType);
    }, [searchTerm, filterType, internships]);

    const applyFilters = (search, type) => {
        const sValue = search.toLowerCase();
        const filtered = internships.filter(item => {
            const matchesSearch = item.companyName.toLowerCase().includes(sValue) || 
                                 item.role.toLowerCase().includes(sValue) ||
                                 (item.skills && Array.isArray(item.skills) && item.skills.some(skill => skill.toLowerCase().includes(sValue)));
            
            const matchesType = type === 'ALL' || item.type.toUpperCase() === type;
            
            return matchesSearch && matchesType;
        });
        setFilteredData(filtered);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-10">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex flex-col gap-2">
                        <Link to="/placements" className="text-primary font-black uppercase text-[10px] tracking-[4px] mb-2 flex items-center gap-2">
                            <ChevronRight size={14} className="rotate-180" /> Back to Portal
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase">Internships</h1>
                        <p className="text-slate-500 font-medium">Browse through active internship opportunities for your branch.</p>
                    </div>
                </header>

                {/* Search & Filter UI (Manage Events Style) */}
                <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-xl border border-slate-100 flex flex-col lg:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search role, company or skills..." 
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full bg-slate-50 border border-slate-100 py-5 pl-16 pr-8 rounded-2xl outline-none focus:border-primary/20 font-bold text-slate-700 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <Filter className="text-slate-400 hidden md:block" size={20} />
                        <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full lg:w-auto overflow-x-auto no-scrollbar">
                            {['ALL', 'INTERNSHIP', 'PLACEMENT'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${filterType === type ? 'bg-white text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-[32px] p-8 h-80 animate-pulse border border-slate-100 flex flex-col gap-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                                <div className="w-3/4 h-8 bg-slate-100 rounded-full"></div>
                                <div className="w-1/2 h-6 bg-slate-100 rounded-full"></div>
                                <div className="mt-auto w-full h-12 bg-slate-50 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <Filter size={14} /> Showing {filteredData.length} Results
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {filteredData.map((item, idx) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group"
                                    >
                                        <Link to={`/placements/detail/${item._id}`}>
                                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[80px] group-hover:bg-emerald-500/10 transition-colors"></div>
                                                
                                                <div>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center p-3 border border-slate-100 group-hover:border-emerald-500/20 transition-colors bg-white shadow-sm overflow-hidden">
                                                            {item.logo ? (
                                                                <img src={getImageUrl(item.logo)} className="w-full h-full object-contain" alt={item.companyName} />
                                                            ) : (
                                                                <Building size={24} className="text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                                                            <Briefcase size={16} />
                                                        </div>
                                                    </div>

                                                    <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">{item.companyName}</h3>
                                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-6 flex items-center gap-1.5 line-clamp-1">
                                                        <Laptop size={12} /> {item.role}
                                                    </p>

                                                     <div className="flex flex-wrap gap-2 mb-8">
                                                        {item.skills && Array.isArray(item.skills) && item.skills.slice(0, 3).map((skill, si) => (
                                                            <span key={si} className="text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-3 py-1 rounded-full border border-slate-100 group-hover:border-emerald-500/10 transition-colors">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {item.skills && item.skills.length > 3 && (
                                                            <span className="text-[9px] font-black text-slate-300 px-2 py-1">+{item.skills.length - 3}</span>
                                                        )}
                                                        {(!item.skills || item.skills.length === 0) && (
                                                             <span className="text-[9px] font-black text-slate-300 px-2 py-1 italic">No skills listed</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex flex-col gap-4">
                                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6 mt-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-bold uppercase text-slate-300 tracking-tighter mb-1">STIPEND</span>
                                                            <p className="text-xs font-black text-slate-700 flex items-center gap-1">
                                                                <DollarSign size={10} className="text-emerald-500" /> {item.stipendOrSalary}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col text-right">
                                                            <span className="text-[8px] font-bold uppercase text-slate-300 tracking-tighter mb-1">DEADLINE</span>
                                                            <p className="text-xs font-black text-slate-700 flex items-center justify-end gap-1">
                                                                <Calendar size={10} className="text-rose-400" /> 
                                                                {item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mt-2">
                                                        <MapPin size={10} /> {item.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredData.length === 0 && (
                            <div className="py-20 text-center">
                                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">No internships matching your query</h3>
                                <p className="text-slate-400 mt-2">Try searching for different skills or companies.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Internships;
