const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedAdmin = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/eduai';
        console.log(`Connecting to: ${uri}...`);

        await mongoose.connect(uri);
        console.log('MongoDB Connected for Seeding');

        const adminEmail = 'admin@educord.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists');
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('Updated existing user to admin role');
            }
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                headline: 'Platform Administrator',
                bio: 'Managing the EduCord platform.'
            });
            console.log('Admin user created: admin@educord.com / admin123');
        }
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedAdmin();
