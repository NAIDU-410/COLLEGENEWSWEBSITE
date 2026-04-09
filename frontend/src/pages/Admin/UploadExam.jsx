import React, { useState, useEffect } from 'react';
import { getExams, createExam, updateExam, deleteExam } from '../../services/api';
import { Plus, Trash2, Edit2, Calendar, Layout, Info, Upload, BookOpen, Clock, ChevronRight, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadExam = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(null);
    const [activeMode, setActiveMode] = useState('manual');
    const [formData, setFormData] = useState({
        branch: 'CSE',
        academicYear: 'E1',
        semester: 'Sem 1',
        examType: 'Mid 1',
        mode: 'manual',
        subjects: [{ subjectCode: '', subjectName: '', date: '', month: '', year: '', time: '' }],
        image: null
    });
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');

    const BRANCHES = ['ALL', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const { data } = await getExams();
            setExams(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = () => {
        setFormData({ ...formData, subjects: [...formData.subjects, { subjectCode: '', subjectName: '', date: '', month: '', year: '', time: '' }] });
    };

    const handleRemoveSubject = (idx) => {
        setFormData({ ...formData, subjects: formData.subjects.filter((_, i) => i !== idx) });
    };

    const handleSubjectChange = (idx, field, val) => {
        const newSubjects = [...formData.subjects];
        newSubjects[idx][field] = val;
        setFormData({ ...formData, subjects: newSubjects });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('branch', formData.branch);
        data.append('academicYear', formData.academicYear);
        data.append('semester', formData.semester);
        data.append('examType', formData.examType);
        data.append('mode', activeMode);

        if (activeMode === 'image') {
            if (formData.image) data.append('image', formData.image);
        } else {
            data.append('subjects', JSON.stringify(formData.subjects));
        }

        try {
            if (editingId) {
                await updateExam(editingId, data);
            } else {
                await createExam(data);
            }
            setShowModal(null);
            fetchExams();
            resetForm();
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            branch: 'CSE',
            academicYear: 'E1',
            semester: 'Sem 1',
            examType: 'Mid 1',
            mode: 'manual',
            subjects: [{ subjectCode: '', subjectName: '', date: '', month: '', year: '', time: '' }],
            image: null
        });
        setEditingId(null);
        setActiveMode('manual');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            await deleteExam(id);
            fetchExams();
        }
    };

    const openEdit = (exam) => {
        setEditingId(exam._id);
        setActiveMode(exam.mode);
        setFormData({
            branch: exam.branch,
            academicYear: exam.academicYear,
            semester: exam.semester,
            examType: exam.examType,
            mode: exam.mode,
            subjects: exam.subjects?.length > 0 ? exam.subjects : [{ subjectCode: '', subjectName: '', date: '', month: '', year: '', time: '' }],
            image: null
        });
        setShowModal('edit');
    };

    return (
        <div className="p-4 md:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                            <Calendar size={14} /> Exam Cell Admin
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase">Exam Schedules</h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base">Manage mid-term and semester examination timetables with dual-mode entry.</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal('create'); }}
                        className="flex items-center gap-3 bg-primary text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl transition-all w-full md:w-auto justify-center"
                    >
                        <Plus size={20} /> Create New Schedule
                    </button>
                </header>

                <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by branch or exam type..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-[24px] py-5 pl-16 pr-8 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-[24px] border border-slate-100 w-full md:w-auto">
                        <div className="px-4 py-2 border-r border-slate-200">
                            <Filter size={16} className="text-slate-400" />
                        </div>
                        {BRANCHES.map(branch => (
                            <button
                                key={branch}
                                onClick={() => setActiveFilter(branch)}
                                className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeFilter === branch ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {branch}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-4">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Timetables...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {(() => {
                            const filteredExams = exams.filter(exam => {
                                const branchStr = exam.branch || '';
                                const examTypeStr = exam.examType || '';
                                const searchStr = searchQuery || '';
                                
                                const matchesSearch = 
                                    branchStr.toLowerCase().includes(searchStr.toLowerCase()) || 
                                    examTypeStr.toLowerCase().includes(searchStr.toLowerCase());
                                const matchesFilter = activeFilter === 'ALL' || exam.branch === activeFilter;
                                return matchesSearch && matchesFilter;
                            });

                            if (filteredExams.length > 0) {
                                return filteredExams.map((exam) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={exam._id} 
                                className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-xl transition-all duration-500"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-3/4">
                                    <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center border-2 border-primary/10 shrink-0 group-hover:border-primary/30 transition-colors">
                                        <BookOpen size={32} className="text-primary" />
                                    </div>
                                    <div className="flex flex-col text-center md:text-left overflow-hidden">
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">{exam.branch}</span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{exam.academicYear} • {exam.semester}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${exam.mode === 'image' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {exam.mode} Mode
                                            </span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{exam.examType} Time Table</h3>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5">
                                                <Clock size={12} /> {exam.mode === 'manual' ? `${exam.subjects?.length || 0} Subjects` : 'Image Uploaded'}
                                            </p>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5">
                                                <Info size={12} /> Last Updated: {new Date(exam.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-1/4 justify-between md:justify-end">
                                    <button 
                                        onClick={() => openEdit(exam)} 
                                        className="flex-1 md:flex-none justify-center bg-slate-50 text-slate-500 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white hover:shadow-lg transition-all flex items-center gap-2"
                                    >
                                        <Edit2 size={14} /> Manage
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(exam._id)} 
                                        className="w-12 h-12 md:w-14 md:h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white hover:shadow-lg transition-all shadow-sm"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    } else {
                                return (
                                    <div className="bg-white p-20 rounded-[48px] text-center border-2 border-dashed border-slate-200">
                                        <Layout size={64} className="mx-auto text-slate-200 mb-6" />
                                        <h2 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">
                                            {searchQuery || activeFilter !== 'ALL' ? 'No Matching Schedules' : 'No Schedules Found'}
                                        </h2>
                                        <p className="text-slate-400 mt-2">
                                            {searchQuery || activeFilter !== 'ALL' ? 'Try adjusting your filters or search query.' : 'Start by creating a new examination timetable.'}
                                        </p>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                )}
            </div>

            {/* Modal for Create/Edit */}
            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center p-8 md:p-10 border-b border-slate-100 bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter">
                                        {editingId ? 'Edit Exam Schedule' : 'New Exam Schedule'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure Exam Details & Mode</p>
                                </div>
                                <button onClick={() => setShowModal(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:rotate-90 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-6">
                                        <h3 className="text-xs font-black uppercase tracking-[3px] text-primary flex items-center gap-2">
                                            <div className="w-6 h-[2px] bg-primary"></div> Exam Context
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Branch</label>
                                                <select
                                                    value={formData.branch}
                                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none cursor-pointer focus:border-primary/30 transition-colors"
                                                >
                                                    <option>CSE</option><option>ECE</option><option>EEE</option><option>MECH</option><option>CIVIL</option><option>IT</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Academic Year</label>
                                                <select
                                                    value={formData.academicYear}
                                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none cursor-pointer focus:border-primary/30 transition-colors"
                                                >
                                                    <option>E1</option><option>E2</option><option>E3</option><option>E4</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Semester</label>
                                                <select
                                                    value={formData.semester}
                                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none cursor-pointer focus:border-primary/30 transition-colors"
                                                >
                                                    <option>Sem 1</option><option>Sem 2</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Exam Type</label>
                                                <select
                                                    value={formData.examType}
                                                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none cursor-pointer focus:border-primary/30 transition-colors"
                                                >
                                                    <option>Mid 1</option><option>Mid 2</option><option>Mid 3</option><option>Semester Exam</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <h3 className="text-xs font-black uppercase tracking-[3px] text-primary flex items-center gap-2">
                                            <div className="w-6 h-[2px] bg-primary"></div> Input Mode
                                        </h3>
                                        
                                        <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setActiveMode('manual')}
                                                className={`flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeMode === 'manual' ? 'bg-white text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Manual Entry
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveMode('image')}
                                                className={`flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeMode === 'image' ? 'bg-white text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Image Upload
                                            </button>
                                        </div>

                                        {activeMode === 'image' ? (
                                            <div className="flex flex-col gap-4">
                                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Upload Timetable Image</label>
                                                <div className="relative group/upload h-full min-h-[140px]">
                                                    <input 
                                                        type="file" 
                                                        onChange={e => setFormData({ ...formData, image: e.target.files[0] })} 
                                                        className="absolute inset-0 opacity-0 z-10 cursor-pointer" 
                                                    />
                                                    <div className="bg-slate-50 absolute inset-0 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 transition-all group-hover/upload:border-primary/40 group-hover/upload:bg-primary/5">
                                                        <Upload size={32} className="text-slate-300 group-hover/upload:text-primary transition-colors" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/upload:text-primary">
                                                            {formData.image ? formData.image.name : 'Choose JPG/PNG File'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Manual Mode Active</p>
                                                    <p className="text-[10px] font-medium text-slate-500 mt-1">Subjects data will be stored as a structured list for students.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {activeMode === 'manual' && (
                                    <div className="flex flex-col gap-8 mt-12">
                                        <div className="flex justify-between items-center bg-white sticky top-0 z-10 py-2">
                                            <h3 className="text-xs font-black uppercase tracking-[3px] text-primary flex items-center gap-2">
                                                <div className="w-6 h-[2px] bg-primary"></div> Subjects Database
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={handleAddSubject}
                                                className="bg-primary text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                                            >
                                                <Plus size={14} /> Add Subject
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {formData.subjects.map((sub, idx) => (
                                                <motion.div 
                                                    layout
                                                    key={idx} 
                                                    className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col gap-6 relative group/sub hover:border-primary/20 transition-all"
                                                >
                                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                                        <div className="flex flex-col gap-2 lg:col-span-2">
                                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Subject Name</label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    value={sub.subjectName}
                                                                    onChange={(e) => handleSubjectChange(idx, 'subjectName', e.target.value)}
                                                                    className="w-full bg-white p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors"
                                                                    placeholder="e.g. Engineering Mathematics-I"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Date (Day Month)</label>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        value={sub.date}
                                                                        onChange={(e) => handleSubjectChange(idx, 'date', e.target.value)}
                                                                        className={`w-1/3 bg-white p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors ${sub.isUpdated ? 'text-emerald-600' : ''}`}
                                                                        placeholder="25"
                                                                    />
                                                                    <input
                                                                        value={sub.month}
                                                                        onChange={(e) => handleSubjectChange(idx, 'month', e.target.value)}
                                                                        className={`w-2/3 bg-white p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors ${sub.isUpdated ? 'text-emerald-600' : ''}`}
                                                                        placeholder="March"
                                                                    />
                                                                </div>
                                                                {sub.isUpdated && (
                                                                    <span className="text-[9px] font-bold text-rose-400 line-through px-2">Was: {sub.oldDate}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Time Range</label>
                                                            <div className="flex flex-col gap-1">
                                                                <input
                                                                    value={sub.time}
                                                                    onChange={(e) => handleSubjectChange(idx, 'time', e.target.value)}
                                                                    className={`w-full bg-white p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors ${sub.isUpdated ? 'text-emerald-600' : ''}`}
                                                                    placeholder="10:00 AM - 1:00 PM"
                                                                />
                                                                {sub.isUpdated && (
                                                                    <span className="text-[9px] font-bold text-rose-400 line-through px-2">Was: {sub.oldTime}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Subject Code</label>
                                                            <input
                                                                value={sub.subjectCode || ''}
                                                                onChange={(e) => handleSubjectChange(idx, 'subjectCode', e.target.value)}
                                                                className="w-full bg-white p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors uppercase"
                                                                placeholder="e.g. CS101"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Year</label>
                                                            <input
                                                                value={sub.year || ''}
                                                                onChange={(e) => handleSubjectChange(idx, 'year', e.target.value)}
                                                                className="w-full bg-white p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-primary/30 transition-colors"
                                                                placeholder="2024"
                                                            />
                                                        </div>
                                                        <div className="invisible md:visible"></div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSubject(idx)}
                                                            className="h-full bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center p-4 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    {sub.isUpdated && (
                                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Updated</div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-12 pb-10">
                                    <button 
                                        type="submit" 
                                        className="w-full bg-primary text-white py-6 rounded-3xl font-black uppercase text-sm tracking-[4px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] active:scale-[0.99] transition-all sticky bottom-0 z-10"
                                    >
                                        {editingId ? 'Update Timetable' : 'Publish Timetable'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadExam;
