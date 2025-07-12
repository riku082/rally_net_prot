import { Tournament } from '@/types/tournament';

// サンプルの大会情報を生成する関数（実際のスクレイピングの代替）
export class TournamentScraper {
  
  // 模擬的なデータソース（実際の実装では各サイトからスクレイピング）
  private static mockTournaments: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: '第45回東京都バドミントン選手権大会',
      date: '2024-08-15',
      location: '東京体育館',
      region: '東京都',
      level: 'advanced',
      category: 'singles',
      registrationDeadline: '2024-07-25',
      fee: 3000,
      maxParticipants: 128,
      organizerInfo: {
        name: '東京都バドミントン協会',
        contact: 'info@tokyo-badminton.jp',
        website: 'https://tokyo-badminton.jp'
      },
      description: '東京都内最大級のバドミントン選手権大会。男女シングルス、各年代別に開催。',
      isOfficial: true,
      sourceUrl: 'https://tokyo-badminton.jp/tournament/2024/championship'
    },
    {
      title: '夏季オープンバドミントン大会',
      date: '2024-07-28',
      location: '神奈川県立体育センター',
      region: '神奈川県',
      level: 'all',
      category: 'doubles',
      registrationDeadline: '2024-07-20',
      fee: 2500,
      maxParticipants: 64,
      organizerInfo: {
        name: '神奈川バドミントンクラブ連盟',
        contact: '045-123-4567'
      },
      description: 'どなたでも参加可能なオープン大会。ダブルス戦でペア参加必須。',
      isOfficial: false,
      sourceUrl: 'https://kanagawa-badminton.org/open2024'
    },
    {
      title: '初心者向けバドミントン体験大会',
      date: '2024-08-03',
      location: '埼玉県所沢市民体育館',
      region: '埼玉県',
      level: 'beginner',
      category: 'mixed',
      registrationDeadline: '2024-07-30',
      fee: 1000,
      maxParticipants: 32,
      organizerInfo: {
        name: '所沢バドミントンサークル',
        contact: 'tokorozawa.badminton@gmail.com'
      },
      description: 'バドミントン初心者・未経験者歓迎の体験大会。用具貸出あり。',
      isOfficial: false,
      sourceUrl: 'https://tokorozawa-sports.com/event/badminton2024'
    },
    {
      title: '関東学生バドミントン選手権',
      date: '2024-08-10',
      location: '千葉ポートアリーナ',
      region: '千葉県',
      level: 'advanced',
      category: 'team',
      registrationDeadline: '2024-07-15',
      fee: 5000,
      organizerInfo: {
        name: '関東学生バドミントン連盟',
        contact: 'kanto.student.badminton@gmail.com',
        website: 'https://kanto-student-badminton.jp'
      },
      description: '関東地区の大学生を対象とした団体戦。各大学から代表チームが参加。',
      isOfficial: true,
      sourceUrl: 'https://kanto-student-badminton.jp/championship/2024'
    },
    {
      title: '第30回市民バドミントン大会',
      date: '2024-07-21',
      location: '群馬県前橋市総合スポーツセンター',
      region: '群馬県',
      level: 'intermediate',
      category: 'doubles',
      registrationDeadline: '2024-07-18',
      fee: 1500,
      maxParticipants: 48,
      organizerInfo: {
        name: '前橋市体育協会',
        contact: '027-234-5678'
      },
      description: '前橋市民を対象としたダブルス大会。中級者レベル推奨。',
      isOfficial: false,
      sourceUrl: 'https://maebashi-sports.jp/tournament/badminton2024'
    },
    {
      title: 'ジュニアバドミントンカップ',
      date: '2024-08-25',
      location: '栃木県宇都宮市体育館',
      region: '栃木県',
      level: 'beginner',
      category: 'singles',
      registrationDeadline: '2024-08-10',
      fee: 800,
      maxParticipants: 40,
      organizerInfo: {
        name: '栃木県ジュニアバドミントン協会',
        contact: 'tochigi.junior.bad@gmail.com'
      },
      description: '小中学生を対象としたジュニア大会。年齢別カテゴリあり。',
      isOfficial: true,
      sourceUrl: 'https://tochigi-junior-badminton.jp/cup2024'
    }
  ];

  /**
   * 地域に基づいて大会情報を取得
   */
  static async getTournamentsByRegion(region?: string): Promise<Tournament[]> {
    // 実際の実装では、ここで各バドミントン協会のサイトをスクレイピング
    // 現在はモックデータを使用
    
    let tournaments = this.mockTournaments;
    
    // 地域フィルタリング
    if (region) {
      tournaments = tournaments.filter(t => 
        t.region.includes(region) || t.title.includes(region)
      );
    }

    // 日付でソート（近い順）
    tournaments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // IDとタイムスタンプを追加
    return tournaments.map((tournament, index) => ({
      ...tournament,
      id: `tournament_${Date.now()}_${index}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
  }

  /**
   * 全ての大会情報を取得
   */
  static async getAllTournaments(): Promise<Tournament[]> {
    return this.getTournamentsByRegion();
  }

  /**
   * 近日開催の大会を取得
   */
  static async getUpcomingTournaments(limit: number = 5): Promise<Tournament[]> {
    const tournaments = await this.getAllTournaments();
    const now = new Date();
    
    return tournaments
      .filter(tournament => new Date(tournament.date) >= now)
      .slice(0, limit);
  }

  /**
   * 申込締切が近い大会を取得
   */
  static async getDeadlineSoonTournaments(): Promise<Tournament[]> {
    const tournaments = await this.getAllTournaments();
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return tournaments.filter(tournament => {
      if (!tournament.registrationDeadline) return false;
      const deadline = new Date(tournament.registrationDeadline);
      return deadline >= now && deadline <= oneWeekFromNow;
    });
  }

  /**
   * 実際のスクレイピング実装用のプレースホルダー
   * 本番環境では以下のようなサイトからデータを取得
   */
  private static async scrapeOfficialSites(): Promise<Tournament[]> {
    // 実装例：
    // - 日本バドミントン協会: https://www.badminton.or.jp/
    // - 各都道府県バドミントン協会
    // - 地域のスポーツセンター情報
    
    // Puppeteer または Playwright を使用してスクレイピング
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.goto('https://www.badminton.or.jp/tournament');
    // const tournaments = await page.evaluate(() => {
    //   // DOM操作でデータを抽出
    // });
    // await browser.close();
    
    return [];
  }
}