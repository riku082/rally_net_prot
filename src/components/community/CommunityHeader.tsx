'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft, Users } from 'lucide-react';
import { Community } from '@/types/community';

interface CommunityHeaderProps {
  community: Community;
  memberRole: string;
  currentTab: 'home' | 'calendar' | 'events' | 'members' | 'settings';
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <Link
              href="/community"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">一覧へ</span>
            </Link>
            <div className="flex-1 mx-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {community.name}
              </h1>
              {community.description && (
                <p className="text-gray-600">{community.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {community.memberCount || 0} メンバー
                </span>
                <span>
                  {community.isPublic ? '公開コミュニティ' : '非公開コミュニティ'}
                </span>
                {community.location && (
                  <span>{community.location}</span>
                )}
                {community.category && (
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
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
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ナビゲーションタブ */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <Link
            href={`/community/${communityId}`}
            className={`px-6 py-3 text-sm font-medium ${
              currentTab === 'home'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900 transition-colors'
            }`}
          >
            ホーム
          </Link>
          <Link
            href={`/community/${communityId}/calendar`}
            className={`px-6 py-3 text-sm font-medium ${
              currentTab === 'calendar'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900 transition-colors'
            }`}
          >
            カレンダー
          </Link>
          <Link
            href={`/community/${communityId}/events`}
            className={`px-6 py-3 text-sm font-medium ${
              currentTab === 'events'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900 transition-colors'
            }`}
          >
            イベント一覧
          </Link>
          <Link
            href={`/community/${communityId}/members`}
            className={`px-6 py-3 text-sm font-medium ${
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
              className={`px-6 py-3 text-sm font-medium ${
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