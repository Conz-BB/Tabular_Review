import { DocumentFile, Column, ExtractionResult } from '../types';

export interface Project {
  id: string;
  name: string;
  columns: Column[];
  documents: DocumentFile[];
  results: ExtractionResult;
  selectedModel: string;
  sheetContext?: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'tabular_review_projects';
const CURRENT_PROJECT_KEY = 'tabular_review_current_project';

export const projectStorage = {
  // Get all projects
  getAllProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  },

  // Save a project
  saveProject(project: Project): void {
    try {
      const projects = this.getAllProjects();
      const existingIndex = projects.findIndex(p => p.id === project.id);
      
      if (existingIndex >= 0) {
        projects[existingIndex] = project;
      } else {
        projects.push(project);
      }

      // Sort by updatedAt descending
      projects.sort((a, b) => b.updatedAt - a.updatedAt);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving project:', error);
    }
  },

  // Get a specific project
  getProject(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  },

  // Delete a project
  deleteProject(id: string): void {
    try {
      const projects = this.getAllProjects();
      const filtered = projects.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      
      // If deleting current project, clear it
      const currentId = localStorage.getItem(CURRENT_PROJECT_KEY);
      if (currentId === id) {
        localStorage.removeItem(CURRENT_PROJECT_KEY);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  },

  // Get current project ID
  getCurrentProjectId(): string | null {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  },

  // Set current project ID
  setCurrentProjectId(id: string): void {
    localStorage.setItem(CURRENT_PROJECT_KEY, id);
  },

  // Create a new project
  createProject(name: string, selectedModel: string): Project {
    const now = Date.now();
    const project: Project = {
      id: `project_${now}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      columns: [],
      documents: [],
      results: {},
      selectedModel,
      createdAt: now,
      updatedAt: now
    };
    
    this.saveProject(project);
    return project;
  },

  // Update project with current state
  updateProject(
    id: string,
    updates: {
      name?: string;
      columns?: Column[];
      documents?: DocumentFile[];
      results?: ExtractionResult;
      selectedModel?: string;
      sheetContext?: string;
    }
  ): Project | null {
    const project = this.getProject(id);
    if (!project) return null;

    const updated: Project = {
      ...project,
      ...updates,
      updatedAt: Date.now()
    };

    this.saveProject(updated);
    return updated;
  }
};
