import axios from 'axios';

const API_URL = 'http://localhost:5000/api/exams';

async function verifySyncFix() {
    console.log('--- Sync Fix Verification ---');
    try {
        // 1. Create a test exam with the correct fields
        const testExam = {
            branch: 'SYNC_TEST',
            academicYear: 'E1',
            semester: 'Sem 1',
            examType: 'Mid 1',
            mode: 'manual',
            subjects: [
                {
                    subjectName: 'Sync Test Subject',
                    date: '01',
                    month: 'Jan',
                    year: '2026',
                    time: '10:00 - 13:00'
                }
            ]
        };
        const createRes = await axios.post(API_URL, testExam);
        const examId = createRes.data._id;
        console.log('✅ Created test exam with ID:', examId);

        // 2. Test Backend Filtering (The new feature)
        // We use year=E1 which should be mapped to academicYear internally
        const filterRes = await axios.get(`${API_URL}?year=E1&branch=SYNC_TEST`);
        const found = filterRes.data.some(e => e._id === examId);
        
        if (found) {
            console.log('✅ Backend filtering works! Found exam with year=E1');
        } else {
            console.error('❌ Backend filtering FAILED! Could not find exam with year=E1');
            console.log('API Response:', JSON.stringify(filterRes.data, null, 2));
        }

        // 3. Verify the field name in the response (Should be academicYear)
        const exam = filterRes.data.find(e => e._id === examId);
        if (exam && exam.academicYear === 'E1') {
            console.log('✅ Database field is "academicYear" as expected.');
        } else {
            console.error('❌ Field mismatch! Expected academicYear: E1, got:', exam?.academicYear);
        }

        // Cleanup
        await axios.delete(`${API_URL}/${examId}`);
        console.log('✅ Verification cleanup done.');

    } catch (err) {
        console.error('❌ Sync Fix Verification Failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

verifySyncFix();
