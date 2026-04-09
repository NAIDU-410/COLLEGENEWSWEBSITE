/**
 * CMS / database content aggregator for the chatbot.
 *
 * Pulls live text from all collections that power the public website (your "CMS" layer).
 * Injected into the LLM system prompt so answers reflect admin-managed content.
 *
 * Size is capped (CMS_MAX_CONTEXT_CHARS) to stay within model limits.
 */

import Event from '../models/Event.js';
import Achievement from '../models/Achievement.js';
import Placement from '../models/Placement.js';
import ClubType from '../models/ClubType.js';
import ClubEvent from '../models/ClubEvent.js';
import SportType from '../models/SportType.js';
import SportEvent from '../models/SportEvent.js';
import ExamSchedule from '../models/ExamSchedule.js';
import HomeCarousel from '../models/HomeCarousel.js';
import Footer from '../models/Footer.js';
import SocialMedia from '../models/SocialMedia.js';
import Branding from '../models/Branding.js';
import SportAchievement from '../models/SportAchievement.js';
import { getSiteBaseUrl } from '../data/siteKnowledge.js';

/** Max characters for the final blob (env override for larger models / future RAG split) */
const MAX_CHARS = Math.min(
    Math.max(parseInt(process.env.CMS_MAX_CONTEXT_CHARS || '28000', 10) || 28000, 8000),
    100000
);

const truncate = (s, max = 600) => {
    if (!s || typeof s !== 'string') return '';
    const t = s.trim().replace(/\s+/g, ' ');
    return t.length <= max ? t : `${t.slice(0, max)}…`;
};

const fmtDate = (d) => {
    if (!d) return 'TBA';
    try {
        return new Date(d).toISOString().slice(0, 10);
    } catch {
        return String(d);
    }
};

function clubSlug(name) {
    return (name || '').toLowerCase().trim().replace(/\s+/g, '-');
}

function sportSlug(name) {
    return (name || '').toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Build markdown-style context from all CMS collections.
 * @returns {Promise<string>}
 */
export async function buildCmsContentContextForChat() {
    const base = getSiteBaseUrl();
    const prefix = base ? `${base}` : '';
    const lines = [
        '[CMS / DATABASE CONTENT — auto-loaded from MongoDB]',
        `Generated: ${new Date().toISOString()}`,
        'ONLY mention clubs, sports, events, placements, and achievements that appear verbatim in the sections below.',
        'If a section explicitly says there are none published, tell the user that — do not invent examples.',
    ];

    const pushSection = (title, items) => {
        if (!items?.length) return;
        lines.push('');
        lines.push(`### ${title}`);
        items.forEach((line) => lines.push(line));
    };

    /** Always emit the section so the model sees “empty” vs “has data”. */
    const pushSectionAlways = (title, items, emptyNote) => {
        lines.push('');
        lines.push(`### ${title}`);
        if (!items?.length) {
            lines.push(emptyNote);
        } else {
            items.forEach((line) => lines.push(line));
        }
    };

    // --- Branding (singleton) ---
    try {
        const branding = await Branding.findOne().sort({ updatedAt: -1 }).lean();
        if (branding) {
            lines.push('');
            lines.push('### Branding & hero (home)');
            lines.push(`College: ${branding.collegeName || ''}`);
            lines.push(`Hero title: ${branding.heroTitle || ''}`);
            lines.push(`Hero subtitle: ${branding.heroSubtitle || ''}`);
            lines.push(`CTA: "${branding.ctaText || ''}" → ${branding.ctaLink || '/about'}`);
        }
    } catch (e) {
        console.warn('[cms-chat] branding:', e.message);
    }

    // --- Footer ---
    try {
        const footer = await Footer.findOne().sort({ updatedAt: -1 }).lean();
        if (footer) {
            lines.push('');
            lines.push('### Footer (navigation & copy)');
            lines.push(`Brand: ${footer.brandName || ''}`);
            if (footer.description) lines.push(`Description: ${truncate(footer.description, 800)}`);
            (footer.sections || []).forEach((sec) => {
                const links = (sec.links || []).map((l) => `${l.label} → ${l.url}`).join(' | ');
                lines.push(`Column "${sec.title || ''}": ${links}`);
            });
            if (footer.copyright) lines.push(`Copyright: ${footer.copyright}`);
        }
    } catch (e) {
        console.warn('[cms-chat] footer:', e.message);
    }

    // --- Social ---
    try {
        const socials = await SocialMedia.find().sort({ createdAt: -1 }).limit(20).select('name link').lean();
        pushSection(
            'Social links',
            socials.map((s) => `${s.name}: ${s.link}`)
        );
    } catch (e) {
        console.warn('[cms-chat] social:', e.message);
    }

    // --- Carousel (all slide types) ---
    try {
        const slides = await HomeCarousel.find()
            .sort({ updatedAt: -1 })
            .limit(16)
            .select('title description link type')
            .lean();
        pushSection(
            'Home carousel slides',
            slides.map((sl) => `[${sl.type || 'main'}] ${sl.title || 'Slide'} — ${truncate(sl.description || '', 400)} → ${sl.link || ''}`)
        );
    } catch (e) {
        console.warn('[cms-chat] carousel:', e.message);
    }

    // --- General events (Event model) ---
    try {
        const upcoming = await Event.find({ status: { $in: ['upcoming', 'tba'] } })
            .sort({ eventDate: 1 })
            .limit(15)
            .select('eventTitle eventDate description eventType subcategory status')
            .lean();
        pushSectionAlways(
            'Campus events (upcoming)',
            upcoming.map((e) => {
                const path = `/events/${e._id}`;
                const link = prefix ? `${prefix}${path}` : path;
                return `"${e.eventTitle}" | ${fmtDate(e.eventDate)} | type: ${e.eventType}${e.subcategory ? ` / ${e.subcategory}` : ''} → ${link}\n  ${truncate(e.description, 700)}`;
            }),
            '(No upcoming or TBA events in the database.)'
        );
    } catch (e) {
        console.warn('[cms-chat] events upcoming:', e.message);
    }

    try {
        const past = await Event.find({ status: 'past' })
            .sort({ eventDate: -1 })
            .limit(8)
            .select('eventTitle eventDate description eventType subcategory')
            .lean();
        pushSectionAlways(
            'Campus events (recent past)',
            past.map((e) => {
                const path = `/events/${e._id}`;
                const link = prefix ? `${prefix}${path}` : path;
                return `"${e.eventTitle}" | ${fmtDate(e.eventDate)} → ${link}\n  ${truncate(e.description, 400)}`;
            }),
            '(No past events recorded in the database.)'
        );
    } catch (e) {
        console.warn('[cms-chat] events past:', e.message);
    }

    // --- Club-specific events (ClubEvent collection — separate from Event) ---
    try {
        const clubEvts = await ClubEvent.find()
            .sort({ eventDate: -1 })
            .limit(12)
            .select('clubName eventTitle eventDate description activities achievements')
            .lean();
        pushSectionAlways(
            'Club events (detailed)',
            clubEvts.map((ce) => {
                const slug = clubSlug(ce.clubName);
                const path = `/clubs/${slug}/${ce._id}`;
                const link = prefix ? `${prefix}${path}` : path;
                const acts = (ce.activities || [])
                    .slice(0, 4)
                    .map((a) => a.name)
                    .filter(Boolean)
                    .join(', ');
                return `[${ce.clubName}] ${ce.eventTitle} | ${fmtDate(ce.eventDate)} → ${link}\n  ${truncate(ce.description, 650)}${acts ? `\n  Activities: ${acts}` : ''}`;
            }),
            '(No club events in the database.)'
        );
    } catch (e) {
        console.warn('[cms-chat] club events:', e.message);
    }

    // --- Club categories ---
    try {
        const clubs = await ClubType.find().sort({ name: 1 }).select('name description').lean();
        pushSectionAlways(
            'Club categories (ONLY list these names — nothing else exists on the site)',
            clubs.map((c) => {
                const path = `/clubs/${clubSlug(c.name)}`;
                const link = prefix ? `${prefix}${path}` : path;
                return `${c.name} → ${link}\n  ${truncate(c.description || '', 500)}`;
            }),
            '(NONE — no club categories published in admin/DB. Say clearly that no clubs are listed on the website yet. Do NOT name example clubs.)'
        );
    } catch (e) {
        console.warn('[cms-chat] club types:', e.message);
    }

    // --- Achievements ---
    try {
        const ach = await Achievement.find()
            .sort({ updatedAt: -1 })
            .limit(15)
            .select('title description type subcategory year')
            .lean();
        pushSectionAlways(
            'Student achievements',
            ach.map((a) => {
                const path = `/achievements/${a._id}`;
                const link = prefix ? `${prefix}${path}` : path;
                return `${a.title} (${a.year}, ${a.type}${a.subcategory ? ` — ${a.subcategory}` : ''}) → ${link}\n  ${truncate(a.description, 650)}`;
            }),
            '(No achievements published in the database.)'
        );
    } catch (e) {
        console.warn('[cms-chat] achievements:', e.message);
    }

    // --- Placements (include description snippet) ---
    try {
        const placements = await Placement.find()
            .sort({ createdAt: -1 })
            .limit(15)
            .lean();
        pushSectionAlways(
            'Placements & internships (ONLY companies/roles listed here)',
            placements.map((p) => {
                const path = `/placements/detail/${p._id}`;
                const link = prefix ? `${prefix}${path}` : path;
                const skills = Array.isArray(p.skills) ? p.skills.slice(0, 8).join(', ') : '';
                return `[${p.type}] ${p.companyName} — ${p.role} | ${p.location} | ${p.stipendOrSalary || ''} | mode: ${p.mode || ''}${p.deadline ? ` | deadline ${fmtDate(p.deadline)}` : ''} → ${link}\n  ${truncate(p.description || '', 700)}${skills ? `\n  Skills: ${skills}` : ''}`;
            }),
            '(No placements or internships in the database.)'
        );
    } catch (e) {
        console.warn('[cms-chat] placements:', e.message);
    }

    // --- Sports types ---
    try {
        const sports = await SportType.find().sort({ name: 1 }).select('name description').lean();
        pushSectionAlways(
            'Sports categories (ONLY list these)',
            sports.map((s) => {
                const path = `/sports/${sportSlug(s.name)}`;
                const link = prefix ? `${prefix}${path}` : path;
                return `${s.name} → ${link}\n  ${truncate(s.description || '', 500)}`;
            }),
            '(NONE — no sports categories published in admin/DB. Do not invent sport names.)'
        );
    } catch (e) {
        console.warn('[cms-chat] sport types:', e.message);
    }

    // --- Sport events ---
    try {
        const se = await SportEvent.find()
            .sort({ eventDate: -1 })
            .limit(12)
            .select('sportType eventTitle eventDate description')
            .lean();
        pushSectionAlways(
            'Sports tournaments / events',
            se.map((ev) => {
                const path = `/sports/${sportSlug(ev.sportType)}/${ev._id}`;
                const link = prefix ? `${prefix}${path}` : path;
                return `[${ev.sportType}] ${ev.eventTitle} | ${fmtDate(ev.eventDate)} → ${link}\n  ${truncate(ev.description, 650)}`;
            }),
            '(No sports events in the database.)'
        );
    } catch (e) {
        console.warn('[cms-chat] sport events:', e.message);
    }

    // --- Sport achievements ---
    try {
        const sa = await SportAchievement.find()
            .sort({ createdAt: -1 })
            .limit(12)
            .select('sportType year title description')
            .lean();
        pushSection(
            'Sports achievements',
            sa.map((a) => `[${a.sportType}, ${a.year}] ${a.title}\n  ${truncate(a.description, 500)}`)
        );
    } catch (e) {
        console.warn('[cms-chat] sport achievements:', e.message);
    }

    // --- Exam schedules (more subject rows) ---
    try {
        const exams = await ExamSchedule.find()
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();
        pushSection(
            'Exam schedules',
            exams.map((ex) => {
                const subj = (ex.subjects || [])
                    .map((s) => `${s.subjectName}: ${s.date}/${s.month}/${s.year} ${s.time || ''}${s.isUpdated ? ' (updated)' : ''}`)
                    .join('\n    ');
                return `${ex.branch} | Sem ${ex.semester} | ${ex.academicYear} | ${ex.examType} | ${ex.mode}\n    ${truncate(subj, 1200)}`;
            })
        );
    } catch (e) {
        console.warn('[cms-chat] exams:', e.message);
    }

    let text = lines.join('\n');
    if (text.length > MAX_CHARS) {
        text =
            text.slice(0, MAX_CHARS) +
            `\n\n[…truncated to ${MAX_CHARS} chars. Set CMS_MAX_CONTEXT_CHARS to allow more.]`;
    }

    if (lines.length <= 3) {
        return `${text}\n\n(No CMS rows returned — check MongoDB connection and collections.)`;
    }

    return text;
}
