'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiRss, FiArrowRight, FiStar, FiClock } from 'react-icons/fi';
import { ArticleMetadata } from '@/types/article';

const TopNewsPanel: React.FC = () => {
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles?limit=3');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '記事の取得に失敗しました。');
        }
        
        setArticles(data.articles || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました。';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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
      'news': 'bg-blue-100 text-blue-800',
      'tips': 'bg-green-100 text-green-800',
      'strategy': 'bg-purple-100 text-purple-800',
      'equipment': 'bg-orange-100 text-orange-800',
      'tournament': 'bg-red-100 text-red-800',
      'interview': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-sm text-red-500 py-4">エラー: {error}</div>;
    }

    if (articles.length === 0) {
      return <div className="text-center text-sm text-gray-500 py-4">記事がありません。</div>;
    }

    return (
      <div className="space-y-5">
        {articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.id}`}>
            <div className="group cursor-pointer border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <img 
                  src={article.thumbnail} 
                  alt={article.title}
                  className="w-16 h-12 object-cover rounded-md flex-shrink-0 group-hover:shadow-md transition-shadow"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </span>
                    {article.featured && (
                      <FiStar className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                    {article.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <div className="flex items-center space-x-2">
                      <span>{article.author}</span>
                      <span className="flex items-center">
                        <FiClock className="w-3 h-3 mr-1" />
                        {article.readTime}分
                      </span>
                    </div>
                    <span>{new Date(article.publishedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex items-center mb-4">
        <FiRss className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">最新記事</h3>
      </div>
      <div className="flex-grow">
        {renderContent()}
      </div>
      <div className="mt-4 text-right">
        <Link href="/news" className="inline-flex items-center font-medium text-sm text-blue-600 hover:text-blue-800 transition-colors">
          もっと見る <FiArrowRight className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default TopNewsPanel;