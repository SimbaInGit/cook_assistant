declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    
    getGenerativeModel(options: {
      model: string;
      generationConfig?: {
        temperature?: number;
        topK?: number;
        topP?: number;
        maxOutputTokens?: number;
        stopSequences?: string[];
      };
      safetySettings?: Array<{
        category: HarmCategory;
        threshold: HarmBlockThreshold;
      }>;
    }): GenerativeModel;
  }

  export class GenerativeModel {
    generateContent(content: string | Array<string | Part>): Promise<GenerateContentResult>;
    generateContentStream(content: string | Array<string | Part>): Promise<GenerateContentStreamResult>;
    countTokens(content: string | { contents: Array<{ role: string; parts: Part[] }> }): Promise<{ totalTokens: number }>;
  }

  export interface Part {
    text?: string;
    inlineData?: {
      data: string;
      mimeType: string;
    };
  }

  export interface GenerateContentResult {
    response: {
      candidates?: Array<{
        content: {
          parts: Part[];
        };
        finishReason?: string;
        index?: number;
      }>;
      promptFeedback?: any;
      text?: () => string;
      parts?: () => Part[];
    };
  }

  export interface GenerateContentStreamResult {
    stream: AsyncIterable<StreamedContent>;
  }

  export interface StreamedContent {
    text(): string;
    candidates: Array<{
      content: {
        parts: Part[];
      };
    }>;
  }

  export enum HarmCategory {
    HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT',
  }

  export enum HarmBlockThreshold {
    BLOCK_NONE = 'BLOCK_NONE',
    BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE',
    BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
    BLOCK_ONLY_HIGH = 'BLOCK_ONLY_HIGH',
    BLOCK_UNSPECIFIED = 'BLOCK_UNSPECIFIED',
  }
  
  export enum Modality {
    TEXT = "text",
    IMAGE = "image"
  }
}
