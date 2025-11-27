import React, { useState, useEffect, useRef } from 'react';
import { Folder, FolderOpen, Plus, Trash2, ChevronDown } from './Icons';
import { Project } from '../services/projectStorage';
import { projectStorage } from '../services/projectStorage';

interface ProjectSwitcherProps {
  currentProjectId: string | null;
  currentProjectName: string;
  onProjectSelect: (projectId: string) => void;
  onProjectCreate: (name: string) => void;
  onProjectDelete: (projectId: string) => void;
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({
  currentProjectId,
  currentProjectName,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewProjectName('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadProjects = () => {
    setProjects(projectStorage.getAllProjects());
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onProjectCreate(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
      setTimeout(loadProjects, 100); // Reload after creation
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? All data will be lost.')) {
      onProjectDelete(projectId);
      setTimeout(loadProjects, 100); // Reload after deletion
    }
  };

  const handleProjectSelect = (projectId: string) => {
    onProjectSelect(projectId);
    setIsOpen(false);
    setTimeout(loadProjects, 100); // Reload to get updated list
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadProjects();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-md transition-all active:scale-95"
        title="Switch Projects"
      >
        <Folder className="w-4 h-4" />
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setIsOpen(false);
              setIsCreating(false);
              setNewProjectName('');
            }}
          ></div>
          <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2">
              {/* Header */}
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Projects</h3>
                {!isCreating && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                    title="New Project"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>

              {/* Create New Project Form */}
              {isCreating && (
                <div className="px-3 py-3 border-b border-slate-100">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateProject();
                      } else if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewProjectName('');
                      }
                    }}
                    placeholder="Project name..."
                    className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreateProject}
                      className="flex-1 px-2 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewProjectName('');
                      }}
                      className="px-2 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Project List */}
              <div className="max-h-96 overflow-y-auto">
                {projects.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-slate-400">
                    No projects yet. Create one to get started.
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors group relative ${
                        project.id === currentProjectId
                          ? 'bg-indigo-50 hover:bg-indigo-100'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${
                        project.id === currentProjectId
                          ? 'bg-indigo-100'
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}>
                        {project.id === currentProjectId ? (
                          <FolderOpen className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Folder className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          project.id === currentProjectId
                            ? 'text-indigo-900'
                            : 'text-slate-700'
                        }`}>
                          {project.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {formatDate(project.updatedAt)} • {project.columns.length} columns • {project.documents.length} docs
                        </div>
                      </div>
                      {project.id === currentProjectId && (
                        <div className="absolute right-2 top-2">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        </div>
                      )}
                      {project.id !== currentProjectId && (
                        <button
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

