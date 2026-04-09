import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Card = ({
    title,
    subtitle,
    image,
    link,
    date,
    author,
    category,
    badge,
    description,
    variant = 'default',
    index = 0,
    children
}) => {
    const fadeInVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.1, ease: "easeOut" } }
    };

    if (variant === 'simple') {
        return (
            <motion.div
                variants={fadeInVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative h-[300px] rounded-[40px] overflow-hidden group shadow-2xl hover:shadow-primary/20 transition-all duration-500"
            >
                {image ? (
                    <>
                        <img 
                            src={image} 
                            alt={title} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = 'https://placehold.co/800x600/1e293b/ffffff?text=Image+Unavailable'; 
                            }} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent group-hover:via-primary/40 transition-colors duration-500" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                         <div className="text-white/10 font-black text-2xl uppercase tracking-widest">No Image</div>
                    </div>
                )}

                <div className="absolute inset-0 p-8 flex flex-col justify-end gap-3 z-10 text-left">
                    <div className="flex items-center gap-4">
                        {children}
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{title}</h3>
                    </div>
                    <p className="text-white/70 text-sm font-medium leading-relaxed line-clamp-2">{description}</p>

                    {link && (
                        <NavLink
                            to={link}
                            className="mt-4 w-fit bg-white text-slate-900 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-xl"
                        >
                            Explore <ArrowRight size={14} />
                        </NavLink>
                    )}
                </div>
            </motion.div>
        );
    }

    if (variant === 'achievement') {
        return (
            <motion.div
                variants={fadeInVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="card group hover:-translate-y-4"
            >
                <div className="relative overflow-hidden aspect-square">
                    <img src={image || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=687&auto=format&fit=crop'} alt={title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                        <h4 className="text-white text-lg font-bold mb-1">{title}</h4>
                        <p className="text-blue-100 text-sm font-semibold">{subtitle}</p>
                    </div>
                </div>
                <div className="p-8 flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">{category}</span>
                        <span className="text-xs text-gray-400 font-bold">{date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2">{description}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="card group flex flex-col hover:-translate-y-2 cursor-pointer"
        >
            <div className="relative overflow-hidden aspect-video">
                <img 
                    src={image || 'https://placehold.co/800x450/1e293b/ffffff?text=Image+Unavailable'} 
                    alt={title} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-125 transition-transform duration-[2000ms] ease-out" 
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = 'https://placehold.co/800x450/1e293b/ffffff?text=Image+Unavailable'; 
                    }} 
                />
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-lg shadow-2xl tracking-widest uppercase">
                        {badge || 'LATEST'}
                    </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-40 transition-opacity group-hover:opacity-60 duration-500" />
            </div>

            <div className="p-8 flex flex-col flex-grow bg-white relative z-20">
                <div className="flex items-center gap-6 mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {date}</div>
                    <div className="flex items-center gap-1.5"><User size={14} className="text-primary" /> {author}</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 leading-tight mb-4 group-hover:text-primary transition-all duration-300">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3 mb-6">
                    {description}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between group-hover:border-primary/20 transition-colors">
                    <NavLink to={link} className="text-primary font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all">
                        Read Story <ArrowRight size={14} />
                    </NavLink>
                </div>
            </div>
        </motion.div>
    );
};

export default Card;
