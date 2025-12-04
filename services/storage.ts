/**
 * Crochetly Storage Service
 * AsyncStorage utilities for saving and retrieving project data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, ProjectSummary, NewProject } from '@/types/project';

// Storage Keys
const STORAGE_KEYS = {
  PROJECTS: '@crochetly:projects',
  PROJECT_PREFIX: '@crochetly:project:',
  USER_PREFERENCES: '@crochetly:preferences',
} as const;

/**
 * Generate a unique ID for new projects
 */
const generateId = (): string => {
  return `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Get the current timestamp in ISO format
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Project Storage Service
 */
export const ProjectStorage = {
  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const projectsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!projectsJson) {
        return [];
      }
      return JSON.parse(projectsJson) as Project[];
    } catch (error) {
      console.error('Error getting all projects:', error);
      return [];
    }
  },

  /**
   * Get project summaries for the gallery view
   * Returns projects sorted by updatedAt in descending order (newest first)
   */
  async getProjectSummaries(): Promise<ProjectSummary[]> {
    try {
      const projects = await this.getAllProjects();
      const summaries = projects.map((project) => ({
        id: project.id,
        name: project.name,
        status: project.status,
        thumbnailUri: project.thumbnailUri,
        progressPercentage: project.progressPercentage,
        updatedAt: project.updatedAt,
      }));
      // Sort by updatedAt descending (newest first)
      return summaries.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting project summaries:', error);
      return [];
    }
  },

  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    try {
      const projects = await this.getAllProjects();
      return projects.find((project) => project.id === id) || null;
    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  },

  /**
   * Create a new project
   */
  async createProject(newProject: NewProject): Promise<Project> {
    try {
      const timestamp = getTimestamp();
      const project: Project = {
        ...newProject,
        id: newProject.id || generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        yarns: newProject.yarns || [],
        hooks: newProject.hooks || [],
        status: newProject.status || 'draft',
      };

      const projects = await this.getAllProjects();
      projects.unshift(project); // Add to beginning
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  },

  /**
   * Update an existing project
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const projects = await this.getAllProjects();
      const index = projects.findIndex((project) => project.id === id);

      if (index === -1) {
        return null;
      }

      const updatedProject: Project = {
        ...projects[index],
        ...updates,
        id, // Ensure ID doesn't change
        createdAt: projects[index].createdAt, // Preserve createdAt
        updatedAt: getTimestamp(),
      };

      projects[index] = updatedProject;
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      const projects = await this.getAllProjects();
      const filteredProjects = projects.filter((project) => project.id !== id);

      if (filteredProjects.length === projects.length) {
        return false; // Project not found
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filteredProjects));
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  },

  /**
   * Clear all projects (for debugging/reset)
   */
  async clearAllProjects(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PROJECTS);
    } catch (error) {
      console.error('Error clearing projects:', error);
      throw new Error('Failed to clear projects');
    }
  },

  /**
   * Get project count
   */
  async getProjectCount(): Promise<number> {
    try {
      const projects = await this.getAllProjects();
      return projects.length;
    } catch (error) {
      console.error('Error getting project count:', error);
      return 0;
    }
  },
};

/**
 * User Preferences Storage Service
 */
export interface UserPreferences {
  defaultYarnWeight?: string;
  defaultHookSize?: string;
  theme?: 'light' | 'dark' | 'system';
  hasCompletedOnboarding?: boolean;
}

export const PreferencesStorage = {
  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const prefsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (!prefsJson) {
        return {};
      }
      return JSON.parse(prefsJson) as UserPreferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {};
    }
  },

  /**
   * Save user preferences
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      const currentPrefs = await this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw new Error('Failed to save preferences');
    }
  },

  /**
   * Clear preferences (for debugging/reset)
   */
  async clearPreferences(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    } catch (error) {
      console.error('Error clearing preferences:', error);
      throw new Error('Failed to clear preferences');
    }
  },
};

export default {
  ProjectStorage,
  PreferencesStorage,
  STORAGE_KEYS,
};
