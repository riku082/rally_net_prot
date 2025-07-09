import { MBTIAnswer, MBTIType } from '@/types/mbti';

export interface AdvancedAnalysis {
  confidenceScore: number;
  borderlineTraits: string[];
  dominantFunctions: string[];
  subType: string;
  consistency: number;
  alternativeTypes: { type: string; probability: number }[];
}

// 認知機能の定義
const cognitiveFunctions = {
  'ESTJ': ['Te', 'Si', 'Ne', 'Fi'],
  'ESTP': ['Se', 'Ti', 'Fe', 'Ni'],
  'ESFJ': ['Fe', 'Si', 'Ne', 'Ti'],
  'ESFP': ['Fi', 'Se', 'Te', 'Ni'],
  'ENTJ': ['Te', 'Ni', 'Se', 'Fi'],
  'ENTP': ['Ne', 'Ti', 'Fe', 'Si'],
  'ENFJ': ['Fe', 'Ni', 'Se', 'Ti'],
  'ENFP': ['Ne', 'Fi', 'Te', 'Si'],
  'ISTJ': ['Si', 'Te', 'Fi', 'Ne'],
  'ISTP': ['Ti', 'Se', 'Ni', 'Fe'],
  'ISFJ': ['Si', 'Fe', 'Ti', 'Ne'],
  'ISFP': ['Fi', 'Se', 'Ni', 'Te'],
  'INTJ': ['Ni', 'Te', 'Fi', 'Se'],
  'INTP': ['Ti', 'Ne', 'Si', 'Fe'],
  'INFJ': ['Ni', 'Fe', 'Ti', 'Se'],
  'INFP': ['Fi', 'Ne', 'Si', 'Te']
};

// 認知機能の説明
const functionDescriptions = {
  'Te': '外向思考 - 効率的な組織化と実行',
  'Ti': '内向思考 - 論理的分析と理解',
  'Fe': '外向感情 - 調和と他者への配慮',
  'Fi': '内向感情 - 価値観と信念',
  'Se': '外向感覚 - 現在の体験と行動',
  'Si': '内向感覚 - 過去の経験と記憶',
  'Ne': '外向直観 - 可能性と新しいアイデア',
  'Ni': '内向直観 - 洞察と将来のビジョン'
};

export function performAdvancedAnalysis(
  answers: MBTIAnswer[],
  scores: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number },
  finalType: MBTIType
): AdvancedAnalysis {
  const totalQuestions = answers.length;
  
  // 信頼度スコアの計算
  const confidenceScore = calculateConfidenceScore(scores, totalQuestions);
  
  // 境界線上の特性の判定
  const borderlineTraits = identifyBorderlineTraits(scores, totalQuestions);
  
  // 主要な心理機能の取得
  const dominantFunctions = getDominantFunctions(finalType);
  
  // サブタイプの決定（A: 自信型, T: 慎重型）
  const subType = determineSubType(answers, finalType);
  
  // 一貫性の計算
  const consistency = calculateConsistency(answers);
  
  // 代替タイプの可能性
  const alternativeTypes = calculateAlternativeTypes(scores, totalQuestions);
  
  return {
    confidenceScore,
    borderlineTraits,
    dominantFunctions,
    subType,
    consistency,
    alternativeTypes
  };
}

function calculateConfidenceScore(
  scores: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number },
  totalQuestions: number
): number {
  const questionsPerDimension = totalQuestions / 4;
  
  // 各次元での優勢度を計算
  const dominances = [
    Math.abs(scores.E - scores.I) / questionsPerDimension,
    Math.abs(scores.S - scores.N) / questionsPerDimension,
    Math.abs(scores.T - scores.F) / questionsPerDimension,
    Math.abs(scores.J - scores.P) / questionsPerDimension
  ];
  
  // 平均優勢度を信頼度スコアとして使用
  const averageDominance = dominances.reduce((sum, d) => sum + d, 0) / 4;
  return Math.round(averageDominance * 100);
}

function identifyBorderlineTraits(
  scores: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number },
  totalQuestions: number
): string[] {
  const questionsPerDimension = totalQuestions / 4;
  const threshold = 0.2; // 20%以内の差は境界線とみなす
  
  const borderlineTraits: string[] = [];
  
  if (Math.abs(scores.E - scores.I) / questionsPerDimension <= threshold) {
    borderlineTraits.push('E/I');
  }
  if (Math.abs(scores.S - scores.N) / questionsPerDimension <= threshold) {
    borderlineTraits.push('S/N');
  }
  if (Math.abs(scores.T - scores.F) / questionsPerDimension <= threshold) {
    borderlineTraits.push('T/F');
  }
  if (Math.abs(scores.J - scores.P) / questionsPerDimension <= threshold) {
    borderlineTraits.push('J/P');
  }
  
  return borderlineTraits;
}

function getDominantFunctions(type: MBTIType): string[] {
  const functions = cognitiveFunctions[type];
  return functions.map(func => `${func}: ${functionDescriptions[func as keyof typeof functionDescriptions]}`);
}

function determineSubType(answers: MBTIAnswer[], type: MBTIType): string {
  // 簡単な実装：回答パターンから自信型(A)か慎重型(T)かを判定
  // より複雑な実装では、質問内容と回答パターンを詳細に分析
  const assertiveQuestions = answers.filter(a => 
    ['E', 'S', 'T', 'J'].includes(a.selectedValue)
  );
  
  const assertiveRatio = assertiveQuestions.length / answers.length;
  return assertiveRatio > 0.6 ? `${type}-A` : `${type}-T`;
}

function calculateConsistency(answers: MBTIAnswer[]): number {
  // 回答の一貫性を計算
  // 同じカテゴリ内での回答の一貫性をチェック
  const categories = {
    'E/I': [] as string[],
    'S/N': [] as string[],
    'T/F': [] as string[],
    'J/P': [] as string[]
  };
  
  // カテゴリ別に回答を分類（実際の実装では質問とカテゴリのマッピングが必要）
  answers.forEach((answer, index) => {
    const questionIndex = index + 1;
    if (questionIndex <= 4) categories['E/I'].push(answer.selectedValue);
    else if (questionIndex <= 8) categories['S/N'].push(answer.selectedValue);
    else if (questionIndex <= 12) categories['T/F'].push(answer.selectedValue);
    else categories['J/P'].push(answer.selectedValue);
  });
  
  let totalConsistency = 0;
  let categoryCount = 0;
  
  Object.entries(categories).forEach(([category, values]) => {
    if (values.length > 0) {
      const [trait1, trait2] = category.split('/');
      const trait1Count = values.filter(v => v === trait1).length;
      const trait2Count = values.filter(v => v === trait2).length;
      const consistency = Math.max(trait1Count, trait2Count) / values.length;
      totalConsistency += consistency;
      categoryCount++;
    }
  });
  
  return Math.round((totalConsistency / categoryCount) * 100);
}

function calculateAlternativeTypes(
  scores: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number },
  totalQuestions: number
): { type: string; probability: number }[] {
  const questionsPerDimension = totalQuestions / 4;
  
  // 各次元での確率を計算
  const probabilities = {
    E: scores.E / questionsPerDimension,
    I: scores.I / questionsPerDimension,
    S: scores.S / questionsPerDimension,
    N: scores.N / questionsPerDimension,
    T: scores.T / questionsPerDimension,
    F: scores.F / questionsPerDimension,
    J: scores.J / questionsPerDimension,
    P: scores.P / questionsPerDimension
  };
  
  // 上位3つの代替タイプを生成
  const alternatives: { type: string; probability: number }[] = [];
  
  // 最も僅差の次元を特定し、その次元を反転したタイプを生成
  const dimensions = ['E/I', 'S/N', 'T/F', 'J/P'];
  const margins = [
    Math.abs(scores.E - scores.I),
    Math.abs(scores.S - scores.N),
    Math.abs(scores.T - scores.F),
    Math.abs(scores.J - scores.P)
  ];
  
  // 僅差順にソート
  const sortedDimensions = dimensions
    .map((dim, index) => ({ dim, margin: margins[index] }))
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 3);
  
  // 主要タイプを取得
  const mainType = [
    scores.E > scores.I ? 'E' : 'I',
    scores.S > scores.N ? 'S' : 'N',
    scores.T > scores.F ? 'T' : 'F',
    scores.J > scores.P ? 'J' : 'P'
  ].join('');
  
  // 代替タイプを生成
  sortedDimensions.forEach(({ dim, margin }) => {
    const altType = generateAlternativeType(mainType, dim);
    const probability = Math.round((1 - margin / questionsPerDimension) * 100);
    alternatives.push({ type: altType, probability });
  });
  
  return alternatives;
}

function generateAlternativeType(mainType: string, dimensionToFlip: string): string {
  const typeArray = mainType.split('');
  
  switch (dimensionToFlip) {
    case 'E/I':
      typeArray[0] = typeArray[0] === 'E' ? 'I' : 'E';
      break;
    case 'S/N':
      typeArray[1] = typeArray[1] === 'S' ? 'N' : 'S';
      break;
    case 'T/F':
      typeArray[2] = typeArray[2] === 'T' ? 'F' : 'T';
      break;
    case 'J/P':
      typeArray[3] = typeArray[3] === 'J' ? 'P' : 'J';
      break;
  }
  
  return typeArray.join('');
}

// 成長レベルの判定
export function assessGrowthLevel(answers: MBTIAnswer[], type: MBTIType): {
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
  nextSteps: string[];
} {
  // 簡単な実装：回答パターンから成長レベルを判定
  const consistentAnswers = answers.filter((answer, index) => {
    // 一貫性のある回答かどうかをチェック
    return true; // 実際の実装では詳細な分析が必要
  });
  
  const consistencyRatio = consistentAnswers.length / answers.length;
  
  if (consistencyRatio >= 0.9) {
    return {
      level: 'Expert',
      description: 'あなたは自分の特性を深く理解し、それを効果的に活用できています。',
      nextSteps: ['他者の指導', 'チーム運営', '新しい挑戦']
    };
  } else if (consistencyRatio >= 0.75) {
    return {
      level: 'Advanced',
      description: 'あなたは自分の強みを活かし、弱みを補完する方法を理解しています。',
      nextSteps: ['リーダーシップ発揮', '戦術的思考の向上', '指導力の開発']
    };
  } else if (consistencyRatio >= 0.6) {
    return {
      level: 'Intermediate',
      description: 'あなたは基本的な特性を理解し、実践に活かそうとしています。',
      nextSteps: ['一貫性の向上', '弱み克服', '強みの特化']
    };
  } else {
    return {
      level: 'Beginner',
      description: 'あなたは自分の特性を発見し、理解し始めています。',
      nextSteps: ['自己理解の深化', '基本技術の習得', '実践的経験の積み重ね']
    };
  }
}