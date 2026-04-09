import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans selection:bg-primary selection:text-white transition-colors duration-300 overflow-x-hidden">
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar />

            <main className="flex-grow w-full relative pt-20">
                {/* Page transitions wrapper */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="w-full h-full min-h-[70vh]"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>

                {/* Background Decorative patterns */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10 mt-[-200px] mr-[-300px]" />
                <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[200px] -z-10 mb-[-400px] ml-[-400px]" />
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
