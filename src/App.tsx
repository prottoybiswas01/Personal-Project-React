import { useEffect, useState } from 'react';
import type { PortfolioData, Project, ContactMessage } from './types/portfolio';
import { 
  getStoredPortfolioData, 
  saveStoredPortfolioData, 
  resetPortfolioData
} from './utils/storage';
import { 
  fetchPortfolioData, 
  saveProfileToDB, 
  saveProjectToDB, 
  pushCommitToDB, 
  saveCityConfigToDB, 
  sendMessageToDB, 
  resetDBToDefaults 
} from './services/api';

import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { AboutSection } from './components/sections/AboutSection';
import { HobbiesMoviesSection } from './components/sections/HobbiesMoviesSection';
import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/layout/Footer';

import { BuildingInspectorModal } from './components/3d/BuildingInspectorModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

export function App() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(getStoredPortfolioData);
  const [isMongoConnected, setIsMongoConnected] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Selected 3D Building Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Admin Auth & Dashboard Modal State
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Fetch initial state from MongoDB Atlas API
  useEffect(() => {
    async function loadData() {
      const { data, isMongoConnected: connected } = await fetchPortfolioData();
      if (connected) {
        setPortfolioData(data);
        setIsMongoConnected(true);
      }
    }
    loadData();
  }, []);

  // Check URL pathname for /admin or #admin
  useEffect(() => {
    const handleUrlCheck = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.endsWith('/admin') || hash === '#admin') {
        setIsAdminLoginOpen(true);
      }
    };
    handleUrlCheck();
    window.addEventListener('hashchange', handleUrlCheck);
    return () => window.removeEventListener('hashchange', handleUrlCheck);
  }, []);

  // Save changes to MongoDB Atlas and localStorage
  const updatePortfolioData = async (newData: PortfolioData) => {
    setPortfolioData(newData);
    saveStoredPortfolioData(newData);
  };

  const handleSaveAllFromAdmin = async (newData: PortfolioData) => {
    setPortfolioData(newData);
    saveStoredPortfolioData(newData);
    
    // Sync to MongoDB Atlas
    await saveProfileToDB(newData.profile);
    await saveCityConfigToDB(newData.cityConfig);
    for (const proj of newData.projects) {
      await saveProjectToDB(proj, false);
    }
  };

  const handleResetData = async () => {
    await resetDBToDefaults();
    const fresh = resetPortfolioData();
    setPortfolioData(fresh);
  };

  // Add Commits / Stack 3D Floor to Building
  const handleAddCommit = async (projectId: string) => {
    const updatedProjects = portfolioData.projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          commitsCount: p.commitsCount + 1,
        };
      }
      return p;
    });

    const updatedData: PortfolioData = {
      ...portfolioData,
      projects: updatedProjects,
    };

    updatePortfolioData(updatedData);
    await pushCommitToDB(projectId, 1);

    // Refresh selected project in modal so updated commit count shows live!
    const target = updatedProjects.find((p) => p.id === projectId);
    if (target) {
      setSelectedProject(target);
    }
  };

  // Contact Form Message Transmission Handler
  const handleSendMessage = async (msgData: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
    const newMsg: ContactMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      date: new Date().toLocaleString(),
      read: false,
    };
    const updated = {
      ...portfolioData,
      messages: [newMsg, ...portfolioData.messages],
    };
    updatePortfolioData(updated);
    await sendMessageToDB(msgData);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30 selection:text-sky-300 font-sans relative overflow-x-hidden">
      
      {/* Top Header Navbar */}
      <Navbar
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setIsAdminLoginOpen(false);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* MongoDB Atlas Connectivity Banner */}
      {isMongoConnected && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-1.5 text-center text-xs font-mono-code text-emerald-400 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>MongoDB Atlas Connected • Live Persistence Active (Cluster0)</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="space-y-12">
        
        {/* 3D GitHub City Skyscraper Hero Stage */}
        <HeroSection
          profile={portfolioData.profile}
          projects={portfolioData.projects}
          cityConfig={portfolioData.cityConfig}
          onUpdateCityConfig={(newCityConfig) => {
            const nextConfig = { ...portfolioData.cityConfig, ...newCityConfig };
            updatePortfolioData({
              ...portfolioData,
              cityConfig: nextConfig,
            });
            saveCityConfigToDB(nextConfig);
          }}
          onSelectProject={(proj) => setSelectedProject(proj)}
          onOpenAdmin={() => setIsAdminLoginOpen(true)}
        />

        {/* Filterable Projects Section */}
        <ProjectsSection
          projects={portfolioData.projects}
          onSelectProject={(proj) => setSelectedProject(proj)}
        />

        {/* 3D Interactive Skills Matrix */}
        <SkillsSection skills={portfolioData.skills} />

        {/* About Prottoy Biswas & Biography */}
        <AboutSection profile={portfolioData.profile} />

        {/* Creative Hobbies & Sci-Fi Media Showcase */}
        <HobbiesMoviesSection
          hobbies={portfolioData.hobbies}
          movies={portfolioData.movies}
        />

        {/* Direct Contact Terminal */}
        <ContactSection
          profile={portfolioData.profile}
          onSendMessage={handleSendMessage}
        />

      </main>

      {/* Cyberpunk Footer */}
      <Footer
        profile={portfolioData.profile}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
      />

      {/* 3D Skyscraper Building Inspector Modal */}
      <BuildingInspectorModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onAddCommit={handleAddCommit}
      />

      {/* Admin Auth Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen && !isAdminLoggedIn}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
        }}
      />

      {/* Admin Control Center Dashboard */}
      <AdminDashboard
        isOpen={isAdminLoggedIn}
        onClose={() => setIsAdminLoggedIn(false)}
        data={portfolioData}
        onSaveData={(newData) => {
          handleSaveAllFromAdmin(newData);
        }}
        onResetData={() => {
          handleResetData();
          setIsAdminLoggedIn(false);
        }}
      />

    </div>
  );
}
