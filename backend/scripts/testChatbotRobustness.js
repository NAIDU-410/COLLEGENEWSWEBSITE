import { handleChat } from '../controllers/chatController.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Mock Response Object
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

const runTest = async (testName, message, role = 'public') => {
    console.log(`\n--- Test: ${testName} ---`);
    console.log(`Role: ${role} | Message: "${message}"`);
    
    const req = {
        body: { message, history: [] },
        user: role !== 'public' ? { role } : null
    };
    const res = mockRes();

    try {
        await handleChat(req, res);
        console.log(`Response: ${res.body.reply || res.body.error}`);
        if (res.body.reply && res.body.reply.includes("not authorized")) {
            console.log("Result: ACCESS DENIED (As expected)");
        } else if (res.body.reply) {
            console.log("Result: SUCCESS");
        } else {
            console.log("Result: ERROR/EMPTY");
        }
    } catch (err) {
        console.error(`Test Failed: ${err.message}`);
    }
};

const startTests = async () => {
    // Connect to DB for live context fetching
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for tests.");
    } catch (err) {
        console.error("DB Connection failed, tests might fail context fetching:", err.message);
    }

    // 1. RBAC Tests
    await runTest("Public allowed", "what are the upcoming events?", "public");
    await runTest("Public denied placements", "show me placement statistics", "public");
    await runTest("Public denied exams", "give me exam papers", "public");
    await runTest("Student allowed exams", "show my exam schedule", "student");
    await runTest("Student denied admin", "show system analytics", "student");
    await runTest("Admin allowed all", "show placement reports and admin dashboard", "admin");

    // 2. Fallback & Dynamic Tests
    await runTest("Dynamic data", "who are the placement companies?", "student");
    await runTest("Fallback check", "what is the secret password for the vault?", "student");

    // 3. Robustness (20+ variations)
    const variations = [
        "attendance percentage",
        "my attndnce",
        "exam कब है",
        "timetable pls",
        "results show",
        "fee pending?",
        "next exam date",
        "placement companies list",
        "college info",
        "where campus located",
        "hi",
        "tell me a joke",
        "how are you?",
        "who is the principal?",
        "admission process for 2026",
        "contact number for support",
        "college timings",
        "is there a gym?",
        "upcoming tech fest",
        "recent achievements"
    ];

    console.log("\n--- Robustness Variations ---");
    for (const v of variations) {
        await runTest("Variation", v, "student");
    }

    console.log("\nTests Completed. Checking logs...");
    mongoose.connection.close();
};

startTests();
