import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { register as registerApi, verifyEmail } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [devOtp, setDevOtp] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (step === 2) {
            return handleVerify(e);
        }

        // Basic validations
        if (formData.name.trim().length < 2) {
            setError('Please enter your full name (at least 2 characters).');
            return;
        }
        if (!/^\d{10}$/.test(formData.phoneNumber)) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match. Please re-enter.');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            const { data } = await registerApi({
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phoneNumber: formData.phoneNumber.trim(),
                password: formData.password,
            });
            setMessage(data.message || 'OTP sent successfully!');
            if (data.devOtp) setDevOtp(data.devOtp);
            setStep(2);
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : 'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!otp || otp.length < 5) {
           setError('Please enter a valid OTP.');
           return;
        }

        setLoading(true);
        try {
            const { data } = await verifyEmail({ email: formData.email.trim().toLowerCase(), otp });
            login(data);
            navigate('/', { replace: true });
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : 'Verification failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-slate-50 border-2 border-slate-100 py-5 pl-16 pr-12 rounded-2xl outline-none focus:border-primary/40 focus:bg-white transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-300";

    return (
        <div className="min-h-[90vh] flex items-center justify-center py-20 px-4 relative overflow-hidden bg-slate-50">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -mr-[400px] -mt-[400px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] -ml-[300px] -mb-[300px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 z-10"
            >
                {/* ── Left panel ── */}
                <div className="hidden lg:flex flex-col justify-between bg-primary p-20 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/30 opacity-50 backdrop-blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col gap-10">
                        <div className="flex items-center gap-4 group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
                                <img src="/rgukt-logo.png" alt="RGUKT" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tight uppercase leading-none">RGUKT Ongole</span>
                                <span className="text-[10px] text-blue-200 font-bold tracking-widest uppercase mt-1">Official Portal</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 max-w-sm">
                            <h2 className="text-4xl font-black leading-tight tracking-tight mt-10">
                                Start Your <span className="text-blue-300 underline decoration-wavy decoration-2 underline-offset-8">Academic Journey</span>
                            </h2>
                            <p className="text-blue-100/70 font-medium leading-relaxed">
                                Join thousands of students already using the platform for real-time news, exam schedules and placement resources.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col gap-5 mt-20">
                        {['Verified Academic Credentials', 'Exclusive Placement Resources', 'Exam Schedule Access', 'Personalized Event Feed'].map(item => (
                            <div key={item} className="flex items-center gap-4 text-blue-100/80 font-bold text-sm">
                                <CheckCircle className="text-blue-400 w-5 h-5 flex-shrink-0" /> {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Form ── */}
                <div className="p-10 md:p-16 flex flex-col justify-center">
                    <div className="flex flex-col gap-7">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-black text-gray-800 tracking-tight">Create Profile</h1>
                            <p className="text-gray-500 font-medium text-sm">Fill in your details to get started.</p>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl flex items-start gap-3 border border-red-100 text-sm font-semibold">
                                <AlertCircle size={17} className="mt-0.5 shrink-0" /> {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-2xl flex items-start gap-3 border border-green-100 text-sm font-semibold mb-4">
                                <CheckCircle size={17} className="mt-0.5 shrink-0" /> {message}
                            </div>
                        )}

                        {devOtp && (
                            <div className="bg-blue-50 text-blue-700 px-4 py-4 rounded-2xl flex flex-col gap-2 border border-blue-200 text-sm mb-2">
                                <p className="font-black uppercase tracking-widest text-xs">Email blocked by server. Use this OTP:</p>
                                <p className="text-3xl font-black tracking-[0.4em] text-blue-800">{devOtp}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {step === 1 ? (
                                <>
                                    {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Full Name</label>
                                <div className="group relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Ganesh Kumar"
                                        required
                                        value={formData.name}
                                        onChange={handleChange('name')}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Official Email</label>
                                <div className="group relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="email"
                                        placeholder="student@rgukt.ac.in"
                                        required
                                        value={formData.email}
                                        onChange={handleChange('email')}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Phone Number</label>
                                <div className="group relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        required
                                        maxLength={10}
                                        value={formData.phoneNumber}
                                        onChange={handleChange('phoneNumber')}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Password</label>
                                <div className="group relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        required
                                        value={formData.password}
                                        onChange={handleChange('password')}
                                        className={inputClass}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Confirm Password</label>
                                <div className="group relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange('confirmPassword')}
                                        className={inputClass}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            </>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Verification OTP</label>
                                    <div className="group relative">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Enter OTP sent to email"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium ml-1 mt-1">We securely emailed a one-time passcode to <span className="text-primary font-bold">{formData.email}</span></p>
                                </div>
                            )}

                             <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (step === 1 ? 'Creating Profile...' : 'Verifying...') : (step === 1 ? 'Create Profile' : 'Verify Account')} <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="flex items-center gap-4">
                            <div className="h-px flex-grow bg-slate-100" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Already enrolled?</span>
                            <div className="h-px flex-grow bg-slate-100" />
                        </div>

                        <NavLink
                            to="/login"
                            className="group flex items-center justify-center gap-4 bg-slate-900 border border-slate-800 text-white py-5 rounded-2xl transition-all hover:bg-black uppercase text-[10px] font-black tracking-widest shadow-xl"
                        >
                            Back to Login <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </NavLink>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
