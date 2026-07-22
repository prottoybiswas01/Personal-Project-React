import type { PortfolioData, ProfileInfo, Project, CityConfig, ContactMessage } from '../types/portfolio';
import { initialPortfolioData } from '../data/initialData';

const API_BASE_URL = '/api';

export async function fetchPortfolioData(): Promise<{ data: PortfolioData; isMongoConnected: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio`);
    if (res.ok) {
      const data = await res.json();
      return { data, isMongoConnected: true };
    }
  } catch (err) {
    console.warn('Backend server not responding, using local storage fallback:', err);
  }
  return { data: initialPortfolioData, isMongoConnected: false };
}

export async function syncGitHubRepositoriesWithDB(): Promise<{ success: boolean; projects?: Project[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/github/sync`);
    if (res.ok) {
      const result = await res.json();
      return { success: true, projects: result.projects, message: result.message };
    }
  } catch (err) {
    console.error('Error syncing with GitHub:', err);
  }
  return { success: false, message: 'Could not connect to GitHub API' };
}

export async function saveProfileToDB(profile: ProfileInfo): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveProjectToDB(project: Project, isNew: boolean): Promise<boolean> {
  try {
    const url = isNew ? `${API_BASE_URL}/portfolio/projects` : `${API_BASE_URL}/portfolio/projects/${project.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteProjectFromDB(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/projects/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pushCommitToDB(projectId: string, count: number = 1): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/projects/${projectId}/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveCityConfigToDB(config: CityConfig): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/city-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendMessageToDB(message: Omit<ContactMessage, 'id' | 'date' | 'read'>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resetDBToDefaults(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/reset`, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
