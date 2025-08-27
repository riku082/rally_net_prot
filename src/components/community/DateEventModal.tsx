'use client';

import React from 'react';
import { 
  X, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trophy,
  Activity,
  MoreHorizontal
} from 'lucide-react';
import { CommunityEvent, EventType } from '@/types/community';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  events: CommunityEvent[];
  communityId: string;
}

export default function DateEventModal({
  isOpen,
  onClose,
  selectedDate,
  events,
  communityId
}: DateEventModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEventTypeIcon = (type?: EventType) => {
    switch (type) {
      case EventType.PRACTICE:
        return <Activity className="h-4 w-4" />;
      case EventType.MATCH:
        return <Trophy className="h-4 w-4" />;
      case EventType.OTHER:
        return <MoreHorizontal className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type?: EventType) => {
    switch (type) {
      case EventType.PRACTICE:
        return '練習';
      case EventType.MATCH:
        return '試合';
      case EventType.OTHER:
        return 'その他';
      default:
        return 'イベント';
    }
  };

  const getEventTypeColor = (type?: EventType) => {
    switch (type) {
      case EventType.PRACTICE:
        return 'bg-blue-100 text-blue-700';
      case EventType.MATCH:
        return 'bg-orange-100 text-orange-700';
      case EventType.OTHER:
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const handleCreateEvent = () => {
    // ローカル日付を正しくフォーマット（タイムゾーンを考慮）
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    router.push(`/community/${communityId}/events/new?date=${dateStr}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {formatDate(selectedDate)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">この日は練習記録がありません</p>
              <p className="text-sm text-gray-400 mb-6">新しい練習記録を追加しましょう</p>
              <button
                onClick={handleCreateEvent}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                新しい練習記録
              </button>
            </div>
          ) : (
            <div>
              <div className="space-y-4 mb-6">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/community/${communityId}/events/${event.id}`}
                    className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                          {getEventTypeIcon(event.eventType)}
                          <span className="ml-1">{getEventTypeLabel(event.eventType)}</span>
                        </span>
                        <h3 className="font-semibold text-gray-900">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      {event.maxParticipants && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          定員 {event.maxParticipants}名
                        </div>
                      )}
                    </div>

                    {event.eventType === EventType.PRACTICE && event.practiceCardIds && event.practiceCardIds.length > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs">
                          練習カード {event.practiceCardIds.length}枚
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  onClick={handleCreateEvent}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新しいイベントを追加
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}