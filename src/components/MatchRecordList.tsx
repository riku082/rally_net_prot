'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { MatchRecord, GameType, MatchType } from '@/types/match';
import { 
  Trophy,
  Calendar,
  Clock,
  Users,
  MapPin,
  Filter,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  X
} from 'lucide-react';
import MatchRecordForm from './MatchRecordForm';

interface MatchRecordListProps {
  communityId?: string;
  onSelectMatch?: (match: MatchRecord) => void;
  selectionMode?: boolean;
}

export default function MatchRecordList({ 
  communityId, 
  onSelectMatch,
  selectionMode = false 
}: MatchRecordListProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchRecord | null>(null);
  
  // フィルター状態
  const [filterType, setFilterType] = useState<MatchType | ''>('');
  const [filterGameType, setFilterGameType] = useState<GameType | ''>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user, communityId]);

  useEffect(() => {
    applyFilters();
  }, [matches, filterType, filterGameType, filterDateFrom, filterDateTo]);

  const loadMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let matchQuery;
      if (communityId) {
        // コミュニティの試合のみ
        matchQuery = query(
          collection(db, 'matches'),
          where('communityId', '==', communityId),
          orderBy('date', 'desc'),
          orderBy('startTime', 'desc')
        );
      } else {
        // ユーザーの全試合
        matchQuery = query(
          collection(db, 'matches'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          orderBy('startTime', 'desc')
        );
      }
      
      const snapshot = await getDocs(matchQuery);
      const matchData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MatchRecord[];
      
      setMatches(matchData);
    } catch (error: any) {
      console.error('Error loading matches:', error);
      
      // インデックスエラーの場合、シンプルなクエリにフォールバック
      if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        try {
          let simpleQuery;
          if (communityId) {
            simpleQuery = query(
              collection(db, 'matches'),
              where('communityId', '==', communityId)
            );
          } else {
            simpleQuery = query(
              collection(db, 'matches'),
              where('userId', '==', user.uid)
            );
          }
          
          const snapshot = await getDocs(simpleQuery);
          const matchData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as MatchRecord[];
          
          // クライアント側でソート
          matchData.sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return (b.startTime || '').localeCompare(a.startTime || '');
          });
          
          setMatches(matchData);
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          setMatches([]);
        }
      } else {
        setMatches([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...matches];
    
    if (filterType) {
      filtered = filtered.filter(m => m.matchType === filterType);
    }
    
    if (filterGameType) {
      filtered = filtered.filter(m => m.gameType === filterGameType);
    }
    
    if (filterDateFrom) {
      filtered = filtered.filter(m => m.date >= filterDateFrom);
    }
    
    if (filterDateTo) {
      filtered = filtered.filter(m => m.date <= filterDateTo);
    }
    
    setFilteredMatches(filtered);
  };

  const handleSaveMatch = async (matchData: Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      if (editingMatch) {
        // 更新
        await updateDoc(doc(db, 'matches', editingMatch.id), {
          ...matchData,
          updatedAt: Date.now()
        });
      } else {
        // 新規作成
        await addDoc(collection(db, 'matches'), {
          ...matchData,
          userId: user.uid,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      
      await loadMatches();
      setShowForm(false);
      setEditingMatch(null);
    } catch (error) {
      console.error('Error saving match:', error);
      alert('試合記録の保存に失敗しました');
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('この試合記録を削除してもよろしいですか？')) return;
    
    try {
      await deleteDoc(doc(db, 'matches', matchId));
      await loadMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('削除に失敗しました');
    }
  };

  const getMatchTypeLabel = (type: MatchType) => {
    const labels = {
      practice: '練習試合',
      tournament: 'トーナメント',
      league: 'リーグ戦',
      friendly: '親善試合',
      training: 'トレーニング'
    };
    return labels[type];
  };

  const getGameTypeLabel = (type: GameType) => {
    const labels = {
      singles: 'シングルス',
      doubles: 'ダブルス',
      mixed_doubles: 'ミックス'
    };
    return labels[type];
  };

  const calculateWinRate = () => {
    if (filteredMatches.length === 0) return 0;
    const wins = filteredMatches.filter(m => m.winner === 'team1').length;
    return Math.round((wins / filteredMatches.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingMatch(null);
            }}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className="h-5 w-5 mr-1 rotate-180" />
            戻る
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingMatch ? '試合記録を編集' : '新しい試合記録'}
          </h2>
          
          <MatchRecordForm
            communityId={communityId}
            onSave={handleSaveMatch}
            onCancel={() => {
              setShowForm(false);
              setEditingMatch(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">試合記録</h2>
            <p className="text-gray-600 mt-1">
              {communityId ? 'コミュニティの' : '個人の'}試合履歴を管理
            </p>
          </div>
          
          {!selectionMode && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              新規作成
            </button>
          )}
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredMatches.length}
            </div>
            <div className="text-sm text-gray-600">試合数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredMatches.filter(m => m.winner === 'team1').length}
            </div>
            <div className="text-sm text-gray-600">勝利</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {calculateWinRate()}%
            </div>
            <div className="text-sm text-gray-600">勝率</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4 mr-2" />
            フィルター
          </button>
          
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    試合タイプ
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as MatchType | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">すべて</option>
                    <option value="practice">練習試合</option>
                    <option value="tournament">トーナメント</option>
                    <option value="league">リーグ戦</option>
                    <option value="friendly">親善試合</option>
                    <option value="training">トレーニング</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ゲーム形式
                  </label>
                  <select
                    value={filterGameType}
                    onChange={(e) => setFilterGameType(e.target.value as GameType | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">すべて</option>
                    <option value="singles">シングルス</option>
                    <option value="doubles">ダブルス</option>
                    <option value="mixed_doubles">ミックス</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開始日
                  </label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    終了日
                  </label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 試合リスト */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">試合記録がありません</p>
            {!selectionMode && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-green-600 hover:text-green-700"
              >
                最初の試合記録を作成
              </button>
            )}
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div
              key={match.id}
              className={`bg-white rounded-lg shadow-md p-4 ${
                selectionMode ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={() => selectionMode && onSelectMatch?.(match)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      match.winner === 'team1' ? 'bg-green-100 text-green-700' :
                      match.winner === 'team2' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {match.winner === 'team1' ? '勝利' :
                       match.winner === 'team2' ? '敗北' : '引分'}
                    </span>
                    
                    <span className="text-xs text-gray-500">
                      {getMatchTypeLabel(match.matchType)}
                    </span>
                    
                    <span className="text-xs text-gray-500">
                      {getGameTypeLabel(match.gameType)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm mb-2">
                    <div className="font-semibold">
                      {match.team1.players.map(p => p.name).join('・')}
                      <span className="mx-2 text-gray-400">VS</span>
                      {match.team2.players.map(p => p.name).join('・')}
                    </div>
                  </div>
                  
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    {match.scores.map(s => `${s.team1Score}-${s.team2Score}`).join(' / ')}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {match.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {match.startTime}
                    </span>
                    {match.venue && (
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {match.venue}
                      </span>
                    )}
                  </div>
                </div>
                
                {!selectionMode && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMatch(match);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMatch(match.id);
                      }}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 必要なインポートを追加
import { updateDoc, addDoc } from 'firebase/firestore';