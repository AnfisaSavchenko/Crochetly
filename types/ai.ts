/**
 * Crochetly AI Types
 * Types for AI generation pipeline results
 */

import { DifficultyLevel, YarnWeight } from './project';

/**
 * Result from image analysis step
 */
export interface ImageAnalysisResult {
  subject: string;
  description: string;
  colors: string[];
  shape: string;
  distinctFeatures: string[];
  suggestedName: string;
}

/**
 * Generated material information
 */
export interface GeneratedYarn {
  color: string;
  weight: YarnWeight;
  quantity: string;
}

export interface GeneratedHook {
  size: string;
}

/**
 * Crochet pattern abbreviation
 */
export interface PatternAbbreviation {
  abbr: string;
  meaning: string;
}

/**
 * Pattern instruction section
 */
export interface PatternSection {
  name: string;
  instructions: string[];
}

/**
 * Full generated pattern result
 */
export interface GeneratedPattern {
  projectName: string;
  difficulty: DifficultyLevel;
  description: string;
  materials: {
    yarns: GeneratedYarn[];
    hooks: GeneratedHook[];
    otherSupplies: string[];
  };
  abbreviations: PatternAbbreviation[];
  sections: PatternSection[];
  notes: string[];
  estimatedTime: string;
}

/**
 * Complete AI generation result
 */
export interface AIGenerationResult {
  analysis: ImageAnalysisResult;
  generatedImageUrl: string;
  pattern: GeneratedPattern;
  originalImageUri: string;
}

/**
 * Processing stage for UI updates
 */
export type ProcessingStage =
  | 'idle'
  | 'analyzing'
  | 'generating_image'
  | 'writing_pattern'
  | 'complete'
  | 'error';

/**
 * Stage status info for UI
 */
export interface StageStatus {
  stage: ProcessingStage;
  message: string;
  progress: number; // 0-100
}

export const STAGE_INFO: Record<ProcessingStage, { message: string; progress: number }> = {
  idle: { message: 'Ready to create magic', progress: 0 },
  analyzing: { message: 'Analyzing your photo...', progress: 20 },
  generating_image: { message: 'Dreaming up a plushie...', progress: 50 },
  writing_pattern: { message: 'Writing the pattern...', progress: 80 },
  complete: { message: 'Your pattern is ready!', progress: 100 },
  error: { message: 'Something went wrong', progress: 0 },
};
