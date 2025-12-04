/**
 * Crochetly Project Types
 * Types for crochet projects and related data
 */

import type { PatternAbbreviation } from './ai';

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';
export type DifficultyLevel = 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert';
export type YarnWeight = 'lace' | 'fingering' | 'sport' | 'dk' | 'worsted' | 'aran' | 'bulky' | 'super_bulky';

export interface YarnInfo {
  id: string;
  name: string;
  brand?: string;
  color?: string;
  weight: YarnWeight;
  fiber?: string;
  quantity?: number; // in grams or yards
  quantityUnit?: 'grams' | 'yards' | 'meters';
}

export interface HookInfo {
  id: string;
  size: string; // e.g., "5.0mm" or "H/8"
  material?: string;
}

export interface PatternNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interactive Pattern Row - a single instruction step with completion tracking
 */
export interface PatternRow {
  id: string;
  instruction: string;
  isCompleted: boolean;
  completedAt?: string;
}

/**
 * Interactive Pattern Section - a group of rows for a specific part (e.g., Head, Body)
 * Named differently from ai.ts PatternSection to avoid conflict
 */
export interface InteractivePatternSection {
  id: string;
  name: string;
  rows: PatternRow[];
}

// Re-export alias for backwards compatibility
export type PatternSection = InteractivePatternSection;

/**
 * Structured Pattern Data - full interactive pattern structure
 */
export interface StructuredPattern {
  sections: InteractivePatternSection[];
  abbreviations: PatternAbbreviation[];
  otherSupplies: string[];
  estimatedTime: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  difficulty?: DifficultyLevel;

  // Pattern info
  patternSource?: string; // URL or "Original"
  patternNotes?: PatternNote[];

  // Materials
  yarns: YarnInfo[];
  hooks: HookInfo[];

  // Progress
  currentRow?: number;
  totalRows?: number;
  progressPercentage?: number;

  // Media
  thumbnailUri?: string;
  imageUris?: string[];
  originalImageUri?: string; // User's uploaded photo
  generatedImageUri?: string; // AI-generated plushie visualization

  // AI Generated Content
  aiGeneratedPattern?: string; // Legacy: formatted text pattern
  aiSuggestions?: string[];
  structuredPattern?: StructuredPattern; // New: interactive pattern data

  // Timestamps
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: ProjectStatus;
  thumbnailUri?: string;
  progressPercentage?: number;
  updatedAt: string;
}

// Utility type to create a new project
export type NewProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};
