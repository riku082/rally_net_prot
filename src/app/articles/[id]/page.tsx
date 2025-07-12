'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import { Article } from '@/types/article';
import { FiArrowLeft, FiClock, FiUser, FiCalendar, FiTag, FiStar } from 'react-icons/fi';
import Link from 'next/link';

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ params }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setArticleId(unwrappedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/${articleId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '記事の取得に失敗しました');
        }

        setArticle(data.article);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'news': 'ニュース',
      'tips': 'テクニック',
      'strategy': '戦略',
      'equipment': '用具',
      'tournament': '大会',
      'interview': 'インタビュー'
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'news': 'bg-theme-primary-100 text-theme-primary-800',
      'tips': 'bg-green-100 text-green-800',
      'strategy': 'bg-purple-100 text-purple-800',
      'equipment': 'bg-orange-100 text-orange-800',
      'tournament': 'bg-red-100 text-red-800',
      'interview': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  const formatContent = (content: string) => {
    // Markdownライクなコンテンツを簡単にHTMLに変換
    return content
      .split('\n')
      .map((line, index) => {
        // 見出し
        if (line.startsWith('# ')) {
          return `<h1 key="${index}" class="text-3xl font-bold text-gray-900 mb-6 mt-8">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 key="${index}" class="text-2xl font-bold text-gray-800 mb-4 mt-6">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 key="${index}" class="text-xl font-bold text-gray-700 mb-3 mt-5">${line.substring(4)}</h3>`;
        }
        
        // 強調
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
        
        // リスト
        if (line.startsWith('- ')) {
          return `<li key="${index}" class="ml-4 mb-2">${boldText.substring(2)}</li>`;
        }
        if (/^\d+\./.test(line)) {
          return `<li key="${index}" class="ml-4 mb-2">${boldText.substring(line.indexOf('.') + 1).trim()}</li>`;
        }
        
        // 引用
        if (line.startsWith('> ')) {
          return `<blockquote key="${index}" class="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 text-gray-700 italic mb-4">${boldText.substring(2)}</blockquote>`;
        }
        
        // 空行
        if (line.trim() === '') {
          return '<br>';
        }
        
        // 通常のテキスト
        return `<p key="${index}" class="mb-4 leading-relaxed text-gray-700">${boldText}</p>`;
      })
      .join('');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/news" />
        <MobileNav activePath="/news" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="h-64 bg-gray-200 rounded mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/news" />
        <MobileNav activePath="/news" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">記事が見つかりません</h1>
                <p className="text-gray-600 mb-6">{error || '指定された記事は存在しません。'}</p>
                <Link href="/news" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FiArrowLeft className="mr-2" />
                  記事一覧に戻る
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePath="/news" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto px-2 sm:px-0">
            {/* ナビゲーション */}
            <div className="mb-6">
              <Link href="/news" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-theme-primary-600 transition-colors">
                <FiArrowLeft className="mr-2 h-4 w-4" />
                記事一覧に戻る
              </Link>
            </div>

            {/* 記事本体 */}
            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* ヘッダー画像 */}
              <div className="relative h-64 md:h-80">
                <img 
                  src={article.thumbnail} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </span>
                    {article.featured && (
                      <span className="flex items-center px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                        <FiStar className="w-4 h-4 mr-1" />
                        注目記事
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 記事内容 */}
              <div className="p-4 sm:p-6 md:p-8">
                {/* タイトル */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  {article.title}
                </h1>

                {/* サブタイトル */}
                {article.subtitle && (
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {article.subtitle}
                  </p>
                )}

                {/* メタ情報 */}
                <div className="flex flex-wrap items-center gap-6 py-4 border-y border-gray-200 mb-8">
                  <div className="flex items-center text-gray-600">
                    <FiUser className="w-4 h-4 mr-2" />
                    <span className="font-medium">{article.author}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span>{new Date(article.publishedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiClock className="w-4 h-4 mr-2" />
                    <span>{article.readTime}分で読める</span>
                  </div>
                </div>

                {/* 記事本文 */}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
                />

                {/* タグ */}
                {article.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">タグ</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span key={index} className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                          <FiTag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArticlePage;