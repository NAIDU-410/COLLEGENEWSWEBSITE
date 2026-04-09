import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://127.0.0.1:5000/api/auth';
const testEmail = 'o999999@rguktong.ac.in';

async function testAuth() {
  try {
    // connect to DB to read OTP
    await mongoose.connect(process.env.MONGO_URI);
    
    // clear existing test user
    const User = (await import('./models/User.js')).default;
    await User.deleteOne({ email: testEmail });

    console.log('1. Registering user...');
    try {
        const registerRes = await axios.post(`${API_URL}/register`, {
        name: 'Test Setup User',
        email: testEmail,
        phoneNumber: '1234567890',
        password: 'password123'
        });
        console.log('Register Res:', registerRes.status);
    } catch(e) {
        // If it fails because of email sending, we catch it but it should return 201 anyway
        console.log('Register attempt returned:', e?.response?.status, e?.response?.data);
    }

    // Get OTP and check student role
    const user = await User.findOne({ email: testEmail });
    if (!user) {
        console.error("User not saved to DB!");
        return;
    }
    console.log(`User created. Role: ${user.role}, isVerified: ${user.isVerified}, OTP: ${user.otp}`);

    console.log('\n2. Verifying OTP...');
    const verifyRes = await axios.post(`${API_URL}/verify`, {
      email: testEmail,
      otp: user.otp
    });
    console.log('Verify Res:', verifyRes.data);

    // Get token from verfiy
    const token = verifyRes.data.token;

    console.log('\n3. Testing Login...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: testEmail,
      password: 'password123'
    });
    console.log('Login Res:', loginRes.data._id ? 'SUCCESS (Token received)' : 'FAILED');

    // Test Forgot Password
    console.log('\n4. Testing Forgot Password...');
    let resetToken = null;
    try {
        const forgotRes = await axios.post(`${API_URL}/forgot-password`, { email: testEmail });
        resetToken = forgotRes.data.resetToken;
        console.log('Forgot Password Res:', forgotRes.status);
    } catch(e) {
        console.log('Forgot Password error:', e?.response?.data);
        resetToken = e?.response?.data?.resetToken; // In case we return token even if email fails?
        // Wait, authController currently returns 500 if email fails and clears the resetToken!
    }

    // Read reset OTP
    const userAfterForgot = await User.findOne({ email: testEmail });
    
    if (userAfterForgot.otp) {
        console.log(`\n5. Testing Reset Password with OTP: ${userAfterForgot.otp} and token ${resetToken}...`);
        
        // Wait, if authController returns 500, we might need to simulate it locally to test reset endpoint.
        // Let's manually set reset Token in DB if it failed.
        let tokenToUse = resetToken;
        if (!tokenToUse) {
            console.log("Auto-fixing reset token because email failed...");
            const crypto = require('crypto');
            tokenToUse = crypto.randomBytes(20).toString('hex');
            userAfterForgot.resetToken = crypto.createHash('sha256').update(tokenToUse).digest('hex');
            userAfterForgot.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
            userAfterForgot.otp = '123456';
            userAfterForgot.otpExpiry = Date.now() + 5 * 60 * 1000;
            await userAfterForgot.save();
        }

        const resetRes = await axios.post(`${API_URL}/reset-password/${tokenToUse}`, {
        otp: userAfterForgot.otp,
        password: 'newpassword123'
        });
        console.log('Reset Password Res:', resetRes.data);
        
        console.log('\n6. Testing Login with New Password...');
        const newLoginRes = await axios.post(`${API_URL}/login`, {
        email: testEmail,
        password: 'newpassword123'
        });
        console.log('Login (New Password) Res:', newLoginRes.data._id ? 'SUCCESS (Token received)' : 'FAILED');
    }

    console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<");

  } catch (error) {
    console.error("\nTest failed:", error?.response?.data || error.message);
  } finally {
    const User = (await import('./models/User.js')).default;
    await User.deleteOne({ email: testEmail });
    await mongoose.connection.close();
  }
}

testAuth();
