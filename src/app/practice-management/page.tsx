'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import AuthGuard from '@/components/AuthGuard';
import PracticeCalendar from '@/components/PracticeCalendar';
import PracticeDayDetail from '@/components/PracticeDayDetail';
import PracticeList from '@/components/PracticeList';
import PracticeForm from '@/components/PracticeForm';
import PracticeCardList from '@/components/PracticeCardList';
import PracticeCardForm from '@/components/PracticeCardForm';
import { Practice, PracticeCard } from '@/types/practice';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { FaCalendarAlt, FaBook, FaLayerGroup, FaPlus, FaChartLine, FaTrophy } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

type ViewMode = 'calendar' | 'records' | 'cards';

export default function PracticeManagementPage() {
  const { user } = useAuth();
  // const router = useRouter(); // 将来的な機能拡張用
  const searchParams = useSearchParams();
  
  // データ状態
  const [practices, setPractices] = useState<Practice[]>([]);
  const [practiceCards, setPracticeCards] = useState<PracticeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // UI状態  
  const [activeView, setActiveView] = useState<ViewMode>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'cards' || tab === 'records' || tab === 'calendar') {
      return tab as ViewMode;
    }
    return 'calendar';
  });
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [editingCard, setEditingCard] = useState<PracticeCard | null>(null);
  const [formInitialDate, setFormInitialDate] = useState<string>('');
  
  // カレンダー関連状態
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDatePractices, setSelectedDatePractices] = useState<Practice[]>([]);
  const [showDayDetail, setShowDayDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      
      // 仮のサンプルデータ
      const samplePractices: Practice[] = [
        {
          id: '1',
          userId: user.uid,
          date: '2024-07-10',
          startTime: '10:00',
          endTime: '12:00',
          duration: 120,
          type: 'basic_practice',
          intensity: 'medium',
          title: '基礎練習',
          description: 'クリア、ドロップ、スマッシュの基礎練習',
          notes: '今日は調子が良かった。フットワークが改善した。',
          skills: [
            {
              id: '1',
              name: 'クリア',
              category: 'clear',
              rating: 4,
              improvement: 1,
              notes: '安定してきた'
            }
          ],
          goals: ['クリアの精度向上'],
          achievements: ['連続50本成功'],
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now() - 86400000,
        },
        {
          id: '2',
          userId: user.uid,
          date: '2024-07-12',
          startTime: '19:00',
          endTime: '21:00',
          duration: 120,
          type: 'game_practice',
          intensity: 'high',
          title: '試合練習',
          description: 'ダブルスの試合形式練習',
          notes: 'パートナーとの連携がうまくいった',
          skills: [],
          goals: ['ダブルス連携向上'],
          achievements: ['3ゲーム連続勝利'],
          createdAt: Date.now() - 259200000,
          updatedAt: Date.now() - 259200000,
        },
        {
          id: '3',
          userId: user.uid,
          date: '2024-07-14',
          startTime: '08:00',
          endTime: '09:30',
          duration: 90,
          type: 'physical_training',
          intensity: 'very_high',
          title: 'フィジカル強化',
          description: '体力向上のための集中トレーニング',
          notes: 'きつかったが、達成感があった',
          skills: [],
          goals: ['体力向上'],
          achievements: ['目標回数達成'],
          createdAt: Date.now() - 432000000,
          updatedAt: Date.now() - 432000000,
        }
      ];

      const sampleCards: PracticeCard[] = [
        {
          id: '1',
          userId: user.uid,
          title: '基礎サーブ練習',
          description: 'サーブの基本フォームを身につけ、正確性を向上させる練習メニュー',
          objectives: ['サーブの基本フォームを習得', 'コート内への成功率80%以上を目指す'],
          drills: [
            {
              id: '1',
              name: 'ハイサーブ練習',
              description: '後ろのコーナーを狙ったハイサーブの練習',
              duration: 15,
              intensity: 'medium',
              skillCategory: 'serve',
              sets: 3,
              reps: 20
            }
          ],
          estimatedDuration: 30,
          difficulty: 'beginner',
          skillCategories: ['serve'],
          equipment: ['シャトル', 'ラケット'],
          courtInfo: {
            targetAreas: ['service_box_left', 'service_box_right', 'backcourt_left', 'backcourt_center'],
            focusArea: 'backcourt_center',
            courtType: 'doubles',
            notes: 'サーブの到達地点を意識して練習する'
          },
          notes: '初心者向けの基本的なサーブ練習です。',
          tags: ['基礎', 'サーブ'],
          isPublic: false,
          usageCount: 5,
          lastUsed: '2024-07-09',
          rating: 4.2,
          createdAt: Date.now() - 604800000,
          updatedAt: Date.now() - 604800000,
        },
        {
          id: '2',
          userId: user.uid,
          title: 'クリア＆ドロップ組み合わせ練習',
          description: 'クリアとドロップを組み合わせた実戦的な練習メニュー',
          objectives: ['クリアの飛距離と精度向上', 'ドロップの精度向上'],
          drills: [],
          estimatedDuration: 45,
          difficulty: 'intermediate',
          skillCategories: ['clear', 'drop'],
          equipment: ['シャトル', 'ラケット'],
          courtInfo: {
            targetAreas: ['backcourt_center', 'frontcourt_left_own', 'frontcourt_right_own'],
            focusArea: 'backcourt_center',
            courtType: 'singles',
            notes: 'クリアは後衛から、ドロップは前衛エリアへの精密なコントロールを練習'
          },
          notes: '中級者向けの練習です。',
          tags: ['中級', 'クリア', 'ドロップ'],
          isPublic: false,
          usageCount: 3,
          lastUsed: '2024-07-08',
          rating: 4.5,
          createdAt: Date.now() - 1209600000,
          updatedAt: Date.now() - 1209600000,
        }
      ];

      setPractices(samplePractices);
      setPracticeCards(sampleCards);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 統計情報の計算
  const calculateStats = () => {
    const thisMonth = new Date();
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const monthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);
    
    const monthPractices = practices.filter(p => {
      const practiceDate = new Date(p.date);
      return practiceDate >= monthStart && practiceDate <= monthEnd;
    });
    
    const totalDuration = practices.reduce((sum, p) => sum + p.duration, 0);
    const practiceDays = new Set(practices.map(p => p.date)).size;
    
    return {
      totalPractices: practices.length,
      monthPractices: monthPractices.length,
      totalHours: Math.round(totalDuration / 60),
      practiceDays,
      totalCards: practiceCards.length,
      cardUsage: practiceCards.reduce((sum, c) => sum + c.usageCount, 0),
    };
  };

  // 練習記録関連のハンドラー
  const handleSavePractice = async (practiceData: Omit<Practice, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) return;

    try {
      setIsSaving(true);
      
      if (editingPractice) {
        const updatedPractice: Practice = {
          ...editingPractice,
          ...practiceData,
          updatedAt: Date.now(),
        };
        
        setPractices(prev => 
          prev.map(p => p.id === editingPractice.id ? updatedPractice : p)
        );
        
        if (selectedDate && selectedDate.toISOString().split('T')[0] === practiceData.date) {
          setSelectedDatePractices(prev => 
            prev.map(p => p.id === editingPractice.id ? updatedPractice : p)
          );
        }
      } else {
        const newPractice: Practice = {
          id: Date.now().toString(),
          userId: user.uid,
          ...practiceData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        setPractices(prev => [...prev, newPractice]);
        
        if (selectedDate && selectedDate.toISOString().split('T')[0] === practiceData.date) {
          setSelectedDatePractices(prev => [...prev, newPractice]);
        }
      }
      
      setShowPracticeForm(false);
      setEditingPractice(null);
      setFormInitialDate('');
    } catch (error) {
      console.error('練習記録の保存に失敗しました:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPractice = (practice: Practice) => {
    setEditingPractice(practice);
    setFormInitialDate(practice.date);
    setShowPracticeForm(true);
    setShowDayDetail(false);
  };

  const handleDeletePractice = async (practiceId: string) => {
    try {
      setPractices(prev => prev.filter(p => p.id !== practiceId));
      setSelectedDatePractices(prev => prev.filter(p => p.id !== practiceId));
    } catch (error) {
      console.error('練習記録の削除に失敗しました:', error);
    }
  };

  const handleCreatePractice = (date?: Date) => {
    setFormInitialDate(date ? date.toISOString().split('T')[0] : '');
    setEditingPractice(null);
    setShowPracticeForm(true);
    setShowDayDetail(false);
  };

  // 練習カード関連のハンドラー
  const handleSavePracticeCard = async (cardData: Omit<PracticeCard, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>) => {
    if (!user?.uid) return;

    try {
      setIsSaving(true);
      
      if (editingCard) {
        const updatedCard: PracticeCard = {
          ...editingCard,
          ...cardData,
          updatedAt: Date.now(),
        };
        
        setPracticeCards(prev => 
          prev.map(c => c.id === editingCard.id ? updatedCard : c)
        );
      } else {
        const newCard: PracticeCard = {
          id: Date.now().toString(),
          userId: user.uid,
          ...cardData,
          usageCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        setPracticeCards(prev => [newCard, ...prev]);
      }
      
      setShowCardForm(false);
      setEditingCard(null);
    } catch (error) {
      console.error('練習カードの保存に失敗しました:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPracticeCard = (card: PracticeCard) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const handleDeletePracticeCard = async (cardId: string) => {
    try {
      setPracticeCards(prev => prev.filter(c => c.id !== cardId));
    } catch (error) {
      console.error('練習カードの削除に失敗しました:', error);
    }
  };

  const handleUsePracticeCard = async (card: PracticeCard, date?: Date) => {
    try {
      const targetDate = date || new Date();
      const newPractice: Practice = {
        id: Date.now().toString(),
        userId: user?.uid || '',
        date: targetDate.toISOString().split('T')[0],
        startTime: '10:00',
        endTime: `${Math.floor((10 * 60 + card.estimatedDuration) / 60)}:${(10 * 60 + card.estimatedDuration) % 60 < 10 ? '0' : ''}${(10 * 60 + card.estimatedDuration) % 60}`,
        duration: card.estimatedDuration,
        type: 'basic_practice',
        intensity: 'medium',
        title: card.title,
        description: card.description,
        notes: `練習カード「${card.title}」から作成`,
        skills: [],
        goals: card.objectives,
        achievements: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setPractices(prev => [...prev, newPractice]);
      
      const updatedCard = {
        ...card,
        usageCount: card.usageCount + 1,
        lastUsed: targetDate.toISOString().split('T')[0],
        updatedAt: Date.now(),
      };
      
      setPracticeCards(prev => prev.map(c => c.id === card.id ? updatedCard : c));
      
      if (selectedDate && selectedDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0]) {
        setSelectedDatePractices(prev => [...prev, newPractice]);
      }
    } catch (error) {
      console.error('練習カードの使用に失敗しました:', error);
    }
  };

  // カレンダー関連のハンドラー
  const handleDateClick = (date: Date, dayPractices: Practice[]) => {
    setSelectedDate(date);
    setSelectedDatePractices(dayPractices);
    setShowDayDetail(true);
  };

  const stats = calculateStats();

  const tabs = [
    { id: 'calendar', label: 'カレンダー', icon: <FaCalendarAlt className="w-4 h-4" /> },
    { id: 'records', label: '記録一覧', icon: <FaBook className="w-4 h-4" /> },
    { id: 'cards', label: 'カード管理', icon: <FaLayerGroup className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Sidebar activePath="/practice-management" />
          <MobileNav activePath="/practice-management" />
          <div className="flex-1 flex flex-col lg:ml-0">
            <Topbar />
            <main className="flex-1 p-8">
              <div className="max-w-7xl mx-auto">
                <div className="animate-pulse space-y-6">
                  <div className="bg-gray-200 rounded-lg h-32"></div>
                  <div className="bg-gray-200 rounded-lg h-96"></div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar activePath="/practice-management" />
        <MobileNav activePath="/practice-management" />
        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar />
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* ヘッダーセクション */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl opacity-5"></div>
                <div className="relative p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        練習管理
                      </h1>
                      <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                        練習記録、カード、スケジュールを一元管理して効率的な練習を実現
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {activeView === 'records' && (
                        <button
                          onClick={() => handleCreatePractice()}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaPlus className="w-4 h-4 mr-2" />
                          練習記録
                        </button>
                      )}
                      {activeView === 'cards' && (
                        <button
                          onClick={() => setShowCardForm(true)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FaPlus className="w-4 h-4 mr-2" />
                          練習カード
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 統計カード */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <GiShuttlecock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">総練習回数</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalPractices}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaCalendarAlt className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">今月の練習</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.monthPractices}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaChartLine className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">総練習時間</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FaTrophy className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">練習日数</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.practiceDays}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FaLayerGroup className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">練習カード</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <FaBook className="w-6 h-6 text-pink-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">カード使用</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.cardUsage}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* タブナビゲーション */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20">
                <div className="border-b border-gray-200">
                  <div className="flex space-x-8 px-6">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id as ViewMode)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeView === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* タブコンテンツ */}
                <div className="p-6">
                  {activeView === 'calendar' && (
                    <PracticeCalendar
                      practices={practices}
                      practiceCards={practiceCards}
                      onDateClick={handleDateClick}
                      onCreatePractice={handleCreatePractice}
                      onEditPractice={handleEditPractice}
                      onUsePracticeCard={handleUsePracticeCard}
                    />
                  )}

                  {activeView === 'records' && (
                    <PracticeList
                      practices={practices}
                      onEdit={handleEditPractice}
                      onDelete={handleDeletePractice}
                      isLoading={false}
                    />
                  )}

                  {activeView === 'cards' && (
                    <PracticeCardList
                      cards={practiceCards}
                      onEdit={handleEditPracticeCard}
                      onDelete={handleDeletePracticeCard}
                      onUse={handleUsePracticeCard}
                      isLoading={false}
                    />
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* モーダル */}
      {showDayDetail && selectedDate && (
        <PracticeDayDetail
          selectedDate={selectedDate}
          practices={selectedDatePractices}
          practiceCards={practiceCards}
          onClose={() => setShowDayDetail(false)}
          onCreatePractice={handleCreatePractice}
          onEditPractice={handleEditPractice}
          onDeletePractice={handleDeletePractice}
          onUsePracticeCard={handleUsePracticeCard}
        />
      )}

      {showPracticeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <PracticeForm
              practice={editingPractice || undefined}
              onSave={handleSavePractice}
              onCancel={() => {
                setShowPracticeForm(false);
                setEditingPractice(null);
                setFormInitialDate('');
              }}
              isLoading={isSaving}
              initialDate={formInitialDate}
            />
          </div>
        </div>
      )}

      {showCardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <PracticeCardForm
              card={editingCard || undefined}
              onSave={handleSavePracticeCard}
              onCancel={() => {
                setShowCardForm(false);
                setEditingCard(null);
              }}
              isLoading={isSaving}
            />
          </div>
        </div>
      )}
    </AuthGuard>
  );
}