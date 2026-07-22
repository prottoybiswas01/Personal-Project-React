import type { PortfolioData } from '../types/portfolio';

export const initialPortfolioData: PortfolioData = {
  profile: {
    name: 'Prottoy Biswas',
    title: 'MERN Stack Developer | UI/UX Designer',
    bio: 'Passionate MERN stack web developer and UI/UX designer from Dhaka, Bangladesh. Specializing in building modern, scalable, interactive web applications with immersive user experiences.',
    location: 'Dhaka, Bangladesh',
    avatarUrl: '/prottoy_profile.png',
    email: 'prottoybiswas01@gmail.com',
    githubUsername: 'prottoybiswas01',
    githubUrl: 'https://github.com/prottoybiswas01',
    linkedinUrl: 'https://linkedin.com/in/prottoybiswas01',
    focusArea: 'MERN Stack Development & Modern UI/UX',
    learningGoals: [
      'Advanced React 19 Patterns & Server Actions',
      'Micro-Frontends & Cloud Architecture',
      'Interactive 3D WebGL / Three.js Visualizations',
      'Design Systems & Accessible UI Frameworks'
    ],
    yearsExperience: 2
  },
  projects: [
    {
      id: 'proj-1',
      title: 'E-Commerce Platform',
      subtitle: 'Full Stack MERN Shopping Application',
      description: 'Feature-complete e-commerce suite with shopping cart, user authentication, automated payment gateway integration, product inventory management, and an interactive admin dashboard.',
      category: 'Full Stack',
      techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS', 'Stripe'],
      githubUrl: 'https://github.com/prottoybiswas01/Professional-Portfolio',
      liveUrl: 'https://github.com/prottoybiswas01',
      imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=80',
      commitsCount: 42,
      buildingColor: '#38bdf8', // Neon Sky Blue
      featured: true,
      createdAt: '2025-11-10'
    },
    {
      id: 'proj-2',
      title: 'Tuition Platform UI',
      subtitle: 'Educational Tutor-Student Portal',
      description: 'Modern educational booking & tutor discovery platform featuring responsive course filtering, guardian user experience workflows, subject matching, and custom schedule visualizers.',
      category: 'Frontend',
      techStack: ['React', 'TailwindCSS', 'JavaScript', 'Context API', 'Lucide Icons'],
      githubUrl: 'https://github.com/prottoybiswas01',
      liveUrl: 'https://github.com/prottoybiswas01',
      imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
      commitsCount: 28,
      buildingColor: '#a855f7', // Cyber Purple
      featured: true,
      createdAt: '2025-12-05'
    },
    {
      id: 'proj-3',
      title: 'Admin Analytics Dashboard',
      subtitle: 'Real-time Data Visualization Hub',
      description: 'Sleek, data-rich analytical dashboard with customizable chart widgets, system metrics tracking, responsive sidebars, dark mode engine, and user role management controls.',
      category: 'Frontend',
      techStack: ['React', 'Chart.js', 'TailwindCSS', 'REST APIs', 'Vite'],
      githubUrl: 'https://github.com/prottoybiswas01',
      liveUrl: 'https://github.com/prottoybiswas01',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      commitsCount: 35,
      buildingColor: '#10b981', // Matrix Emerald Green
      featured: true,
      createdAt: '2026-01-15'
    },
    {
      id: 'proj-4',
      title: 'Authentication & RBAC System',
      subtitle: 'Secure Multi-Role Identity Provider',
      description: 'Robust authentication service utilizing JWT tokens, Firebase Auth, refresh token rotation, encrypted cookie sessions, and granular Role-Based Access Control (RBAC).',
      category: 'Backend',
      techStack: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Firebase Auth'],
      githubUrl: 'https://github.com/prottoybiswas01',
      liveUrl: 'https://github.com/prottoybiswas01',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      commitsCount: 19,
      buildingColor: '#ec4899', // Hot Cyber Pink
      featured: true,
      createdAt: '2026-02-02'
    },
    {
      id: 'proj-5',
      title: 'UI/UX Design Systems Hub',
      subtitle: 'Design System & Component Library',
      description: 'Comprehensive Figma design tokens, component library specs, color accessibility standards, micro-interaction mockups, and reusable component guidelines.',
      category: 'UI/UX',
      techStack: ['Figma', 'Adobe Illustrator', 'Canva', 'CSS Design Tokens'],
      githubUrl: 'https://github.com/prottoybiswas01',
      liveUrl: 'https://github.com/prottoybiswas01',
      imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
      commitsCount: 22,
      buildingColor: '#f59e0b', // Cyber Gold
      featured: false,
      createdAt: '2026-03-12'
    }
  ],
  skills: [
    { id: 'sk-1', name: 'JavaScript (ES6+)', category: 'Development', level: 92, iconName: 'Code', color: '#f7df1e' },
    { id: 'sk-2', name: 'React.js', category: 'Development', level: 90, iconName: 'Atom', color: '#61dafb' },
    { id: 'sk-3', name: 'Node.js', category: 'Backend & DB', level: 85, iconName: 'Server', color: '#22c55e' },
    { id: 'sk-4', name: 'Express.js', category: 'Backend & DB', level: 86, iconName: 'Cpu', color: '#94a3b8' },
    { id: 'sk-5', name: 'MongoDB', category: 'Backend & DB', level: 82, iconName: 'Database', color: '#4ade80' },
    { id: 'sk-6', name: 'TailwindCSS', category: 'Styling & Tools', level: 95, iconName: 'Palette', color: '#38b2ac' },
    { id: 'sk-7', name: 'UI/UX Design', category: 'UI/UX & Design', level: 88, iconName: 'Figma', color: '#a855f7' },
    { id: 'sk-8', name: 'Figma', category: 'UI/UX & Design', level: 90, iconName: 'Layout', color: '#f24e1e' },
    { id: 'sk-9', name: 'Adobe Illustrator', category: 'UI/UX & Design', level: 80, iconName: 'PenTool', color: '#ff9a00' },
    { id: 'sk-10', name: 'Git & GitHub', category: 'Styling & Tools', level: 90, iconName: 'GitBranch', color: '#f05033' },
    { id: 'sk-11', name: 'Bootstrap', category: 'Styling & Tools', level: 88, iconName: 'Layers', color: '#8511fa' },
    { id: 'sk-12', name: 'Three.js / 3D Graphics', category: 'Development', level: 75, iconName: 'Box', color: '#38bdf8' }
  ],
  hobbies: [
    {
      id: 'hob-1',
      title: 'UI/UX Prototyping & Motion Design',
      description: 'Crafting fluid glassmorphism animations, micro-interactions, and futuristic layout prototypes in Figma.',
      icon: 'Palette',
      category: 'Design'
    },
    {
      id: 'hob-2',
      title: 'Open Source & Git Exploration',
      description: 'Exploring innovative frontend libraries, 3D WebGL repos, and building utility scripts.',
      icon: 'GitBranch',
      category: 'Coding'
    },
    {
      id: 'hob-3',
      title: 'Sci-Fi & Tech Cinema',
      description: 'Informed by futuristic aesthetics, cyberpunk themes, neon visual landscapes, and digital art.',
      icon: 'Film',
      category: 'Entertainment'
    },
    {
      id: 'hob-4',
      title: 'Tech Gadgets & Workspace Setup',
      description: 'Optimizing productive ergonomic setups, mechanical keyboards, and ambient rgb workspace vibes.',
      icon: 'Monitor',
      category: 'Lifestyle'
    }
  ],
  movies: [
    {
      id: 'mov-1',
      title: 'Blade Runner 2049',
      genre: 'Sci-Fi / Cyberpunk',
      rating: 9.8,
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      review: 'Masterpiece of visual atmosphere, lighting composition, and futuristic cityscapes that inspires my 3D design aesthetics.'
    },
    {
      id: 'mov-2',
      title: 'Interstellar',
      genre: 'Sci-Fi / Drama',
      rating: 9.6,
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      review: 'Incredible score and visual scale. Reminds me to dream big in architecture, code, and software development.'
    },
    {
      id: 'mov-3',
      title: 'The Matrix',
      genre: 'Action / Sci-Fi',
      rating: 9.5,
      posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      review: 'The ultimate programmer movie. Inspired green matrix digital rain themes and deep fascination with system design.'
    }
  ],
  cityConfig: {
    theme: 'cyberpunk',
    showGrid: true,
    showParticles: true,
    autoRotate: true,
    rotationSpeed: 0.003,
    weatherEffect: 'starfield',
    skyColor: '#090d16',
    gridColor: '#38bdf8'
  },
  messages: [
    {
      id: 'msg-1',
      name: 'Sarah Connor',
      email: 'sarah@techstudio.io',
      subject: 'Frontend / MERN Role Opportunity',
      message: 'Hi Prottoy, saw your 3D Interactive GitHub City portfolio! Would love to discuss a remote Senior UI/MERN developer position with our team.',
      date: '2026-07-20 14:32',
      read: false
    }
  ]
};
