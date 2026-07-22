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

// Helper to color code building based on language / topics
function getBuildingColor(language?: string | null, topics?: string[]): string {
  if (topics && topics.includes('react')) return '#38bdf8';
  if (topics && topics.includes('nodejs')) return '#10b981';
  if (topics && topics.includes('fullstack')) return '#a855f7';
  if (!language) return '#38bdf8';

  const lang = language.toLowerCase();
  if (lang.includes('typescript') || lang.includes('javascript') || lang.includes('js')) return '#38bdf8';
  if (lang.includes('html') || lang.includes('css')) return '#a855f7';
  if (lang.includes('node') || lang.includes('python')) return '#10b981';
  if (lang.includes('ui') || lang.includes('figma')) return '#f59e0b';
  return '#ec4899';
}

// Format repository name cleanly
function formatRepoTitle(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Enhanced Live GitHub Auto Sync Engine
export async function syncGitHubRepositories(username: string = 'prottoybiswas01') {
  try {
    console.log(`📡 Fetching live public repositories for GitHub user: ${username}`);
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: {
        'User-Agent': 'Prottoy-Portfolio-3D-App'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const repos: any[] = await response.json();
    if (!Array.isArray(repos)) return [];

    const syncedProjects = [];

    for (const repo of repos) {
      // 1. Try to fetch portfolio.json metadata file from repo if user created one
      let repoMeta: any = {};
      try {
        const metaRes = await fetch(`https://raw.githubusercontent.com/${username}/${repo.name}/main/portfolio.json`);
        if (metaRes.ok) {
          repoMeta = await metaRes.json();
        }
      } catch {
        // No custom portfolio.json, fallback to intelligent GitHub defaults
      }

      // Preserve existing manual liveUrl or buildingColor if user edited it in MongoDB
      const existingInDB = await ProjectModel.findOne({ id: `gh-${repo.id}` }).lean();

      // Estimate commits count from repository size / updates
      const estimatedCommits = repoMeta.commitsCount || Math.max(10, Math.min(80, Math.floor(repo.size / 80) + 15));

      // Build tech stack list from GitHub topics & language
      const techStack: string[] = repoMeta.techStack || [];
      if (techStack.length === 0) {
        if (repo.language) techStack.push(repo.language);
        if (Array.isArray(repo.topics)) {
          repo.topics.forEach((t: string) => {
            if (!techStack.includes(t)) techStack.push(t);
          });
        }
        if (!techStack.includes('Git')) techStack.push('Git');
        if (!techStack.includes('GitHub')) techStack.push('GitHub');
      }

      const projData = {
        id: `gh-${repo.id}`,
        title: repoMeta.title || formatRepoTitle(repo.name),
        subtitle: repoMeta.subtitle || `GitHub Repository (${repo.language || 'Web'})`,
        description: repoMeta.description || repo.description || `Public GitHub repository ${repo.full_name}. Updated on ${new Date(repo.updated_at).toLocaleDateString()}.`,
        category: (repoMeta.category || (repo.language === 'TypeScript' || repo.language === 'JavaScript' ? 'Full Stack' : 'Frontend')) as any,
        techStack,
        githubUrl: repo.html_url,
        liveUrl: existingInDB?.liveUrl || repoMeta.liveUrl || repo.homepage || '',
        imageUrl: repoMeta.imageUrl || existingInDB?.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        commitsCount: estimatedCommits,
        buildingColor: repoMeta.buildingColor || existingInDB?.buildingColor || getBuildingColor(repo.language, repo.topics),
        featured: repoMeta.featured ?? (repo.stargazers_count > 0 || repo.name.toLowerCase().includes('react')),
        createdAt: repo.created_at ? repo.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };

      // Upsert into MongoDB Atlas
      const updated = await ProjectModel.findOneAndUpdate(
        { id: projData.id },
        projData,
        { upsert: true, new: true }
      );
      syncedProjects.push(updated);
    }

    console.log(`✅ Synced ${syncedProjects.length} GitHub repositories with MongoDB Atlas!`);
    return syncedProjects;
  } catch (err) {
    console.error('Failed to sync live GitHub repositories:', err);
    return [];
  }
}

// GET /api/github/sync -> Fetch & Sync Live Repos from GitHub API to MongoDB
router.get('/github/sync', async (_req, res) => {
  try {
    const repos = await syncGitHubRepositories();
    const allProjects = await ProjectModel.find().sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      message: `Successfully auto-synced ${repos.length} GitHub repositories with MongoDB Atlas!`,
      projects: allProjects
    });
  } catch {
    res.status(500).json({ error: 'Failed to sync with GitHub API' });
  }
});

// POST /api/github/webhook -> Real-time GitHub Webhook Event Listener
router.post('/github/webhook', async (req, res) => {
  try {
    const event = req.headers['x-github-event'];
    console.log(`🔔 Received GitHub Webhook Notification: Event=${event}`);
    
    // Automatically trigger live sync when new code is pushed or a repo is created!
    const repos = await syncGitHubRepositories();
    res.json({
      success: true,
      message: `GitHub webhook processed event '${event}'. Synced ${repos.length} repositories.`,
      event
    });
  } catch (err) {
    console.error('Error processing GitHub webhook:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// GET /api/portfolio -> fetch entire portfolio state from MongoDB
router.get('/portfolio', async (_req, res) => {
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
  } catch {
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
  } catch {
    res.status(500).json({ error: 'Failed to create project in MongoDB' });
  }
});

// PUT /api/portfolio/projects/:id -> update project in MongoDB
router.put('/portfolio/projects/:id', async (req, res) => {
  try {
    const updated = await ProjectModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/portfolio/projects/:id -> delete project from MongoDB
router.delete('/portfolio/projects/:id', async (req, res) => {
  try {
    await ProjectModel.deleteOne({ id: req.params.id });
    res.json({ success: true, deletedId: req.params.id });
  } catch {
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
  } catch {
    res.status(500).json({ error: 'Failed to push commit' });
  }
});

// PUT /api/portfolio/city-config -> update 3D city settings in MongoDB
router.put('/portfolio/city-config', async (req, res) => {
  try {
    const updated = await CityConfigModel.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(updated);
  } catch {
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
  } catch {
    res.status(500).json({ error: 'Failed to transmit message' });
  }
});

// DELETE /api/portfolio/messages/:id -> delete message
router.delete('/portfolio/messages/:id', async (req, res) => {
  try {
    await MessageModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// POST /api/portfolio/reset -> reset DB to seed data
router.post('/portfolio/reset', async (_req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database reset to Prottoy Biswas defaults' });
  } catch {
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

export default router;
