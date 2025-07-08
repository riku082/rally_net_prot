import { NextResponse } from 'next/server';
import { sampleArticles } from '@/data/sampleArticles';
import { ArticleMetadata } from '@/types/article';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    let filteredArticles = sampleArticles.filter(article => article.status === 'published');

    // 注目記事フィルター
    if (featured === 'true') {
      filteredArticles = filteredArticles.filter(article => article.featured);
    }

    // カテゴリフィルター
    if (category) {
      filteredArticles = filteredArticles.filter(article => article.category === category);
    }

    // 公開日順でソート（新しい順）
    filteredArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // 件数制限
    if (limit) {
      const limitNum = parseInt(limit);
      filteredArticles = filteredArticles.slice(0, limitNum);
    }

    // メタデータのみを返す（記事一覧表示用）
    const articleMetadata: ArticleMetadata[] = filteredArticles.map(article => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      author: article.author,
      category: article.category,
      thumbnail: article.thumbnail,
      publishedAt: article.publishedAt,
      featured: article.featured,
      readTime: article.readTime,
      tags: article.tags
    }));

    return NextResponse.json({
      success: true,
      articles: articleMetadata,
      total: articleMetadata.length
    });

  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch articles',
        articles: []
      },
      { status: 500 }
    );
  }
}