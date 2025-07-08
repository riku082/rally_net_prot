'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleMetadata } from '@/types/article';
import { FiClock, FiUser, FiTag, FiStar } from 'react-icons/fi';

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/articles');
        const data = await response.json();
        
        if (data.success) {
          setArticles(data.articles);
        } else {
          setError('記事の取得に失敗しました');
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('記事の取得中にエラーが発生しました');
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4 mb-6">
              <div className="w-32 h-24 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="flex space-x-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">バドミントン記事</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">バドミントン記事</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {articles.length}件の記事
        </span>
      </div>
      
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">現在表示できる記事がありません。</p>
        </div>
      ) : (
        <div className="space-y-8">
          {articles.map((article) => (
            <Link key={article.id} href={`/articles/${article.id}`}>
              <article className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 pb-8 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 rounded-lg p-4 transition-all duration-200 cursor-pointer group">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img 
                      src={article.thumbnail} 
                      alt={article.title}
                      className="w-full md:w-40 h-32 object-cover rounded-lg group-hover:shadow-lg transition-shadow"
                    />
                    {article.featured && (
                      <div className="absolute top-2 left-2">
                        <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 shadow-sm">
                          <FiStar className="w-3 h-3 mr-1" />
                          注目
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <FiUser className="w-4 h-4 mr-1" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        <span>{article.readTime}分で読める</span>
                      </div>
                    </div>
                    <time dateTime={article.publishedAt} className="font-medium">
                      {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                    </time>
                  </div>
                  
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {article.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
                          <FiTag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;