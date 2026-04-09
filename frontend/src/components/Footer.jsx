import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Instagram, Linkedin, Youtube, Facebook, Globe } from 'lucide-react';
import { getFooter, getSocialMedia, getBranding } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import XIcon from './XIcon';


const PLATFORM_MAP = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: XIcon,
    x: XIcon,
    youtube: Youtube,
    linkedin: Linkedin,
    website: Globe,
    globe: Globe,
};

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [footer, setFooter] = useState(null);
    const [socialLinks, setSocialLinks] = useState([]);
    const [branding, setBranding] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const [footerRes, socialRes, brandingRes] = await Promise.all([
                    getFooter(),
                    getSocialMedia(),
                    getBranding()
                ]);
                setFooter(footerRes.data);
                setSocialLinks(socialRes.data);
                setBranding(brandingRes.data);
            } catch (error) {
                console.error("Failed to fetch footer data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFooterData();
    }, []);

    const logoUrl = branding ? getImageUrl(branding.logo || branding.navbarLogo) : null;

    const collegeName = branding?.collegeName || 'College News';
    const description = footer?.description || 'Empowering students with real-time news, academic updates, and campus achievements.';
    const copyright = footer?.copyright || `© ${currentYear} ${collegeName}. All Rights Reserved.`;
    const sections = footer?.sections || [];

    return (
        <footer className="bg-slate-900 text-white relative pt-16 pb-8 overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-400 to-primary z-10" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-white/10 pb-12 ${sections.length > 0 ? `lg:grid-cols-${Math.min(sections.length + 2, 5)}` : 'lg:grid-cols-3'}`}>
                    {/* Logo & Info Column */}
                    <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300 shadow-xl shadow-blue-500/20 overflow-hidden p-1">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                                ) : (
                                    <Rocket className="text-primary w-7 h-7" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black text-white tracking-tight leading-none uppercase">{collegeName}</span>
                                <span className="text-[10px] text-blue-300 font-bold tracking-widest uppercase mt-1">Official University Portal</span>
                            </div>
                        </Link>
                        <p className="text-blue-100/70 text-sm leading-relaxed max-w-xs font-medium">{description}</p>

                        {/* Social Icons */}
                        {socialLinks.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {socialLinks.map((social) => {
                                    const platformKey = (social.name || social.platform || social.icon || '').toLowerCase();
                                    const SocialIcon = PLATFORM_MAP[platformKey];
                                    return (
                                        <a
                                            key={social._id}
                                            href={social.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all duration-300 hover:-translate-y-1 shadow-md border border-white/10"
                                            title={social.name || social.platform}
                                        >
                                            {SocialIcon
                                                ? <SocialIcon size={16} />
                                                : <span className="text-xs font-black text-white">{(social.name || social.platform || 'S')[0].toUpperCase()}</span>
                                            }
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Dynamic Section Links */}
                    {sections.map((section) => (
                        <div key={section._id || section.title} className="flex flex-col gap-5">
                            <h3 className="text-sm font-black text-white tracking-widest uppercase border-l-4 border-primary pl-4">{section.title}</h3>
                            <ul className="flex flex-col gap-3">
                                {(section.links || []).map((link, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={link.url}
                                            target={link.url?.startsWith('http') ? '_blank' : '_self'}
                                            rel="noreferrer"
                                            className="text-blue-100/60 hover:text-white transition-all text-sm font-medium hover:translate-x-2 inline-block"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>


                {/* Bottom copyright */}
                <div className="flex flex-col items-center justify-center py-8 text-center max-w-4xl mx-auto">
                    <p className="text-xs text-blue-100/40 font-bold uppercase tracking-[0.2em] leading-relaxed">
                        {copyright}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
