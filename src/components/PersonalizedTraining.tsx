'use client';

import React, { useState } from 'react';
import { MBTIResult } from '@/types/mbti';
import { badmintonMBTITypes } from '@/data/badmintonMBTITypes';
import { FaBullseye, FaCheckCircle, FaClock, FaFire } from 'react-icons/fa';

interface PersonalizedTrainingProps {
  result: MBTIResult;
}

interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  focus: string[];
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  reps?: string;
  tips: string[];
}

const PersonalizedTraining: React.FC<PersonalizedTrainingProps> = ({ result }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  
  // const typeData = badmintonMBTITypes[result.result as keyof typeof badmintonMBTITypes];

  // タイプ別のトレーニングプランを生成
  const generateTrainingPlans = (): TrainingPlan[] => {
    const baseExercises = {
      footwork: {
        id: 'footwork',
        name: 'フットワーク基礎練習',
        description: 'コート内での機敏な動きを身に付ける',
        duration: '10分',
        reps: '3セット',
        tips: ['つま先立ちを意識', '腰を落として安定感を保つ', 'リズムを一定に保つ']
      },
      serve: {
        id: 'serve',
        name: 'サーブ練習',
        description: '正確で多彩なサーブを習得',
        duration: '15分',
        reps: '各種類10回',
        tips: ['手首のスナップを効かせる', '体重移動を意識', 'コースを狙って打つ']
      },
      smash: {
        id: 'smash',
        name: 'スマッシュ練習',
        description: '力強く決定的なスマッシュを身に付ける',
        duration: '20分',
        reps: '連続50回',
        tips: ['タイミングが重要', '体全体を使って打つ', 'フォロースルーを意識']
      },
      defense: {
        id: 'defense',
        name: 'ディフェンス練習',
        description: '相手の攻撃を確実に返す技術',
        duration: '15分',
        reps: '3セット',
        tips: ['低い姿勢を保つ', '相手の動きを予測', '次の攻撃を準備']
      }
    };

    const plans: TrainingPlan[] = [];

    // タイプ別に最適化されたプランを作成
    if (result.result.includes('E')) {
      // 外向型：チームワークとコミュニケーション重視
      plans.push({
        id: 'team-focused',
        title: 'チームワーク強化プラン',
        description: 'パートナーとの連携を重視した練習メニュー',
        duration: '60分',
        difficulty: 'intermediate',
        exercises: [
          baseExercises.footwork,
          {
            id: 'doubles-coordination',
            name: 'ダブルス連携練習',
            description: 'パートナーとのポジショニングと連携',
            duration: '25分',
            tips: ['声かけを積極的に', 'パートナーの動きを予測', 'カバーし合う意識']
          },
          baseExercises.serve
        ],
        focus: ['コミュニケーション', 'チームワーク', 'リーダーシップ']
      });
    }

    if (result.result.includes('I')) {
      // 内向型：個人技術の向上重視
      plans.push({
        id: 'individual-focus',
        title: '個人技術向上プラン',
        description: '一人でも実践できる技術習得メニュー',
        duration: '45分',
        difficulty: 'beginner',
        exercises: [
          baseExercises.footwork,
          {
            id: 'shadow-practice',
            name: 'シャドー練習',
            description: 'イメージトレーニングと基本動作の反復',
            duration: '20分',
            tips: ['正確なフォームを意識', '集中力を保つ', 'イメージを明確に']
          },
          baseExercises.serve
        ],
        focus: ['集中力', '技術精度', '自己分析']
      });
    }

    if (result.result.includes('T')) {
      // 思考型：戦術的アプローチ
      plans.push({
        id: 'tactical-training',
        title: '戦術的思考プラン',
        description: '状況判断と戦術的な練習メニュー',
        duration: '75分',
        difficulty: 'advanced',
        exercises: [
          {
            id: 'pattern-practice',
            name: 'パターン練習',
            description: '様々な戦術パターンの習得',
            duration: '30分',
            tips: ['状況に応じて選択', '相手の弱点を突く', '冷静に判断']
          },
          baseExercises.smash,
          baseExercises.defense
        ],
        focus: ['戦術理解', '状況判断', '効率性']
      });
    }

    if (result.result.includes('F')) {
      // 感情型：楽しさと調和重視
      plans.push({
        id: 'enjoyment-focused',
        title: '楽しさ重視プラン',
        description: '楽しみながら上達できる練習メニュー',
        duration: '50分',
        difficulty: 'beginner',
        exercises: [
          {
            id: 'fun-drills',
            name: '楽しいドリル練習',
            description: 'ゲーム感覚で楽しめる練習',
            duration: '25分',
            tips: ['楽しむことを最優先', '仲間と一緒に', '笑顔を忘れずに']
          },
          baseExercises.footwork,
          baseExercises.serve
        ],
        focus: ['楽しさ', '仲間との絆', 'モチベーション']
      });
    }

    return plans;
  };

  const trainingPlans = generateTrainingPlans();

  const handleExerciseComplete = (exerciseId: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompletedExercises(newCompleted);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return '不明';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <FaBullseye className="w-5 h-5 mr-2 text-blue-600" />
        あなた専用のトレーニングプラン
      </h3>

      {/* プラン選択 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {trainingPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedPlan === plan.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-800">{plan.title}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}>
                {getDifficultyText(plan.difficulty)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <FaClock className="w-4 h-4 mr-1" />
                {plan.duration}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FaFire className="w-4 h-4 mr-1" />
                {plan.exercises.length}種目
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 選択されたプランの詳細 */}
      {selectedPlan && (
        <div className="bg-gray-50 rounded-lg p-6">
          {(() => {
            const plan = trainingPlans.find(p => p.id === selectedPlan);
            if (!plan) return null;

            const completedCount = plan.exercises.filter(ex => completedExercises.has(ex.id)).length;
            const progressPercentage = (completedCount / plan.exercises.length) * 100;

            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-800">{plan.title}</h4>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{completedCount}/{plan.exercises.length}</span>
                  </div>
                </div>

                {/* 重点項目 */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">重点項目:</h5>
                  <div className="flex flex-wrap gap-2">
                    {plan.focus.map((focus, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>

                {/* エクササイズ一覧 */}
                <div className="space-y-3">
                  {plan.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        completedExercises.has(exercise.id)
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <button
                              onClick={() => handleExerciseComplete(exercise.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                                completedExercises.has(exercise.id)
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-400'
                              }`}
                            >
                              {completedExercises.has(exercise.id) && (
                                <FaCheckCircle className="w-3 h-3" />
                              )}
                            </button>
                            <h6 className="font-medium text-gray-800">{exercise.name}</h6>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 ml-9">{exercise.description}</p>
                          <div className="flex items-center text-sm text-gray-500 ml-9">
                            <FaClock className="w-3 h-3 mr-1" />
                            {exercise.duration}
                            {exercise.reps && (
                              <>
                                <span className="mx-2">•</span>
                                {exercise.reps}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* コツ・ヒント */}
                      <div className="mt-3 ml-9">
                        <h6 className="text-xs font-medium text-gray-700 mb-1">コツ・ヒント:</h6>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {exercise.tips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 完了時のメッセージ */}
                {completedCount === plan.exercises.length && (
                  <div className="mt-4 p-4 bg-green-100 rounded-lg">
                    <div className="flex items-center">
                      <FaCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">
                        おめでとうございます！プランを完了しました！
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default PersonalizedTraining;