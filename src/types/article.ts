export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  summary: string;
  author: string;
  category: 'news' | 'tips' | 'strategy' | 'equipment' | 'tournament' | 'interview';
  tags: string[];
  thumbnail: string;
  publishedAt: string;
  updatedAt?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean; // 注目記事フラグ
  readTime: number; // 読了時間（分）
  viewCount?: number; // 閲覧数
}

export interface ArticleMetadata {
  id: string;
  title: string;
  summary: string;
  author: string;
  category: string;
  thumbnail: string;
  publishedAt: string;
  featured: boolean;
  readTime: number;
  tags: string[];
}