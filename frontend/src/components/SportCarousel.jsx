import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const SportCarousel = ({ items = [] }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!items || items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % items.length);
        }, 5000); // 5 second auto-scroll
        return () => clearInterval(timer);
    }, [items?.length]);

    if (!items.length) return null;

    return (
        <div className="relative w-full h-[400px] rounded-[60px] overflow-hidden group shadow-2xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = offset.x;
                        if (swipe < -50) setCurrent(prev => (prev + 1) % items.length);
                        else if (swipe > 50) setCurrent(prev => (prev - 1 + items.length) % items.length);
                    }}
                >
                    <img
                        src={getImageUrl(items[current].image)}
                        className="w-full h-full object-cover"
                        alt={items[current].title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    <div className="absolute inset-x-12 bottom-12 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                                <Trophy className="text-primary w-5 h-5 shadow-2xl" />
                            </div>
                            <span className="text-blue-300 font-black tracking-[0.4em] uppercase text-[10px]">Victory Record</span>
                        </div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight italic">
                            {items[current].title}
                        </h3>
                        <p className="text-blue-100/60 font-bold uppercase tracking-widest text-xs">
                            {items[current].year} • CHAMPIONSHIP HIGHLIGHT
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            {items.length > 1 && (
                <>
                    <button 
                        onClick={() => setCurrent(prev => (prev - 1 + items.length) % items.length)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={() => setCurrent(prev => (prev + 1) % items.length)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {items.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${current === i ? 'w-8 bg-primary' : 'w-2 bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default SportCarousel;
