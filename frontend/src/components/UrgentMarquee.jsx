import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUpcomingEvents } from '../services/api';

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const UrgentMarquee = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try { const { data } = await getUpcomingEvents(); setEvents(data); }
            catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
        const t = setInterval(load, 5 * 60 * 1000);
        return () => clearInterval(t);
    }, []);

    const go = (ev) => {
        const sub = (ev.subcategory || '').toLowerCase().replace(/\s+/g, '-');
        if (ev.eventType === 'sports') navigate(`/sports/${sub}/${ev._id}`);
        else if (ev.eventType === 'clubs') navigate(`/clubs/${sub}/${ev._id}`);
        else navigate(`/events/${ev._id}`);
    };

    if (loading) return null;

    /* ── No events ── */
    if (events.length === 0) return (
        <div style={{
            display: 'flex', alignItems: 'stretch', height: 38,
            fontFamily: 'inherit',
        }}>
            {/* Red label */}
            <div style={{
                background: '#dc2626',
                display: 'flex', alignItems: 'center',
                padding: '0 18px', gap: 8, flexShrink: 0,
            }}>
                <span style={{
                    color: 'white', fontWeight: 900, fontSize: 11,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                }}>⚡ URGENT</span>
            </div>
            {/* Dark band */}
            <div style={{
                flex: 1, background: '#0f172a',
                display: 'flex', alignItems: 'center', paddingLeft: 24,
            }}>
                <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    No upcoming events at this time
                </span>
            </div>
        </div>
    );

    /* Build the ticker string — triplicate for seamless loop */
    const items = [...events, ...events, ...events];

    return (
        <div style={{ display: 'flex', alignItems: 'stretch', height: 40, overflow: 'hidden', fontFamily: 'inherit' }}>

            {/* ── RED URGENT LABEL ── */}
            <div style={{
                background: 'linear-gradient(135deg, #b91c1c, #dc2626)',
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 20px', flexShrink: 0,
                zIndex: 2, position: 'relative',
                boxShadow: '4px 0 16px rgba(185,28,28,0.6)',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)',
                paddingRight: 28,
            }}>
                {/* Pulsing dot */}
                <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                    <span style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'white', opacity: 0.5,
                        animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
                    }} />
                    <span style={{
                        position: 'relative', display: 'block', width: 8, height: 8,
                        borderRadius: '50%', background: 'white',
                        boxShadow: '0 0 6px rgba(255,255,255,0.8)',
                    }} />
                </span>
                <span style={{
                    color: 'white', fontWeight: 900, fontSize: 11,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    whiteSpace: 'nowrap',
                }}>URGENT</span>
            </div>

            {/* ── DARK SCROLLING BAND ── */}
            <div
                style={{
                    flex: 1, background: '#0f172a',
                    overflow: 'hidden', position: 'relative',
                    borderTop: '1px solid rgba(220,38,38,0.3)',
                    borderBottom: '1px solid rgba(220,38,38,0.15)',
                }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {/* Left fade */}
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 30, zIndex: 3,
                    background: 'linear-gradient(to right, #0f172a, transparent)',
                    pointerEvents: 'none',
                }} />
                {/* Right fade */}
                <div style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, zIndex: 3,
                    background: 'linear-gradient(to left, #0f172a, transparent)',
                    pointerEvents: 'none',
                }} />

                {/* Scrolling items */}
                <div style={{
                    display: 'flex', alignItems: 'center', height: '100%',
                    animation: paused ? 'none' : 'ticker 50s linear infinite',
                    whiteSpace: 'nowrap', willChange: 'transform',
                }}>
                    {items.map((ev, idx) => (
                        <React.Fragment key={`${ev._id}-${idx}`}>
                            {/* Event item */}
                            <button
                                onClick={() => go(ev)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 10,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    padding: '0 4px', outline: 'none',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.querySelector('span.title').style.color = '#f87171';
                                    e.currentTarget.querySelector('span.title').style.textDecoration = 'underline';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.querySelector('span.title').style.color = '#e2e8f0';
                                    e.currentTarget.querySelector('span.title').style.textDecoration = 'none';
                                }}
                            >
                                {/* Emoji type icon */}
                                <span style={{ fontSize: 13 }}>
                                    {ev.eventType === 'sports' ? '🏆' : ev.eventType === 'clubs' ? '🎭' : '📣'}
                                </span>

                                {/* Category label */}
                                {(ev.subcategory || ev.eventType) && (
                                    <span style={{
                                        display: 'inline-block',
                                        background: 'rgba(220,38,38,0.15)',
                                        border: '1px solid rgba(220,38,38,0.35)',
                                        borderRadius: 4,
                                        color: '#fca5a5',
                                        fontSize: 9, fontWeight: 900,
                                        letterSpacing: '0.15em', textTransform: 'uppercase',
                                        padding: '2px 7px',
                                    }}>
                                        {ev.subcategory || ev.eventType}
                                    </span>
                                )}

                                {/* Event title */}
                                <span
                                    className="title"
                                    style={{
                                        color: '#e2e8f0', fontWeight: 600, fontSize: 13,
                                        transition: 'color 0.2s, text-decoration 0.2s',
                                        maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}
                                >
                                    {ev.eventTitle}
                                </span>

                                {/* Date */}
                                <span style={{
                                    color: '#475569', fontSize: 11, fontWeight: 600,
                                    fontVariantNumeric: 'tabular-nums',
                                }}>
                                    {formatDate(ev.eventDate)}
                                </span>
                            </button>

                            {/* ◆ Diamond separator */}
                            <span style={{
                                color: '#dc2626', fontSize: 10,
                                margin: '0 20px', lineHeight: 1, flexShrink: 0,
                                textShadow: '0 0 8px rgba(220,38,38,0.6)',
                            }}>◆</span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes ticker {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default UrgentMarquee;
