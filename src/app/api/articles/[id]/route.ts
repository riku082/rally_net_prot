import { NextResponse } from 'next/server';
import { sampleArticles } from '@/data/sampleArticles';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const article = sampleArticles.find(article => 
      article.id === id && article.status === 'published'
    );

    if (!article) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article not found' 
        },
        { status: 404 }
      );
    }

    // 閲覧数を増加（実際のプロダクションではデータベースを更新）
    article.viewCount = (article.viewCount || 0) + 1;

    return NextResponse.json({
      success: true,
      article: article
    });

  } catch (error) {
    console.error('Article API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch article' 
      },
      { status: 500 }
    );
  }
}