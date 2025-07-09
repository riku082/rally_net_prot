import { MBTIQuestion } from '@/types/mbti';

export const badmintonMBTIQuestions: MBTIQuestion[] = [
  // E/I (外向性/内向性)
  {
    id: 'q1',
    category: 'E/I',
    question: '試合前の準備時間について、どちらが自分に合っていますか？',
    options: [
      { text: '他の選手と話したり、コーチと戦術を議論したりして気持ちを高める', value: 'E' },
      { text: '一人で静かに集中し、イメージトレーニングをする', value: 'I' }
    ]
  },
  {
    id: 'q2',
    category: 'E/I',
    question: '試合中のミスをした時の対処法は？',
    options: [
      { text: 'パートナーやコーチとすぐに話し合い、解決策を見つける', value: 'E' },
      { text: '一度深呼吸し、自分の中で冷静に分析してから次のプレーに集中する', value: 'I' }
    ]
  },
  {
    id: 'q3',
    category: 'E/I',
    question: '新しいバドミントンクラブに入った時の行動は？',
    options: [
      { text: '積極的に他のメンバーに声をかけて、すぐに輪に入る', value: 'E' },
      { text: 'しばらく様子を見て、自然に関係を築いていく', value: 'I' }
    ]
  },
  {
    id: 'q4',
    category: 'E/I',
    question: 'バドミントンの練習で最も集中できるのはどちらですか？',
    options: [
      { text: '仲間と一緒に声を掛け合いながら練習する', value: 'E' },
      { text: '一人で黙々と基礎練習に取り組む', value: 'I' }
    ]
  },

  // S/N (感覚/直観)
  {
    id: 'q5',
    category: 'S/N',
    question: 'バドミントンの戦術を学ぶ時、どちらの方法が好きですか？',
    options: [
      { text: '具体的な技術や定石を一つずつ丁寧に習得する', value: 'S' },
      { text: '全体的な戦略や可能性を考えて、新しい戦術を創造する', value: 'N' }
    ]
  },
  {
    id: 'q6',
    category: 'S/N',
    question: 'ラリー中の判断で重視するのはどちらですか？',
    options: [
      { text: '相手の位置やシャトルの軌道など、目に見える情報', value: 'S' },
      { text: '相手の心理状態や次の展開の可能性を読む', value: 'N' }
    ]
  },
  {
    id: 'q7',
    category: 'S/N',
    question: 'バドミントンの上達のために最も重要だと思うのは？',
    options: [
      { text: '基本的な技術を確実にマスターすること', value: 'S' },
      { text: '常に新しい技術やプレースタイルを模索すること', value: 'N' }
    ]
  },
  {
    id: 'q8',
    category: 'S/N',
    question: 'バドミントンを教える時、どちらの方法を選びますか？',
    options: [
      { text: '段階的に基本から応用まで順序立てて教える', value: 'S' },
      { text: '全体像を示してから、個人の特性に合わせて指導する', value: 'N' }
    ]
  },

  // T/F (思考/感情)
  {
    id: 'q9',
    category: 'T/F',
    question: '試合で負けた時の分析方法は？',
    options: [
      { text: '技術的な問題点や戦術の改善点を客観的に分析する', value: 'T' },
      { text: 'チームの雰囲気やモチベーションの問題を重視する', value: 'F' }
    ]
  },
  {
    id: 'q10',
    category: 'T/F',
    question: 'バドミントンの指導で最も重要視することは？',
    options: [
      { text: '技術的な向上と効率的な練習方法', value: 'T' },
      { text: '選手の気持ちに寄り添い、楽しくプレーできること', value: 'F' }
    ]
  },
  {
    id: 'q11',
    category: 'T/F',
    question: 'ダブルスでパートナーとの意見が分かれた時の対処法は？',
    options: [
      { text: '論理的に最も効果的な戦術を選択する', value: 'T' },
      { text: 'パートナーの気持ちを尊重し、お互いが納得できる方法を探る', value: 'F' }
    ]
  },
  {
    id: 'q12',
    category: 'T/F',
    question: 'バドミントンで最も大切にしたい価値観は？',
    options: [
      { text: '勝利への追求と技術の向上', value: 'T' },
      { text: '仲間との絆とスポーツの楽しさ', value: 'F' }
    ]
  },

  // J/P (判断/知覚)
  {
    id: 'q13',
    category: 'J/P',
    question: 'バドミントンの練習計画についてどう考えますか？',
    options: [
      { text: '毎日の練習メニューを事前に決めて計画的に実行する', value: 'J' },
      { text: 'その日の体調や気分に合わせて柔軟に練習内容を変える', value: 'P' }
    ]
  },
  {
    id: 'q14',
    category: 'J/P',
    question: '試合中の戦術変更についてどう思いますか？',
    options: [
      { text: '事前に決めた戦術を最後まで貫く', value: 'J' },
      { text: '試合の流れに応じて臨機応変に戦術を変更する', value: 'P' }
    ]
  },
  {
    id: 'q15',
    category: 'J/P',
    question: 'バドミントンの技術習得で好むのはどちらですか？',
    options: [
      { text: '決められた練習メニューを確実にこなす', value: 'J' },
      { text: '自由に色々な技術を試してみる', value: 'P' }
    ]
  },
  {
    id: 'q16',
    category: 'J/P',
    question: 'バドミントンの大会や練習の時間管理について？',
    options: [
      { text: '時間通りに始まり、予定通りに終わることを重視する', value: 'J' },
      { text: '内容が充実していれば、時間の多少のずれは気にしない', value: 'P' }
    ]
  }
];