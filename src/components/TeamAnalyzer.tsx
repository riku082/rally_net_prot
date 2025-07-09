'use client';

import React, { useState, useEffect } from 'react';
import { MBTIResult, MBTIType } from '@/types/mbti';
import { badmintonMBTITypes } from '@/data/badmintonMBTITypes';
import { FaUsers, FaPlus, FaTrash, FaChartBar, FaExclamationTriangle, FaCheckCircle, FaSearch } from 'react-icons/fa';
import MBTIAvatar from './MBTIAvatar';

interface TeamMember {
  id: string;
  name: string;
  mbtiType: MBTIType;
  role: 'player' | 'captain' | 'coach';
  strengths: string[];
  weaknesses: string[];
}

interface TeamAnalysis {
  compatibility: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  roleDistribution: { [key: string]: number };
  balanceScore: number;
}

const TeamAnalyzer: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberType, setNewMemberType] = useState<MBTIType>('ESTJ');
  const [newMemberRole, setNewMemberRole] = useState<'player' | 'captain' | 'coach'>('player');
  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const allMBTITypes: MBTIType[] = [
    'ESTJ', 'ESTP', 'ESFJ', 'ESFP', 'ENTJ', 'ENTP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISTP', 'ISFJ', 'ISFP', 'INTJ', 'INTP', 'INFJ', 'INFP'
  ];

  const addTeamMember = () => {
    if (newMemberName.trim()) {
      const typeData = badmintonMBTITypes[newMemberType];
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: newMemberName.trim(),
        mbtiType: newMemberType,
        role: newMemberRole,
        strengths: typeData.strengths,
        weaknesses: typeData.weaknesses
      };
      setTeamMembers([...teamMembers, newMember]);
      setNewMemberName('');
      setNewMemberType('ESTJ');
      setNewMemberRole('player');
    }
  };

  const removeMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  const analyzeTeam = () => {
    if (teamMembers.length < 2) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const analysis = performTeamAnalysis(teamMembers);
      setAnalysis(analysis);
      setIsAnalyzing(false);
    }, 1000);
  };

  const performTeamAnalysis = (members: TeamMember[]): TeamAnalysis => {
    // 相性スコアの計算
    const compatibility = calculateCompatibility(members);
    
    // チーム全体の強みと弱みの分析
    const { strengths, weaknesses } = analyzeTeamStrengthsWeaknesses(members);
    
    // 推奨事項の生成
    const recommendations = generateRecommendations(members, strengths, weaknesses);
    
    // 役割分布の分析
    const roleDistribution = analyzeRoleDistribution(members);
    
    // バランススコアの計算
    const balanceScore = calculateBalanceScore(members);

    return {
      compatibility,
      strengths,
      weaknesses,
      recommendations,
      roleDistribution,
      balanceScore
    };
  };

  const calculateCompatibility = (members: TeamMember[]): number => {
    if (members.length < 2) return 0;

    const typeCount = members.reduce((acc, member) => {
      acc[member.mbtiType] = (acc[member.mbtiType] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // 多様性スコア（異なるタイプが多いほど高い）
    const diversityScore = Object.keys(typeCount).length / members.length;

    // 補完性スコア（対立する特性のバランス）
    const eCount = members.filter(m => m.mbtiType[0] === 'E').length;
    const iCount = members.filter(m => m.mbtiType[0] === 'I').length;
    const sCount = members.filter(m => m.mbtiType[1] === 'S').length;
    const nCount = members.filter(m => m.mbtiType[1] === 'N').length;
    const tCount = members.filter(m => m.mbtiType[2] === 'T').length;
    const fCount = members.filter(m => m.mbtiType[2] === 'F').length;
    const jCount = members.filter(m => m.mbtiType[3] === 'J').length;
    const pCount = members.filter(m => m.mbtiType[3] === 'P').length;

    const complementScore = (
      Math.min(eCount, iCount) +
      Math.min(sCount, nCount) +
      Math.min(tCount, fCount) +
      Math.min(jCount, pCount)
    ) / (members.length * 2);

    return Math.round((diversityScore * 0.4 + complementScore * 0.6) * 100);
  };

  const analyzeTeamStrengthsWeaknesses = (members: TeamMember[]) => {
    const allStrengths = members.flatMap(m => m.strengths);
    const allWeaknesses = members.flatMap(m => m.weaknesses);

    // 強みの頻度を計算
    const strengthCount = allStrengths.reduce((acc, strength) => {
      acc[strength] = (acc[strength] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // 弱みの頻度を計算
    const weaknessCount = allWeaknesses.reduce((acc, weakness) => {
      acc[weakness] = (acc[weakness] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // 共通の強みと弱みを抽出
    const commonStrengths = Object.entries(strengthCount)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strength]) => strength);

    const commonWeaknesses = Object.entries(weaknessCount)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([weakness]) => weakness);

    return {
      strengths: commonStrengths,
      weaknesses: commonWeaknesses
    };
  };

  const generateRecommendations = (members: TeamMember[], strengths: string[], weaknesses: string[]): string[] => {
    const recommendations: string[] = [];

    // チームサイズに基づく推奨
    if (members.length < 4) {
      recommendations.push('チームメンバーを増やして多様性を高めることを推奨します');
    } else if (members.length > 8) {
      recommendations.push('チームサイズが大きいため、小グループに分けることを検討してください');
    }

    // 役割分布に基づく推奨
    const captainCount = members.filter(m => m.role === 'captain').length;
    const coachCount = members.filter(m => m.role === 'coach').length;

    if (captainCount === 0) {
      recommendations.push('リーダーシップを発揮できるキャプテンを任命してください');
    } else if (captainCount > 2) {
      recommendations.push('キャプテンが多すぎる可能性があります。役割分担を明確にしてください');
    }

    if (coachCount === 0) {
      recommendations.push('指導役となるコーチの存在が重要です');
    }

    // 弱みに基づく推奨
    if (weaknesses.includes('臨機応変な対応がやや苦手')) {
      recommendations.push('柔軟性のあるメンバーを追加するか、アジリティ練習を増やしてください');
    }

    if (weaknesses.includes('コミュニケーションが苦手')) {
      recommendations.push('チーム内のコミュニケーション向上のための活動を実施してください');
    }

    return recommendations;
  };

  const analyzeRoleDistribution = (members: TeamMember[]) => {
    return members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  };

  const calculateBalanceScore = (members: TeamMember[]): number => {
    const typeDistribution = {
      E: members.filter(m => m.mbtiType[0] === 'E').length,
      I: members.filter(m => m.mbtiType[0] === 'I').length,
      S: members.filter(m => m.mbtiType[1] === 'S').length,
      N: members.filter(m => m.mbtiType[1] === 'N').length,
      T: members.filter(m => m.mbtiType[2] === 'T').length,
      F: members.filter(m => m.mbtiType[2] === 'F').length,
      J: members.filter(m => m.mbtiType[3] === 'J').length,
      P: members.filter(m => m.mbtiType[3] === 'P').length
    };

    // 理想的なバランスからの偏差を計算
    const idealRatio = members.length / 2;
    const deviations = [
      Math.abs(typeDistribution.E - idealRatio),
      Math.abs(typeDistribution.S - idealRatio),
      Math.abs(typeDistribution.T - idealRatio),
      Math.abs(typeDistribution.J - idealRatio)
    ];

    const averageDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / 4;
    const balanceScore = Math.max(0, 100 - (averageDeviation / members.length) * 100);

    return Math.round(balanceScore);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'captain': return 'bg-yellow-100 text-yellow-800';
      case 'coach': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'captain': return 'キャプテン';
      case 'coach': return 'コーチ';
      default: return 'プレイヤー';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <FaUsers className="w-5 h-5 mr-2 text-purple-600" />
        チーム分析
      </h3>

      {/* メンバー追加フォーム */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-800 mb-4">メンバーを追加</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="名前"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <select
            value={newMemberType}
            onChange={(e) => setNewMemberType(e.target.value as MBTIType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {allMBTITypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value as 'player' | 'captain' | 'coach')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="player">プレイヤー</option>
            <option value="captain">キャプテン</option>
            <option value="coach">コーチ</option>
          </select>
          <button
            onClick={addTeamMember}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-4 h-4 mr-1" />
            追加
          </button>
        </div>
      </div>

      {/* チームメンバー一覧 */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-4">チームメンバー ({teamMembers.length}名)</h4>
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>メンバーを追加してチーム分析を開始してください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <MBTIAvatar type={member.mbtiType} size="sm" animated={false} />
                    <div className="ml-3">
                      <h5 className="font-medium text-gray-800">{member.name}</h5>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                        {getRoleText(member.role)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{badmintonMBTITypes[member.mbtiType].title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分析ボタン */}
      {teamMembers.length >= 2 && (
        <div className="text-center mb-6">
          <button
            onClick={analyzeTeam}
            disabled={isAnalyzing}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                分析中...
              </>
            ) : (
              <>
                <FaChartBar className="w-4 h-4 mr-2" />
                チーム分析を実行
              </>
            )}
          </button>
        </div>
      )}

      {/* 分析結果 */}
      {analysis && (
        <div className="space-y-6">
          {/* 分析サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h5 className="font-medium text-blue-800 mb-2">相性スコア</h5>
              <p className="text-2xl font-bold text-blue-900">{analysis.compatibility}%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <h5 className="font-medium text-green-800 mb-2">バランススコア</h5>
              <p className="text-2xl font-bold text-green-900">{analysis.balanceScore}%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <h5 className="font-medium text-purple-800 mb-2">チームサイズ</h5>
              <p className="text-2xl font-bold text-purple-900">{teamMembers.length}名</p>
            </div>
          </div>

          {/* 強みと弱み */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-800 mb-3 flex items-center">
                <FaCheckCircle className="w-4 h-4 mr-2" />
                チームの強み
              </h5>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start">
                    <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h5 className="font-medium text-red-800 mb-3 flex items-center">
                <FaExclamationTriangle className="w-4 h-4 mr-2" />
                注意すべき点
              </h5>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start">
                    <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 推奨事項 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-3">推奨事項</h5>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAnalyzer;