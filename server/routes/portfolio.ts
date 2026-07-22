import { Router } from 'express';
import { 
  ProfileModel, 
  ProjectModel, 
  SkillModel, 
  HobbyModel, 
  MovieModel, 
  CityConfigModel, 
  MessageModel 
} from '../models/PortfolioSchemas';
import { seedDatabase } from '../db';
import { initialPortfolioData } from '../../src/data/initialData';

const router = Router();

// GET /api/portfolio -> fetch entire portfolio state from MongoDB
router.get('/portfolio', async (req, res) => {
  try {
    const profile = await ProfileModel.findOne().lean() || initialPortfolioData.profile;
    const projects = await ProjectModel.find().sort({ createdAt: -1 }).lean();
    const skills = await SkillModel.find().lean();
    const hobbies = await HobbyModel.find().lean();
    const movies = await MovieModel.find().lean();
    const cityConfig = await CityConfigModel.findOne().lean() || initialPortfolioData.cityConfig;
    const messages = await MessageModel.find().sort({ createdAt: -1 }).lean();

    res.json({
      profile,
      projects: projects.length > 0 ? projects : initialPortfolioData.projects,
      skills: skills.length > 0 ? skills : initialPortfolioData.skills,
      hobbies: hobbies.length > 0 ? hobbies : initialPortfolioData.hobbies,
      movies: movies.length > 0 ? movies : initialPortfolioData.movies,
      cityConfig,
      messages: messages.length > 0 ? messages : initialPortfolioData.messages
    });
  } catch (err) {
    console.error('Error fetching portfolio from MongoDB:', err);
    res.status(500).json({ error: 'Failed to load portfolio data from MongoDB Atlas' });
  }
});

// PUT /api/portfolio/profile -> update profile in MongoDB
router.put('/portfolio/profile', async (req, res) => {
  try {
    const updated = await ProfileModel.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/portfolio/projects -> create new project in MongoDB
router.post('/portfolio/projects', async (req, res) => {
  try {
    const projData = {
      ...req.body,
      id: req.body.id || `proj-${Date.now()}`
    };
    const created = await ProjectModel.create(projData);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project in MongoDB' });
  }
});

// PUT /api/portfolio/projects/:id -> update project in MongoDB
router.put('/portfolio/projects/:id', async (req, res) => {
  try {
    const updated = await ProjectModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/portfolio/projects/:id -> delete project from MongoDB
router.delete('/portfolio/projects/:id', async (req, res) => {
  try {
    await ProjectModel.deleteOne({ id: req.params.id });
    res.json({ success: true, deletedId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/portfolio/projects/:id/commit -> increment commits / stack floor
router.post('/portfolio/projects/:id/commit', async (req, res) => {
  try {
    const count = req.body.count || 1;
    const updated = await ProjectModel.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { commitsCount: count } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to push commit' });
  }
});

// PUT /api/portfolio/city-config -> update 3D city settings in MongoDB
router.put('/portfolio/city-config', async (req, res) => {
  try {
    const updated = await CityConfigModel.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update 3D city config' });
  }
});

// POST /api/portfolio/messages -> add contact message to MongoDB
router.post('/portfolio/messages', async (req, res) => {
  try {
    const msg = {
      ...req.body,
      id: `msg-${Date.now()}`,
      date: new Date().toLocaleString(),
      read: false
    };
    const created = await MessageModel.create(msg);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to transmit message' });
  }
});

// DELETE /api/portfolio/messages/:id -> delete message
router.delete('/portfolio/messages/:id', async (req, res) => {
  try {
    await MessageModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// POST /api/portfolio/reset -> reset DB to seed data
router.post('/portfolio/reset', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database reset to Prottoy Biswas defaults' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

export default router;
