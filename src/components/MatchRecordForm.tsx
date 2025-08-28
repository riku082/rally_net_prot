'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { 
  MatchRecord, 
  TeamInfo, 
  PlayerInfo, 
  GameScore,
  MatchType,
  GameType
} from '@/types/match';
import { Friendship } from '@/types/friendship';
import { CommunityMember } from '@/types/community';
import { 
  Trophy,
  Users,
  User,
  Plus,
  Minus,
  X,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MatchRecordFormProps {
  practiceId?: string;
  communityId?: string;
  communityEventId?: string;
  date?: string;
  onSave: (match: Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

export default function MatchRecordForm({ 
  practiceId,
  communityId,
  communityEventId,
  date,
  onSave,
  onCancel
}: MatchRecordFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<PlayerInfo[]>([]);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<1 | 2>(1);
  
  const [formData, setFormData] = useState({
    matchType: 'practice' as MatchType,
    gameType: 'doubles' as GameType,
    startTime: '',
    endTime: '',
    venue: '',
    notes: ''
  });
  
  const [team1, setTeam1] = useState<PlayerInfo[]>([]);
  const [team2, setTeam2] = useState<PlayerInfo[]>([]);
  const [scores, setScores] = useState<GameScore[]>([
    { gameNumber: 1, team1Score: 0, team2Score: 0 }
  ]);

  useEffect(() => {
    if (user) {
      loadAvailablePlayers();
    }
  }, [user, communityId, communityEventId]);

  const loadAvailablePlayers = async () => {
    if (!user) return;
    
    const players: PlayerInfo[] = [];
    
    // 自分を追加
    players.push({
      id: user.uid,
      name: user.displayName || 'あなた',
      type: 'user',
      photoURL: user.photoURL || undefined
    });
    
    try {
      if (communityId && communityEventId) {
        // コミュニティイベントの参加者を取得
        const participationsQuery = query(
          collection(db, 'event_participations'),
          where('eventId', '==', communityEventId),
          where('status', '==', 'ATTENDING')
        );
        const participationsSnapshot = await getDocs(participationsQuery);
        
        for (const doc of participationsSnapshot.docs) {
          const participation = doc.data();
          if (participation.userId !== user.uid) {
            // ユーザー情報を取得
            const userQuery = query(
              collection(db, 'users'),
              where('__name__', '==', participation.userId)
            );
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              players.push({
                id: participation.userId,
                name: userData.displayName || userData.name || 'メンバー',
                type: 'community_member',
                photoURL: userData.photoURL || userData.avatarUrl
              });
            }
          }
        }
      } else {
        // フレンドを取得
        const friendshipsQuery1 = query(
          collection(db, 'friendships'),
          where('fromUserId', '==', user.uid),
          where('status', '==', 'accepted')
        );
        const friendshipsQuery2 = query(
          collection(db, 'friendships'),
          where('toUserId', '==', user.uid),
          where('status', '==', 'accepted')
        );
        
        const [friendshipsSnapshot1, friendshipsSnapshot2] = await Promise.all([
          getDocs(friendshipsQuery1),
          getDocs(friendshipsQuery2)
        ]);
        
        const friendIds = new Set<string>();
        
        friendshipsSnapshot1.docs.forEach(doc => {
          const friendship = doc.data() as Friendship;
          friendIds.add(friendship.toUserId);
        });
        
        friendshipsSnapshot2.docs.forEach(doc => {
          const friendship = doc.data() as Friendship;
          friendIds.add(friendship.fromUserId);
        });
        
        // フレンド情報を取得
        for (const friendId of friendIds) {
          const profileDoc = await getDoc(doc(db, 'userProfiles', friendId));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            players.push({
              id: friendId,
              name: profileData.displayName || profileData.name || 'フレンド',
              type: 'friend',
              photoURL: profileData.avatar || profileData.photoURL
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading players:', error);
    }
    
    setAvailablePlayers(players);
  };

  const addPlayerToTeam = (player: PlayerInfo, teamNum: 1 | 2) => {
    if (teamNum === 1) {
      if (!team1.some(p => p.id === player.id)) {
        setTeam1([...team1, player]);
      }
    } else {
      if (!team2.some(p => p.id === player.id)) {
        setTeam2([...team2, player]);
      }
    }
    setShowPlayerSelection(false);
    setSearchTerm('');
  };

  const removePlayerFromTeam = (playerId: string, teamNum: 1 | 2) => {
    if (teamNum === 1) {
      setTeam1(team1.filter(p => p.id !== playerId));
    } else {
      setTeam2(team2.filter(p => p.id !== playerId));
    }
  };

  const addGuestPlayer = (name: string, teamNum: 1 | 2) => {
    const guestPlayer: PlayerInfo = {
      id: `guest-${Date.now()}`,
      name,
      type: 'guest'
    };
    
    if (teamNum === 1) {
      setTeam1([...team1, guestPlayer]);
    } else {
      setTeam2([...team2, guestPlayer]);
    }
  };

  const addGame = () => {
    setScores([
      ...scores,
      { gameNumber: scores.length + 1, team1Score: 0, team2Score: 0 }
    ]);
  };

  const removeGame = (index: number) => {
    setScores(scores.filter((_, i) => i !== index));
  };

  const updateScore = (index: number, team: 'team1' | 'team2', value: number) => {
    const newScores = [...scores];
    if (team === 'team1') {
      newScores[index].team1Score = value;
    } else {
      newScores[index].team2Score = value;
    }
    setScores(newScores);
  };

  const calculateWinner = (): 'team1' | 'team2' | 'draw' => {
    let team1Wins = 0;
    let team2Wins = 0;
    
    scores.forEach(score => {
      if (score.team1Score > score.team2Score) {
        team1Wins++;
      } else if (score.team2Score > score.team1Score) {
        team2Wins++;
      }
    });
    
    if (team1Wins > team2Wins) return 'team1';
    if (team2Wins > team1Wins) return 'team2';
    return 'draw';
  };

  const handleSubmit = () => {
    if (!user) return;
    if (team1.length === 0 || team2.length === 0) {
      alert('両チームに最低1名のプレイヤーが必要です');
      return;
    }
    
    const matchRecord: Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      practiceId,
      communityId,
      communityEventId,
      userId: user.uid,
      date: date || new Date().toISOString().split('T')[0],
      startTime: formData.startTime || new Date().toTimeString().slice(0, 5),
      endTime: formData.endTime,
      matchType: formData.matchType,
      gameType: formData.gameType,
      venue: formData.venue,
      team1: {
        players: team1,
        games: scores.filter(s => s.team1Score > s.team2Score).length
      },
      team2: {
        players: team2,
        games: scores.filter(s => s.team2Score > s.team1Score).length
      },
      scores,
      winner: calculateWinner(),
      notes: formData.notes,
      tags: [
        ...(communityId ? [`community:${communityId}`] : []),
        ...team1.map(p => p.name),
        ...team2.map(p => p.name)
      ]
    };
    
    onSave(matchRecord);
  };

  const filteredPlayers = availablePlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !team1.some(p => p.id === player.id) &&
    !team2.some(p => p.id === player.id)
  );

  const maxPlayers = formData.gameType === 'singles' ? 1 : 2;

  return (
    <div className="space-y-4">
      {/* 試合設定 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">試合設定</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              試合タイプ
            </label>
            <select
              value={formData.matchType}
              onChange={(e) => setFormData({ ...formData, matchType: e.target.value as MatchType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="practice">練習試合</option>
              <option value="tournament">トーナメント</option>
              <option value="league">リーグ戦</option>
              <option value="friendly">親善試合</option>
              <option value="training">トレーニング</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ゲームタイプ
            </label>
            <select
              value={formData.gameType}
              onChange={(e) => {
                setFormData({ ...formData, gameType: e.target.value as GameType });
                // シングルスの場合、余分なプレイヤーを削除
                if (e.target.value === 'singles') {
                  setTeam1(team1.slice(0, 1));
                  setTeam2(team2.slice(0, 1));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="singles">シングルス</option>
              <option value="doubles">ダブルス</option>
              <option value="mixed_doubles">ミックスダブルス</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始時刻
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了時刻
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            会場
          </label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder="例: 市民体育館 コート1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* チーム構成 */}
      <div className="grid grid-cols-2 gap-4">
        {/* チーム1 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">チーム1</h4>
          
          {team1.map((player) => (
            <div key={player.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-2">
              <div className="flex items-center">
                {player.photoURL ? (
                  <img src={player.photoURL} alt={player.name} className="w-8 h-8 rounded-full mr-2" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                <span className="text-sm font-medium">{player.name}</span>
              </div>
              <button
                onClick={() => removePlayerFromTeam(player.id, 1)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {team1.length < maxPlayers && (
            <button
              onClick={() => {
                setSelectedTeam(1);
                setShowPlayerSelection(true);
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              <Plus className="inline h-4 w-4 mr-1" />
              プレイヤーを追加
            </button>
          )}
        </div>

        {/* チーム2 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">チーム2</h4>
          
          {team2.map((player) => (
            <div key={player.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-2">
              <div className="flex items-center">
                {player.photoURL ? (
                  <img src={player.photoURL} alt={player.name} className="w-8 h-8 rounded-full mr-2" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                <span className="text-sm font-medium">{player.name}</span>
              </div>
              <button
                onClick={() => removePlayerFromTeam(player.id, 2)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {team2.length < maxPlayers && (
            <button
              onClick={() => {
                setSelectedTeam(2);
                setShowPlayerSelection(true);
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              <Plus className="inline h-4 w-4 mr-1" />
              プレイヤーを追加
            </button>
          )}
        </div>
      </div>

      {/* プレイヤー選択モーダル */}
      {showPlayerSelection && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-900">プレイヤーを選択</h4>
            <button
              onClick={() => setShowPlayerSelection(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="名前で検索またはゲスト名を入力"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
            {filteredPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => addPlayerToTeam(player, selectedTeam)}
                className="w-full flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  {player.photoURL ? (
                    <img src={player.photoURL} alt={player.name} className="w-8 h-8 rounded-full mr-2" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{player.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {player.type === 'community_member' ? 'メンバー' :
                     player.type === 'friend' ? 'フレンド' :
                     player.type === 'user' ? 'あなた' : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          {searchTerm && filteredPlayers.length === 0 && (
            <button
              onClick={() => {
                addGuestPlayer(searchTerm, selectedTeam);
                setSearchTerm('');
                setShowPlayerSelection(false);
              }}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="inline h-4 w-4 mr-1" />
              ゲスト「{searchTerm}」を追加
            </button>
          )}
        </div>
      )}

      {/* スコア入力 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900">スコア</h4>
          <button
            onClick={addGame}
            className="text-green-600 hover:text-green-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        {scores.map((score, index) => (
          <div key={index} className="flex items-center gap-3 mb-2">
            <span className="text-sm text-gray-600 w-16">ゲーム{score.gameNumber}</span>
            <input
              type="number"
              min="0"
              value={score.team1Score}
              onChange={(e) => updateScore(index, 'team1', parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              min="0"
              value={score.team2Score}
              onChange={(e) => updateScore(index, 'team2', parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
            />
            {scores.length > 1 && (
              <button
                onClick={() => removeGame(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Minus className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">勝者</span>
            <span className={`text-sm font-bold ${
              calculateWinner() === 'team1' ? 'text-green-600' :
              calculateWinner() === 'team2' ? 'text-blue-600' :
              'text-gray-500'
            }`}>
              {calculateWinner() === 'team1' ? 'チーム1' :
               calculateWinner() === 'team2' ? 'チーム2' :
               '引き分け'}
            </span>
          </div>
        </div>
      </div>

      {/* メモ */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          メモ
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="試合の感想や改善点など"
        />
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={team1.length === 0 || team2.length === 0}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Trophy className="h-4 w-4 mr-2" />
          試合記録を保存
        </button>
      </div>
    </div>
  );
}