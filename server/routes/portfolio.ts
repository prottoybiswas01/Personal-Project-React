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

// 100% Automated Live GitHub Sync Engine
export async function syncGitHubRepositories(username: string = 'prottoybiswas01') {
  try {
    console.log(`📡 100% Auto-syncing live public repositories for GitHub user: ${username}`);
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
      // Check existing in MongoDB
      const existingInDB = await ProjectModel.findOne({ id: `gh-${repo.id}` }).lean();

      // Estimate initial commits count or preserve growing count
      const initialCommits = Math.max(12, Math.min(90, Math.floor(repo.size / 70) + 15));
      const currentCommits = existingInDB ? Math.max(existingInDB.commitsCount, initialCommits) : initialCommits;

      // Build tech stack list from GitHub topics & language
      const techStack: string[] = [];
      if (repo.language) techStack.push(repo.language);
      if (Array.isArray(repo.topics)) {
        repo.topics.forEach((t: string) => {
          if (!techStack.includes(t)) techStack.push(t);
        });
      }
      if (!techStack.includes('Git')) techStack.push('Git');
      if (!techStack.includes('GitHub')) techStack.push('GitHub');

      const projData = {
        id: `gh-${repo.id}`,
        title: existingInDB?.title || formatRepoTitle(repo.name),
        subtitle: `GitHub Repository (${repo.language || 'Web'})`,
        description: repo.description || existingInDB?.description || `Public GitHub repository ${repo.full_name}. Updated on ${new Date(repo.updated_at).toLocaleDateString()}.`,
        category: (repo.language === 'TypeScript' || repo.language === 'JavaScript' ? 'Full Stack' : 'Frontend') as any,
        techStack,
        githubUrl: repo.html_url,
        liveUrl: existingInDB?.liveUrl || repo.homepage || '',
        imageUrl: existingInDB?.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        commitsCount: currentCommits,
        buildingColor: existingInDB?.buildingColor || getBuildingColor(repo.language, repo.topics),
        featured: repo.stargazers_count > 0 || repo.name.toLowerCase().includes('react'),
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

    console.log(`✅ 100% Auto-synced ${syncedProjects.length} GitHub repositories into MongoDB Atlas!`);
    return syncedProjects;
  } catch (err) {
    console.error('Failed to sync live GitHub repositories:', err);
    return [];
  }
}

// GET /api/github/sync -> Automatic Sync Endpoint
router.get('/github/sync', async (_req, res) => {
  try {
    const repos = await syncGitHubRepositories();
    const allProjects = await ProjectModel.find().sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      message: `Successfully 100% auto-synced ${repos.length} GitHub repositories with MongoDB Atlas!`,
      projects: allProjects
    });
  } catch {
    res.status(500).json({ error: 'Failed to sync with GitHub API' });
  }
});

// POST /api/github/webhook -> 100% Zero-Touch Real-Time GitHub Push Listener Webhook
router.post('/github/webhook', async (req, res) => {
  try {
    const event = req.headers['x-github-event'] || 'push';
    const body = req.body || {};

    console.log(`⚡ Real-time GitHub Webhook Event Triggered: Event=${event}`);

    // If it's a push event with commit details
    if (body.repository && body.repository.id) {
      const repoId = `gh-${body.repository.id}`;
      const pushedCommitsCount = Array.isArray(body.commits) ? body.commits.length : 1;
      const commitMsg = body.head_commit?.message || 'Pushed commit to GitHub';

      console.log(`🚀 GitHub Commit Pushed to ${body.repository.name}: "${commitMsg}" (+${pushedCommitsCount} commits)`);

      // Automatically increment commits & add 3D floor in MongoDB Atlas!
      const updated = await ProjectModel.findOneAndUpdate(
        { id: repoId },
        { 
          $inc: { commitsCount: pushedCommitsCount },
          $set: {
            description: body.repository.description || `Public GitHub repository ${body.repository.full_name}.`,
            githubUrl: body.repository.html_url,
            liveUrl: body.repository.homepage || ''
          }
        },
        { new: true, upsert: true }
      );

      // Trigger full sync in background
      syncGitHubRepositories();

      return res.json({
        success: true,
        message: `100% Auto-synced! Pushed ${pushedCommitsCount} commit(s) to ${body.repository.name}. 3D Skyscraper building floor added!`,
        updatedProject: updated
      });
    }

    // Default trigger full sync
    const repos = await syncGitHubRepositories();
    res.json({
      success: true,
      message: `GitHub webhook processed event '${event}'. Auto-synced ${repos.length} repositories.`,
      event
    });
  } catch (err) {
    console.error('Error processing 100% auto GitHub webhook:', err);
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
