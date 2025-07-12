'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
import PracticeAnalyticsCharts from '@/components/PracticeAnalyticsCharts';
import { Practice, PracticeCard } from '@/types/practice';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { FaCalendarAlt, FaBook, FaLayerGroup, FaPlus, FaChartLine } from 'react-icons/fa';

type ViewMode = 'calendar' | 'records' | 'cards' | 'analytics';

function PracticeManagementContent() {
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
    if (tab === 'cards' || tab === 'records' || tab === 'calendar' || tab === 'analytics') {
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
          title: 'ハイサーブ練習',
          description: '後ろのコーナーを狙ったハイサーブの練習',
          drill: {
            id: '1',
            name: 'ハイサーブ練習',
            description: '後ろのコーナーを狙ったハイサーブの練習。フォームと精度を重視する。',
            duration: 15,
                        skillCategory: 'serve',
            sets: 3,
            reps: 20
          },
          difficulty: 'beginner',
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
          title: 'クリア練習',
          description: '高いクリアでシャトルを後ろに送る練習',
          drill: {
            id: '2',
            name: 'クリア練習',
            description: '高いクリアでシャトルを相手コート後方に送る練習。飛距離と精度を向上させる。',
            duration: 20,
                        skillCategory: 'clear',
            sets: 3,
            reps: 15
          },
          difficulty: 'intermediate',
          equipment: ['シャトル', 'ラケット'],
          courtInfo: {
            targetAreas: ['backcourt_center', 'backcourt_left', 'backcourt_right'],
            focusArea: 'backcourt_center',
            courtType: 'singles',
            notes: 'クリアの到達地点を後衛エリアに正確に送る'
          },
          notes: '普通強度のクリア練習です。',
          tags: ['普通', 'クリア'],
          isPublic: false,
          usageCount: 3,
          lastUsed: '2024-07-08',
          rating: 4.5,
          createdAt: Date.now() - 1209600000,
          updatedAt: Date.now() - 1209600000,
        },
        {
          id: '3',
          userId: user.uid,
          title: 'ネット前ドロップ',
          description: 'ネット際にやわらかくシャトルを落とす練習',
          drill: {
            id: '3',
            name: 'ネット前ドロップ',
            description: 'ネット際にソフトタッチでシャトルを落とす練習。角度とタイミングが重要。',
            duration: 10,
                        skillCategory: 'drop',
            sets: 4,
            reps: 10
          },
          difficulty: 'advanced',
          equipment: ['シャトル', 'ラケット'],
          courtInfo: {
            targetAreas: ['frontcourt_left_own', 'frontcourt_center_own', 'frontcourt_right_own'],
            focusArea: 'frontcourt_center_own',
            courtType: 'singles',
            notes: 'ネット際の前衛エリアを狙う精密なドロップ'
          },
          notes: 'きつい強度の繊細なタッチが必要な練習です。',
          tags: ['きつい', 'ドロップ', 'ネット'],
          isPublic: false,
          usageCount: 8,
          lastUsed: '2024-07-11',
          rating: 4.8,
          createdAt: Date.now() - 345600000,
          updatedAt: Date.now() - 345600000,
        }
      ];

      // 実際のデータベースから練習記録を取得
      const practicesData = await firestoreDb.getPractices(user.uid);
      setPractices(practicesData);

      // 実際のデータベースから練習カードを取得
      const cardsData = await firestoreDb.getPracticeCards(user.uid);
      setPracticeCards(cardsData);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // 練習記録関連のハンドラー
  const handleSavePractice = async (practiceData: Omit<Practice, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) return;

    try {
      setIsSaving(true);
      
      if (editingPractice) {
        // 既存の練習記録を更新
        const updatedPractice: Practice = {
          ...editingPractice,
          ...practiceData,
          updatedAt: Date.now(),
        };
        
        await firestoreDb.updatePractice(editingPractice.id, updatedPractice);
        
        setPractices(prev => 
          prev.map(p => p.id === editingPractice.id ? updatedPractice : p)
        );
        
        if (selectedDate && selectedDate.toISOString().split('T')[0] === practiceData.date) {
          setSelectedDatePractices(prev => 
            prev.map(p => p.id === editingPractice.id ? updatedPractice : p)
          );
        }
      } else {
        // 新しい練習記録を作成
        const newPractice: Practice = {
          id: Date.now().toString(),
          userId: user.uid,
          ...practiceData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        await firestoreDb.addPractice(newPractice);
        
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
      await firestoreDb.deletePractice(practiceId);
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
        // 既存の練習カードを更新
        const updatedCard: PracticeCard = {
          ...editingCard,
          ...cardData,
          updatedAt: Date.now(),
        };
        
        await firestoreDb.updatePracticeCard(editingCard.id, updatedCard);
        
        setPracticeCards(prev => 
          prev.map(c => c.id === editingCard.id ? updatedCard : c)
        );
      } else {
        // 新しい練習カードを作成
        const newCard: PracticeCard = {
          id: Date.now().toString(),
          userId: user.uid,
          ...cardData,
          usageCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        await firestoreDb.addPracticeCard(newCard);
        
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
    if (!user?.uid) {
      console.error('ユーザーIDが取得できません');
      return;
    }
    
    console.log('削除開始 - CardID:', cardId, 'UserID:', user.uid);
    console.log('削除前のカード数:', practiceCards.length);
    
    try {
      await firestoreDb.deletePracticeCard(cardId, user.uid);
      
      // ローカル状態を更新
      const updatedCards = practiceCards.filter(c => c.id !== cardId);
      setPracticeCards(updatedCards);
      
      console.log('削除成功 - CardID:', cardId);
      console.log('削除後のカード数:', updatedCards.length);
      
      // 削除が成功したことをユーザーに通知
      // alert('練習カードを削除しました');
      
      // データを再読み込みして最新状態を確保
      setTimeout(async () => {
        try {
          const refreshedCards = await firestoreDb.getPracticeCards(user.uid);
          setPracticeCards(refreshedCards);
          console.log('データ再読み込み完了。カード数:', refreshedCards.length);
        } catch (refreshError) {
          console.error('データ再読み込みに失敗:', refreshError);
        }
      }, 1000);
      
    } catch (error) {
      console.error('練習カードの削除に失敗しました:', error);
      alert('練習カードの削除に失敗しました。もう一度お試しください。');
    }
  };


  // カレンダー関連のハンドラー
  const handleDateClick = (date: Date, dayPractices: Practice[]) => {
    setSelectedDate(date);
    setSelectedDatePractices(dayPractices);
    setShowDayDetail(true);
  };


  const tabs = [
    { id: 'calendar', label: 'カレンダー', icon: <FaCalendarAlt className="w-4 h-4" /> },
    { id: 'records', label: '記録一覧', icon: <FaBook className="w-4 h-4" /> },
    { id: 'cards', label: 'カード管理', icon: <FaLayerGroup className="w-4 h-4" /> },
    { id: 'analytics', label: '練習分析', icon: <FaChartLine className="w-4 h-4" /> },
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
                          className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                        >
                          <FaPlus className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">練習</span>記録
                        </button>
                      )}
                      {activeView === 'cards' && (
                        <button
                          onClick={() => setShowCardForm(true)}
                          className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium shadow-lg"
                        >
                          <FaPlus className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">練習</span>カード
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* タブナビゲーション */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20">
                <div className="border-b border-gray-200">
                  <div className="flex space-x-2 sm:space-x-4 md:space-x-8 px-3 sm:px-6 overflow-x-auto">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id as ViewMode)}
                        className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                          activeView === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="w-3 h-3 sm:w-4 sm:h-4">{tab.icon}</span>
                        <span className="text-xs sm:text-sm">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* タブコンテンツ */}
                <div className="p-6">
                  {activeView === 'calendar' && (
                    <PracticeCalendar
                      practices={practices}
                      onDateClick={handleDateClick}
                      onEditPractice={handleEditPractice}
                    />
                  )}

                  {activeView === 'records' && (
                    <div className="relative">
                      <PracticeList
                        practices={practices}
                        onEdit={handleEditPractice}
                        onDelete={handleDeletePractice}
                        isLoading={false}
                      />
                      
                      {/* モバイル用フローティングアクションボタン */}
                      <div className="fixed bottom-6 right-6 sm:hidden z-40">
                        <button
                          onClick={() => handleCreatePractice()}
                          className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                          aria-label="練習記録を追加"
                        >
                          <FaPlus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeView === 'cards' && (
                    <div className="relative">
                      <PracticeCardList
                        cards={practiceCards}
                        onEdit={handleEditPracticeCard}
                        onDelete={handleDeletePracticeCard}
                        isLoading={false}
                      />
                      
                      {/* モバイル用フローティングアクションボタン */}
                      <div className="fixed bottom-6 right-6 sm:hidden z-40">
                        <button
                          onClick={() => setShowCardForm(true)}
                          className="flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 hover:scale-105"
                          aria-label="練習カードを追加"
                        >
                          <FaPlus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeView === 'analytics' && (
                    <PracticeAnalyticsCharts practices={practices} />
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
              availableCards={practiceCards}
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

export default function PracticeManagementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PracticeManagementContent />
    </Suspense>
  );
}