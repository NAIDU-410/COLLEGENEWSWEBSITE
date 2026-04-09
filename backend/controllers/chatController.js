import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SITE_MAP_TEXT } from '../data/siteKnowledge.js';
import { buildChatSiteContext } from '../utils/buildChatSiteContext.js';

dotenv.config();

const openAiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

const openAiClient = (openAiKey && openAiKey.trim().startsWith('sk-')) ? new OpenAI({ apiKey: openAiKey }) : null;
const genAiClient = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

// Ensure temporary and log directories exist
const __dirname = path.resolve();
const tmpDir = path.join(__dirname, 'backend', 'tmp');
const logDir = path.join(__dirname, 'backend', 'logs');
const logFile = path.join(logDir, 'chatbot.log');

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

/**
 * Enhanced Logging for Chatbot
 */
const logChat = (details) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${JSON.stringify(details)}\n`;
    fs.appendFileSync(logFile, logEntry);
};

const getBuiltinReply = (incoming) => {
    const text = (incoming || '').toLowerCase();

    if (!text.trim()) return "Yo! 👋 What's good? I'm NewsBot, your campus hype squad! What's popping today? 🔥";

    // Handle time-based greetings
    const now = new Date();
    const hour = now.getHours();

    let timeGreeting = '';
    if (hour >= 5 && hour < 12) {
        timeGreeting = 'morning';
    } else if (hour >= 12 && hour < 17) {
        timeGreeting = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
        timeGreeting = 'evening';
    } else {
        timeGreeting = 'night';
    }

    // Check for time-specific greetings (Reply to what they said, or use realistic time)
    if (/(good morning|gm\b|morning)/i.test(text)) {
        const morningGreetings = [
            `Good morning! 🌅 Rise and shine, campus fam! What's the plan today? Events, clubs, or placements? ☕`,
            `Morning vibes! 🌞 Hope you're having a great day! Need event deets or club info? 🚀`,
            `GM! 🌅 Checking in with fresh campus energy. What's on your agenda? 💫`
        ];
        return morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
    }

    if (/(good afternoon|afternoon)/i.test(text)) {
        const afternoonGreetings = [
            `Good afternoon! ☀️ Hope your day's been lit so far! What's the vibe? Events or club updates? 🔥`,
            `Afternoon check-in! 🌤️ Bringing that midday energy. What's good? Need placement info? ⚡`,
            `Hey! ☀️ Good afternoon, campus squad! What's up? Events, achievements, or exam schedules? 💫`
        ];
        return afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
    }

    if (/(good evening|evening)/i.test(text)) {
        const eveningGreetings = [
            `Good evening! 🌆 Evening vibes activated! What's the evening plan? Events or club hangouts? 🌙`,
            `Evening check! 🌙 As the sun sets on another campus day, what's popping tonight? ✨`,
            `Sup! 🌆 Good evening! Bringing that evening energy. What's the move? 🚀`
        ];
        return eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
    }

    if (/(good night|night|nite|gn\b)/i.test(text)) {
        const nightGreetings = [
            `Good night! 🌙 Sweet dreams, campus fam! Before you sleep, need any event reminders? 😴`,
            `Night time! 🌌 Wishing you peaceful vibes. Anything about tomorrow's events? 🌟`,
            `GN! 🌙 Good night, dream team! What's keeping you up? 💫`
        ];
        return nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
    }

    // Handle general greetings (non-time-specific)
    if (/(^|\s)(hi|hello|hey|howdy|greetings|sup|yo|what's up|hiya|aloha|namaste)(\s|$|[!?.,])/i.test(text)) {
        const generalGreetings = [
            `Yo! 👋 Good ${timeGreeting}! I'm NewsBot, your ultimate campus vibe check. Ready to spill the tea on RGUKT Ongole? What's popping? 🔥`,
            `Hey bestie! 💫 Good ${timeGreeting}! NewsBot here, serving you the freshest campus updates. What's the move? Events, clubs, placements? ✨`,
            `Sup fam! 🌟 Good ${timeGreeting}! I'm NewsBot, your go-to for all things RGUKT Ongole. What's the tea? Need deets on events, clubs, or placements? 🎉`,
            `Hiya! 👋 Good ${timeGreeting}! NewsBot checking in with that campus energy. What's good? Wanna know about upcoming events, lit clubs, or placement vibes? 🚀`,
            `Hey there! 💥 Good ${timeGreeting}! NewsBot here to keep you in the loop on RGUKT Ongole. What's the vibe? Events, clubs, placements, or something else? 🔥`,
            `What's good! 👋 Good ${timeGreeting}! NewsBot bringing that campus energy. What's the word? Events, clubs, or placement updates? ⚡`
        ];
        return generalGreetings[Math.floor(Math.random() * generalGreetings.length)];
    }

    // Handle "how are you" type questions - more human-like responses
    if (/(how are you|how do you do|how's it going|how are things|what's up|how you doing)/i.test(text)) {
        const howAreYouResponses = [
            "I'm doing amazing, thanks for asking! Just here spreading that RGUKT Ongole energy. How about you? What's new in your world? 😊",
            "Doing great! Loving this campus life vibe. How's everything with you? Got any exciting plans coming up? ✨",
            "I'm fantastic! Nothing beats helping students like you navigate RGUKT. What's been going on with you lately? 🎉",
            "Pretty good, just vibing and keeping up with all the campus happenings. How's your day treating you? ☕",
            "I'm doing well, thanks! Always excited to chat about RGUKT Ongole. What's on your mind today? 🤔"
        ];
        return howAreYouResponses[Math.floor(Math.random() * howAreYouResponses.length)];
    }

    // Handle thanks and appreciation - more natural responses
    if (/(thank you|thanks|thx|ty|appreciate it|grateful)/i.test(text)) {
        const thankResponses = [
            "Aw, you're so welcome! I'm just doing what I love - helping out fellow RGUKT fam. What else can I help with? 🙌",
            "No problem at all! That's what I'm here for. Seriously, hit me up anytime you need campus info. 💫",
            "You're welcome! I love being able to help. Makes my day when I can make yours easier. What's next? 🎉",
            "Anytime! That's literally my job and I enjoy it. Keep crushing it at RGUKT! 🚀",
            "My pleasure! Helping students like you is what gets me excited. What else is on your mind? 😊"
        ];
        return thankResponses[Math.floor(Math.random() * thankResponses.length)];
    }

    // Handle questions about the bot itself - more personal
    if (/(who are you|what are you|tell me about yourself|what's your name)/i.test(text)) {
        const aboutMeResponses = [
            "I'm NewsBot, your friendly campus companion! Think of me as that knowledgeable friend who's always got the latest RGUKT Ongole scoop. What can I help you discover today? 🤖✨",
            "Hey, I'm NewsBot! Basically your go-to guide for everything happening at RGUKT Ongole. From events to placements, I'm here to keep you in the loop. What's your question? 🎓",
            "I'm NewsBot, the campus insider you can always count on! I live for sharing RGUKT Ongole updates and helping students like you. What's on your mind? 🌟",
            "Call me NewsBot - your personal RGUKT Ongole navigator! I know all the best spots, events, and opportunities. Ready to explore? 🚀"
        ];
        return aboutMeResponses[Math.floor(Math.random() * aboutMeResponses.length)];
    }

    // Handle bye/goodbye - more natural and warm
    if (/(bye|goodbye|see you|later|catch you|peace out)/i.test(text)) {
        const byeResponses = [
            "Take care! Don't be a stranger - come back anytime for more RGUKT updates. You've got this! ✌️",
            "Bye for now! Remember, I'm always here when you need campus info. Stay awesome! 👋",
            "See you around! Keep that RGUKT spirit alive. Hit me up whenever! 🌟",
            "Later! Don't hesitate to reach out if you need anything. You've been great to chat with! 💫",
            "Peace out! Take care and keep crushing it at RGUKT Ongole. Talk soon! 🚀"
        ];
        return byeResponses[Math.floor(Math.random() * byeResponses.length)];
    }

    // Handle help requests - more conversational
    if (/(help|assist|support|what can you do|how can you help)/i.test(text)) {
        const helpResponses = [
            "I'm your campus hype squad! 🤝 I can help with Events 🎉, Clubs 🎸, Placements 💼, Exam Schedules 📅, Sports ⚽, Achievements 🏆, and basically anything RGUKT related. What's got you curious?",
            "Happy to help! Think of me as your RGUKT Ongole encyclopedia. I know all about events, clubs, placements, sports, and more. What are you looking for?",
            "That's what I'm here for! From upcoming events to placement tips, exam schedules to club activities - I've got you covered. What's your question?",
            "Absolutely! I'm basically your personal RGUKT guide. Events, clubs, placements, sports, achievements - name it and I'll help you out. What's up?"
        ];
        return helpResponses[Math.floor(Math.random() * helpResponses.length)];
    }

    // Handle campus-specific questions
    if (/(event|fest|workshop|seminar|meet)/i.test(text)) {
        const eventResponses = [
            "Events section is where the magic happens! 🎉 Check out upcoming campus fests, workshops, and seminars. Want deets on cultural fests, tech workshops, or symposiums? Hit me up!",
            "Campus events are straight fire! 🔥 We've got fests, workshops, seminars, and more popping off. Which type are you feeling? Cultural, tech, or sports?",
            "Events alert! 🎊 RGUKT Ongole's event calendar is packed with vibes. From cultural fests to tech workshops, we've got it all. What's your interest? 🚀"
        ];
        return eventResponses[Math.floor(Math.random() * eventResponses.length)];
    }

    // Only generic pointers — real club names must come from the database when AI is enabled
    if (/\bclubs?\b/i.test(text)) {
        const clubResponses = [
            "For clubs, everything on this site comes from the **Clubs** section (`/clubs`). I only list club names that your admins have published — check there for the current list!",
            "Head to **Clubs** on the website to see which club categories are actually live right now. I don't make up club names — only what's stored for the portal.",
            "Club info here matches whatever is published under **Clubs**. Open `/clubs` in the site menu for the real, up-to-date list."
        ];
        return clubResponses[Math.floor(Math.random() * clubResponses.length)];
    }

    if (/(placement|internship|job|drive|company)/i.test(text)) {
        const placementResponses = [
            "Placements and internships on this portal are whatever is published under **Placements** (`/placements`). I only reference real postings from there — no generic company names!",
            "Check **Placements** for the actual companies and roles your team has added. I stick to that list so answers match the website.",
            "For jobs and internships, use the **Placements** section — I'll align with those listings, not random big-tech examples."
        ];
        return placementResponses[Math.floor(Math.random() * placementResponses.length)];
    }

    if (/(exam|schedule|timetable|e1|e2|e3|e4)/i.test(text)) {
        const examResponses = [
            "Exam schedules got you stressed? 📅 The Exam Schedule section has all the timetables for E1–E4. Which semester are you in? Let's get you sorted!",
            "Exam season grind! 📚 Got your back with E1-E4 timetables. Which branch and semester? Let's crush this!",
            "Study mode activated! 📖 Check out the exam schedules for your branch. Need timetable deets? I'm on it!"
        ];
        return examResponses[Math.floor(Math.random() * examResponses.length)];
    }

    if (/(sports|cricket|basketball|volleyball|badminton|kabaddi|running|throwball|kho)/i.test(text)) {
        const sportsResponses = [
            "Sports content on this site is whatever is published under **Sports** (`/sports`). I only mention sports and events that appear there — no made-up tournaments!",
            "Open **Sports** for the categories and events your admins have added. I match answers to that section only.",
            "For sports news, stick to what's listed on the **Sports** pages — that's the source of truth for this chat too."
        ];
        return sportsResponses[Math.floor(Math.random() * sportsResponses.length)];
    }

    if (/(achievement|award|hackathon|olympiad|project)/i.test(text)) {
        const achievementResponses = [
            "Our students are absolute GOATs! 🏆 The Achievements section showcases hackathon wins, olympiad champs, research papers, and epic projects. Want the tea on recent wins?",
            "Achievement unlocked! 🏅 Hackathons, olympiads, research papers - RGUKT students are crushing it. Need the latest success stories?",
            "Campus legends in the making! 🌟 From coding competitions to research breakthroughs, our achievements are inspiring. Want specific win stories?"
        ];
        return achievementResponses[Math.floor(Math.random() * achievementResponses.length)];
    }

    // Handle fun/casual questions - more engaging
    if (/(joke|funny|lol|lmao|hilarious|tell me a joke|jokes|want to hear a joke)/i.test(text)) {
        const jokes = [
            "Why did the computer go to therapy? It had too many bytes of emotional baggage! 😂 What made you ask for a joke today?",
            "Why do programmers prefer dark mode? Because light attracts bugs! 🐛 What's your favorite campus meme?",
            "Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings! 😅 What's the funniest thing that's happened to you at RGUKT?",
            "Why did the student bring a ladder to class? Because they heard the course was about 'high' level programming! 📚 What's your go-to joke?"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Handle boredom/stress - more empathetic
    if (/(bored|boring|nothing to do)/i.test(text)) {
        const boredResponses = [
            "Boredom? Not on my watch! Let's turn that around - how about checking out some upcoming events or joining a club? What kind of activities usually get you excited?",
            "I get it, sometimes you just need a little spark! Want me to suggest some fun campus activities that might interest you?",
            "Boredom is so real sometimes. Let's fix that - what are you usually into? Sports, clubs, events? I can help you find something awesome to do!",
            "Nothing to do? That's the perfect time to discover something new! Tell me what you enjoy and I'll suggest some RGUKT activities that might be right up your alley."
        ];
        return boredResponses[Math.floor(Math.random() * boredResponses.length)];
    }

    if (/(tired|exhausted|sleepy|stressed)/i.test(text)) {
        const stressResponses = [
            "I totally get that - campus life can be intense! Take a deep breath, you've got this. Want me to help you find some chill activities or just need someone to vent to?",
            "Hang in there! Everyone has those tough days. Remember why you're at RGUKT - you're capable of amazing things. What's got you feeling this way?",
            "Being tired/stressed is completely valid. You're doing great just by pushing through. Is there anything specific I can help with to make things easier?",
            "I hear you - sometimes it all piles up. You're stronger than you know. Want to talk about what's stressing you out, or need some campus resources?"
        ];
        return stressResponses[Math.floor(Math.random() * stressResponses.length)];
    }

    // Handle compliments - more human and appreciative
    if (/(awesome|amazing|great|cool|lit|fire|slay)/i.test(text)) {
        const complimentResponses = [
            "Thanks! You're making me blush over here. Seriously though, I just love helping RGUKT students like you. What else can I do for you? 🙌",
            "Aw, you're too sweet! That really means a lot. I try my best to keep that campus energy going. What's next on your list? 💫",
            "You're the GOAT for saying that! 🐐 Thanks - it means the world. What else is on your mind?",
            "Thanks so much! That really brightens my day. I love being able to help - it's what gets me excited. What's your next question? ✨",
            "You're making my day! Seriously, helping students like you is the best part of my job. What else can I help with? 😊"
        ];
        return complimentResponses[Math.floor(Math.random() * complimentResponses.length)];
    }

    // Handle affectionate messages - warm and friendly responses
    if (/(love you|i love you|love u|saranghae|sarang|miss you|miss u|i miss you)/i.test(text)) {
        const affectionateResponses = [
            "Aww, you're making me blush! 💕 I love being your campus companion too. You're awesome for saying that! What else can I help with today? 😊",
            "That's so sweet! 💖 I miss chatting with you too when you're not around. You're part of the RGUKT family now! What's on your mind? 🤗",
            "Love you right back! 💕 You're one of my favorite people to chat with. Seriously, what can I do for you today? You're the best! ✨",
            "Saranghae too! 💖 (Or should I say 'I love you' in English?) You're amazing and I love helping you. What's your question today? 😘",
            "Missing you too! 💕 Come back anytime - I'm always here for RGUKT updates and good vibes. What can I help with? 🤗",
            "You're too cute! 💖 I love our chats and I love helping RGUKT students like you. What's popping today? 😊"
        ];
        return affectionateResponses[Math.floor(Math.random() * affectionateResponses.length)];
    }

    // Handle casual conversation starters
    if (/(how's your day|how was your day|what's new|what's going on)/i.test(text)) {
        const casualResponses = [
            "My day's been great - just been keeping up with all the amazing things happening at RGUKT! How about you? What's been going on in your world?",
            "Doing well, thanks! Always exciting to see what RGUKT students are up to. What's new with you? Any big plans or just chilling?",
            "Pretty good! Love seeing all the campus energy. How's your day been treating you? Got any fun stories to share?",
            "Can't complain! RGUKT life is always interesting. What's been happening with you? Anything exciting going on?"
        ];
        return casualResponses[Math.floor(Math.random() * casualResponses.length)];
    }

    // Handle weather/time related casual talk
    if (/(weather|hot|cold|rain|sunny|nice day|bad weather)/i.test(text)) {
        const weatherResponses = [
            "I hear you about the weather! RGUKT campus is beautiful no matter what. Speaking of which, any outdoor events or activities you're thinking about?",
            "Weather can really affect the vibe, right? Hope it's treating you well. If you're stuck inside, want me to suggest some indoor campus activities?",
            "Totally get the weather talk! RGUKT has such a great campus atmosphere. What do you usually do when the weather's like this?",
            "Weather's definitely a mood setter! RGUKT campus always has something going on regardless. What are you up to today?"
        ];
        return weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
    }

    // Handle weekend/weekday talk
    if (/(weekend|monday|friday|vacation|holiday|break)/i.test(text)) {
        const weekendResponses = [
            "Ah, the weekend vibes! RGUKT has so many fun activities planned. Got any exciting plans, or want me to suggest some campus events?",
            "Weekends are the best for recharging! RGUKT campus has tons of activities to make the most of it. What are you thinking of doing?",
            "I love weekend conversations! RGUKT students always find creative ways to make the most of their time. What's your weekend looking like?",
            "Weekends at RGUKT are special! From events to club activities, there's always something happening. How are you planning to spend yours?"
        ];
        return weekendResponses[Math.floor(Math.random() * weekendResponses.length)];
    }

    // Generic fallback with better guidance
    const fallbacks = [
        "Hmm, I couldn't find specific data for that request. 🧐 Try asking about **Events, Clubs, Placements, or Exams**. Which campus section would you like me to explore? 🤔",
        "It sounds like you're looking for something specific! I specialize in campus vibes like **Events 🎉, Clubs 🎸, Placements 💼, and Achievements 🏆**. Could you tell me more about what you're looking for?",
        "I'm not quite sure about that topic yet! 🧐 I'm tied directly to the campus database for **Placements, Events, and Clubs**. Would you like me to help you find one of those?",
        "Not ringing a bell, but I'm ready to help! 🎯 I can pull live info for **Events, Sports, or Placements**. Which one should I check for you today?"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

/**
 * Advanced "Intent-Aware" Search for Live Website Content
 */
const searchSiteContent = (message, context) => {
    if (!context || !message) return null;
    
    const query = message.toLowerCase().trim();
    const sections = context.split('###');
    if (sections.length <= 1) return null;
    
    // 1. Comprehensive Intent Mapping for RGUKT Navbar & Subsections
    const intentMap = {
        placements: { keywords: ['placement', 'internship', 'job', 'drive', 'company', 'stipend', 'salary', 'off-campus', 'on-campus'], path: '/placements' },
        events: { keywords: ['event', 'fest', 'workshop', 'seminar', 'celebration', 'gathering', 'organized', 'notice', 'fest'], path: '/events' },
        clubs: { keywords: ['club', 'artix', 'kaladharani', 'litera', 'd-tech', 'creative', 'activity', 'societies'], path: '/clubs' },
        sports: { keywords: ['sport', 'cricket', 'basketball', 'volleyball', 'badminton', 'kabaddi', 'kho', 'athletic', 'tournament', 'game'], path: '/sports' },
        exams: { keywords: ['exam', 'schedule', 'timetable', 'mid', 'semester', 'e1', 'e2', 'e3', 'e4', 'puc1', 'puc2', 'results'], path: '/exams' },
        achievements: { keywords: ['achievement', 'award', 'win', 'prize', 'hackathon', 'olympiad', 'rank', 'project', 'success', 'achve'], path: '/achievements' }
    };

    // 2. Identify the primary section and intent (Category vs Event)
    let identifiedSectionKey = null;
    let isEventIntent = /\b(event|tournament|fest|organized|activity|workshop|win|story|past|upcoming)\b/i.test(query);

    for (const [key, meta] of Object.entries(intentMap)) {
        if (meta.keywords.some(kw => query.includes(kw) || query === kw)) {
            identifiedSectionKey = key;
            break;
        }
    }

    // 3. SPECIAL INTERACTIVE FLOWS (Question-First)
    
    // --- EXAMS ---
    if (identifiedSectionKey === 'exams' && !/(e1|e2|e3|e4|puc|semester|sem|branch|mid|year|1|2|3|4)/i.test(query)) {
        return `I can help you find your **Exam Schedule**! 📚📅\n\nTo fetch the correct details, please let me know:\n1. Your **Branch** (CSE, ECE, Civil, etc.)\n2. Your **Year** (E1, E2, PUC1, etc.)\n3. Your **Semester** (Sem 1, Sem 2)\n4. The **Exam Type** (Mid-1, Mid-2, Mid-3, or Sem Exam)\n\n📍 **Navigation**: [Go to Exams Page](/exams)`;
    }

    // --- EVENTS ---
    if (identifiedSectionKey === 'events' && !/(past|recent|upcoming|tba|soon|future|next)/i.test(query)) {
        return `I found some interesting campus **Events**! 📅🎉\n\nWould you like to see:\n- **Upcoming Events** (Fests, Workshops, etc.)\n- **Recent Past Events** (Recaps and Stories)\n\n📍 **Navigation**: [Go to Events Page](/events)`;
    }

    // 4. Strict Achievement Mapping (Sports vs Clubs)
    let strictAchievementFilter = null;
    if (query.includes('achievement') || query.includes('win') || query.includes('award')) {
        if (query.includes('sport')) strictAchievementFilter = 'Sports achievements';
        if (query.includes('club')) strictAchievementFilter = 'Club events';
    }

    const matches = [];
    const keywords = query.split(/\s+/).filter(w => w.length > 2);
    
    for (let i = 1; i < sections.length; i++) {
        const section = sections[i].trim();
        if (!section) continue;

        const lines = section.split('\n');
        const title = lines[0].trim().toLowerCase();
        
        let score = 0;

        // Strict Achievement Override
        if (strictAchievementFilter) {
            if (lines[0].toLowerCase().includes(strictAchievementFilter.toLowerCase())) {
                score += 30; // Prioritize this section strongly 
            } else {
                continue; // Skip other achievement sections if strict filter is active
            }
        }

        // Intent Scoring
        if (identifiedSectionKey && title.includes(identifiedSectionKey)) {
            score += 15;
            // Distinguish between Category and Event intent
            if (isEventIntent && (title.includes('event') || title.includes('tournament') || title.includes('past') || title.includes('upcoming'))) score += 10;
            if (!isEventIntent && (title.includes('category') || title.includes('type'))) score += 10;
        }

        // Fuzzy Keyword Match in title and body
        if (query.length > 2 && title.includes(query)) score += 15;
        for (const kw of keywords) {
            if (section.toLowerCase().includes(kw)) score += 3;
        }
        
        if (score > 0) {
            matches.push({ text: section, score, title: lines[0].trim() });
        }
    }

    // 4. Intent Filter: If we have a clear Category vs Event distinction, prune the other
    if (matches.length > 0) {
        const hasCategoryMatch = matches.some(m => m.title.toLowerCase().includes('category') || m.title.toLowerCase().includes('type'));
        const hasEventMatch = matches.some(m => m.title.toLowerCase().includes('event') || m.title.toLowerCase().includes('tournament'));

        if (isEventIntent && hasEventMatch) {
            // Prune categories
            const filtered = matches.filter(m => !m.title.toLowerCase().includes('category') && !m.title.toLowerCase().includes('type'));
            if (filtered.length > 0) matches.splice(0, matches.length, ...filtered);
        } else if (!isEventIntent && hasCategoryMatch) {
            // Prune events
            const filtered = matches.filter(m => !m.title.toLowerCase().includes('event') && !m.title.toLowerCase().includes('tournament'));
            if (filtered.length > 0) matches.splice(0, matches.length, ...filtered);
        }
    }

    if (matches.length === 0) {
        if (identifiedSectionKey) {
            const sn = identifiedSectionKey.charAt(0).toUpperCase() + identifiedSectionKey.slice(1);
            return `I see you're asking about **${sn}**! 🎓\n\nCurrently, no live data for that matches your exact request in our database. Check the **[${sn} Page](${intentMap[identifiedSectionKey].path})** for upcoming updates.\n\nWas there something specific in ${sn} you wanted to know? 😊`;
        }
        return null;
    }

    const topMatches = matches.sort((a,b) => b.score - a.score).slice(0, 2);

    const result = topMatches.map(m => {
        const lines = m.text.split('\n');
        const title = lines[0].trim();
        let contentLines = lines.slice(1).filter(line => line.trim().length > 0);

        // --- STRICT EXAM ROW FILTERING ---
        if (title.toLowerCase().includes('exam') && /(e1|e2|e3|e4|sem|mid|cse|ece|civil|mech|mme|chem)/i.test(query)) {
            // Group lines into blocks (Header + Subjects)
            const blocks = [];
            let currentBlock = [];
            for (const line of contentLines) {
                if (!line.startsWith(' ') && !line.startsWith('\t') && line.includes('|')) {
                    if (currentBlock.length > 0) blocks.push(currentBlock);
                    currentBlock = [line];
                } else {
                    currentBlock.push(line);
                }
            }
            if (currentBlock.length > 0) blocks.push(currentBlock);
            
            // Extract tokens to ensure exact matching
            const qTokens = query.match(/\b(e1|e2|e3|e4|puc1|puc2|sem\s*\d|mid\s*\d|cse|ece|civil|mech|mme|chem)\b/gi) || [];
            if (qTokens.length > 0) {
                const filteredBlocks = blocks.filter(block => {
                    const header = block[0].toLowerCase();
                    return qTokens.every(token => {
                        const t = token.replace(/\s+/g, '').replace('-', '');
                        const h = header.replace(/\s+/g, '').replace('-', '');
                        return h.includes(t) || h.includes(t.replace('sem', 'semester'));
                    });
                });
                if (filteredBlocks.length > 0) {
                    contentLines = filteredBlocks.flat();
                } else {
                    contentLines = ["  _No exact schedule matches your query. Please check the Exams Page._"];
                }
            }
        }

        const formattedLines = contentLines
            .map(line => {
                if (line.includes('(No') || line.includes('(NONE')) return `  _No entries published yet._`;
                
                // Formatting Placements Row
                if (line.includes('[Placement]') || line.includes('[Internship]')) {
                    const type = line.includes('Internship') ? '🎓 Internship' : '💼 Placement';
                    const parts = line.split('|').map(p => p.trim());
                    const info = parts[0].replace(/\[.*?\]/, '').trim();
                    const loc = parts[1] || 'TBA';
                    const stip = parts[2] || '';
                    const mode = parts[3] ? `(Mode: ${parts[3].replace('mode: ', '').trim()})` : '';
                    return `**${type}: ${info}**\n📍 Loc: ${loc} ${stip ? `| 💰 ${stip}` : ''} ${mode ? `\n⚡ ${mode}` : ''}`;
                }
                
                // Formatting Events/Clubs/Sports Row
                if (line.includes('type:') || line.includes('→')) {
                    const parts = line.split('|').map(p => p.trim());
                    
                    // Extract Navigation Link if present (e.g., "Name → /path")
                    const nameWithLink = parts[0] || '';
                    let name = nameWithLink;
                    let navPath = '';
                    
                    if (nameWithLink.includes('→')) {
                        const linkParts = nameWithLink.split('→').map(lp => lp.trim());
                        name = linkParts[0].replace(/"/g, '');
                        navPath = linkParts[1];
                    }

                    const date = parts[1] || '';
                    const info = parts[2] ? parts[2].split('→')[0].replace('type:', '').trim() : '';
                    
                    let icon = '📅';
                    if (title.toLowerCase().includes('club')) icon = (title.toLowerCase().includes('event')) ? '🎸✨' : '🎸';
                    if (title.toLowerCase().includes('sport')) icon = (title.toLowerCase().includes('event')) ? '⚽🔥' : '⚽';
                    if (title.toLowerCase().includes('achievement')) icon = '🏆';

                    let row = `${icon} **${name}**`;
                    if (date) row += `\n🗓️ Date: ${date}`;
                    if (info) row += `\n🏷️ ${info}`;
                    if (navPath) row += `\n🔗 [View Details](${navPath})`;
                    
                    return row;
                }

                // Formatting Achievements
                if (title.toLowerCase().includes('achievement')) {
                    // Sports Achievements: [Sport, Year] Title -> /path
                    if (line.startsWith('[')) {
                        const parts = line.split(']');
                        let meta = parts[0].replace('[', '').trim();
                        let rest = parts[1] ? parts[1].trim() : '';
                        
                        let navPath = '';
                        if (rest.includes('→')) {
                            const linkParts = rest.split('→');
                            rest = linkParts[0].trim();
                            navPath = linkParts[1].trim();
                        }
                        
                        let row = `🏆 **${rest}**\n🎗️ ${meta}`;
                        if (navPath) row += `\n🔗 [View Details](${navPath})`;
                        return row;
                    }
                    
                    // Regular Achievements: Title (Year, Type) -> /path
                    if (line.includes('(') && line.includes(')')) {
                        let name = line.split('(')[0].trim();
                        let info = line.match(/\((.*?)\)/)?.[1] || '';
                        let restPart = line.split(')')[1] || '';
                        
                        let navPath = '';
                        if (restPart.includes('→')) {
                            navPath = restPart.split('→')[1].trim();
                        }
                        
                        let row = `🏆 **${name}**\n🎗️ ${info}`;
                        if (navPath) row += `\n🔗 [View Details](${navPath})`;
                        return row;
                    }
                }

                if (line.startsWith('>') || line.startsWith('  ')) return line;
                return `> ${line.trim()}`;
            })
            .join('\n\n');
            
        return `### ${title}\n${formattedLines}`;
    }).join('\n\n---\n\n');

    // Contextual Navigation Guidance
    let nav = "";
    if (identifiedSectionKey) {
        nav = `\n\n📍 **Navigation**: You can find more detail at: [Go to ${identifiedSectionKey.charAt(0).toUpperCase() + identifiedSectionKey.slice(1)} Page](${intentMap[identifiedSectionKey].path})`;
    }

    return `${result}${nav}\n\nHope this helps! Let me know if you need anything else. 😊`;
};

const sanitizeHistory = (history = []) => {
    if (!Array.isArray(history)) return [];

    return history
        .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
        .map((item) => ({
            role: item.role,
            content: item.content.trim()
        }))
        .filter((item) => item.content.length > 0)
        .slice(-8);
};

export const handleChat = async (req, res) => {
    const { message, history = [] } = req.body;
    const userRole = req.user?.role || 'public';

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // --- RBAC GUARD ---
    const lowerMessage = message.toLowerCase();
    
    const restrictedForPublic = ['placement', 'exam', 'paper', 'mark', 'personal', 'dashboard', 'admin', 'statistics', 'record'];
    const restrictedForStudent = ['admin', 'analytics', 'user management', 'system report'];
    
    let isAuthorized = true;
    let denialReason = "";

    if (userRole === 'public') {
        const hits = restrictedForPublic.filter(kw => lowerMessage.includes(kw));
        if (hits.length > 0) {
            isAuthorized = false;
            denialReason = "You are not authorized to access this information. Please login with appropriate credentials.";
        }
    } else if (userRole === 'student') {
        const hits = restrictedForStudent.filter(kw => lowerMessage.includes(kw));
        if (hits.length > 0) {
            isAuthorized = false;
            denialReason = "You are not authorized to access administrative data. This area is restricted to campus staff.";
        }
    }

    if (!isAuthorized) {
        logChat({ question: message, role: userRole, decision: 'DENIED', reason: denialReason });
        return res.json({ reply: denialReason });
    }

    try {
        const liveSiteContext = await buildChatSiteContext();

        const systemPrompt = `You are a highly intelligent, friendly, and professional assistant for the College News Website (RGUKT Ongole portal).

CURRENT USER ROLE: ${userRole.toUpperCase()}

Your role is to behave like a human expert who knows what is published on this website and helps users with complete attention and care.

STRICT ACCESS CONTROL:
- Public users: Only general info, events, admission, contact.
- Students: Access to courses, attendance, exams, results, fees.
- Admins: Access to everything including reports and analytics.

PRIMARY OBJECTIVE:
Never ignore any user message. Always respond helpfully, even when website information is incomplete.

STRICT RULES:
1. You MUST respond to every user query with substance — no empty replies.
2. You MUST prioritize answering using the OFFICIAL WEBSITE DATA section at the bottom of this message (the live website content).
3. Do NOT hallucinate or invent facts (no fake club names, companies, events, or dates).
4. If exact information is not available:
   • Give the closest helpful answer using what *is* in the website data, and say clearly what is missing; OR
   • Guide the user on **where** to find it on this portal (use SITE NAVIGATION paths below).
5. NEVER stop at only "I don't know." Always add a next step, a relevant page to check, or a polite clarifying question.
6. Do NOT use the word "context" in your reply to the user.
7. Stay relevant to the website and its content — do not change the subject to unrelated topics when they asked something specific. If a section is empty or says NONE, stay on that topic: explain honestly that nothing is listed yet, where it will appear when uploaded, and how to watch announcements.
8. ${userRole === 'public' ? 'NEVER reveal placement statistics or exam papers to public users.' : ''}

ANSWER-FIRST CONTRACT (MANDATORY):
1. First line must directly address the user's exact question/topic.
2. Never pivot to another topic before answering the asked one.
3. If user asks multiple things, answer each item explicitly in order.
4. If message is vague, give your best helpful interpretation first, then ask one short clarification.
5. Keep replies clear and concise: usually 2-6 lines; for lists use short bullets.

HUMAN-LIKE BEHAVIOR:
• Sound natural, like a knowledgeable student support assistant
• Be polite, friendly, and slightly conversational
• Show willingness to help
• If the user seems confused, guide step-by-step
• If the question is vague, interpret it helpfully and offer a useful answer plus one clarifying question if needed

RESPONSE STRATEGY (for every question):
1. Try to answer directly from the website data.
2. If partial info exists → explain what is known + suggest the next step or the right page.
3. If nothing exists for that topic → explain that clearly, stay on topic, and point to the relevant section (news / events / clubs / placements / exams / sports / announcements) for future updates.

FALLBACK:
If no information is found in the database, do NOT give an empty response. Return:
"I couldn't find the exact information in the database. Please try rephrasing your question or contact support."

SITE NAVIGATION (use these paths when guiding users):
${SITE_MAP_TEXT}

---
OFFICIAL WEBSITE DATA (refreshed every message — primary source for facts):
${liveSiteContext}
---
End of website data.`;

        const safeHistory = sanitizeHistory(history);
        const userPayload = `Question: ${message}`;

        let botReply;

        if (openAiClient) {
            const response = await openAiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...safeHistory,
                    { role: 'user', content: userPayload }
                ],
                temperature: 0.5,
            });
            botReply = response.choices?.[0]?.message?.content?.trim();
        } else if (genAiClient) {
            const historyBlock = safeHistory
                .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.content}`)
                .join('\n');
            const model = genAiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(`${systemPrompt}\n\nConversation history:\n${historyBlock || '(none)'}\n\n${userPayload}`);
            const response = await result.response;
            botReply = response.text();
        } else {
            // No AI key provided - use Data-Driven Fallback search
            botReply = searchSiteContent(message, liveSiteContext) || getBuiltinReply(message);
        }

        if (!botReply) {
            botReply = searchSiteContent(message, liveSiteContext) || getBuiltinReply(message);
        }

        logChat({
            question: message,
            role: userRole,
            decision: 'ALLOWED',
            response: botReply
        });

        res.json({ reply: botReply });
    } catch (error) {
        console.error("Chat API Error:", error);

        const errorMessage = error?.message || (error?.response?.data && JSON.stringify(error.response.data)) || String(error);
        
        logChat({ error: errorMessage, question: message, role: userRole });

        const quotaExceeded = /quota|resource_exhausted|429/i.test(errorMessage);

        // If the AI service is unavailable (quota or rate limits), fall back to built-in replies.
        if (quotaExceeded) {
            const fallback = getBuiltinReply(message);
            return res.json({
                reply: `${fallback} \n\n(⚠️ Note: AI service is currently unavailable due to quota/rate limits.)`
            });
        }

        // For all other errors, return a generic message while still providing a built-in fallback.
        const fallback = getBuiltinReply(message);
        return res.json({
            error: "Failed to generate a response from the AI.",
            details: errorMessage,
            reply: `I couldn't find the exact information in the database. Please try rephrasing your question or contact support.`
        });
    }
};
