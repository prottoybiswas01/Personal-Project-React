import { useEffect, useState } from 'react';
import type { PortfolioData, Project, ContactMessage } from './types/portfolio';
import { 
  getStoredPortfolioData, 
  saveStoredPortfolioData, 
  resetPortfolioData,
  playSound
} from './utils/storage';
import { 
  fetchPortfolioData, 
  saveProfileToDB, 
  saveProjectToDB, 
  saveCityConfigToDB, 
  sendMessageToDB, 
  resetDBToDefaults,
  syncGitHubRepositoriesWithDB
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
import confetti from 'canvas-confetti';

export function App() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(getStoredPortfolioData);
  const [isMongoConnected, setIsMongoConnected] = useState<boolean>(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Selected 3D Building Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Admin Auth & Dashboard Modal State
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Fetch initial state & run initial GitHub Auto Sync
  useEffect(() => {
    async function loadData() {
      const { data, isMongoConnected: connected } = await fetchPortfolioData();
      if (connected) {
        setPortfolioData(data);
        setIsMongoConnected(true);
      }

      // Perform background GitHub auto-sync on load
      const res = await syncGitHubRepositoriesWithDB();
      if (res.success && res.projects) {
        setPortfolioData(prev => ({ ...prev, projects: res.projects! }));
      }
    }
    loadData();

    // Automatic polling interval (every 2 minutes) for continuous GitHub auto-sync
    const interval = setInterval(async () => {
      const res = await syncGitHubRepositoriesWithDB();
      if (res.success && res.projects) {
        setPortfolioData(prev => ({ ...prev, projects: res.projects! }));
      }
    }, 120000);

    return () => clearInterval(interval);
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

  // Live GitHub Auto Sync Action
  const handleSyncGitHub = async () => {
    setIsSyncingGitHub(true);
    playSound('commit');

    const res = await syncGitHubRepositoriesWithDB();
    setIsSyncingGitHub(false);

    if (res.success && res.projects) {
      const updated = {
        ...portfolioData,
        projects: res.projects
      };
      setPortfolioData(updated);
      saveStoredPortfolioData(updated);

      playSound('admin');
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 }
      });

      setSyncStatusMsg(res.message || 'Live synced with GitHub repositories!');
      setTimeout(() => setSyncStatusMsg(null), 5000);
    } else {
      playSound('error');
      setSyncStatusMsg(res.message || 'Could not sync with GitHub');
      setTimeout(() => setSyncStatusMsg(null), 5000);
    }
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
        onSyncGitHub={handleSyncGitHub}
        isSyncingGitHub={isSyncingGitHub}
      />

      {/* MongoDB Atlas & Sync Notification Banner */}
      {(isMongoConnected || syncStatusMsg) && (
        <div className="bg-slate-900/90 border-b border-sky-500/30 px-4 py-2 text-center text-xs font-mono-code text-sky-300 flex flex-wrap items-center justify-center gap-2">
          {syncStatusMsg ? (
            <span className="text-emerald-400 font-bold">✨ {syncStatusMsg}</span>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>MongoDB Atlas Connected • Real-Time GitHub Auto Sync Active</span>
            </>
          )}
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
          onSyncGitHub={handleSyncGitHub}
          isSyncingGitHub={isSyncingGitHub}
        />

        {/* Filterable Projects Section */}
        <ProjectsSection
          projects={portfolioData.projects}
          onSelectProject={(proj) => setSelectedProject(proj)}
          onSyncGitHub={handleSyncGitHub}
          isSyncingGitHub={isSyncingGitHub}
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
        onSyncGitHub={handleSyncGitHub}
        isSyncingGitHub={isSyncingGitHub}
      />

    </div>
  );
}
