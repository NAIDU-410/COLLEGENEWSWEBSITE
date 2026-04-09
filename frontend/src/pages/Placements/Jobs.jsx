import React, { useState, useEffect } from 'react';
import { getPlacements } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building, Calendar, DollarSign, ChevronRight, Filter, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const { data } = await getPlacements();
            setJobs(data);
            
            // Default to placement if on jobs page
            setFilterType('PLACEMENT');
            const initialFiltered = data.filter(item => item.type === 'Placement');
            setFilteredData(initialFiltered);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters(searchTerm, filterType);
    }, [searchTerm, filterType, jobs]);

    const applyFilters = (search, type) => {
        const sValue = search.toLowerCase();
        const filtered = jobs.filter(item => {
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
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase">Full-Time Jobs</h1>
                        <p className="text-slate-500 font-medium">Elevate your career with high-package placement opportunities.</p>
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
                            <div key={i} className="bg-white rounded-[40px] p-8 h-80 animate-pulse border border-slate-100 flex flex-col gap-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                                <div className="w-3/4 h-8 bg-slate-100 rounded-full"></div>
                                <div className="w-1/2 h-6 bg-slate-100 rounded-full"></div>
                                <div className="mt-auto w-full h-12 bg-primary/5 rounded-xl"></div>
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
                                            <div className="bg-white rounded-[48px] p-8 shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.15)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] group-hover:bg-primary/10 transition-colors"></div>
                                                
                                                <div>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center p-4 border border-slate-100 group-hover:border-primary/20 shadow-sm transition-all overflow-hidden">
                                                            {item.logo ? (
                                                                <img src={getImageUrl(item.logo)} className="w-full h-full object-contain" alt={item.companyName} />
                                                            ) : (
                                                                <Building size={32} className="text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div className="bg-primary/5 text-primary p-3 rounded-2xl">
                                                            <Target size={20} />
                                                        </div>
                                                    </div>

                                                    <h3 className="text-3xl font-black text-slate-800 mb-1 group-hover:text-primary transition-colors tracking-tight">{item.companyName}</h3>
                                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-6 flex items-center gap-1.5">
                                                        <Award size={12} /> {item.role}
                                                    </p>

                                                     <div className="flex flex-wrap gap-2 mb-8">
                                                        {item.skills && Array.isArray(item.skills) && item.skills.slice(0, 3).map((skill, si) => (
                                                            <span key={si} className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-primary px-3 py-1 rounded-full border border-blue-100 group-hover:bg-primary group-hover:text-white transition-all duration-300">
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

                                                <div className="mt-auto">
                                                    <div className="bg-slate-50 p-6 rounded-[32px] group-hover:bg-primary/5 transition-colors">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Expected Package</span>
                                                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Deadline</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-lg font-black text-slate-800 flex items-center gap-1.5">
                                                                <DollarSign size={16} className="text-primary" /> {item.stipendOrSalary}
                                                            </p>
                                                            <div className="flex flex-col items-end">
                                                                <p className="text-xs font-black text-rose-500 flex items-center gap-1">
                                                                    <Calendar size={12} /> 
                                                                    {item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Open'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-4 px-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                                        <MapPin size={12} /> {item.location}
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
                                <Building size={64} className="mx-auto text-slate-200 mb-6" />
                                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">No jobs found</h3>
                                <p className="text-slate-400 mt-2">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Jobs;
