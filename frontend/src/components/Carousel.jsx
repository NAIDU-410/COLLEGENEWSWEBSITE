import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/imageUrl';

const SLIDE_DURATION = 3000; // ms per slide

const Carousel = ({ items = [] }) => {
    const [current, setCurrent] = useState(0);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const progressRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    const total = items.length;

    // ── Go to slide ────────────────────────────────────────────────
    const goTo = useCallback((idx) => {
        setCurrent((idx + total) % total);
        setProgress(0);
        startTimeRef.current = Date.now();
    }, [total]);

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    // ── Auto-play interval ─────────────────────────────────────────
    useEffect(() => {
        intervalRef.current = setInterval(next, SLIDE_DURATION);
        return () => clearInterval(intervalRef.current);
    }, [next]);

    // ── Progress bar animation ─────────────────────────────────────
    useEffect(() => {
        setProgress(0);
        startTimeRef.current = Date.now();

        const tick = () => {
            const elapsed = Date.now() - startTimeRef.current;
            setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
            progressRef.current = requestAnimationFrame(tick);
        };
        progressRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(progressRef.current);
    }, [current]);

    // ── Keyboard nav ───────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [prev, next]);

    if (!items.length) return null;

    const item = items[current];

    return (
        <div
            className="relative w-full overflow-hidden bg-slate-900"
            style={{ height: '65vh', maxHeight: '620px', minHeight: '380px' }}
        >
            {/* ── Slides ───────────────────────────────────────────── */}
            <AnimatePresence mode="sync">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    className="absolute inset-0"
                >
                    {/* Background image */}
                    <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Slide content */}
                    <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 lg:px-28 xl:px-40">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                            className="max-w-4xl flex flex-col gap-7"
                        >
                            {/* Category label */}
                            <div className="flex items-center gap-3 text-blue-300 font-black tracking-[0.35em] uppercase text-xs">
                                <span className="w-10 h-[3px] bg-blue-400 rounded-full" />
                                {item.category || 'Announcement'}
                            </div>

                            {/* Title */}
                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter drop-shadow-2xl">
                                {item.title}
                            </h1>

                            {/* Description */}
                            <p className="text-lg md:text-xl text-blue-100/80 font-medium leading-relaxed max-w-2xl drop-shadow-lg">
                                {item.description}
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-4 mt-2">
                                <Link
                                    to={item.link || '/about'}
                                    className="px-9 py-5 bg-white text-primary font-black rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 shadow-2xl flex items-center gap-3 hover:-translate-y-1 uppercase tracking-widest text-sm"
                                >
                                    Explore <ArrowRight className="w-5 h-5" />
                                </Link>
                                <div className="flex items-center gap-3 text-white/60 font-bold uppercase tracking-widest text-[11px] bg-white/10 backdrop-blur-md px-6 py-5 rounded-2xl border border-white/10">
                                    <Calendar className="w-4 h-4 text-blue-300" />
                                    {item.date || 'March 2024'}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ── Prev / Next arrows ───────────────────────────────── */}
            <button
                onClick={prev}
                className="absolute left-5 md:left-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all duration-300 shadow-2xl group"
                aria-label="Previous Slide"
            >
                <ChevronLeft className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>
            <button
                onClick={next}
                className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all duration-300 shadow-2xl group"
                aria-label="Next Slide"
            >
                <ChevronRight className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>

            {/* ── Bottom HUD: dots + progress + counter + play/pause ── */}
            <div className="absolute bottom-0 left-0 right-0 z-30 px-6 md:px-16 pb-6 flex flex-col gap-4">

                {/* Auto-scroll progress bar */}
                <div className="w-full h-[3px] bg-white/15 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white rounded-full transition-none"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2">
                        {items.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`rounded-full transition-all duration-400 ${i === current
                                    ? 'w-8 h-2.5 bg-white'
                                    : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Slide number pill (top-right) ─────────────────────── */}
            <div className="absolute top-8 right-8 z-30 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 hidden md:flex items-center gap-2 text-white/60 font-black text-xs uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                {item.category || 'News'}
            </div>
        </div>
    );
};

export default Carousel;
