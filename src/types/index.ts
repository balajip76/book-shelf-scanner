export type Disposition = 'keep' | 'give-away' | 'throw-away' | 'unassigned';

export type Genre = 'fiction' | 'non-fiction' | 'uncategorized';

export type SubCategory =
  | 'literary-fiction'
  | 'science-fiction'
  | 'mystery'
  | 'romance'
  | 'fantasy'
  | 'thriller'
  | 'historical-fiction'
  | 'horror'
  | 'short-stories'
  | 'graphic-novel'
  | 'self-help'
  | 'biography'
  | 'memoir'
  | 'history'
  | 'science'
  | 'business'
  | 'travel'
  | 'cooking'
  | 'philosophy'
  | 'psychology'
  | 'politics'
  | 'true-crime';

export type ScanStatus = 'pending' | 'complete' | 'failed';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  disposition: Disposition;
  genre: Genre;
  subCategory: SubCategory | null;
  notes: string | null;
  capturedAt: number;
  completedAt: number | null;
  addedManually: boolean;
  scanSessionId: string | null;
}

export interface ScanSession {
  id: string;
  capturedAt: number;
  imageThumb: string | null;
  booksRecognized: string[];
  status: ScanStatus;
}

export interface SpineReading {
  tempId: string;
  title: string | null;
  author: string | null;
  readable: boolean;
}

export interface VisionResult {
  books: SpineReading[];
  rawResponseId: string;
}

export interface ClassificationResult {
  tempId: string;
  genre: Genre | 'uncategorized';
  subCategory: SubCategory | null;
  confidence: 'high' | 'low';
}

export interface RecognizedBook {
  tempId: string;
  title: string | null;
  author: string | null;
  readable: boolean;
  genre: Genre;
  subCategory: SubCategory | null;
  classificationConfidence: 'high' | 'low' | null;
}

export interface ScanResult {
  sessionId: string;
  books: RecognizedBook[];
  durationMs: number;
}
