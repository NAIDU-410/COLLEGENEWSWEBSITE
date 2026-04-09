import axios from 'axios';
import * as cheerio from 'cheerio';
import Placement from '../models/Placement.js';
import Achievement from '../models/Achievement.js';
import SportAchievement from '../models/SportAchievement.js';
import ClubType from '../models/ClubType.js';
import Event from '../models/Event.js';

// Fetch dynamic content from the website
const getWebsiteContent = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Get the current website URL
        const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3000';
        
        try {
            // Try to fetch the main page
            const response = await axios.get(websiteUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            
            // Extract all text content from the page
            let pageContent = '';
            
            // Get text from common content areas
            $('body').each((i, elem) => {
                pageContent += $(elem).text() + ' ';
            });
            
            // Clean up the content
            pageContent = pageContent
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, ' ')
                .trim();

            if (pageContent) {
                res.json({
                    content: pageContent,
                    url: websiteUrl,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(404).json({ error: 'No content found on the website' });
            }

        } catch (error) {
            console.error('Error fetching website:', error);
            res.status(500).json({ error: 'Failed to fetch website content' });
        }

    } catch (error) {
        console.error('Error in getWebsiteContent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Scrape website for specific content
const scrapeWebsite = async (req, res) => {
    try {
        const { url, query } = req.query;
        
        if (!url || !query) {
            return res.status(400).json({ error: 'URL and query parameters are required' });
        }

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });

            const $ = cheerio.load(response.data);
            
            // Extract structured content
            const structuredContent = {
                title: $('title').text() || '',
                headings: [],
                paragraphs: [],
                lists: [],
                links: [],
                metadata: {
                    description: $('meta[name="description"]').attr('content') || '',
                    keywords: $('meta[name="keywords"]').attr('content') || ''
                }
            };

            // Extract headings
            $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
                const tagName = $(elem).prop('tagName').toLowerCase();
                structuredContent.headings.push({
                    level: tagName,
                    text: $(elem).text().trim()
                });
            });

            // Extract paragraphs
            $('p').each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 20) { // Only include meaningful paragraphs
                    structuredContent.paragraphs.push(text);
                }
            });

            // Extract lists
            $('ul, ol').each((i, elem) => {
                const listItems = [];
                $(elem).find('li').each((j, li) => {
                    const text = $(li).text().trim();
                    if (text) listItems.push(text);
                });
                if (listItems.length > 0) {
                    structuredContent.lists.push({
                        type: $(elem).prop('tagName').toLowerCase(),
                        items: listItems
                    });
                }
            });

            // Extract links with text
            $('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                const text = $(elem).text().trim();
                if (text && href) {
                    structuredContent.links.push({
                        url: href,
                        text: text
                    });
                }
            });

            // Combine all content for analysis
            let allContent = [
                structuredContent.title,
                structuredContent.metadata.description,
                ...structuredContent.headings.map(h => h.text),
                ...structuredContent.paragraphs,
                ...structuredContent.lists.flatMap(l => l.items),
                ...structuredContent.links.map(l => l.text)
            ].join(' ');

            // Clean content
            allContent = allContent
                .replace(/\s+/g, ' ')
                .replace(/[^\w\s.,!?;:'"-]/g, ' ')
                .trim();

            res.json({
                content: allContent,
                structured: structuredContent,
                url: url,
                query: query,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error scraping website:', error);
            res.status(500).json({ error: 'Failed to scrape website' });
        }

    } catch (error) {
        console.error('Error in scrapeWebsite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get website navigation structure
const getWebsiteNavigation = async (req, res) => {
    try {
        const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3000';
        
        try {
            const response = await axios.get(websiteUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            
            const navigation = {
                menu: [],
                links: [],
                sections: []
            };

            // Extract navigation menu
            $('nav a, .menu a, .navigation a').each((i, elem) => {
                const href = $(elem).attr('href');
                const text = $(elem).text().trim();
                if (text && href) {
                    navigation.menu.push({
                        text: text,
                        url: href.startsWith('http') ? href : new URL(href, websiteUrl).href
                    });
                }
            });

            // Extract all links
            $('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                const text = $(elem).text().trim();
                if (text && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    navigation.links.push({
                        text: text,
                        url: href.startsWith('http') ? href : new URL(href, websiteUrl).href
                    });
                }
            });

            // Extract main sections
            $('main, .main, .content, section').each((i, elem) => {
                const $section = $(elem);
                const heading = $section.find('h1, h2, h3').first().text().trim();
                const content = $section.text().trim();
                
                if (content.length > 100) {
                    navigation.sections.push({
                        heading: heading || `Section ${i + 1}`,
                        content: content.substring(0, 500) + '...',
                        id: $section.attr('id') || `section-${i}`
                    });
                }
            });

            res.json({
                navigation: navigation,
                url: websiteUrl,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting navigation:', error);
            res.status(500).json({ error: 'Failed to get website navigation' });
        }

    } catch (error) {
        console.error('Error in getWebsiteNavigation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get global website statistics (Placements, Sports, etc.)
const getWebsiteStats = async (req, res) => {
    try {
        const [
            placements,
            placementAchievements,
            sportAchievements,
            clubTypesCount,
            clubEventsCount,
            newsCount
        ] = await Promise.all([
            Placement.find().lean(),
            Achievement.countDocuments({ type: 'placements' }),
            SportAchievement.countDocuments(),
            ClubType.countDocuments(),
            Event.countDocuments({ eventType: 'clubs' }),
            Event.countDocuments({ eventType: 'event' })
        ]);

        // 1. Partner Companies: Unique company count from placements + base 100
        const uniqueCompanies = new Set(placements.map(p => p.companyName)).size;
        const partnerCompanies = 100 + uniqueCompanies;

        // 2. Placed Students: Base 1150 + (achievement count * 15)
        const placedStudents = 1150 + (placementAchievements * 15) + placements.length;

        // 3. Placement Rate: Base 92% + slight growth based on achievements (max 99%)
        const placementRate = Math.min(99, Math.floor(92 + (placementAchievements * 0.5)));

        // 4. Avg Package: Calculate from placements and format
        let avgPackage = 6.5; // Base
        if (placements.length > 0) {
            const salaries = placements
                .map(p => {
                    if (!p.stipendOrSalary) return null;
                    const match = p.stipendOrSalary.match(/(\d+(\.\d+)?)/);
                    return match ? parseFloat(match[0]) : null;
                })
                .filter(s => s !== null && s > 0 && s < 100); // Filter out outliers like 50000
            
            if (salaries.length > 0) {
                const sum = salaries.reduce((a, b) => a + b, 0);
                avgPackage = parseFloat((sum / salaries.length).toFixed(1));
            }
        }

        // 5. Total Active Athletes: Base 1400 + (sport achievements * 5)
        const activeAthletes = 1400 + (sportAchievements * 5);

        // 6. Championship Titles: Direct count of sport achievements
        const championshipTitles = sportAchievements;

        // 7. Clubs stats
        // Students count is a pseudo-dynamic value based on clubs: 2800 + clubs*50
        const totalClubStudents = 2800 + (clubTypesCount * 50);

        res.json({
            placements: {
                partnerCompanies,
                placedStudents,
                placementRate,
                avgPackage
            },
            sports: {
                activeAthletes,
                championshipTitles
            },
            clubs: {
                totalClubs: clubTypesCount,
                totalEvents: clubEventsCount,
                totalStudents: totalClubStudents
            },
            global: {
                totalNews: newsCount
            }
        });

    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export {
    getWebsiteContent,
    scrapeWebsite,
    getWebsiteNavigation,
    getWebsiteStats
};
