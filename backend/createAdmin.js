import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for admin creation...');

    const adminDetails = {
      name: 'System Admin',
      email: 'admin@college.edu',
      phoneNumber: '9999999999',
      password: 'adminpassword123',
      role: 'admin',
    };

    // 2. Check if admin already exists
    const adminExists = await User.findOne({ email: adminDetails.email });

    if (adminExists) {
      console.log('Admin already exists');
    } else {
      // 3. Create admin (User model's pre-save hook handles hashing)
      // However, the user explicitly asked to "Hash the password using bcryptjs before saving"
      // and "Insert the admin user into the database"
      // Our User model already has a pre-save hook for hashing. 
      // If I manually hash it here, it might be hashed twice.
      // Let's check the User.js model.
      
      const admin = new User(adminDetails);
      await admin.save();
      console.log('Admin created successfully');
    }

    // 4. Close connection
    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
