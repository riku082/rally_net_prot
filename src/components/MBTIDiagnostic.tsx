'use client';

import React, { useState, useEffect } from 'react';
import { badmintonMBTIQuestions } from '@/data/badmintonMBTIQuestions';
import { badmintonMBTITypes } from '@/data/badmintonMBTITypes';
import { MBTIAnswer, MBTIResult, MBTIType } from '@/types/mbti';
import { useAuth } from '@/context/AuthContext';
import { performAdvancedAnalysis } from '@/utils/mbtiAnalysis';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

interface MBTIDiagnosticProps {
  onComplete: (result: MBTIResult) => void;
}

const MBTIDiagnostic: React.FC<MBTIDiagnosticProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<MBTIAnswer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const totalQuestions = badmintonMBTIQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P') => {
    setSelectedAnswer(value);
    
    const newAnswer: MBTIAnswer = {
      questionId: badmintonMBTIQuestions[currentQuestion].id,
      selectedValue: value
    };

    const updatedAnswers = [...answers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === newAnswer.questionId);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers.push(newAnswer);
    }
    
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      processDiagnostic();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const previousAnswer = answers.find(a => a.questionId === badmintonMBTIQuestions[currentQuestion - 1].id);
      setSelectedAnswer(previousAnswer?.selectedValue || null);
    }
  };

  const processDiagnostic = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      // スコア計算
      const scores = {
        E: 0, I: 0,
        S: 0, N: 0,
        T: 0, F: 0,
        J: 0, P: 0
      };

      answers.forEach(answer => {
        scores[answer.selectedValue]++;
      });

      // MBTIタイプ決定
      const mbtiType: MBTIType = [
        scores.E > scores.I ? 'E' : 'I',
        scores.S > scores.N ? 'S' : 'N',
        scores.T > scores.F ? 'T' : 'F',
        scores.J > scores.P ? 'J' : 'P'
      ].join('') as MBTIType;

      const playStyleData = badmintonMBTITypes[mbtiType];

      // 高度な分析を実行
      const advancedAnalysis = performAdvancedAnalysis(answers, scores, mbtiType);

      const result: MBTIResult = {
        id: `mbti_${Date.now()}`,
        userId: user.uid,
        result: mbtiType,
        scores,
        playStyle: {
          strengths: playStyleData.strengths,
          weaknesses: playStyleData.weaknesses,
          recommendations: playStyleData.recommendations,
          description: playStyleData.description
        },
        createdAt: Date.now(),
        analysis: advancedAnalysis
      };

      // API経由で保存
      await fetch('/api/mbti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, userId: user.uid })
      });

      onComplete(result);
    } catch (error) {
      console.error('診断処理エラー:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const currentAnswer = answers.find(a => a.questionId === badmintonMBTIQuestions[currentQuestion].id);
    setSelectedAnswer(currentAnswer?.selectedValue || null);
  }, [currentQuestion, answers]);

  const currentQ = badmintonMBTIQuestions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* プログレスバー */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
            <GiShuttlecock className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2 text-blue-600 flex-shrink-0" />
            <span className="whitespace-nowrap">BPSI診断</span>
          </h2>
          <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 質問カード */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-8 mb-4 sm:mb-6">
        <div className="mb-4 sm:mb-6">
          <div className="inline-block px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            {currentQ.category}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        {/* 選択肢 */}
        <div className="space-y-3 sm:space-y-4">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.value)}
              className={`w-full p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                selectedAnswer === option.value
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start sm:items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 sm:mr-4 flex-shrink-0 mt-0.5 sm:mt-0 ${
                  selectedAnswer === option.value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
                <span className={`text-sm sm:text-lg leading-relaxed ${
                  selectedAnswer === option.value ? 'text-blue-700 font-medium' : 'text-gray-700'
                }`}>
                  {option.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex flex-col space-y-4">
        {/* プログレスドット（スマホ用） */}
        <div className="flex items-center justify-center space-x-1 sm:hidden">
          {badmintonMBTIQuestions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index <= currentQuestion ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base ${
              currentQuestion === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">前の質問</span>
            <span className="sm:hidden">前へ</span>
          </button>

          {/* プログレスドット（デスクトップ用） */}
          <div className="hidden sm:flex items-center space-x-2">
            {badmintonMBTIQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index <= currentQuestion ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selectedAnswer || isProcessing}
            className={`flex items-center px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base ${
              !selectedAnswer || isProcessing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : currentQuestion === totalQuestions - 1
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <>
                <FaSpinner className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">処理中...</span>
                <span className="sm:hidden">処理中</span>
              </>
            ) : currentQuestion === totalQuestions - 1 ? (
              <>
                <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">結果を見る</span>
                <span className="sm:hidden">結果</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">次の質問</span>
                <span className="sm:hidden">次へ</span>
                <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MBTIDiagnostic;