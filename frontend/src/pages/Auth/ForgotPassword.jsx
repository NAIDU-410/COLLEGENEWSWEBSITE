import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { forgotPassword } from '../../services/api';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [devLink, setDevLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { data } = await forgotPassword({ email: email.toLowerCase() });
            setMessage(data.message || 'Password reset link sent to your email.');
            if (data.resetToken) {
                setDevLink(`/reset-password/${data.resetToken}`);
            }
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : 'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 relative overflow-hidden bg-slate-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 z-10 p-10"
            >
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Forgot Password</h1>
                        <p className="text-gray-500 font-medium text-sm mt-2">Enter your verified email address to receive a password reset OTP and secure link.</p>
                    </div>

                    {message && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-2xl flex items-start gap-3 border border-green-100 text-sm font-bold">
                            <CheckCircle size={18} className="mt-0.5 shrink-0" /> {message}
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 text-sm font-semibold">
                            <AlertCircle size={17} className="mt-0.5 shrink-0" /> {error}
                        </div>
                    )}

                    {devLink && message.includes('Bypass') && (
                        <div className="bg-blue-50 text-blue-600 p-5 rounded-2xl flex flex-col gap-3 border border-blue-200">
                            <p className="text-sm font-bold">Network Blocked. DEV Testing Mode Active:</p>
                            <NavLink to={devLink} className="bg-blue-600 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest text-center shadow-lg hover:bg-blue-700 transition">
                                PROCEED TO RESET PAGE
                            </NavLink>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Account Email</label>
                            <div className="group relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="email"
                                    placeholder="Enter your student email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 py-4 pl-16 pr-8 rounded-2xl outline-none focus:border-primary/40 focus:bg-white transition-all text-sm font-semibold placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !!message}
                            className="bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="flex items-center justify-center mt-4">
                        <NavLink to="/login" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest text-[10px]">
                            <ArrowLeft size={16} /> Back to Login
                        </NavLink>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
