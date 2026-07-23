export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'Full Stack' | 'Frontend' | 'Backend' | 'UI/UX' | 'Mobile';
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl?: string;
  commitsCount: number; // Controls the 3D building height & floors!
  buildingColor: string; // Hex or CSS color string for 3D accent
  featured: boolean;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Development' | 'UI/UX & Design' | 'Styling & Tools' | 'Backend & DB';
  level: number; // 1 - 100
  iconName: string;
  color: string;
}

export interface Hobby {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: number; // 1 - 10
  posterUrl: string;
  review: string;
}

export interface ProfileInfo {
  name: string;
  title: string;
  bio: string;
  location: string;
  avatarUrl: string;
  email: string;
  githubUsername: string;
  githubUrl: string;
  linkedinUrl: string;
  focusArea: string;
  learningGoals: string[];
  yearsExperience: number;
  totalCommitsOverride?: number;
  totalFloorsOverride?: number;
  totalBuildingsOverride?: number;
}

export interface CityConfig {
  theme: 'cyberpunk' | 'matrix' | 'sunset' | 'diamond' | 'neon-blue';
  showGrid: boolean;
  showParticles: boolean;
  autoRotate: boolean;
  rotationSpeed: number;
  weatherEffect: 'clear' | 'cyber-rain' | 'starfield' | 'grid-pulses';
  skyColor: string;
  gridColor: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface PortfolioData {
  profile: ProfileInfo;
  projects: Project[];
  skills: Skill[];
  hobbies: Hobby[];
  movies: Movie[];
  cityConfig: CityConfig;
  messages: ContactMessage[];
}
