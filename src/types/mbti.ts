export interface MBTIResult {
  id: string;
  userId: string;
  result: string; // "ESTJ", "INFP" など
  scores: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  playStyle: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    description: string;
  };
  createdAt: number;
}

export interface MBTIQuestion {
  id: string;
  category: 'E/I' | 'S/N' | 'T/F' | 'J/P';
  question: string;
  options: {
    text: string;
    value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  }[];
}

export interface MBTIAnswer {
  questionId: string;
  selectedValue: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
}

export interface MBTIDiagnostic {
  id: string;
  userId: string;
  answers: MBTIAnswer[];
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export type MBTIType = 
  | 'ESTJ' | 'ESTP' | 'ESFJ' | 'ESFP'
  | 'ENTJ' | 'ENTP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISTP' | 'ISFJ' | 'ISFP'
  | 'INTJ' | 'INTP' | 'INFJ' | 'INFP';

export interface PlayStyleAnalysis {
  type: MBTIType;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  playStyle: string;
  partnerRecommendations: string[];
} 