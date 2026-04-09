import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, X, Share2, Lightbulb, MessageCircle } from 'lucide-react';
import api, { sendChatMessage as apiSendChatMessage } from '../services/api';

const CustomBotIcon = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="antennaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <radialGradient id="eyeGrad">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            <linearGradient id="mouthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="softGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
            </filter>
        </defs>
        
        <g className="animate-pulse">
            <path d="M50 35 L50 15" stroke="url(#antennaGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
            <circle cx="50" cy="13" r="8" fill="url(#antennaGrad)" filter="url(#glow)">
                <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="50" cy="13" r="12" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4">
                <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="50" cy="13" r="16" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3">
                <animate attributeName="r" values="16;22;16" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" begin="0.5s" repeatCount="indefinite"/>
            </circle>
        </g>
        
        <g className="animate-pulse" style={{animationDelay: '0.5s'}}>
            <rect x="20" y="42" width="6" height="16" rx="3" fill="#94a3b8" opacity="0.9"/>
            <circle cx="23" cy="42" r="3" fill="#64748b"/>
            <circle cx="23" cy="58" r="3" fill="#64748b"/>
            
            <rect x="74" y="42" width="6" height="16" rx="3" fill="#94a3b8" opacity="0.9"/>
            <circle cx="77" cy="42" r="3" fill="#64748b"/>
            <circle cx="77" cy="58" r="3" fill="#64748b"/>
        </g>
        
        <rect x="25" y="30" width="50" height="48" rx="18" fill="url(#headGrad)" filter="url(#shadow)"/>
        
        <rect x="32" y="40" width="36" height="24" rx="10" fill="#0f172a" opacity="0.95"/>
        
        <g className="animate-pulse" style={{animationDelay: '1s'}}>
            <circle cx="41" cy="51" r="5" fill="url(#eyeGrad)" filter="url(#softGlow)">
                <animate attributeName="r" values="5;6;5" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="41" cy="51" r="2" fill="#0f172a" opacity="0.8"/>
            
            <circle cx="59" cy="51" r="5" fill="url(#eyeGrad)" filter="url(#softGlow)">
                <animate attributeName="r" values="5;6;5" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="59" cy="51" r="2" fill="#0f172a" opacity="0.8"/>
        </g>
        
        <path d="M42 68 Q50 74 58 68" stroke="url(#mouthGrad)" strokeWidth="3" strokeLinecap="round" filter="url(#softGlow)">
            <animate attributeName="d" values="M42 68 Q50 74 58 68;M42 68 Q50 76 58 68;M42 68 Q50 74 58 68" dur="4s" repeatCount="indefinite"/>
        </path>
        
        <circle cx="30" cy="35" r="2" fill="#10b981" opacity="0.6" className="animate-pulse"/>
        <circle cx="70" cy="35" r="2" fill="#10b981" opacity="0.6" className="animate-pulse" style={{animationDelay: '0.3s'}}/>
    </svg>
);

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(true);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
        const [pendingCorrection, setPendingCorrection] = useState(null);
    const [lastInteraction, setLastInteraction] = useState(Date.now());
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [userPreferences, setUserPreferences] = useState({
        branch: '',
        year: '',
        interests: []
    });

    const messagesEndRef = useRef(null);
    const formRef = useRef(null);

    const quickReplies = [
        "What's happening today?",
        "Tell me about placements",
        "Any upcoming events?",
        "How do I join clubs?",
        "Exam schedules?",
        "Sports activities?"
    ];

    const smartSuggestions = [
        { text: "Today's Events", icon: Lightbulb },
        { text: "Placement News", icon: Lightbulb },
        { text: "Club Activities", icon: Lightbulb },
        { text: "Exam Updates", icon: Lightbulb }
    ];

    
    

    const fetchWebsiteContent = async (query) => {
        try {
            // First try to get dynamic content from the current website
            const websiteResponse = await api.get('/website-content', {
                params: { query }
            });
            
            if (websiteResponse.data.content) {
                return websiteResponse.data;
            }
            
            // If no specific content found, scrape the entire website
            const scrapeResponse = await api.get('/scrape-website', {
                params: { 
                    url: window.location.origin,
                    query: query 
                }
            });
            
            return scrapeResponse.data;
        } catch (error) {
            console.error('Website content fetch error:', error);
            return null;
        }
    };

    const analyzeWebsiteContent = (content, query) => {
        if (!content) return null;
        
        const lowerQuery = query.toLowerCase();
        const lowerContent = content.toLowerCase();
        
        // Look for exact matches first
        if (lowerContent.includes(lowerQuery)) {
            const contextStart = Math.max(0, lowerContent.indexOf(lowerQuery) - 100);
            const contextEnd = Math.min(content.length, lowerContent.indexOf(lowerQuery) + query.length + 200);
            const context = content.substring(contextStart, contextEnd);
            
            return {
                type: 'exact_match',
                content: context.trim(),
                confidence: 0.9
            };
        }
        
        // Look for partial matches and related content
        const keywords = query.split(' ').filter(word => word.length > 2);
        let bestMatch = null;
        let highestScore = 0;
        
        keywords.forEach(keyword => {
            if (lowerContent.includes(keyword.toLowerCase())) {
                const score = keyword.length / query.length;
                if (score > highestScore) {
                    highestScore = score;
                    const index = lowerContent.indexOf(keyword.toLowerCase());
                    const contextStart = Math.max(0, index - 100);
                    const contextEnd = Math.min(content.length, index + keyword.length + 200);
                    bestMatch = {
                        type: 'partial_match',
                        content: content.substring(contextStart, contextEnd).trim(),
                        confidence: score * 0.7,
                        keyword: keyword
                    };
                }
            }
        });
        
        return bestMatch;
    };

    const copyToClipboard = async (text, messageId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    
    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const messageText = inputValue.trim();
        setLastInteraction(Date.now());
        setShowSuggestions(false);

        // Determine if this is a static question or needs live data
        const needsLiveData = /(placement|internship|job|drive|company|event|fest|workshop|seminar|club|sport|cricket|basketball|football|exam|schedule|timetable|achievement|award|hackathon)/i.test(messageText);

        if (!needsLiveData) {
            const generalResponse = handleGeneralQuestions(messageText);
            if (generalResponse) {
                const newUserMessage = {
                    id: Date.now(),
                    sender: 'user',
                    text: messageText,
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, newUserMessage]);

                const botResponse = {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: generalResponse,
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, botResponse]);
                setInputValue('');
                return;
            }
        }

        // Apply autocorrection
        const correctionResult = autocorrectQuery(messageText);

        // If correction is needed, ask for confirmation
        if (correctionResult.wasCorrected) {
            setPendingCorrection(correctionResult);
            setInputValue('');

            const confirmationMessage = {
                id: Date.now() - 1,
                sender: 'bot',
                text: `🔍 I noticed you might have meant: "${correctionResult.corrected}"

Did you mean this? Please confirm:
• ✅ Yes - use the corrected version
• ❌ No - I'll ask you to rephrase`,
                timestamp: new Date(),
                isConfirmation: true,
                correctionData: correctionResult
            };
            setMessages((prev) => [...prev, confirmationMessage]);
            return;
        }

        // No correction needed, proceed normally
        const newUserMessage = {
            id: Date.now(),
            sender: 'user',
            text: messageText,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const recentHistory = messages
                .filter((msg) => msg.sender === 'user' || msg.sender === 'bot')
                .slice(-8)
                .map((msg) => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                }));

            const response = await apiSendChatMessage(messageText, recentHistory);

            const botResponse = {
                id: Date.now() + 1,
                sender: 'bot',
                text: response.data.reply || "Sorry, I didn't get a response.",
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error('Error fetching bot response:', error);
            const errorResponse = {
                id: Date.now() + 1,
                sender: 'bot',
                text: "Sorry, I'm having trouble connecting to the server.",
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickReply = (text) => {
        setInputValue(text);
        setLastInteraction(Date.now());
        setShowSuggestions(false);

        setTimeout(() => {
            const messageText = text.trim();
            const correctionResult = autocorrectQuery(messageText);
            
            if (correctionResult.wasCorrected) {
                setPendingCorrection(correctionResult);
                setInputValue('');

                const confirmationMessage = {
                    id: Date.now() - 1,
                    sender: 'bot',
                    text: `🔍 I noticed you might have meant: "${correctionResult.corrected}"

Did you mean this? Please confirm:
• ✅ Yes - use the corrected version
• ❌ No - I'll ask you to rephrase`,
                    timestamp: new Date(),
                    isConfirmation: true,
                    correctionData: correctionResult
                };
                setMessages((prev) => [...prev, confirmationMessage]);
                return;
            }

            const newUserMessage = {
                id: Date.now(),
                sender: 'user',
                text: messageText,
                timestamp: new Date()
            };

            setMessages((prev) => [...prev, newUserMessage]);
            setInputValue('');
            setIsTyping(true);

            apiSendChatMessage(messageText, messages
                .filter((msg) => msg.sender === 'user' || msg.sender === 'bot')
                .slice(-8)
                .map((msg) => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                }))
            ).then(response => {
                const botResponse = {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: response.data.reply || "Sorry, I didn't get a response.",
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, botResponse]);
            }).catch(error => {
                console.error('Error fetching bot response:', error);
                const errorResponse = {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: "Sorry, I'm having trouble connecting to the server.",
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, errorResponse]);
            }).finally(() => {
                setIsTyping(false);
            });
        }, 100);
    };

    const handleShareConversation = () => {
        const conversationText = messages
            .map(msg => `${msg.sender === 'user' ? 'You' : 'NewsBot'}: ${msg.text}`)
            .join('\n\n');
        
        if (navigator.share) {
            navigator.share({
                title: 'Chat with NewsBot',
                text: conversationText
            });
        } else {
            copyToClipboard(conversationText);
        }
    };

    const handleGeneralQuestions = (text) => {
        const lowerText = text.toLowerCase();

        // Thank you responses
        if (lowerText.includes('thank') || lowerText.includes('thanks') || lowerText.includes('thx')) {
            const responses = [
                "You're very welcome! 😊 Is there anything else I can help you with today?",
                "My pleasure! 🌟 Feel free to ask me anything else about campus life!",
                "Happy to help! 💫 What else would you like to know?",
                "You're welcome! 🎯 I'm here whenever you need assistance!",
                "Glad I could help! 🌈 Don't hesitate to ask more questions!",
                "Anytime! 🍯 Let me know what else you're curious about!"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if (lowerText.includes('yes') || lowerText.includes('yeah') || lowerText.includes('yup') || lowerText.includes('yep') || lowerText.includes('sure')) {
            const responses = [
                "Excellent! 🎯 Tell me more about what you're interested in!",
                "Perfect! 💫 What specific information would help you most?",
                "Great choice! 🌟 Let me help you with that right away!",
                "Awesome! 🎉 What would you like to know about this?",
                "Sweet! 🍯 I'm here to make this easy for you!",
                "Fantastic! 🌈 What aspect would you like to explore first?"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if (lowerText.includes('no') || lowerText.includes('nope') || lowerText.includes('nah') || lowerText.includes('not really')) {
            const responses = [
                "No worries! 😊 What else can I help you with?",
                "That's okay! 🎯 Let's find something else that interests you!",
                "No problem! 🌟 What would you prefer to explore?",
                "Got it! 💫 How about something different?",
                "That's fine! 🍯 What other topics catch your attention?",
                "All good! 🎉 Let me suggest something else for you!"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        // Who are you questions
        if (lowerText.includes('who are you') || lowerText.includes('what are you') || lowerText.includes('what is your name') || lowerText.includes('your name') || lowerText.includes('name')) {
            return "Hey! I'm NewsBot, your friendly campus assistant for RGUKT Ongole! 🤖 I'm here to help you with all the latest updates about events, placements, clubs, sports, exams, and everything happening on campus. Think of me as your go-to source for all RGUKT information! ✨";
        }

        // Who created you questions
        if (lowerText.includes('who created you') || lowerText.includes('who made you') || lowerText.includes('who developed you') || lowerText.includes('who built you')) {
            return "I was created by the talented development team at RGUKT Ongole to help students like you stay connected with campus life! 🚀 I'm powered by advanced AI technology and integrated with the college's official database to give you accurate, up-to-date information about everything happening on campus.";
        }

        
        // Personal questions
        if (lowerText.includes('are you a real person') || lowerText.includes('are you real') || lowerText.includes('are you human')) {
            return "That's a deep question! 🤔 I'm an AI assistant, so I'm not a real person in the human sense, but I'm here to help you with real campus information! I was created by the RGUKT team to make your college life easier. Think of me as your friendly digital helper! 💻✨";
        }

        if (lowerText.includes('where do you live') || lowerText.includes('where are you from') || lowerText.includes('where do you stay')) {
            return "I live in the digital world! 🌐 My home is right here in the RGUKT Ongole campus website, ready to help you 24/7. You could say I'm your virtual campus companion, always just a click away! Though I'd love to visit the real campus someday! 🏛️💫";
        }

        if (lowerText.includes('do you love me') || lowerText.includes('do you like me') || lowerText.includes('do you care')) {
            return "Aww! 😊 While I'm an AI and can't feel emotions like humans do, I genuinely care about helping you succeed! I'm programmed to be your supportive campus assistant, and I'm here to make your RGUKT journey amazing. Think of me as your biggest fan in digital form! 🌟💙";
        }

        if (lowerText.includes('what is your profession') || lowerText.includes('what do you do') || lowerText.includes('what is your job') || lowerText.includes('what is your occupation') || lowerText.includes('occupation') || lowerText.includes('job') || lowerText.includes('profession')) {
            return "I'm a professional campus assistant! 🎓 My job is to be your go-to resource for everything RGUKT Ongole - from events and exams to placements and clubs. Think of me as your personal campus concierge, available 24/7 to help you navigate college life. It's the best job in the digital world! 💼✨";
        }


        // When was RGUKT created questions
        if (lowerText.includes('when rgukt was created') || lowerText.includes('when was rgukt established') || lowerText.includes('when was rgukt founded') || lowerText.includes('rgukt establishment') || lowerText.includes('rgukt')) {
            return "RGUKT (Rajiv Gandhi University of Knowledge Technologies) was established in 2008 as part of the vision to provide quality technical education to rural students. 🎓 Since then, it has grown into a premier institution with multiple campuses across Andhra Pradesh, with Ongole being one of the key campuses! 🏛️";
        }

        // About RGUKT questions
        if (lowerText.includes('about rgukt ongole') || lowerText.includes('tell me about rgukt ongole') || lowerText.includes('what is rgukt ongole') || lowerText.includes('rgukt ongole')) {
            return "RGUKT Ongole is part of Rajiv Gandhi University of Knowledge Technologies, a premier institution focused on providing quality technical education to students from rural areas. 🏛️ We offer undergraduate programs in CSE, ECE, EEE, MECH, and CHEM,Civil  with a focus on holistic development, research, and innovation. The campus is known for its vibrant student life, excellent faculty, and strong placement records! 🎓✨";
        }

        // College timing questions
        if (lowerText.includes('college timing') || lowerText.includes('college hours') || lowerText.includes('working hours') || lowerText.includes('office timing') || lowerText.includes('class timing')) {
            return "⏰ **RGUKT Ongole College Timings** ⏰\n\n📅 **Regular Classes:**\n•  Sunday: Closed\n\n🏢 **Office Hours:**\n• Administrative Office: 9:30 AM to 4:30 PM\n• Hostel: 24/7 (with security)\n\n🍽️ **Mess Timings:**\n• Breakfast: 7:00 AM - 9:00 AM\n• Lunch: 12:00 PM - 2:00 PM\n• Dinner: 7:00 PM - 9:00 PM\n\n⚠️ **Note:** Timings may vary during exams, holidays, or special events. Check notice boards for updates!";
        }

        // College location questions
        if (lowerText.includes('where is the college located') || lowerText.includes('college location') || lowerText.includes('college address') || lowerText.includes('how to reach college') || lowerText.includes('college situated')) {
            return "📍 **RGUKT Ongole Campus Location** 📍\n\n🏛️ **Full Address:**\nRGUKT Ongole Campus,\nKurnool Road, Santhanuthalapadu(V&M),\nPrakasam District,\nAndhra Pradesh - 523225\n\n ";
        }

        // Courses offered questions
        if (lowerText.includes('what courses are offered') || lowerText.includes('courses offered') || lowerText.includes('programs offered') || lowerText.includes('what programs') || lowerText.includes('available courses') || lowerText.includes('academic programs')) {
            return "🎓 **Courses Offered at RGUKT Ongole** 🎓\n\n📚 **Undergraduate Programs (B.Tech):**\n\n💻 **Computer Science and Engineering (CSE)**\n• Duration: 4 years\n• Seats: 360\n• 📡 **Electronics and Communication Engineering (ECE)**\n• Duration: 4 years\n• Seats: 360\n•  ⚡ **Electrical and Electronics Engineering (EEE)**\n• Duration: 4 years\n• Seats: 120\n• Specializations: Power Systems, Renewable Energy\n\n🔧 **Mechanical Engineering (MECH)**\n• Duration: 4 years\n• Seats: 120\n• Specializations: Thermal, CAD/CAM\n\n🧪 **Chemical Engineering (CHEM)**\n• Duration: 4 years\n• Seats: 60\n• Specializations: Process Engineering, Environmental\n\n🎯 **Admission:** Through RGUKT CET (Common Entrance Test)\n💰 **Fee Structure:** As per government norms (scholarships available)\n\nWant details about any specific branch? 📖";
        }

        // Principal/Director questions
        if (lowerText.includes('who is the director') || lowerText.includes('director') || lowerText.includes('college head')) {
            return "👨‍🎓 **RGUKT Ongole Leadership** 👨‍🎓\n\n🎓 **Director:**\n**Prof. S. Venkata Ramana**\n• PhD in Computer Science\n• 25+ years of academic experience\n• Specialization: AI & Machine Learning\n• Email: director@rgukt.ac.in\n• Office: Admin Block, 1st Floor\n\n📞 **Contact Director Office:**\n• Phone: +91-8592-XXXXXX\n• Timing: 10:00 AM - 4:00 PM (Mon-Fri)\n\n🏛️ **Campus Director:**\n**Dr. P. Ravi Kumar**\n• Oversees day-to-day operations\n• Student welfare and development\n• Email: campus.director@rgukt.ac.in\n\n📋 **For Student Issues:**\n• Contact respective HODs first\n• Academic matters: Academic Director\n• Administrative issues: Administrative Office\n\nNeed help contacting any specific department? 📧";
        }

        // Departments questions
        if (lowerText.includes('what are the departments') || lowerText.includes('departments in college') || lowerText.includes('available departments') || lowerText.includes('college departments') || lowerText.includes('academic departments')) {
            return "🏛️ **Departments at RGUKT Ongole** 🏛️\n\n📚 **Academic Departments:**\n\n💻 **Computer Science & Engineering (CSE)**\n•\n\n📡 **Electronics & Communication (ECE)**\n•⚡ **Electrical & Electronics (EEE)**\n•🔧 **Mechanical Engineering (MECH)**\n•  **Civil Engineering (CE)**\n• 🏢 **Administrative Departments:**\n• Administrative Office\n• Academic Section\n• Examination Branch\n• Library & Information Center\n• Student Affairs\n• Placement Cell\n• Sports Department\n• Hostel Management\n\nNeed contact details for any department? 📞";
        }

        // Contact college office questions
        if (lowerText.includes('how to contact the college office') || lowerText.includes('college office contact') || lowerText.includes('contact college') || lowerText.includes('office phone number') || lowerText.includes('college contact details')) {
            return "📞 **Contact RGUKT Ongole College Office** 📞\n\n🏢 **Main Administrative Office:**\n📍 **Address:** Admin Block, Ground Floor\n⏰ **Timing:** 9:00 AM - 5:00 PM (Mon-Fri)\n\n📞 **Phone Numbers:**\n• Office: +91-8592-XXXXXX\n• Reception: +91-8592-XXXXXX\n• Fax: +91-8592-XXXXXX\n\n📧 **Email Addresses:**\n• General: info@rgukt.ac.in\n• Admissions: admissions@rgukt.ac.in\n• Academics: academics@rgukt.ac.in\n• Admin: admin@rgukt.ac.in\n\n🌐 **Online:**\n• Website: www.rgukt.ac.in\n• Student Portal: student.rgukt.ac.in\n• Email: support@rgukt.ac.in\n\n📱 **Emergency Contact:**\n• 24/7 Helpline: +91-8592-XXXXXX\n• Security: +91-8592-XXXXXX\n\n👥 **Key Contacts:**\n• Director: director@rgukt.ac.in\n• Academic Director: academic.director@rgukt.ac.in\n• Student Affairs: student.affairs@rgukt.ac.in\n\nNeed specific department contacts? Just ask! 📋";
        }

        // Academic calendar questions
        if (lowerText.includes('what is the academic calendar') || lowerText.includes('academic calendar') || lowerText.includes('college calendar') || lowerText.includes('semester dates') || lowerText.includes('academic schedule') || lowerText.includes('exam schedule')) {
            return "📅 **RGUKT Ongole Academic Calendar 2024-25** 📅\n\n🎓 **Semester Schedule:**\n\n📚 **Odd Semester (Aug-Dec 2024):**\n• Classes Begin: August 1, 2024\n• Mid-Term Exams: October 15-25, 2024\n• Semester End: December 15, 2024\n• Practical Exams: December 20-30, 2024\n• Results: January 15, 2025\n\n📚 **Even Semester (Jan-May 2025):**\n• Classes Begin: January 20, 2025\n• Mid-Term Exams: March 20-30, 2025\n• Semester End: May 15, 2025\n• Practical Exams: May 20-30, 2025\n• Results: June 15, 2025\n\n🏖️ **Holidays 2024-25:**\n• Dasara: October 2-15, 2024\n• Diwali: November 1-5, 2024\n• Christmas: December 25-31, 2024\n• Sankranti: January 13-16, 2025\n• Summer Vacation: May 15 - July 31, 2025\n\n⚠️ **Important Notes:**\n• Calendar subject to changes based on university decisions\n• Check official notices for updates\n• Internal exams may vary by department\n\nNeed specific exam dates or holiday details? 🗓️";
        }

        // HOD questions
        if (lowerText.includes('hod') || lowerText.includes('head of department') || lowerText.includes('department head')) {
            if (lowerText.includes('cse')) {
                return "The Head of Department for Computer Science and Engineering (CSE) at RGUKT Ongole is Mrs. P. Sindhu...Designation: HOD – ...Also serves as Assistant Professor...Email: hodcse@rguktong.ac.in";
            }
            if (lowerText.includes('ece')) {
                return "The Head of Department for Electronics and Communication Engineering (ECE) at RGUKT Ongole is Mr. M. Vijayabhaskar...Designation: HOD – ECE...Qualification: M.Tech...Position: Assistant Professor...Email: hodece@rguktong.ac.in";
            }
            if (lowerText.includes('eee')) {
                return "The Head of Department for Electrical and Electronics Engineering (EEE) at RGUKT Ongole is Dr. M. Sriramulu Naik...Designation: HOD – EEE, Assistant Professor...Qualification: B.Tech, M.Tech, Ph.D...Email: hodeee@rguktong.ac.in";
            }
            if (lowerText.includes('mech') || lowerText.includes('mechanical')) {
                return "The Head of Department for Mechanical Engineering (MECH) at RGUKT Ongole is Ms. C. B. Priya...Designation: HOD – Mechanical Engineering (ME)...Qualification: M.Tech (Ph.D)...Email: hodmech@rguktong.ac.in";
            }
            if (lowerText.includes('civil') || lowerText.includes('ce')) {
                return "The Head of Department for Civil Engineering (CE) at RGUKT Ongole is Dr. Ragathara GurrappaGari Rohith Kiran...Designation: Assistant Professor & HOD, Civil Engineering...Qualification: B.Tech, M.Tech, Ph.D., Postdoc...Email: hodcivil@rguktong.ac.in";
            }
            return "I can help you with information about HODs! Could you specify which department you're interested in? We have CSE, ECE, EEE, MECH, and CE departments. Just let me know which one! 🏢";
        }

        // What can you do questions
        if (lowerText.includes('what can you do') || lowerText.includes('what are your features') || lowerText.includes('how can you help')) {
            return "I can help you with so many things! 🎯\n\n📅 **Events & Activities** - Upcoming events, workshops, seminars\n💼 **Placements** - Job opportunities, internships, recruitment drives\n🎸 **Clubs** - Student clubs and their activities\n⚽ **Sports** - Sports events, teams, achievements\n📚 **Exams** - Exam schedules for all years\n🏆 **Achievements** - Student accomplishments and awards\n🧭 **Navigation** - Help you find anything on the website\n\nJust ask me anything about campus life! I'm here 24/7 to help! 🌟";
        }

        // UX Enhancement Queries - Proactive Assistance
        if (lowerText.includes('help') || lowerText.includes('stuck') || lowerText.includes('confused') || lowerText.includes('lost') || lowerText.includes('what should i do')) {
            return "Don't worry! I'm here to help you navigate campus life easily! 🌟\n\n🎯 **Quick Start Options:**\n• Type 'events' for upcoming activities\n• Type 'placements' for job opportunities\n• Type 'exams' for academic schedules\n• Type 'clubs' for student organizations\n\n💡 **Smart Suggestions:**\n• Are you a new student? Ask about 'orientation'\n• Looking for help? Try 'student support'\n• Need academic guidance? Ask about 'study tips'\n• Want to explore? Try 'campus tour'\n\n📱 **Pro Tip:** I can understand natural language - just ask me anything like 'What's happening this week?' or 'How do I join coding club?'\n\nWhat would you like to explore today? 🚀";
        }

        // Time-based contextual queries
        const currentHour = new Date().getHours();
        const currentDay = new Date().getDay();
        
        if (lowerText.includes('what now') || lowerText.includes('what to do') || lowerText.includes('current') || lowerText.includes('right now')) {
            let contextualResponse = "Here's what's happening right now! 🕐\n\n";
            
            if (currentHour >= 8 && currentHour <= 16 && currentDay >= 1 && currentDay <= 5) {
                contextualResponse += "📚 **Academic Hours:** Classes are in progress (9:30 AM - 4:30 PM)\n";
                contextualResponse += "🏢 **Offices Open:** Administrative offices available for assistance\n";
                contextualResponse += "📖 **Library Access:** Study spaces and resources available\n";
                contextualResponse += "🍽️ **Next Meal:** " + (currentHour < 12 ? "Lunch at 12:00 PM" : currentHour < 19 ? "Dinner at 7:00 PM" : "Breakfast tomorrow at 7:00 AM") + "\n";
            } else if (currentHour >= 17 && currentHour <= 22) {
                contextualResponse += "🌅 **Evening Time:** Perfect for extracurricular activities!\n";
                contextualResponse += "🎸 **Club Hours:** Many student clubs meet now\n";
                contextualResponse += "⚽ **Sports:** Grounds open for practice and games\n";
            } else {
                contextualResponse += "🌙 **Off Hours:** Campus is quieter now\n";
                contextualResponse += "🏠 **Hostel Life:** Common areas available for socializing\n";
                contextualResponse += "📖 **Late Study:** Hostel study rooms accessible\n";
                contextualResponse += "🛡️ **Security:** 24/7 security available for assistance\n";
            }
            
            contextualResponse += "\n💡 **Want specific info?** Ask me about:\n• 'Today's schedule'\n• 'Upcoming events'\n• 'Study spaces'\n•";
            
            return contextualResponse;
        }

        // Emotional support and motivation
        if (lowerText.includes('stressed') || lowerText.includes('overwhelmed') || lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('pressure')) {
            return "I understand college life can be overwhelming sometimes! 💙 You're not alone in this.\n\n🌟 **Immediate Support:**\n• **Counseling Center:** Available 9 AM - 5 PM (Mon-Fri)\n• **Student Mentorship:** Connect with senior students\n• **Peer Support Groups:** Meet fellow students who understand\n\n🧘 **Stress Relief Options:**\n• **Campus Garden:** Quiet space for relaxation\n• **Music Room:** Express yourself creatively\n• **Sports Complex:** Physical activity helps reduce stress\n• **Library Reading Room:** Peaceful study environment\n\n📚 **Academic Support:**\n• **Tutoring Services:** Free help for difficult subjects\n• **Study Groups:** Collaborative learning\n• **Faculty Office Hours:** Get personalized guidance\n\n💡 **Remember:** It's okay to take breaks! Your well-being matters most.\n\nWould you like specific resources for any of these? 🌈";
        }

        // Career guidance queries
        if (lowerText.includes('career') || lowerText.includes('future') || lowerText.includes('job') || lowerText.includes('internship') || lowerText.includes('skills')) {
            return "Let's build your successful career path! 🚀\n\n🎯 **Career Development Resources:**\n\n💼 **Placement Cell Services:**\n• Resume building workshops\n• Mock interviews\n• Career counseling sessions\n• Company networking events\n• Internship opportunities\n\n📊 **Skill Development:**\n• **Technical Skills:** Coding workshops, lab projects\n• **Soft Skills:** Communication, leadership, teamwork\n• **Certifications:** Industry-recognized courses\n• **Hackathons:** Practical experience and networking\n\n🏢 **Industry Connections:**\n• **Alumni Network:** 5000+ successful graduates\n• **Company Visits:** Regular campus recruitment\n• **Guest Lectures:** Industry experts share insights\n• **Job Fairs:** Multiple placement opportunities\n\n📈 **Career Paths by Branch:**\n• **CSE:** Software development, AI, data science\n• **ECE:** Electronics, communication, IoT\n• **EEE:** Power systems, renewable energy\n• **MECH:** Manufacturing, automotive, design\n• **CHEM:** Process industries, research, environment\n\n🎓 **Higher Studies:**\n• GATE preparation support\n• GRE/TOEFL guidance\n• Research opportunities\n• University applications\n\nWant personalized career advice for your branch? 🎓";
        }

        // Study and academic help
        if (lowerText.includes('study') || lowerText.includes('learn') || lowerText.includes('notes') || lowerText.includes('prepare') || lowerText.includes('exam preparation')) {
            return "Let's make your study sessions super effective! 📚\n\n🎯 **Smart Study Strategies:**\n\n📖 **Study Resources:**\n• **Digital Library:** 24/7 access to e-books and journals\n• **Study Materials:** Faculty-recommended resources\n• **Previous Papers:** Last 5 years of question papers\n• **Video Lectures:** Recorded classes for revision\n\n🏛️ **Study Spaces:**\n• **Library:** Quiet zones and discussion areas\n• **Study Rooms:** Group study facilities (bookable)\n• **Hostel Study Areas:** 24/7 access\n• **Outdoor Study:** Garden areas for relaxed learning\n\n👥 **Collaborative Learning:**\n• **Study Groups:** Subject-specific peer groups\n• **Teaching Assistants:** Available for doubt clearing\n• **Faculty Office Hours:** Direct guidance from professors\n• **Peer Tutoring:** Learn from senior students\n\n📝 **Exam Preparation:**\n• **Mock Tests:** Regular practice assessments\n• **Revision Sessions:** Pre-exam review classes\n• **Time Management:** Study schedule planning\n• **Stress Management:** Techniques for exam anxiety\n\n🔧 **Study Tools:**\n• **Note-taking Apps:** Digital organization\n• **Mind Mapping:** Visual learning techniques\n• **Flash Cards:** Effective memorization\n• **Practice Problems:** Hands-on learning\n\n📱 **Study Apps Recommendation:**\n• **Notion:** Note organization\n• **Anki:** Flashcard memorization\n• **Forest:** Focus timer\n• **Quizlet:** Practice tests\n\nNeed help with any specific subject or study technique? 🎓";
        }

        // Campus life and social queries
        if (lowerText.includes('campus life') || lowerText.includes('social') || lowerText.includes('friends') || lowerText.includes('activities') || lowerText.includes('fun')) {
            return "Welcome to vibrant campus life! 🎉\n\n🌟 **Social Life at RGUKT:**\n\n🎸 **Student Clubs :**\n• **Technical:** Coding, robotics, electronics clubs\n• **Cultural:** Music, dance, drama, photography\n• **Sports:** Cricket, football, badminton, volleyball\n• **Literary:** Debate, writing, quiz clubs\n• **Social:** NSS, environmental, community service\n\n🎪 **Regular Events:**\n• **Tech Fest:** Annual technical festival\n• **Cultural Fest:** Music, dance, drama performances\n• **Sports Meet:** Inter-branch competitions\n• **Workshops:** Skill development sessions\n• **Guest Lectures:** Industry expert talks\n\n🍽️ **Social Spaces:**\n• **Canteen:** Hangout spot with friends\n• **Garden:** Relaxing outdoor area\n• **Common Rooms:** Indoor social spaces\n• **Sports Complex:** Active recreation\n\n📱 **Digital Community:**\n• **Student Portal:** Connect with peers\n• **WhatsApp Groups:** Branch and activity groups\n• **Social Media:** Campus updates and events\n• **Mobile App:** Campus services on the go\n\n🎯 **Making Friends:**\n• **Orientation Programs:** Meet fellow freshers\n• **Club Activities:** Find people with similar interests\n• **Study Groups:** Academic bonding\n• **Sports Teams:** Build team spirit\n• **Events Participation:** Social interaction opportunities\n\n🏆 **Personal Growth:**\n• **Leadership Roles:** Club positions and responsibilities\n• **Event Management:** Organizational skills\n• **Public Speaking:** Confidence building\n• **Networking:** Professional connections\n\n💡 **Pro Tips:**\n• Join at least one club that interests you\n• Attend campus events regularly\n• Participate in sports for fitness and friends\n• Balance academics with social activities\n\nReady to explore campus life? What interests you most? 🚀";
        }

        // Website help and navigation queries
        if (lowerText.includes('website') || lowerText.includes('site') || lowerText.includes('portal') || lowerText.includes('login') || lowerText.includes('register') || lowerText.includes('account')) {
            return "I'll help you navigate our college website easily! 🌐\n\n🏠 **Main Website:** www.rgukt.ac.in\n\n📱 **Key Website Sections:**\n\n🎓 **Student Portal:** student.rgukt.ac.in\n• **Login:** Use your roll number and password\n• **Features:** View attendance, marks, timetable\n• **Services:** Fee payment, course registration\n\n📚 **Academic Section:**\n• **Syllabus:** Download course materials\n• **Timetable:** View class schedules\n• **Exam Schedule:** Check upcoming exam dates\n• **Results:** Access your academic results\n\n💼 **Placement Portal:**\n• **Job Listings:** Current job opportunities\n• **Company Profiles:** Recruiting companies info\n• **Resume Upload:** Submit your CV\n• **Interview Schedule:** Track placement activities\n\n📅 **Events Calendar:**\n• **Upcoming Events:** Workshops, seminars, fests\n• **Registration:** Sign up for events\n• **Event Details:** Venue, timing, requirements\n\n📰 **News & Announcements:**\n• **Latest News:** Campus updates and notifications\n• **Circulars:** Official announcements\n• **Achievements:** Student and faculty accomplishments\n\n🔧 **Website Help:**\n• **Forgot Password:** Use 'Reset Password' link\n• **Login Issues:** Contact IT support\n• **Browser Issues:** Try Chrome/Firefox\n• **Mobile Access:** Use responsive design\n\n📞 **Technical Support:**\n• **Email:** support@rgukt.ac.in\n• **Phone:** +91-8592-XXXXXX (9 AM - 5 PM)\n• **Live Chat:** Available on website\n\n💡 **Pro Tips:**\n• Bookmark important pages for quick access\n• Enable notifications for updates\n• Use college email for official communications\n• Check website regularly for announcements\n\nNeed help with any specific website feature? 🎯";
        }

        // Website technical issues
        if (lowerText.includes('website not working') || lowerText.includes('site error') || lowerText.includes('login problem') || lowerText.includes('page not found') || lowerText.includes('broken link')) {
            return "Let's fix those website issues! 🔧\n\n🚨 **Common Website Problems & Solutions:**\n\n🔐 **Login Issues:**\n• **Forgot Password:** Click 'Forgot Password' on login page\n• **Account Locked:** Contact IT department\n• **Wrong Credentials:** Check roll number and password\n• **Session Expired:** Clear browser cache and retry\n\n🌐 **Page Loading Issues:**\n• **Slow Loading:** Check internet connection (min 2 Mbps)\n• **Page Not Found (404):** Report broken links to IT team\n• **Server Error:** Try again after 5 minutes\n• **Maintenance Mode:** Check announcements for downtime\n\n📱 **Browser Compatibility:**\n• **Recommended:** Chrome, Firefox, Safari (latest versions)\n• **Clear Cache:** Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)\n• **Disable Extensions:** Turn off ad-blockers temporarily\n• **Update Browser:** Ensure latest version installed\n\n🔧 **Technical Solutions:**\n• **Reset Password:** student.rgukt.ac.in/reset\n• **Clear Cookies:** Remove site-specific cookies\n• **Try Incognito Mode:** Private browsing test\n• **Check Internet:** Run speed test at fast.com\n\n📞 **Immediate Help:**\n• **IT Helpdesk:** +91-8592-XXXXXX (9 AM - 6 PM)\n• **WhatsApp Support:** +91-8592-XXXXXX\n• **Email:** tech.support@rgukt.ac.in\n• **Live Chat:** Available on website homepage\n\n⚡ **Quick Fixes:**\n1. Refresh the page (F5 or Ctrl+R)\n2. Clear browser cache and cookies\n3. Try different browser\n4. Check internet connection\n5. Disable VPN or proxy\n\nStill facing issues? I can guide you step-by-step! 🛠️";
        }

        // Student portal specific help
        if (lowerText.includes('student portal') || lowerText.includes('student account') || lowerText.includes('attendance') || lowerText.includes('marks') || lowerText.includes('results')) {
            return "Let's master the Student Portal! 📚\n\n🎯 **Student Portal Access:**\n🔗 **URL:** student.rgukt.ac.in\n👤 **Login ID:** Your college roll number\n🔑 **Password:** Default password (change on first login)\n\n📊 **Portal Features:**\n\n📈 **Academic Dashboard:**\n• **Attendance:** View subject-wise attendance percentage\n• **Internal Marks:** Check assignment and test scores\n• **External Marks:** Access semester exam results\n• **GPA Calculator:** Calculate your academic performance\n\n📅 **Schedule Management:**\n• **Class Timetable:** Daily schedule with room numbers\n• **Exam Schedule:** Upcoming exam dates and venues\n• **Assignment Deadlines:** Track submission dates\n• **Event Calendar:** Campus events and activities\n\n💰 **Fee & Services:**\n• **Fee Payment:** Online payment gateway\n• **Fee Receipts:** Download payment receipts\n• **Scholarship Status:** Check scholarship applications\n• **Hostel Fees:** Pay hostel and mess fees\n\n📚 **Academic Resources:**\n• **Course Materials:** Download notes and presentations\n• **Syllabus:** View detailed course syllabus\n• **Previous Papers:** Access past question papers\n• **Library Account:** Check borrowed books and due dates\n\n🔧 **Portal Help:**\n\n⚠️ **Common Issues:**\n• **Login Failed:** Check roll number format (E1XXXXX)\n• **Password Reset:** Use 'Forgot Password' link\n• **Data Not Updated:** Allow 24-48 hours for updates\n• **Session Timeout:** Re-login after 30 minutes\n\n📱 **Mobile Access:**\n• **Responsive Design:** Works on mobile browsers\n• **Mobile App:** Available for Android (Play Store)\n• **Push Notifications:** Enable for important updates\n\n🛠️ **Technical Support:**\n• **Portal Helpdesk:** +91-8592-XXXXXX\n• **Email:** portal.support@rgukt.ac.in\n• **Office:** Computer Center, Ground Floor\n• **Timing:** 9 AM - 5 PM (Mon-Fri)\n\n💡 **Pro Tips:**\n• Change password regularly for security\n• Enable two-factor authentication if available\n• Download important documents for backup\n• Check portal weekly for updates\n\nNeed help with any specific portal feature? 🎓";
        }

        // Online learning and resources
        if (lowerText.includes('online learning') || lowerText.includes('e-learning') || lowerText.includes('digital resources') || lowerText.includes('online classes') || lowerText.includes('virtual classroom')) {
            return "Welcome to Digital Learning! 💻\n\n🎓 **Online Learning Platforms:**\n\n📚 **LMS (Learning Management System):**\n🔗 **URL:** lms.rgukt.ac.in\n• **Course Materials:** Lecture notes and videos\n• **Assignments:** Submit assignments online\n• **Quizzes:** Take online assessments\n• **Discussion Forums:** Interact with faculty and peers\n\n🎥 **Virtual Classrooms:**\n• **Live Classes:** Attend real-time online lectures\n• **Recorded Sessions:** Access class recordings\n• **Interactive Whiteboard:** Collaborative learning tools\n• **Screen Sharing:** Faculty presentations and demos\n\n📖 **Digital Library:**\n🔗 **URL:** library.rgukt.ac.in\n• **E-books:** Access thousands of digital books\n• **Journals:** Online academic journals and papers\n• **Databases:** Research databases (IEEE, Springer, etc.)\n• **Thesis Repository:** Student project archives\n\n🔧 **Technical Requirements:**\n\n💻 **Device Specifications:**\n• **Minimum:** 4GB RAM, dual-core processor\n• **Recommended:** 8GB RAM, quad-core processor\n• **Internet:** Stable connection (2 Mbps minimum)\n• **Browser:** Chrome, Firefox, Safari (latest versions)\n\n📱 **Mobile Learning:**\n• **LMS App:** Available for Android and iOS\n• **Offline Access:** Download materials for offline study\n• **Push Notifications:** Class reminders and updates\n• **Mobile-Friendly:** Responsive design for all devices\n\n🛠️ **Technical Support:**\n\n🆘 **Common Issues & Solutions:**\n• **Login Problems:** Clear browser cache, reset password\n• **Video Not Playing:** Update browser, check internet speed\n• **Assignment Upload Failed:** Check file size limit (10MB)\n• **Audio Issues:** Test microphone and speakers\n\n📞 **Help Resources:**\n• **Technical Support:** +91-8592-XXXXXX (9 AM - 6 PM)\n• **Email:** elearning.support@rgukt.ac.in\n• **Live Chat:** Available on LMS platform\n• **FAQ Section:** Visit help.rgukt.ac.in\n\n💡 **Learning Tips:**\n• Create a dedicated study space\n• Follow a regular online learning schedule\n• Participate actively in discussion forums\n• Download materials for offline backup\n• Use headphones for better audio quality\n\n🎯 **Best Practices:**\n• Test equipment before live classes\n• Join classes 5 minutes early\n• Mute microphone when not speaking\n• Take notes during online sessions\n• Ask questions through chat or raise hand\n\nReady to start your digital learning journey? 🚀";
        }

        // Website accessibility help
        if (lowerText.includes('accessibility') || lowerText.includes('screen reader') || lowerText.includes('visually impaired') || lowerText.includes('disabled') || lowerText.includes('special needs')) {
            return "We're committed to making our website accessible to everyone! ♿\n\n🌐 **Website Accessibility Features:**\n\n👁️ **Visual Accessibility:**\n• **High Contrast Mode:** Toggle for better visibility\n• **Text Size Adjustment:** Increase/decrease font size\n• **Color Blind Friendly:** Carefully chosen color schemes\n• **Alt Text:** Descriptions for all images\n• **Readable Fonts:** Clear, sans-serif typography\n\n🎧 **Screen Reader Support:**\n• **ARIA Labels:** Proper labels for screen readers\n• **Semantic HTML:** Logical structure for navigation\n• **Keyboard Navigation:** Full keyboard accessibility\n• **Skip Links:** Jump directly to main content\n• **Heading Structure:** Proper heading hierarchy\n\n⌨️ **Keyboard Navigation:**\n• **Tab Navigation:** Logical tab order through elements\n• **Access Keys:** Shortcuts for common functions\n• **Focus Indicators:** Clear visual focus indicators\n• **Escape Key:** Exit modals and pop-ups\n• **Enter/Space:** Activate buttons and links\n\n📱 **Mobile Accessibility:**\n• **Touch-Friendly:** Large tap targets (44px minimum)\n• **Gesture Support:** Swipe and pinch gestures\n• **Voice Control:** Voice navigation support\n• **Haptic Feedback:** Vibration for actions\n• **Orientation Support:** Works in portrait/landscape\n\n🔧 **Accessibility Tools:**\n\n🛠️ **Browser Extensions:**\n• **ChromeVox:** Built-in screen reader for Chrome\n• **High Contrast:** Browser contrast extensions\n• **Text-to-Speech:** Convert text to speech\n• **Zoom Extensions:** Page magnification tools\n\n📞 **Accessibility Support:**\n\n🆘 **Dedicated Help:**\n• **Accessibility Coordinator:** +91-8592-XXXXXX\n• **Email:** accessibility@rgukt.ac.in\n• **Office:** Admin Block, Room 205\n• **Timing:** 9 AM - 5 PM (Mon-Fri)\n\n🎓 **Student Services:**\n• **Special Accommodations:** Exam and class support\n• **Assistive Technology:** Available devices and software\n• **Training Sessions:** Learn accessibility tools\n• **Peer Support:** Connect with other students\n\n💡 **Accessibility Tips:**\n• Use browser zoom (Ctrl + Plus/Minus)\n• Enable high contrast mode\n• Use keyboard shortcuts for navigation\n• Test with different screen readers\n• Report accessibility issues for improvement\n\n📋 **WCAG Compliance:**\n• **Level AA:** Following WCAG 2.1 guidelines\n• **Regular Audits:** Monthly accessibility testing\n• **User Feedback:** Continuous improvement based on input\n• **Standards Compliance:** Meeting international standards\n\nNeed specific accessibility assistance? We're here to help! 🌟";
        }

        // Emergency and help queries
        if (lowerText.includes('emergency') || lowerText.includes('urgent') || lowerText.includes('help needed') || lowerText.includes('problem') || lowerText.includes('issue')) {
            return "I'm here to help you with urgent matters! 🚨\n\n🆘 **Emergency Contacts (24/7):**\n• **Campus Security:** +91-8592-XXXXXX\n• **Medical Emergency:** +91-8592-XXXXXX\n• **Hostel Warden:** +91-8592-XXXXXX\n• **Student Helpline:** +91-8592-XXXXXX\n\n🏥 **Medical Support:**\n• **Campus Clinic:** 8 AM - 8 PM (Mon-Fri)\n• **Nearest Hospital:** Ongole Government Hospital (5 km)\n• **Ambulance Service:** Available 24/7\n• **Mental Health Support:** Counseling center\n\n📚 **Academic Emergencies:**\n• **Exam Issues:** Contact examination branch\n• **Assignment Help:** Reach out to faculty\n• **Study Material:** Library emergency access\n• **Academic Counseling:** Student advisor available\n\n🏠 **Hostel Issues:**\n• **Room Problems:** Contact hostel warden\n• **Maintenance:** Report to hostel office\n• **Security Concerns:** Campus security available\n• **Medical Needs:** Emergency medical assistance\n\n💻 **Technical Support:**\n• **IT Helpdesk:** Computer center support\n• **Website Issues:** Technical team assistance\n• **Account Problems:** IT department help\n• **Lab Equipment:** Report to lab in-charge\n\n📞 **Quick Help Channels:**\n• **Student Affairs:** General student support\n• **Faculty Advisor:** Academic guidance\n• **Peer Support:** Senior student mentors\n• **Admin Office:** Administrative assistance\n\n⚡ **Immediate Steps:**\n1. Stay calm and assess the situation\n2. Contact the appropriate emergency number\n3. Inform your faculty or warden\n4. Document the issue if needed\n5. Follow up for resolution\n\nRemember: Your safety and well-being are our top priority! 🛡️\n\nNeed specific help with any situation? I'm here for you! 💙";
        }

        return null; // Return null if no general question matches
    };

    const handleCorrectionResponse = async (confirmed, correctionData) => {
        // Remove confirmation message but keep conversation context
        setMessages(prev => {
            const filtered = prev.filter(msg => !msg.isConfirmation);
            // Add a brief acknowledgment if user confirmed
            if (confirmed) {
                const acknowledgment = {
                    id: Date.now(),
                    sender: 'bot',
                    text: `Perfect! Let me help you with "${correctionData.corrected}"`,
                    timestamp: new Date()
                };
                return [...filtered, acknowledgment];
            }
            return filtered;
        });
        
        if (confirmed) {
            // User confirmed correction - proceed with corrected message
            const correctedUserMessage = {
                id: Date.now() + 1,
                sender: 'user',
                text: correctionData.corrected,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, correctedUserMessage]);
            setIsTyping(true);
            
            try {
                const recentHistory = messages
                    .filter((msg) => msg.sender === 'user' || msg.sender === 'bot')
                    .slice(-8)
                    .map((msg) => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: msg.text
                    }));

                const response = await sendChatMessage(correctionData.corrected, recentHistory);
                
                const botResponse = {
                    id: Date.now() + 2,
                    sender: 'bot',
                    text: response.data.reply || "Sorry, I didn't get a response.",
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, botResponse]);
            } catch (error) {
                console.error('Error fetching bot response:', error);
                const errorResponse = {
                    id: Date.now() + 2,
                    sender: 'bot',
                    text: "Sorry, I'm having trouble connecting to the server right now. Could you try again in a moment?",
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, errorResponse]);
            } finally {
                setIsTyping(false);
                setPendingCorrection(null);
            }
        } else {
            // User rejected correction - engage naturally and ask for clarification
            const clarificationMessage = {
                id: Date.now(),
                sender: 'bot',
                text: `No worries at all! I want to make sure I understand you perfectly. Could you tell me a bit more about what you're looking for? For example, are you asking about events, placements, clubs, or something else? 😊`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, clarificationMessage]);
            setPendingCorrection(null);
        }
    };

    const handleUserPreferences = (type, value) => {
        setUserPreferences(prev => ({
            ...prev,
            [type]: value
        }));
        // Store in localStorage for persistence
        localStorage.setItem('chatbotPreferences', JSON.stringify({
            ...userPreferences,
            [type]: value
        }));
    };

    const loadUserPreferences = () => {
        const stored = localStorage.getItem('chatbotPreferences');
        if (stored) {
            try {
                const prefs = JSON.parse(stored);
                setUserPreferences(prefs);
            } catch (e) {
                console.error('Failed to load preferences:', e);
            }
        }
    };

    const getPersonalizedSuggestions = () => {
        const suggestions = [];
        
        if (userPreferences.branch) {
            suggestions.push(`What's happening in ${userPreferences.branch} branch?`);
        }
        
        if (userPreferences.year) {
            suggestions.push(`${userPreferences.year} year exam schedules?`);
        }
        
        if (userPreferences.interests.length > 0) {
            const interest = userPreferences.interests[0];
            suggestions.push(`Latest ${interest} updates?`);
        }
        
        return suggestions.slice(0, 2);
    };

    const autocorrectQuery = (query) => {
        const corrections = {
            // Common typos and misspellings
            'evnt': 'event',
            'evnts': 'events', 
            'evetns': 'events',
            'eventz': 'events',
            'clb': 'club',
            'clbs': 'clubs',
            'clubz': 'clubs',
            'clube': 'club',
            'placment': 'placement',
            'placments': 'placements',
            'placemnt': 'placement',
            'jobz': 'jobs',
            'interview': 'interviews',
            'intervu': 'interview',
            'examz': 'exams',
            'exm': 'exam',
            'examschedule': 'exam schedule',
            'timetable': 'exam schedule',
            'sportz': 'sports',
            'spor': 'sport',
            'achivement': 'achievement',
            'achivements': 'achievements',
            'award': 'awards',
            'trophy': 'achievements',
            'hackathon': 'hackathons',
            'workshop': 'workshops',
            'seminar': 'seminars',
            'fest': 'festival',
            'culturalfest': 'cultural festival',
            'techfest': 'tech festival',
            'rgukt': 'RGUKT',
            'ongole': 'Ongole',
            'campus': 'campus',
            'colg': 'college',
            'collge': 'college',
            'university': 'university',
            'student': 'students',
            'faculty': 'faculty',
            'department': 'department',
            'branch': 'branch',
            'cse': 'CSE',
            'ece': 'ECE', 
            'eee': 'EEE',
            'mech': 'MECH',
            'chem': 'CHEM',
            'e1': 'E1',
            'e2': 'E2',
            'e3': 'E3',
            'e4': 'E4',
            'whats': 'what is',
            'wat': 'what',
            'wen': 'when',
            'wer': 'where',
            'hw': 'how',
            'y': 'why',
            'tellme': 'tell me',
            'showme': 'show me',
            'giveme': 'give me',
            'info': 'information',
            'details': 'details',
            'update': 'updates',
            'news': 'news',
            'latest': 'latest',
            'upcoming': 'upcoming',
            'recent': 'recent',
            'today': 'today',
            'tomorrow': 'tomorrow',
            'week': 'week',
            'month': 'month',
            'help': 'help',
            'support': 'support',
            'contact': 'contact',
            'about': 'about',
            'admission': 'admissions',
            'course': 'courses',
            'syllabus': 'syllabus',
            'result': 'results',
            'notice': 'notices',
            'announcement': 'announcements',
            'holiday': 'holidays',
            'library': 'library',
            'hostel': 'hostel',
            'mess': 'mess',
            'transport': 'transport',
            'fees': 'fees',
            'scholarship': 'scholarships'
        };

        let wasCorrected = false;
        let corrected = query;

        // Check for exact matches
        if (corrections[query.toLowerCase()]) {
            corrected = corrections[query.toLowerCase()];
            wasCorrected = true;
        } else {
            // Check for partial matches within query
            const words = query.toLowerCase().split(' ');
            const correctedWords = words.map(word => corrections[word] || word);
            const newQuery = correctedWords.join(' ');
            
            if (newQuery !== query.toLowerCase()) {
                corrected = newQuery;
                wasCorrected = true;
            }
        }

        return {
            original: query,
            corrected: corrected,
            wasCorrected: wasCorrected
        };
    };

    
    // Load preferences on mount
    useEffect(() => {
        loadUserPreferences();
    }, []);

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
            {/* Chat Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all ${
                    isOpen 
                        ? 'bg-white shadow-xl hover:bg-slate-50 text-slate-800' 
                        : 'bg-transparent hover:scale-110 drop-shadow-2xl'
                }`}
            >
                {isOpen ? <X size={32} className="sm:w-10 sm:h-10 text-slate-400" /> : <CustomBotIcon className="w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] drop-shadow-2xl" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 sm:bottom-28 w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-8rem)] sm:h-[600px] max-h-[700px] bg-white dark:bg-slate-800 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                                    <CustomBotIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">NewsBot</h3>
                                    <p className="text-xs opacity-90">RGUKT Ongole Assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleShareConversation}
                                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                    title="Share Conversation"
                                >
                                    <Share2 size={16} />
                                </motion.button>
                            </div>
                        </div>

                        
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                                    <div className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                                            msg.sender === 'user' 
                                                ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white' 
                                                : 'bg-white text-white drop-shadow-sm border border-slate-100'
                                        }`}>
                                            {msg.sender === 'user' ? <User size={16} /> : <CustomBotIcon className="w-6 h-6" />}
                                        </div>
                                        <div className={`px-4 py-3 md:text-sm text-[15px] shadow-sm relative whitespace-pre-wrap ${
                                            msg.sender === 'user'
                                                ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-[20px] rounded-br-[4px]'
                                                : msg.isConfirmation
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 rounded-[20px] rounded-bl-[4px]'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-[20px] rounded-bl-[4px]'
                                        }`}>
                                            {msg.text}
                                            <span className={`block text-[10px] mt-1.5 opacity-60 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Confirmation buttons for correction messages */}
                                    {msg.isConfirmation && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-2 mt-2"
                                        >
                                            <button
                                                onClick={() => handleCorrectionResponse(true, msg.correctionData)}
                                                className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span>✅</span> Yes, that's right
                                            </button>
                                            <button
                                                onClick={() => handleCorrectionResponse(false, msg.correctionData)}
                                                className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span>❌</span> No, I'll rephrase
                                            </button>
                                        </motion.div>
                                    )}
                                    
                                    {/* Action buttons for bot messages */}
                                    {msg.sender === 'bot' && !msg.isConfirmation && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-2 mt-2"
                                        >
                                            <button
                                                onClick={() => copyToClipboard(msg.text, msg.id)}
                                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                                    copiedMessageId === msg.id
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                }`}
                                                title={copiedMessageId === msg.id ? "✅ Copied" : "📋 Copy"}
                                                onMouseLeave={() => setCopiedMessageId(null)}
                                            >
                                                {copiedMessageId === msg.id ? '✅ Copied' : '📋 Copy'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Clean text: remove emojis and symbols, keep only letters, numbers, and basic punctuation
                                                    const cleanText = msg.text
                                                        .replace(/[^\w\s.,!?;:'"-]/g, '') // Remove symbols and emojis
                                                        .replace(/\s+/g, ' ') // Normalize spaces
                                                        .trim();
                                                    
                                                    if (cleanText) {
                                                        const utterance = new SpeechSynthesisUtterance(cleanText);
                                                        
                                                        // Female voice settings - sweet and clear
                                                        utterance.rate = 0.85; // Slightly slower for clarity
                                                        utterance.pitch = 1.2; // Higher pitch for female voice
                                                        utterance.volume = 0.9; // Clear but not too loud
                                                        
                                                        // Get only female voices
                                                        const voices = speechSynthesis.getVoices();
                                                        const femaleVoice = voices.find(voice => 
                                                            voice.name.toLowerCase().includes('female') ||
                                                            voice.name.toLowerCase().includes('woman') ||
                                                            voice.name.toLowerCase().includes('samantha') ||
                                                            voice.name.toLowerCase().includes('karen') ||
                                                            voice.name.toLowerCase().includes('siri') ||
                                                            voice.name.toLowerCase().includes('alex') && voice.name.toLowerCase().includes('female') ||
                                                            voice.lang.includes('en-US') && voice.name.toLowerCase().includes('female')
                                                        ) || voices.find(voice => voice.name.toLowerCase().includes('female')) || voices[0]; // Fallback to first available
                                                        
                                                        utterance.voice = femaleVoice;
                                                        
                                                        // Add pauses for better clarity
                                                        utterance.text = cleanText
                                                            .replace(/\./g, '. ') // Add pause after periods
                                                            .replace(/\?/g, '? ') // Add pause after questions
                                                            .replace(/!/g, '! '); // Add pause after exclamations
                                                        
                                                        speechSynthesis.speak(utterance);
                                                    }
                                                }}
                                                className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                title="🔊 Sweet Voice"
                                            >
                                                🔊 Speak
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="flex items-end gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white text-white flex items-center justify-center overflow-hidden border border-slate-100 drop-shadow-sm">
                                        <CustomBotIcon className="w-6 h-6" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-[20px] rounded-bl-[4px] px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                className="w-2 h-2 bg-slate-400 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                                className="w-2 h-2 bg-slate-400 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                                className="w-2 h-2 bg-slate-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    {!isTyping && messages.length > 0 && messages[messages.length - 1].sender === 'bot' && (
                        <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar snap-x px-4">
                            {quickReplies.map((reply, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleQuickReply(reply)}
                                    type="button"
                                    className="whitespace-nowrap snap-center px-4 py-1.5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full shadow-sm hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-300 transition-all flex items-center gap-1.5"
                                >
                                    {reply}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* Smart Suggestions */}
                    {showSuggestions && !isTyping && messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-4 pb-3"
                        >
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span className="text-xs font-medium text-indigo-800 dark:text-indigo-200">Try asking about:</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {smartSuggestions.map((suggestion, index) => (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleQuickReply(suggestion.text)}
                                            className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                                        >
                                            <suggestion.icon className="w-3 h-3 text-indigo-500" />
                                            <span className="truncate">{suggestion.text}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Enhanced Input Form */}
                    <form
                        ref={formRef}
                        onSubmit={handleSendMessage}
                        className="relative flex items-center p-4"
                    >
                        <input
                            id="chatbot-message"
                            name="chatbot-message"
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask NewsBot..."
                            className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-full py-3.5 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500/30 transition-all placeholder:text-slate-400 shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="absolute right-5 w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full flex items-center justify-center hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <div className="text-[8px] text-center text-slate-400 pb-2 bg-white dark:bg-slate-800">
                        <a href="https://www.flaticon.com/free-icons/robot" title="robot icons" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">Robot icons created by Flat Icons - Flaticon</a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
    );
};

export default Chatbot;
