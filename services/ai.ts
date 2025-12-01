/**
 * Hookgenie AI Service
 * Multi-step AI pipeline for transforming photos into crochet patterns
 */

import { analyzeImage, generateImage, generateText } from '@fastshot/ai';
import {
  ImageAnalysisResult,
  GeneratedPattern,
  AIGenerationResult,
  ProcessingStage,
} from '@/types/ai';
import {
  DifficultyLevel,
  YarnWeight,
  StructuredPattern,
  InteractivePatternSection,
  PatternRow,
} from '@/types/project';

/**
 * Callbacks for tracking progress during generation
 */
export interface GenerationCallbacks {
  onStageChange: (stage: ProcessingStage) => void;
  onError: (error: Error, stage: ProcessingStage) => void;
}

/**
 * Step 1: Analyze the uploaded image
 * Uses AI vision to identify subject, colors, features, and shape
 */
async function analyzeInputImage(imageUri: string): Promise<ImageAnalysisResult> {
  const analysisPrompt = `Analyze this image for creating a cute crochet plush toy (amigurumi) version.

Please identify and respond in JSON format only (no markdown, no code blocks):
{
  "subject": "what is the main subject/object in the image",
  "description": "brief description of the subject",
  "colors": ["array of main colors present"],
  "shape": "overall shape (round, elongated, complex, etc.)",
  "distinctFeatures": ["array of notable features that should be captured in a plush version"],
  "suggestedName": "a cute creative name for the plush toy version"
}`;

  const result = await analyzeImage({
    imageUrl: imageUri,
    prompt: analysisPrompt,
  });

  try {
    // Try to parse the JSON response
    const cleanedResult = result.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResult) as ImageAnalysisResult;
    return parsed;
  } catch {
    // If parsing fails, create a structured result from the text
    return {
      subject: 'adorable creature',
      description: result.slice(0, 200),
      colors: ['pastel pink', 'cream', 'soft brown'],
      shape: 'round',
      distinctFeatures: ['cute face', 'small limbs'],
      suggestedName: 'Cozy Friend',
    };
  }
}

/**
 * Step 2: Generate a plushie visualization image
 * Creates a "Jellycat-style" amigurumi visualization
 */
async function generatePlushieImage(analysis: ImageAnalysisResult): Promise<string> {
  const colorList = analysis.colors.slice(0, 4).join(', ');
  const featureList = analysis.distinctFeatures.slice(0, 3).join(', ');

  const imagePrompt = `A cute, soft, chenille-style amigurumi crochet plush toy of a ${analysis.subject}.
Jellycat-inspired design with a round, squishy body.
Colors: ${colorList}.
Key features: ${featureList}.
The plush has a friendly, kawaii expression with small button eyes and a gentle smile.
Soft pastel background, product photography style, warm cozy lighting.
High quality, detailed yarn texture visible, handcrafted look.`;

  const result = await generateImage({
    prompt: imagePrompt,
    width: 1024,
    height: 1024,
  });

  if (result.images && result.images.length > 0) {
    return result.images[0];
  }

  throw new Error('Failed to generate plushie image');
}

/**
 * Step 3: Generate the crochet pattern
 * Creates a complete pattern with materials, abbreviations, and instructions
 */
async function generateCrochetPattern(
  analysis: ImageAnalysisResult
): Promise<GeneratedPattern> {
  const patternPrompt = `Create a detailed crochet pattern for an amigurumi plush toy based on this description:

Subject: ${analysis.subject}
Description: ${analysis.description}
Colors needed: ${analysis.colors.join(', ')}
Shape: ${analysis.shape}
Key features to include: ${analysis.distinctFeatures.join(', ')}
Suggested name: ${analysis.suggestedName}

Please respond with ONLY a JSON object (no markdown, no code blocks) in this exact format:
{
  "projectName": "${analysis.suggestedName}",
  "difficulty": "beginner|easy|intermediate|advanced|expert",
  "description": "Brief description of the finished project",
  "materials": {
    "yarns": [
      {"color": "color name", "weight": "worsted", "quantity": "amount in yards or grams"}
    ],
    "hooks": [
      {"size": "hook size like 4.0mm or G/6"}
    ],
    "otherSupplies": ["safety eyes 12mm", "fiberfill stuffing", "yarn needle", "stitch markers"]
  },
  "abbreviations": [
    {"abbr": "sc", "meaning": "single crochet"},
    {"abbr": "inc", "meaning": "increase (2 sc in same stitch)"},
    {"abbr": "dec", "meaning": "invisible decrease"},
    {"abbr": "ch", "meaning": "chain"},
    {"abbr": "sl st", "meaning": "slip stitch"},
    {"abbr": "MR", "meaning": "magic ring"},
    {"abbr": "FO", "meaning": "fasten off"}
  ],
  "sections": [
    {
      "name": "Section Name (e.g., Head, Body, Arms)",
      "instructions": [
        "Round 1: MR, 6 sc in ring (6)",
        "Round 2: inc in each st around (12)",
        "etc..."
      ]
    }
  ],
  "notes": ["Any helpful tips or variations"],
  "estimatedTime": "X-Y hours"
}

Make the pattern suitable for the difficulty level. Include all necessary sections for a complete amigurumi (head, body, limbs, features as needed). Use standard US crochet terminology.`;

  const result = await generateText({
    prompt: patternPrompt,
  });

  try {
    // Try to parse the JSON response
    const cleanedResult = result.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResult) as GeneratedPattern;

    // Validate and normalize the difficulty level
    const validDifficulties: DifficultyLevel[] = ['beginner', 'easy', 'intermediate', 'advanced', 'expert'];
    if (!validDifficulties.includes(parsed.difficulty)) {
      parsed.difficulty = 'intermediate';
    }

    // Validate yarn weights
    const validWeights: YarnWeight[] = ['lace', 'fingering', 'sport', 'dk', 'worsted', 'aran', 'bulky', 'super_bulky'];
    parsed.materials.yarns = parsed.materials.yarns.map(yarn => ({
      ...yarn,
      weight: validWeights.includes(yarn.weight as YarnWeight) ? yarn.weight as YarnWeight : 'worsted',
    }));

    return parsed;
  } catch {
    // Return a default pattern structure if parsing fails
    return createDefaultPattern(analysis);
  }
}

/**
 * Create a default pattern when AI response can't be parsed
 */
function createDefaultPattern(analysis: ImageAnalysisResult): GeneratedPattern {
  return {
    projectName: analysis.suggestedName,
    difficulty: 'intermediate',
    description: `A cute amigurumi ${analysis.subject} plush toy inspired by your photo.`,
    materials: {
      yarns: analysis.colors.slice(0, 3).map(color => ({
        color,
        weight: 'worsted' as YarnWeight,
        quantity: '50 yards',
      })),
      hooks: [{ size: '4.0mm (G/6)' }],
      otherSupplies: [
        'Safety eyes (9-12mm)',
        'Fiberfill stuffing',
        'Yarn needle',
        'Stitch markers',
      ],
    },
    abbreviations: [
      { abbr: 'sc', meaning: 'single crochet' },
      { abbr: 'inc', meaning: 'increase (2 sc in same stitch)' },
      { abbr: 'dec', meaning: 'invisible decrease' },
      { abbr: 'ch', meaning: 'chain' },
      { abbr: 'sl st', meaning: 'slip stitch' },
      { abbr: 'MR', meaning: 'magic ring' },
      { abbr: 'FO', meaning: 'fasten off' },
    ],
    sections: [
      {
        name: 'Head',
        instructions: [
          'Round 1: MR, 6 sc in ring (6)',
          'Round 2: inc in each st around (12)',
          'Round 3: *sc, inc* repeat around (18)',
          'Round 4: *sc 2, inc* repeat around (24)',
          'Round 5-8: sc in each st around (24)',
          'Round 9: *sc 2, dec* repeat around (18)',
          'Add safety eyes between rounds 6-7',
          'Round 10: *sc, dec* repeat around (12)',
          'Stuff firmly',
          'Round 11: dec around (6), FO',
        ],
      },
      {
        name: 'Body',
        instructions: [
          'Round 1: MR, 6 sc in ring (6)',
          'Round 2: inc in each st around (12)',
          'Round 3: *sc, inc* repeat around (18)',
          'Round 4-7: sc in each st around (18)',
          'Round 8: *sc, dec* repeat around (12)',
          'Stuff firmly',
          'Round 9: dec around (6), FO',
          'Leave long tail for sewing',
        ],
      },
      {
        name: 'Arms (make 2)',
        instructions: [
          'Round 1: MR, 6 sc in ring (6)',
          'Round 2-5: sc in each st around (6)',
          'FO, leave tail for sewing',
          'Lightly stuff or leave unstuffed',
        ],
      },
      {
        name: 'Assembly',
        instructions: [
          'Sew head to body',
          'Attach arms to sides of body',
          'Embroider any facial features',
          'Weave in all ends',
        ],
      },
    ],
    notes: [
      'Work in continuous rounds unless otherwise noted',
      'Use a stitch marker to track round beginnings',
      'Stuff as you go for best results',
    ],
    estimatedTime: '3-5 hours',
  };
}

/**
 * Main generation pipeline
 * Orchestrates all three AI steps with progress callbacks
 */
export async function generateProjectFromImage(
  imageUri: string,
  callbacks: GenerationCallbacks
): Promise<AIGenerationResult> {
  let analysis: ImageAnalysisResult;
  let generatedImageUrl: string;
  let pattern: GeneratedPattern;

  // Step 1: Analyze the image
  callbacks.onStageChange('analyzing');
  try {
    analysis = await analyzeInputImage(imageUri);
  } catch (error) {
    callbacks.onError(error as Error, 'analyzing');
    throw error;
  }

  // Step 2: Generate plushie visualization
  callbacks.onStageChange('generating_image');
  try {
    generatedImageUrl = await generatePlushieImage(analysis);
  } catch (error) {
    callbacks.onError(error as Error, 'generating_image');
    throw error;
  }

  // Step 3: Generate crochet pattern
  callbacks.onStageChange('writing_pattern');
  try {
    pattern = await generateCrochetPattern(analysis);
  } catch (error) {
    callbacks.onError(error as Error, 'writing_pattern');
    throw error;
  }

  callbacks.onStageChange('complete');

  return {
    analysis,
    generatedImageUrl,
    pattern,
    originalImageUri: imageUri,
  };
}

/**
 * Generate a unique ID for pattern elements
 */
const generateId = (prefix: string, index: number): string => {
  return `${prefix}_${Date.now()}_${index}`;
};

/**
 * Convert AI pattern sections to interactive structured format
 */
function convertToStructuredPattern(pattern: GeneratedPattern): StructuredPattern {
  const sections: InteractivePatternSection[] = pattern.sections.map((section, sectionIndex) => {
    const rows: PatternRow[] = section.instructions.map((instruction, rowIndex) => ({
      id: generateId(`row_${sectionIndex}`, rowIndex),
      instruction,
      isCompleted: false,
    }));

    return {
      id: generateId('section', sectionIndex),
      name: section.name,
      rows,
    };
  });

  return {
    sections,
    abbreviations: pattern.abbreviations,
    otherSupplies: pattern.materials.otherSupplies,
    estimatedTime: pattern.estimatedTime,
  };
}

/**
 * Convert AI generation result to project data format
 */
export function convertToProjectData(result: AIGenerationResult) {
  const { pattern, generatedImageUrl, originalImageUri } = result;

  // Convert pattern sections to a formatted string (legacy)
  const patternText = formatPatternAsText(pattern);

  // Convert to structured pattern for interactive mode
  const structuredPattern = convertToStructuredPattern(pattern);

  // Calculate total rows for progress tracking
  const totalRows = structuredPattern.sections.reduce(
    (total, section) => total + section.rows.length,
    0
  );

  return {
    name: pattern.projectName,
    description: pattern.description,
    status: 'draft' as const,
    difficulty: pattern.difficulty,
    yarns: pattern.materials.yarns.map((yarn, index) => ({
      id: `yarn_${index}`,
      name: yarn.color,
      color: yarn.color,
      weight: yarn.weight,
      quantity: parseInt(yarn.quantity) || 50,
      quantityUnit: 'yards' as const,
    })),
    hooks: pattern.materials.hooks.map((hook, index) => ({
      id: `hook_${index}`,
      size: hook.size,
    })),
    thumbnailUri: generatedImageUrl,
    imageUris: [originalImageUri, generatedImageUrl],
    originalImageUri,
    generatedImageUri: generatedImageUrl,
    aiGeneratedPattern: patternText,
    aiSuggestions: pattern.notes,
    structuredPattern,
    totalRows,
    progressPercentage: 0,
  };
}

/**
 * Format the pattern object as readable text
 */
function formatPatternAsText(pattern: GeneratedPattern): string {
  const lines: string[] = [];

  lines.push(`# ${pattern.projectName}`);
  lines.push('');
  lines.push(`**Difficulty:** ${pattern.difficulty}`);
  lines.push(`**Estimated Time:** ${pattern.estimatedTime}`);
  lines.push('');
  lines.push(`## Description`);
  lines.push(pattern.description);
  lines.push('');

  lines.push('## Materials');
  lines.push('');
  lines.push('### Yarn');
  pattern.materials.yarns.forEach(yarn => {
    lines.push(`- ${yarn.color} (${yarn.weight}): ${yarn.quantity}`);
  });
  lines.push('');
  lines.push('### Hooks');
  pattern.materials.hooks.forEach(hook => {
    lines.push(`- ${hook.size}`);
  });
  lines.push('');
  lines.push('### Other Supplies');
  pattern.materials.otherSupplies.forEach(supply => {
    lines.push(`- ${supply}`);
  });
  lines.push('');

  lines.push('## Abbreviations');
  pattern.abbreviations.forEach(abbr => {
    lines.push(`- **${abbr.abbr}**: ${abbr.meaning}`);
  });
  lines.push('');

  lines.push('## Pattern Instructions');
  lines.push('');
  pattern.sections.forEach(section => {
    lines.push(`### ${section.name}`);
    section.instructions.forEach(instruction => {
      lines.push(instruction);
    });
    lines.push('');
  });

  if (pattern.notes.length > 0) {
    lines.push('## Notes');
    pattern.notes.forEach(note => {
      lines.push(`- ${note}`);
    });
  }

  return lines.join('\n');
}

export default {
  generateProjectFromImage,
  convertToProjectData,
};
