'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft, Users } from 'lucide-react';
import { Community } from '@/types/community';

interface CommunityHeaderProps {
  community: Community;
  memberRole: string;
  currentTab: 'home' | 'events' | 'members' | 'settings';
}

export default function CommunityHeader({ 
  community, 
  memberRole,
  currentTab
}: CommunityHeaderProps) {
  const communityId = community.id;

  return (
    <>
      {/* ヘッダー画像 */}
      {community.headerImageUrl ? (
        <div className="relative h-64 md:h-80 -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
          <img
            src={community.headerImageUrl}
            alt={`${community.name}のヘッダー画像`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {community.name}
            </h1>
            {community.description && (
              <p className="text-lg opacity-90">{community.description}</p>
            )}
          </div>
          <Link
            href="/community"
            className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">一覧へ</span>
          </Link>
          {(memberRole === 'owner' || memberRole === 'admin') && (
            <Link
              href={`/community/${communityId}/settings`}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div className="flex items-start mb-3 sm:mb-0">
              <Link
                href="/community"
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 sm:gap-2"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">一覧へ</span>
              </Link>
            </div>
            
            <div className="flex-1 sm:mx-4">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 break-words overflow-hidden">
                {community.name}
              </h1>
              {community.description && (
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-0 break-words overflow-hidden line-clamp-3 sm:line-clamp-none">{community.description}</p>
              )}
              <div className="mt-2 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                  {community.memberCount || 0} メンバー
                </span>
                <span className="hidden sm:inline">
                  {community.isPublic ? '公開コミュニティ' : '非公開コミュニティ'}
                </span>
                {community.location && (
                  <span className="hidden sm:inline">{community.location}</span>
                )}
                {community.category && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-100 text-xs">
                    {community.category === 'beginner' ? '初心者向け' :
                     community.category === 'intermediate' ? '中級者向け' :
                     community.category === 'advanced' ? '上級者向け' :
                     community.category === 'mixed' ? 'レベル混合' :
                     community.category === 'competitive' ? '競技志向' :
                     community.category === 'casual' ? 'カジュアル' :
                     community.category === 'junior' ? 'ジュニア' :
                     community.category === 'senior' ? 'シニア' : community.category}
                  </span>
                )}
              </div>
            </div>
            
            {(memberRole === 'owner' || memberRole === 'admin') && (
              <Link
                href={`/community/${communityId}/settings`}
                className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ナビゲーションタブ - モバイル対応 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <div className="flex border-b border-gray-200 min-w-max">
          <Link
            href={`/community/${communityId}`}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
              currentTab === 'home'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900 transition-colors'
            }`}
          >
            ホーム
          </Link>
          <Link
            href={`/community/${communityId}/events`}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
              currentTab === 'events'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900 transition-colors'
            }`}
          >
            イベント
          </Link>
          <Link
            href={`/community/${communityId}/members`}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
              currentTab === 'members'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900 transition-colors'
            }`}
          >
            メンバー
          </Link>
          {(memberRole === 'owner' || memberRole === 'admin') && (
            <Link
              href={`/community/${communityId}/settings`}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
                currentTab === 'settings'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900 transition-colors'
              }`}
            >
              設定
            </Link>
          )}
        </div>
      </div>
    </>
  );
}