import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
  
  // APIキーが設定されていない場合はモックデータを返す
  if (!apiKey || apiKey === 'your_api_key_here') {
    const mockNews = [
      {
        title: 'バドミントン日本代表、世界選手権で好成績',
        source: { name: 'スポーツニュース' },
        publishedAt: '2024-01-15T10:00:00Z',
        description: '日本バドミントン代表が世界選手権で素晴らしい成績を収めました。選手たちの活躍により、日本のバドミントン界に新たな希望が生まれています。',
        url: 'https://example.com/news1'
      },
      {
        title: 'バドミントン技術向上のための新しい練習法',
        source: { name: 'バドミントン専門誌' },
        publishedAt: '2024-01-14T15:30:00Z',
        description: '最新のバドミントン技術向上のための練習法が紹介されています。初心者から上級者まで、レベルに応じた効果的な練習方法を解説します。',
        url: 'https://example.com/news2'
      },
      {
        title: 'バドミントン大会の開催情報',
        source: { name: '大会事務局' },
        publishedAt: '2024-01-13T09:15:00Z',
        description: '今月開催予定のバドミントン大会の詳細情報をお知らせします。参加希望の方はお早めにお申し込みください。',
        url: 'https://example.com/news3'
      }
    ];
    
    return NextResponse.json({ articles: mockNews });
  }

  const url = `https://newsapi.org/v2/everything?q=バドミントン&language=ja&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok') {
      return NextResponse.json({ articles: data.articles });
    } else {
      return NextResponse.json({ error: 'ニュースの取得に失敗しました' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'ニュースの取得に失敗しました' }, { status: 500 });
  }
} 