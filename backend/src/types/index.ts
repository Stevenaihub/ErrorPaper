// Type definitions for ErrorPaper

type Subject = 'Math' | 'Science' | 'History' | 'Literature';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface ErrorQuestion {
    id: number;
    subject: Subject;
    difficulty: Difficulty;
    question: string;
    options: string[];
    correctAnswer: string;
}

interface PracticeQuestion {
    id: number;
    question: string;
    answer: string;
}

interface GeneratedQuestion {
    id: number;
    question: string;
    generatedWith: string;
}

interface ClassificationResult {
    subject: Subject;
    difficulty: Difficulty;
    confidenceLevel: number;
}

interface ApiResponse<T> {
    status: string;
    data: T;
    message?: string;
}

interface OcrResult {
    text: string;
    confidence: number;
    language?: string;
}
