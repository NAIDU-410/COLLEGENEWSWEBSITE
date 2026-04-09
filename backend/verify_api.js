import axios from 'axios';

const API_URL = 'http://localhost:5000/api/exams';

async function testBackend() {
    console.log('--- Backend API & Logic Verification ---');
    try {
        // 1. POST /api/exams (Create)
        const newExam = {
            branch: 'TEST_BRANCH',
            academicYear: 'E1',
            semester: 'Sem 1',
            examType: 'Mid 1',
            mode: 'manual',
            year: '2026',
            subjects: [
                {
                    subjectName: 'Test Subject',
                    date: '01',
                    month: 'Jan',
                    year: '2026',
                    time: '10:00 - 13:00'
                }
            ]
        };
        const createRes = await axios.post(API_URL, newExam);
        const examId = createRes.data._id;
        console.log('✅ POST /api/exams: Created Exam ID:', examId);

        // 2. GET /api/exams (List)
        const listRes = await axios.get(API_URL);
        const foundInList = listRes.data.some(e => e._id === examId);
        console.log('✅ GET /api/exams: Found in list:', foundInList);

        // 3. GET /api/exams/:id (Detail)
        const detailRes = await axios.get(`${API_URL}/${examId}`);
        console.log('✅ GET /api/exams/:id: Title Match:', detailRes.data.branch === 'TEST_BRANCH');

        // 4. PUT /api/exams/:id (Update - trigger strike-through logic)
        const updateData = {
            subjects: [
                {
                    subjectName: 'Test Subject',
                    date: '10', // Changed
                    month: 'Jan',
                    year: '2026',
                    time: '14:00 - 17:00' // Changed
                }
            ]
        };
        const updateRes = await axios.put(`${API_URL}/${examId}`, updateData);
        const updatedSubject = updateRes.data.subjects[0];
        
        console.log('--- Strike-through Logic Check ---');
        console.log('isUpdated:', updatedSubject.isUpdated);
        console.log('oldDate:', updatedSubject.oldDate); // Should be "01 Jan 2026"
        console.log('oldTime:', updatedSubject.oldTime); // Should be "10:00 - 13:00"

        if (updatedSubject.isUpdated && 
            updatedSubject.oldDate === '01 Jan 2026' && 
            updatedSubject.oldTime === '10:00 - 13:00') {
            console.log('✅ Strike-through Logic: Correctly archived old values!');
        } else {
            console.error('❌ Strike-through Logic: FAILED to archive values properly.');
        }

        // 5. DELETE /api/exams/:id (Delete)
        await axios.delete(`${API_URL}/${examId}`);
        console.log('✅ DELETE /api/exams/:id: Resource deleted.');

    } catch (err) {
        if (err.response) {
            console.error('❌ API Error Response:', err.response.status, JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('❌ API Test Failed:', err.message);
        }
        process.exit(1);
    }
}

testBackend();
