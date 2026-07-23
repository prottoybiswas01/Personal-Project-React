import React, { useState } from 'react';
import type { PortfolioData, Project, CityConfig } from '../../types/portfolio';
import { 
  Shield, X, Save, Plus, Trash2, Edit, Layers, User, 
  Sparkles, Film, Inbox, Download, Upload, RotateCcw, RefreshCw
} from 'lucide-react';
import { playSound } from '../../utils/storage';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
  onSaveData: (newData: PortfolioData) => void;
  onResetData: () => void;
  onSyncGitHub?: () => void;
  isSyncingGitHub?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  data,
  onSaveData,
  onResetData,
  onSyncGitHub,
  isSyncingGitHub = false,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'city' | 'hobbies' | 'messages' | 'backup'>('projects');
  
  // Local working copy of state for editing
  const [formData, setFormData] = useState<PortfolioData>(data);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Project Form State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    title: '',
    subtitle: '',
    description: '',
    category: 'Full Stack',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB'],
    githubUrl: 'https://github.com/prottoybiswas01',
    liveUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=80',
    commitsCount: 30,
    buildingColor: '#38bdf8',
    featured: true
  });

  if (!isOpen) return null;

  const handleSaveAll = () => {
    playSound('admin');
    onSaveData(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Add / Edit Project Handlers
  const handleSaveProjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click');

    if (editingProject) {
      // Update existing
      const updatedProjects = formData.projects.map((p) => 
        p.id === editingProject.id ? { ...p, ...projectForm } as Project : p
      );
      setFormData({ ...formData, projects: updatedProjects });
      setEditingProject(null);
    } else {
      // Create new
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        title: projectForm.title || 'New Project',
        subtitle: projectForm.subtitle || 'Custom Web Application',
        description: projectForm.description || 'Description of custom project',
        category: (projectForm.category as Project['category']) || 'Full Stack',
        techStack: projectForm.techStack || ['React', 'Node.js'],
        githubUrl: projectForm.githubUrl || 'https://github.com/prottoybiswas01',
        liveUrl: projectForm.liveUrl || '',
        imageUrl: projectForm.imageUrl || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=80',
        commitsCount: Number(projectForm.commitsCount) || 20,
        buildingColor: projectForm.buildingColor || '#38bdf8',
        featured: Boolean(projectForm.featured),
        createdAt: new Date().toISOString().split('T')[0]
      };
      setFormData({ ...formData, projects: [...formData.projects, newProj] });
    }

    setIsAddingProject(false);
    setProjectForm({
      title: '',
      subtitle: '',
      description: '',
      category: 'Full Stack',
      techStack: ['React', 'Node.js', 'TailwindCSS'],
      githubUrl: 'https://github.com/prottoybiswas01',
      liveUrl: '',
      imageUrl: '',
      commitsCount: 30,
      buildingColor: '#38bdf8',
      featured: true
    });
  };

  const handleDeleteProject = (id: string) => {
    playSound('click');
    setFormData({
      ...formData,
      projects: formData.projects.filter((p) => p.id !== id)
    });
  };

  // Add Commits / Building Floor Height Handler
  const handleQuickAddCommit = (id: string, count: number) => {
    playSound('commit');
    const updated = formData.projects.map((p) => 
      p.id === id ? { ...p, commitsCount: Math.max(1, p.commitsCount + count) } : p
    );
    setFormData({ ...formData, projects: updated });
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    playSound('click');
    const jsonStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prottoy_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile && parsed.projects) {
          playSound('admin');
          setFormData(parsed);
          alert('Backup configuration imported successfully!');
        }
      } catch {
        alert('Invalid JSON configuration file!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col glass-panel border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Admin Header */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 glow-purple">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-white flex items-center gap-2">
                ADMIN CONTROL CENTER
                <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LIVE</span>
              </h2>
              <p className="text-xs font-mono-code text-slate-400">
                Prottoy Biswas • Customize Portfolio, 3D Buildings, City Themes & Messages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSyncGitHub && (
              <button
                onClick={() => {
                  playSound('click');
                  onSyncGitHub();
                }}
                disabled={isSyncingGitHub}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 font-mono-code text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : ''}`} />
                <span>{isSyncingGitHub ? 'Syncing...' : 'Sync GitHub Repos'}</span>
              </button>
            )}

            <button
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-mono-code text-xs font-bold flex items-center gap-1.5 shadow-lg glow-cyan transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccess ? 'SAVED SUCCESS!' : 'SAVE ALL CHANGES'}</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Sidebar Tabs & Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Tabs Sidebar */}
          <div className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-3 space-y-1.5 font-mono-code shrink-0">
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                activeTab === 'projects'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 glow-cyan font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Projects & 3D City
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-sky-400">
                {formData.projects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all ${
                activeTab === 'profile'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 glow-purple font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-purple-400" />
              <span>Profile & Personal Info</span>
            </button>

            <button
              onClick={() => setActiveTab('city')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all ${
                activeTab === 'city'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>3D City Configurator</span>
            </button>

            <button
              onClick={() => setActiveTab('hobbies')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all ${
                activeTab === 'hobbies'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4 text-pink-400" />
              <span>Hobbies & Movies</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                activeTab === 'messages'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-emerald-400" />
                Contact Messages
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-emerald-400 font-bold">
                {formData.messages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all ${
                activeTab === 'backup'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Backup & Factory Reset</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60 font-sans">
            
            {/* PROJECTS MANAGER TAB */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-white">Project Skyscrapers & Git Activity</h3>
                    <p className="text-xs text-slate-400 font-mono-code">Add or modify projects. Syncing with GitHub fetches live repositories from github.com/prottoybiswas01!</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSyncGitHub && (
                      <button
                        onClick={() => {
                          playSound('click');
                          onSyncGitHub();
                        }}
                        disabled={isSyncingGitHub}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 text-sky-400 border border-sky-500/30 text-xs font-mono-code font-bold flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : ''}`} />
                        <span>{isSyncingGitHub ? 'Syncing GitHub...' : 'Live GitHub Auto-Sync'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        playSound('click');
                        setEditingProject(null);
                        setIsAddingProject(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-mono-code font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Custom Project</span>
                    </button>
                  </div>
                </div>

                {/* Add / Edit Project Modal Form */}
                {(isAddingProject || editingProject) && (
                  <form onSubmit={handleSaveProjectForm} className="p-5 rounded-2xl glass-panel border border-sky-500/40 space-y-4 font-mono-code">
                    <h4 className="text-sm font-bold text-sky-300">
                      {editingProject ? `Edit Project: ${editingProject.title}` : 'Add New Portfolio Project'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Project Title *</label>
                        <input
                          type="text"
                          required
                          value={projectForm.title}
                          onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Subtitle / Role *</label>
                        <input
                          type="text"
                          required
                          value={projectForm.subtitle}
                          onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Category</label>
                        <select
                          value={projectForm.category}
                          onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as Project['category'] })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        >
                          <option value="Full Stack">Full Stack</option>
                          <option value="Frontend">Frontend</option>
                          <option value="Backend">Backend</option>
                          <option value="UI/UX">UI/UX</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Commits Count (3D Floor Height)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={projectForm.commitsCount}
                          onChange={(e) => setProjectForm({ ...projectForm, commitsCount: parseInt(e.target.value) || 10 })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">3D Accent Color</label>
                        <input
                          type="color"
                          value={projectForm.buildingColor || '#38bdf8'}
                          onChange={(e) => setProjectForm({ ...projectForm, buildingColor: e.target.value })}
                          className="w-full h-9 p-1 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">GitHub Repo URL</label>
                        <input
                          type="text"
                          value={projectForm.githubUrl}
                          onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Live App Demo URL</label>
                        <input
                          type="text"
                          value={projectForm.liveUrl}
                          onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProject(false);
                          setEditingProject(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                      >
                        Save Project & Update 3D Skyscraper
                      </button>
                    </div>
                  </form>
                )}

                {/* Projects List */}
                <div className="space-y-3 font-mono-code">
                  {formData.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0" 
                          style={{ backgroundColor: proj.buildingColor || '#38bdf8' }}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {proj.title}
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-sky-400 border border-sky-500/30">
                              {proj.category}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400">
                            {proj.commitsCount} Commits • {Math.max(3, Math.floor(proj.commitsCount / 2))} Floors
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickAddCommit(proj.id, 10)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] flex items-center gap-0.5"
                          title="Add 10 commits & floors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+10</span>
                        </button>

                        <button
                          onClick={() => handleQuickAddCommit(proj.id, 5)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] flex items-center gap-0.5"
                          title="Add 5 commits & floors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+5</span>
                        </button>

                        <button
                          onClick={() => handleQuickAddCommit(proj.id, -5)}
                          className="px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-[11px] flex items-center gap-0.5"
                          title="Remove 5 commits"
                        >
                          <span>-5</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingProject(proj);
                            setProjectForm(proj);
                          }}
                          className="p-2 rounded-lg bg-slate-800 text-sky-400 hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-2 rounded-lg bg-slate-800 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* PROFILE INFO TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-4 font-mono-code">
                <h3 className="text-lg font-heading font-bold text-white font-sans">Personal Profile & Bio</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.profile.name}
                      onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, name: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Professional Title</label>
                    <input
                      type="text"
                      value={formData.profile.title}
                      onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, title: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Biography</label>
                  <textarea
                    rows={3}
                    value={formData.profile.bio}
                    onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, bio: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.profile.location}
                      onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, location: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.profile.email}
                      onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, email: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Live Hero Stats Controls */}
                <div className="p-4 rounded-2xl glass-panel border border-sky-500/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sky-400" />
                        <span>Hero Section Live Stats Customizer</span>
                      </h4>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        Manually override total Git Commits, 3D Buildings, or Floors count displayed on home page header!
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setFormData({
                          ...formData,
                          profile: {
                            ...formData.profile,
                            totalCommitsOverride: undefined,
                            totalFloorsOverride: undefined,
                            totalBuildingsOverride: undefined
                          }
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-[11px]"
                    >
                      Reset to Auto-Calculated
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Total Git Commits (Currently: {formData.projects.reduce((sum, p) => sum + p.commitsCount, 0)})
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          placeholder="Auto (727)"
                          value={formData.profile.totalCommitsOverride ?? ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                            setFormData({ ...formData, profile: { ...formData.profile, totalCommitsOverride: val } });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-purple-300 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            playSound('commit');
                            const current = formData.profile.totalCommitsOverride || formData.projects.reduce((sum, p) => sum + p.commitsCount, 0);
                            setFormData({ ...formData, profile: { ...formData.profile, totalCommitsOverride: current + 50 } });
                          }}
                          className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold shrink-0"
                          title="Add +50 commits"
                        >
                          +50
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Floors Stacked (Currently: {formData.projects.reduce((sum, p) => sum + Math.max(3, Math.floor(p.commitsCount / 2)), 0)})
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          placeholder="Auto (386)"
                          value={formData.profile.totalFloorsOverride ?? ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                            setFormData({ ...formData, profile: { ...formData.profile, totalFloorsOverride: val } });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            playSound('commit');
                            const current = formData.profile.totalFloorsOverride || formData.projects.reduce((sum, p) => sum + Math.max(3, Math.floor(p.commitsCount / 2)), 0);
                            setFormData({ ...formData, profile: { ...formData.profile, totalFloorsOverride: current + 25 } });
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shrink-0"
                          title="Add +25 floors"
                        >
                          +25
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Total 3D Buildings (Currently: {formData.projects.length})
                      </label>
                      <input
                        type="number"
                        placeholder={`Auto (${formData.projects.length})`}
                        value={formData.profile.totalBuildingsOverride ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                          setFormData({ ...formData, profile: { ...formData.profile, totalBuildingsOverride: val } });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-sky-300 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3D CITY CONFIGURATOR TAB */}
            {activeTab === 'city' && (
              <div className="space-y-6 font-mono-code">
                <h3 className="text-lg font-heading font-bold text-white font-sans">3D WebGL City Environment</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">City Palette Theme</label>
                    <select
                      value={formData.cityConfig.theme}
                      onChange={(e) => setFormData({ ...formData, cityConfig: { ...formData.cityConfig, theme: e.target.value as CityConfig['theme'] } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white capitalize"
                    >
                      <option value="cyberpunk">Cyberpunk Neon</option>
                      <option value="matrix">Matrix Emerald</option>
                      <option value="sunset">Sunset Gold</option>
                      <option value="diamond">Diamond Midnight</option>
                      <option value="neon-blue">Neon Cyber Blue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Auto-Rotate Speed</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="0.02"
                      value={formData.cityConfig.rotationSpeed}
                      onChange={(e) => setFormData({ ...formData, cityConfig: { ...formData.cityConfig, rotationSpeed: parseFloat(e.target.value) || 0.003 } })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2 flex-wrap">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cityConfig.autoRotate}
                      onChange={(e) => setFormData({ ...formData, cityConfig: { ...formData.cityConfig, autoRotate: e.target.checked } })}
                      className="rounded bg-slate-900 border-slate-700"
                    />
                    <span>Auto Rotate Camera</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cityConfig.showGrid}
                      onChange={(e) => setFormData({ ...formData, cityConfig: { ...formData.cityConfig, showGrid: e.target.checked } })}
                      className="rounded bg-slate-900 border-slate-700"
                    />
                    <span>Show Ground Grid</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cityConfig.showParticles}
                      onChange={(e) => setFormData({ ...formData, cityConfig: { ...formData.cityConfig, showParticles: e.target.checked } })}
                      className="rounded bg-slate-900 border-slate-700"
                    />
                    <span>Show Particle Atmosphere</span>
                  </label>
                </div>
              </div>
            )}

            {/* MESSAGES INBOX TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-4 font-mono-code">
                <h3 className="text-lg font-heading font-bold text-white font-sans">Contact Transmissions ({formData.messages.length})</h3>
                
                {formData.messages.length === 0 ? (
                  <p className="text-xs text-slate-400">No contact messages received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.messages.map((msg) => (
                      <div key={msg.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                          <span className="text-sky-300 font-bold">{msg.name} ({msg.email})</span>
                          <span>{msg.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{msg.subject || 'No Subject'}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BACKUP & RESTORE TAB */}
            {activeTab === 'backup' && (
              <div className="space-y-6 font-mono-code">
                <h3 className="text-lg font-heading font-bold text-white font-sans">Backup & Data Controls</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span>Export Portfolio Backup JSON</span>
                    </h4>
                    <p className="text-xs text-slate-400 font-sans">Download full backup file containing all 3D projects, profile bio, movies, and settings.</p>
                    <button
                      onClick={handleExportJSON}
                      className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold"
                    >
                      Download Backup (.json)
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Import Portfolio Backup</span>
                    </h4>
                    <p className="text-xs text-slate-400 font-sans">Upload a previously saved .json backup file to restore complete portfolio state.</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="text-xs text-slate-400"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3">
                  <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Factory Reset Portfolio Data</span>
                  </h4>
                  <p className="text-xs text-slate-400 font-sans">Restores initial Prottoy Biswas defaults. This clears all custom edits from local browser storage.</p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all portfolio data to factory defaults?')) {
                        onResetData();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold"
                  >
                    Reset to Prottoy Biswas Defaults
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
