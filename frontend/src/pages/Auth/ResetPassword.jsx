import React, { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../services/api';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!otp || otp.length < 5) {
            setError('Please enter a valid OTP.');
            return;
        }

        setLoading(true);

        try {
            const { data } = await resetPassword(token, { otp, password });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : 'Invalid token or OTP. Please try again or request a new reset link.'
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-slate-50 border-2 border-slate-100 py-4 pl-16 pr-12 rounded-xl outline-none focus:border-primary/40 focus:bg-white transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-300";

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
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Reset Password</h1>
                        <p className="text-gray-500 font-medium text-sm mt-2">Enter the OTP sent to your email and your new password.</p>
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

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Reset OTP</label>
                            <div className="group relative">
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Enter OTP from email"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">New Password</label>
                            <div className="group relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Confirm New Password</label>
                            <div className="group relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !!message}
                            className="bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Resetting...' : 'Reset My Password'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="flex items-center justify-center mt-2">
                        <NavLink to="/login" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest text-[10px]">
                            Cancel
                        </NavLink>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
