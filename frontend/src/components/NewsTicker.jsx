import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const newsItems = [
    { text: '🏏 Cricket Team Wins Inter-University Gold — Finals vs NIT Delhi', link: '/sports/cricket' },
    { text: '📋 Mid-Term Exam Schedule Released — E1 & E2 Students', link: '/exams/e1' },
    { text: '💼 TCS, Infosys & Wipro Campus Drive — Register Before March 20', link: '/placements' },
    { text: '🏆 Smart India Hackathon 2024 — Our Team Clinches 1st Place Nationally', link: '/achievements' },
    { text: '🎭 Cultural Fest "Artika 2024" — March 25-27, All Students Welcome', link: '/events' },
    { text: '🔬 IEEE Research Paper Accepted — Prof. Suresh & Students at Singapore Conference', link: '/achievements' },
    { text: '🏀 Women Basketball Team — State-Level Silver Trophy Secured', link: '/sports/basketball' },
    { text: '📚 Semester Exam Time-Table (E3 & E4) — Check Now', link: '/exams/e3' },
    { text: '🚀 Pixel Club Workshop: UI/UX Design Bootcamp — March 22, Registrations Open', link: '/clubs/pixel' },
    { text: '🌐 Google Summer of Code 2024 — 3 Students Selected from Our College', link: '/achievements' },
];

const NewsTicker = () => {
    // Duplicate for seamless looping
    const doubled = [...newsItems, ...newsItems];

    return (
        <div className="bg-red-600 text-white flex items-stretch overflow-hidden relative z-30" style={{ height: '40px' }}>
            {/* URGENT label */}
            <div className="flex items-center gap-2 bg-red-800 px-4 shrink-0 z-10 shadow-xl">
                <Zap size={14} className="animate-pulse" />
                <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">URGENT</span>
            </div>

            {/* Scrolling area */}
            <div className="overflow-hidden flex-1 relative flex items-center">
                <div
                    className="flex gap-0 whitespace-nowrap"
                    style={{
                        animation: 'tickerScroll 45s linear infinite',
                    }}
                >
                    {doubled.map((item, i) => (
                        <Link
                            key={i}
                            to={item.link}
                            className="inline-flex items-center gap-3 hover:text-yellow-300 transition-colors group"
                            style={{ paddingRight: '80px' }}
                        >
                            <span className="text-red-300 text-xs">◆</span>
                            <span className="text-xs font-semibold group-hover:underline">{item.text}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes tickerScroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default NewsTicker;
