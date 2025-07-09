'use client';

import React, { useState, useEffect } from 'react';
import { MBTIType } from '@/types/mbti';
import { badmintonMBTITypes } from '@/data/badmintonMBTITypes';
import { FaSearch, FaHeart, FaUsers, FaStar, FaHandshake } from 'react-icons/fa';
import MBTIAvatar from './MBTIAvatar';

interface PartnerProfile {
  id: string;
  name: string;
  mbtiType: MBTIType;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  playStyle: 'aggressive' | 'defensive' | 'balanced';
  location: string;
  availableTimes: string[];
  bio: string;
  matchScore: number;
  mutualStrengths: string[];
  complementaryAreas: string[];
}

interface PartnerMatcherProps {
  userMBTIType: MBTIType;
}

const PartnerMatcher: React.FC<PartnerMatcherProps> = ({ userMBTIType }) => {
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<PartnerProfile[]>([]);
  const [filters, setFilters] = useState({
    skillLevel: 'all',
    playStyle: 'all',
    location: 'all',
    minMatchScore: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // サンプルデータの生成
  const generateSamplePartners = (): PartnerProfile[] => {
    const samplePartners: PartnerProfile[] = [
      {
        id: '1',
        name: '田中 太郎',
        mbtiType: 'ENFP',
        skillLevel: 'intermediate',
        playStyle: 'aggressive',
        location: '東京',
        availableTimes: ['平日夜', '週末'],
        bio: 'バドミントン歴5年。楽しくプレーしながら上達したいです！',
        matchScore: 0,
        mutualStrengths: [],
        complementaryAreas: []
      },
      {
        id: '2',
        name: '佐藤 花子',
        mbtiType: 'ISTJ',
        skillLevel: 'advanced',
        playStyle: 'defensive',
        location: '神奈川',
        availableTimes: ['週末', '平日朝'],
        bio: '確実なプレーを心がけています。基本を大切にしたい方歓迎！',
        matchScore: 0,
        mutualStrengths: [],
        complementaryAreas: []
      },
      {
        id: '3',
        name: '鈴木 健太',
        mbtiType: 'ESFJ',
        skillLevel: 'beginner',
        playStyle: 'balanced',
        location: '埼玉',
        availableTimes: ['週末'],
        bio: '初心者ですが、一緒に成長していきましょう！',
        matchScore: 0,
        mutualStrengths: [],
        complementaryAreas: []
      },
      {
        id: '4',
        name: '山田 美咲',
        mbtiType: 'INTJ',
        skillLevel: 'expert',
        playStyle: 'aggressive',
        location: '東京',
        availableTimes: ['平日夜', '週末'],
        bio: '戦略的なプレーが得意です。一緒に勝利を目指しましょう！',
        matchScore: 0,
        mutualStrengths: [],
        complementaryAreas: []
      },
      {
        id: '5',
        name: '高橋 直樹',
        mbtiType: 'ISFP',
        skillLevel: 'intermediate',
        playStyle: 'balanced',
        location: '千葉',
        availableTimes: ['平日夜'],
        bio: '自分らしいプレーを大切にしています。楽しく練習しましょう！',
        matchScore: 0,
        mutualStrengths: [],
        complementaryAreas: []
      }
    ];

    // 相性スコアと分析を追加
    return samplePartners.map(partner => ({
      ...partner,
      ...calculateMatch(userMBTIType, partner)
    }));
  };

  const calculateMatch = (userType: MBTIType, partner: PartnerProfile) => {
    const userTypeData = badmintonMBTITypes[userType];
    const partnerTypeData = badmintonMBTITypes[partner.mbtiType];

    // 相性スコアの計算
    const matchScore = calculateCompatibilityScore(userType, partner.mbtiType);

    // 共通の強みを特定
    const mutualStrengths = userTypeData.strengths.filter(strength =>
      partnerTypeData.strengths.includes(strength)
    );

    // 補完関係の特定
    const complementaryAreas = userTypeData.weaknesses.filter(weakness =>
      partnerTypeData.strengths.some(strength => 
        isComplementary(weakness, strength)
      )
    );

    return {
      matchScore,
      mutualStrengths,
      complementaryAreas
    };
  };

  const calculateCompatibilityScore = (type1: MBTIType, type2: MBTIType): number => {
    let score = 50; // ベーススコア

    // 各軸での相性をチェック
    // 外向性/内向性
    if (type1[0] !== type2[0]) {
      score += 15; // 異なる方が補完的
    }

    // 感覚/直観
    if (type1[1] === type2[1]) {
      score += 10; // 同じ方が理解しやすい
    } else {
      score += 5; // 異なっても補完的
    }

    // 思考/感情
    if (type1[2] !== type2[2]) {
      score += 15; // 異なる方が補完的
    }

    // 判断/知覚
    if (type1[3] !== type2[3]) {
      score += 10; // 異なる方がバランスが取れる
    }

    // 推奨パートナーに含まれているかチェック
    const userTypeData = badmintonMBTITypes[type1];
    const isRecommended = userTypeData.partnerRecommendations.some(rec => 
      rec.startsWith(type2)
    );
    if (isRecommended) {
      score += 20;
    }

    return Math.min(100, Math.max(0, score));
  };

  const isComplementary = (weakness: string, strength: string): boolean => {
    const complementaryPairs = [
      ['臨機応変な対応がやや苦手', '柔軟な対応力'],
      ['計画性に欠ける', '計画的な練習と成長'],
      ['コミュニケーションが苦手', 'コミュニケーション能力'],
      ['基礎練習を軽視しがち', '確実で安定した基本技術'],
      ['自己主張が苦手', '強いリーダーシップ']
    ];

    return complementaryPairs.some(([w, s]) => 
      weakness.includes(w) && strength.includes(s)
    );
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const samplePartners = generateSamplePartners();
      setPartners(samplePartners);
      setFilteredPartners(samplePartners);
      setIsLoading(false);
    }, 1000);
  }, [userMBTIType]);

  useEffect(() => {
    let filtered = partners;

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(partner => 
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.mbtiType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // スキルレベルフィルタ
    if (filters.skillLevel !== 'all') {
      filtered = filtered.filter(partner => partner.skillLevel === filters.skillLevel);
    }

    // プレースタイルフィルタ
    if (filters.playStyle !== 'all') {
      filtered = filtered.filter(partner => partner.playStyle === filters.playStyle);
    }

    // 地域フィルタ
    if (filters.location !== 'all') {
      filtered = filtered.filter(partner => partner.location === filters.location);
    }

    // 相性スコアフィルタ
    filtered = filtered.filter(partner => partner.matchScore >= filters.minMatchScore);

    // 相性スコア順にソート
    filtered.sort((a, b) => b.matchScore - a.matchScore);

    setFilteredPartners(filtered);
  }, [partners, filters, searchTerm]);

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      case 'expert': return 'エキスパート';
      default: return level;
    }
  };

  const getPlayStyleText = (style: string) => {
    switch (style) {
      case 'aggressive': return '攻撃的';
      case 'defensive': return '守備的';
      case 'balanced': return 'バランス型';
      default: return style;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <FaHandshake className="w-5 h-5 mr-2 text-pink-600" />
        パートナーマッチング
      </h3>

      {/* 検索とフィルタ */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="名前やタイプで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={filters.skillLevel}
            onChange={(e) => setFilters({...filters, skillLevel: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">全スキルレベル</option>
            <option value="beginner">初級</option>
            <option value="intermediate">中級</option>
            <option value="advanced">上級</option>
            <option value="expert">エキスパート</option>
          </select>

          <select
            value={filters.playStyle}
            onChange={(e) => setFilters({...filters, playStyle: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">全プレースタイル</option>
            <option value="aggressive">攻撃的</option>
            <option value="defensive">守備的</option>
            <option value="balanced">バランス型</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">全地域</option>
            <option value="東京">東京</option>
            <option value="神奈川">神奈川</option>
            <option value="埼玉">埼玉</option>
            <option value="千葉">千葉</option>
          </select>

          <input
            type="range"
            min="0"
            max="100"
            value={filters.minMatchScore}
            onChange={(e) => setFilters({...filters, minMatchScore: parseInt(e.target.value)})}
            className="w-full"
            title={`最低相性スコア: ${filters.minMatchScore}%`}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          最低相性スコア: {filters.minMatchScore}%
        </div>
      </div>

      {/* パートナー一覧 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">パートナーを検索中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPartners.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaUsers className="w-8 h-8 mx-auto mb-4 opacity-50" />
              <p>条件に合うパートナーが見つかりませんでした</p>
            </div>
          ) : (
            filteredPartners.map(partner => (
              <div key={partner.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <MBTIAvatar type={partner.mbtiType} size="md" animated={true} />
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-800">{partner.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs ${getSkillLevelColor(partner.skillLevel)}`}>
                          {getSkillLevelText(partner.skillLevel)}
                        </span>
                        <span>•</span>
                        <span>{getPlayStyleText(partner.playStyle)}</span>
                        <span>•</span>
                        <span>{partner.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className={`font-bold ${getMatchScoreColor(partner.matchScore)}`}>
                        {partner.matchScore}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">相性スコア</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{partner.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {partner.mutualStrengths.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <h5 className="font-medium text-green-800 mb-2 text-sm">共通の強み</h5>
                      <ul className="text-xs text-green-700 space-y-1">
                        {partner.mutualStrengths.slice(0, 3).map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {partner.complementaryAreas.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h5 className="font-medium text-blue-800 mb-2 text-sm">補完関係</h5>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {partner.complementaryAreas.slice(0, 3).map((area, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">対応可能時間:</span>
                    {partner.availableTimes.join(', ')}
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex items-center px-3 py-1 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm">
                      <FaHeart className="w-3 h-3 mr-1" />
                      興味あり
                    </button>
                    <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      <FaUsers className="w-3 h-3 mr-1" />
                      メッセージ
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PartnerMatcher;