import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { 
  ProfileModel, 
  ProjectModel, 
  SkillModel, 
  HobbyModel, 
  MovieModel, 
  CityConfigModel, 
  MessageModel 
} from './models/PortfolioSchemas';
import { initialPortfolioData } from '../src/data/initialData';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://prottoybiswas575358_db_user:PGig1Mu1gkq5GaTn@cluster0.qrwfjlj.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0';

export async function connectDB() {
  try {
    console.log('Connecting to MongoDB Atlas database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Initialize/seed database if Profile is missing
    const existingProfile = await ProfileModel.findOne();
    if (!existingProfile) {
      console.log('Seeding MongoDB database with Prottoy Biswas portfolio data...');
      await seedDatabase();
    }
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error);
  }
}

export async function seedDatabase() {
  try {
    await ProfileModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await SkillModel.deleteMany({});
    await HobbyModel.deleteMany({});
    await MovieModel.deleteMany({});
    await CityConfigModel.deleteMany({});
    await MessageModel.deleteMany({});

    await ProfileModel.create(initialPortfolioData.profile);
    await ProjectModel.insertMany(initialPortfolioData.projects);
    await SkillModel.insertMany(initialPortfolioData.skills);
    await HobbyModel.insertMany(initialPortfolioData.hobbies);
    await MovieModel.insertMany(initialPortfolioData.movies);
    await CityConfigModel.create(initialPortfolioData.cityConfig);
    await MessageModel.insertMany(initialPortfolioData.messages);

    console.log('🌱 Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
