require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farm2market-dev';

const seed = async () => {
  try {
    await mongoose.connect(MONGO);
    console.log('Connected to DB for seeding');

    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});

    // Create users
    const users = await User.create([
      { name: 'Alice Organizer', email: 'alice@college.edu', password: 'password123', role: 'organizer' },
      { name: 'Bob Student', email: 'bob@student.edu', password: 'password123', role: 'student' },
      { name: 'Carol Student', email: 'carol@student.edu', password: 'password123', role: 'student' }
    ]);

    // Create events
    const now = new Date();
    const events = await Event.create([
      { title: 'Hackathon 2026', description: '24h hack event', date: new Date(now.getTime() + 7*24*60*60*1000), time: '09:00', venue: 'Auditorium', capacity: 200, organizer: 'Tech Club', category: 'hackathon', certificateEnabled: true },
      { title: 'Design Workshop', description: 'Hands-on Figma', date: new Date(now.getTime() + 14*24*60*60*1000), time: '10:00', venue: 'Lab 1', capacity: 80, organizer: 'Design Club', category: 'workshop', certificateEnabled: true }
    ]);

    // Create registrations
    const regs = await Registration.create([
      { eventId: events[0]._id, userId: users[1]._id.toString(), studentName: users[1].name, email: users[1].email, department: 'CSE' },
      { eventId: events[0]._id, userId: users[2]._id.toString(), studentName: users[2].name, email: users[2].email, department: 'Design' }
    ]);

    // Update registered count
    events[0].registeredCount = regs.length;
    await events[0].save();

    console.log('Seed completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

seed();