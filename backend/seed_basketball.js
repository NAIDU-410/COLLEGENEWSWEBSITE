import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SportEvent from './models/SportEvent.js';
import SportType from './models/SportType.js';
import SportAchievement from './models/SportAchievement.js';
import Event from './models/Event.js';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Create Sport Type
        let basketballType = await SportType.findOne({ name: 'Basketball' });
        if (!basketballType) {
            basketballType = await SportType.create({ name: 'Basketball' });
            console.log('Created Basketball Sport Type');
        }

        // 2. Clear existing sample data to avoid duplicates
        await SportEvent.deleteMany({ eventTitle: "Inter-College Basketball Championship" });
        await SportAchievement.deleteMany({ sportType: "Basketball" });
        await Event.deleteMany({ eventName: "Inter-College Basketball Championship", eventType: 'sports' });

        // 3. Create achievements
        await SportAchievement.create([
            {
                sportType: "Basketball",
                year: 2024,
                title: "Inter-University Winner",
                description: "Defeated 15 teams to secure state rank."
            },
            {
                sportType: "Basketball",
                year: 2023,
                title: "Runner Up",
                description: "Reached finals in the regional meet."
            }
        ]);
        console.log('Added Achievements');

        // 4. Create Basketball Event
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 14);

        const sportEvent = await SportEvent.create({
            sportType: "Basketball",
            eventTitle: "Inter-College Basketball Championship",
            eventDate: futureDate,
            eventDescription: "Annual basketball tournament with multiple teams competing for the campus trophy. High intensity games expected.",
            eventImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2690&auto=format&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=2671&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2669&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1466074558223-9993306db7e3?q=80&w=2670&auto=format&fit=crop"
            ],
            status: "upcoming",
            matches: [
                {
                    teamA: "RGUKT Ongole",
                    teamB: "RGUKT Nuzvid",
                    matchDate: futureDate,
                    score: "",
                    result: ""
                },
                {
                    teamA: "RGUKT RK Valley",
                    teamB: "RGUKT Srikakulam",
                    matchDate: new Date(futureDate.getTime() + 86400000),
                    score: "",
                    result: ""
                }
            ],
            teams: [
                { name: "RGUKT Ongole", description: "Host Team - Elite Squad" },
                { name: "RGUKT Nuzvid", description: "Defending Champions" },
                { name: "RGUKT RK Valley", description: "Fast-Paced Wingers" },
                { name: "RGUKT Srikakulam", description: "Agile Defense" }
            ],
            socialLinks: {
                instagram: "https://instagram.com/rguktongole_sports"
            }
        });
        console.log('Created Basketball Event');

        // 5. Sync to General Events
        await Event.create({
            eventType: 'sports',
            subcategory: "Basketball",
            eventName: "Inter-College Basketball Championship",
            date: futureDate.getDate(),
            month: futureDate.toLocaleString('default', { month: 'long' }),
            year: futureDate.getFullYear(),
            image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2690&auto=format&fit=crop",
            description: "Annual basketball tournament with multiple teams competing for the campus trophy.",
        });
        console.log('Synced to General Events');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
