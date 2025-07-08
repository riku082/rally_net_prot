import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'News API key is not configured.' },
      { status: 500 }
    );
  }

  const query = 'バドミントン';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=jp&sortBy=publishedAt&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('NewsAPI Error:', errorData);
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data.articles);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
