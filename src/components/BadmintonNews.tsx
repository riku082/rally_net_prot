'use client';

import React, { useState, useEffect } from 'react';
import { FiExternalLink, FiRss, FiImage } from 'react-icons/fi';

interface NewsArticle {
  title: string;
  source: { name: string };
  publishedAt: string;
  description: string;
  url: string;
  urlToImage?: string; // サムネイル画像のURL
}

const BadmintonNews: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/badminton-news');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'ニュースの取得に失敗しました。');
        }
        
        setNews(data.articles || data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました。';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <div className="flex items-center mb-8">
        <FiRss className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-3xl font-bold text-gray-800">リアルタイム バドミントンニュース</h2>
      </div>

      {loading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ニュースを読み込んでいます...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-semibold">エラーが発生しました</p>
          <p className="text-red-500 mt-2">{error}</p>
          <p className="text-xs text-gray-500 mt-4">APIキーが正しく設定されているか、開発サーバーを再起動したかをご確認ください。</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {news.length > 0 ? (
            news.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start bg-white p-4 rounded-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                <div className="w-full md:w-1/3 lg:w-1/4 h-48 md:h-auto md:aspect-w-16 md:aspect-h-9 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  {item.urlToImage ? (
                    <img 
                      src={item.urlToImage} 
                      alt={item.title} 
                      className="w-full h-full object-cover rounded-md shadow-md"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                    />
                  ) : null}
                  <div className={`${item.urlToImage ? 'hidden' : ''} w-full h-full bg-gray-100 flex items-center justify-center rounded-md`}>
                    <FiImage className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-700 transition-colors">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{item.source.name}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm">{item.description || '説明はありません。'}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    記事を読む <FiExternalLink className="ml-1.5" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">ニュース記事が見つかりませんでした。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BadmintonNews;
