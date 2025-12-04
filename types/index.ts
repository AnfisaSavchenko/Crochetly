/**
 * Crochetly Types Index
 * Central export for all types
 */

// Export project types
export {
  ProjectStatus,
  DifficultyLevel,
  YarnWeight,
  YarnInfo,
  HookInfo,
  PatternNote,
  PatternRow,
  InteractivePatternSection,
  PatternSection,
  StructuredPattern,
  Project,
  ProjectSummary,
  NewProject,
} from './project';

// Export AI types - rename PatternSection to avoid conflict
export {
  ImageAnalysisResult,
  GeneratedYarn,
  GeneratedHook,
  PatternAbbreviation,
  PatternSection as AIPatternSection,
  GeneratedPattern,
  AIGenerationResult,
  ProcessingStage,
  StageStatus,
  STAGE_INFO,
} from './ai';
