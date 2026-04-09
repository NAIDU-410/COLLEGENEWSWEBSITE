import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    Edit2, 
    Trash2, 
    Shield, 
    Mail, 
    Phone, 
    X, 
    Check,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../services/api';

const AdminManagementCard = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: ''
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await getAdmins();
            setAdmins(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phoneNumber: ''
        });
        setIsEditing(false);
        setSelectedAdminId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isEditing) {
                await updateAdmin(selectedAdminId, formData);
                setSuccess('Admin updated successfully');
            } else {
                await createAdmin(formData);
                setSuccess('New admin added successfully');
            }
            resetForm();
            fetchAdmins();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (admin) => {
        setFormData({
            name: admin.name,
            email: admin.email,
            phoneNumber: admin.phoneNumber,
            password: '' // Don't pre-fill password for editing
        });
        setIsEditing(true);
        setSelectedAdminId(admin._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) return;

        setActionLoading(true);
        try {
            await deleteAdmin(id);
            setSuccess('Admin deleted successfully');
            fetchAdmins();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && admins.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 flex flex-col gap-8">
            {/* Header section */}
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    <Shield className="text-primary" /> Admin Management
                </h2>
                <p className="text-slate-500 font-medium">Create and manage administrative accounts for the campus portal.</p>
            </div>

            {/* Notifications */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 text-red-700"
                    >
                        <AlertCircle size={20} />
                        <span className="font-bold">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
                    </motion.div>
                )}
                {success && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-center gap-3 text-emerald-700"
                    >
                        <Check size={20} />
                        <span className="font-bold">{success}</span>
                        <button onClick={() => setSuccess(null)} className="ml-auto"><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Card */}
                <motion.div 
                    layout
                    className="lg:col-span-4 bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 sticky top-10"
                >
                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        {isEditing ? <Edit2 size={20} /> : <UserPlus size={20} />}
                        {isEditing ? 'Update Admin' : 'Add New Admin'}
                    </h3>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                            <input 
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="bg-slate-50 border-2 border-slate-100 px-5 py-3 rounded-2xl outline-none focus:border-primary/20 font-bold transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border-2 border-slate-100 pl-12 pr-5 py-3 rounded-2xl outline-none focus:border-primary/20 font-bold transition-all"
                                    placeholder="admin@college.com"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                                Password {isEditing && <span className="text-[10px] text-slate-300 lowercase font-medium">(Leave blank to keep current)</span>}
                            </label>
                            <input 
                                required={!isEditing}
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="bg-slate-50 border-2 border-slate-100 px-5 py-3 rounded-2xl outline-none focus:border-primary/20 font-bold transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    required
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border-2 border-slate-100 pl-12 pr-5 py-3 rounded-2xl outline-none focus:border-primary/20 font-bold transition-all"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button 
                                type="submit" 
                                disabled={actionLoading}
                                className="flex-grow bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Update Admin' : 'Add Admin')}
                            </button>
                            {isEditing && (
                                <button 
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-slate-100 text-slate-500 font-bold px-6 rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>

                {/* List Table */}
                <div className="lg:col-span-8 bg-white rounded-[32px] overflow-hidden shadow-xl border border-slate-100">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Users size={20} /> Administrators
                        </h3>
                        <span className="bg-primary/10 text-primary text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                            Total: {admins.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Info</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {admins.map((admin) => (
                                    <motion.tr 
                                        layout
                                        key={admin._id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black uppercase text-sm">
                                                    {admin.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{admin.name}</span>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Admin Role</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <Mail size={12} className="text-slate-300" /> {admin.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <Phone size={12} className="text-slate-300" /> {admin.phoneNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(admin)}
                                                    className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(admin._id)}
                                                    className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {admins.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-20 text-center text-slate-400 font-bold">
                                            No administrator accounts found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminManagementCard;
