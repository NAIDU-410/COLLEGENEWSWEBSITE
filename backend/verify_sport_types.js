const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifySportCRUD() {
    try {
        console.log('🚀 Starting Sport Category CRUD Verification...');

        // 1. Create a Test Sport
        console.log('🔹 Creating test sport...');
        const createRes = await axios.post(`${API_URL}/sports/types`, { name: 'TestSport' });
        const testId = createRes.data._id;
        console.log('✅ Created:', createRes.data);

        // 2. Update the Sport
        console.log('🔹 Updating test sport...');
        const updateRes = await axios.put(`${API_URL}/sports/types/${testId}`, { name: 'UpdatedSport' });
        console.log('✅ Updated:', updateRes.data);

        if (updateRes.data.name !== 'UpdatedSport') throw new Error('Update failed');

        // 3. Delete the Sport
        console.log('🔹 Deleting test sport...');
        const deleteRes = await axios.delete(`${API_URL}/sports/types/${testId}`);
        console.log('✅ Deleted:', deleteRes.data);

        console.log('\n✨ ALL CRUD OPERATIONS VERIFIED SUCCESSFULLY!');
    } catch (error) {
        console.error('❌ Verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

verifySportCRUD();
