export interface RegionHierarchy {
  prefecture: string;
  region: string;
  area: string;
  neighbors: string[];
}

export const REGION_HIERARCHY: Record<string, RegionHierarchy> = {
  // 北海道地方
  '北海道': {
    prefecture: '北海道',
    region: '北海道地方',
    area: '北海道',
    neighbors: ['青森県']
  },

  // 東北地方
  '青森県': {
    prefecture: '青森県',
    region: '東北地方',
    area: '北東北',
    neighbors: ['北海道', '岩手県', '秋田県']
  },
  '岩手県': {
    prefecture: '岩手県',
    region: '東北地方',
    area: '北東北',
    neighbors: ['青森県', '秋田県', '宮城県']
  },
  '秋田県': {
    prefecture: '秋田県',
    region: '東北地方',
    area: '北東北',
    neighbors: ['青森県', '岩手県', '宮城県', '山形県']
  },
  '宮城県': {
    prefecture: '宮城県',
    region: '東北地方',
    area: '南東北',
    neighbors: ['岩手県', '秋田県', '山形県', '福島県']
  },
  '山形県': {
    prefecture: '山形県',
    region: '東北地方',
    area: '南東北',
    neighbors: ['秋田県', '宮城県', '福島県', '新潟県']
  },
  '福島県': {
    prefecture: '福島県',
    region: '東北地方',
    area: '南東北',
    neighbors: ['宮城県', '山形県', '新潟県', '群馬県', '栃木県', '茨城県']
  },

  // 関東地方
  '茨城県': {
    prefecture: '茨城県',
    region: '関東地方',
    area: '北関東',
    neighbors: ['福島県', '栃木県', '埼玉県', '千葉県']
  },
  '栃木県': {
    prefecture: '栃木県',
    region: '関東地方',
    area: '北関東',
    neighbors: ['福島県', '茨城県', '群馬県', '埼玉県']
  },
  '群馬県': {
    prefecture: '群馬県',
    region: '関東地方',
    area: '北関東',
    neighbors: ['福島県', '新潟県', '長野県', '埼玉県', '栃木県']
  },
  '埼玉県': {
    prefecture: '埼玉県',
    region: '関東地方',
    area: '南関東',
    neighbors: ['茨城県', '栃木県', '群馬県', '長野県', '山梨県', '東京都', '千葉県']
  },
  '千葉県': {
    prefecture: '千葉県',
    region: '関東地方',
    area: '南関東',
    neighbors: ['茨城県', '埼玉県', '東京都']
  },
  '東京都': {
    prefecture: '東京都',
    region: '関東地方',
    area: '南関東',
    neighbors: ['埼玉県', '千葉県', '神奈川県', '山梨県']
  },
  '神奈川県': {
    prefecture: '神奈川県',
    region: '関東地方',
    area: '南関東',
    neighbors: ['東京都', '山梨県', '静岡県']
  },

  // 中部地方
  '新潟県': {
    prefecture: '新潟県',
    region: '中部地方',
    area: '北陸',
    neighbors: ['山形県', '福島県', '群馬県', '長野県', '富山県']
  },
  '富山県': {
    prefecture: '富山県',
    region: '中部地方',
    area: '北陸',
    neighbors: ['新潟県', '長野県', '岐阜県', '石川県']
  },
  '石川県': {
    prefecture: '石川県',
    region: '中部地方',
    area: '北陸',
    neighbors: ['富山県', '岐阜県', '福井県']
  },
  '福井県': {
    prefecture: '福井県',
    region: '中部地方',
    area: '北陸',
    neighbors: ['石川県', '岐阜県', '滋賀県', '京都府']
  },
  '山梨県': {
    prefecture: '山梨県',
    region: '中部地方',
    area: '甲信越',
    neighbors: ['埼玉県', '東京都', '神奈川県', '静岡県', '長野県']
  },
  '長野県': {
    prefecture: '長野県',
    region: '中部地方',
    area: '甲信越',
    neighbors: ['群馬県', '埼玉県', '山梨県', '静岡県', '愛知県', '岐阜県', '富山県', '新潟県']
  },
  '岐阜県': {
    prefecture: '岐阜県',
    region: '中部地方',
    area: '東海',
    neighbors: ['富山県', '石川県', '福井県', '滋賀県', '愛知県', '長野県']
  },
  '静岡県': {
    prefecture: '静岡県',
    region: '中部地方',
    area: '東海',
    neighbors: ['神奈川県', '山梨県', '長野県', '愛知県']
  },
  '愛知県': {
    prefecture: '愛知県',
    region: '中部地方',
    area: '東海',
    neighbors: ['長野県', '岐阜県', '静岡県', '三重県']
  },

  // 近畿地方
  '三重県': {
    prefecture: '三重県',
    region: '近畿地方',
    area: '近畿',
    neighbors: ['愛知県', '岐阜県', '滋賀県', '京都府', '奈良県', '和歌山県']
  },
  '滋賀県': {
    prefecture: '滋賀県',
    region: '近畿地方',
    area: '近畿',
    neighbors: ['福井県', '岐阜県', '三重県', '京都府']
  },
  '京都府': {
    prefecture: '京都府',
    region: '近畿地方',
    area: '近畿',
    neighbors: ['福井県', '滋賀県', '三重県', '奈良県', '大阪府', '兵庫県']
  },
  '大阪府': {
    prefecture: '大阪府',
    region: '近畿地方',
    area: '近畿',
    neighbors: ['京都府', '奈良県', '和歌山県', '兵庫県']
  },
  '兵庫県': {
    prefecture: '兵庫県',
    region: '近畿地方',
    area: '近畿',
    neighbors: ['京都府', '大阪府', '岡山県', '鳥取県']
  },
  '奈良県': {
    prefecture: '奈良県',
    region: '近畿地方',
    area: '近畿',
    neighbors: ['三重県', '京都府', '大阪府', '和歌山県']
  },
  '和歌山県': {
    prefecture: '和歌山県',
    region: '近畿地方',
    area: '近畿',
    neighbors: ['三重県', '奈良県', '大阪府']
  },

  // 中国地方
  '鳥取県': {
    prefecture: '鳥取県',
    region: '中国地方',
    area: '山陰',
    neighbors: ['兵庫県', '岡山県', '島根県']
  },
  '島根県': {
    prefecture: '島根県',
    region: '中国地方',
    area: '山陰',
    neighbors: ['鳥取県', '岡山県', '広島県', '山口県']
  },
  '岡山県': {
    prefecture: '岡山県',
    region: '中国地方',
    area: '山陽',
    neighbors: ['兵庫県', '鳥取県', '島根県', '広島県']
  },
  '広島県': {
    prefecture: '広島県',
    region: '中国地方',
    area: '山陽',
    neighbors: ['島根県', '岡山県', '山口県', '愛媛県']
  },
  '山口県': {
    prefecture: '山口県',
    region: '中国地方',
    area: '山陽',
    neighbors: ['島根県', '広島県', '福岡県', '大分県']
  },

  // 四国地方
  '徳島県': {
    prefecture: '徳島県',
    region: '四国地方',
    area: '四国',
    neighbors: ['兵庫県', '香川県', '愛媛県', '高知県']
  },
  '香川県': {
    prefecture: '香川県',
    region: '四国地方',
    area: '四国',
    neighbors: ['岡山県', '徳島県', '愛媛県']
  },
  '愛媛県': {
    prefecture: '愛媛県',
    region: '四国地方',
    area: '四国',
    neighbors: ['広島県', '山口県', '徳島県', '香川県', '高知県', '大分県']
  },
  '高知県': {
    prefecture: '高知県',
    region: '四国地方',
    area: '四国',
    neighbors: ['徳島県', '愛媛県']
  },

  // 九州地方
  '福岡県': {
    prefecture: '福岡県',
    region: '九州地方',
    area: '北九州',
    neighbors: ['山口県', '佐賀県', '熊本県', '大分県']
  },
  '佐賀県': {
    prefecture: '佐賀県',
    region: '九州地方',
    area: '北九州',
    neighbors: ['福岡県', '長崎県', '熊本県']
  },
  '長崎県': {
    prefecture: '長崎県',
    region: '九州地方',
    area: '北九州',
    neighbors: ['佐賀県', '熊本県']
  },
  '熊本県': {
    prefecture: '熊本県',
    region: '九州地方',
    area: '南九州',
    neighbors: ['福岡県', '佐賀県', '長崎県', '大分県', '宮崎県', '鹿児島県']
  },
  '大分県': {
    prefecture: '大分県',
    region: '九州地方',
    area: '南九州',
    neighbors: ['山口県', '愛媛県', '福岡県', '熊本県', '宮崎県']
  },
  '宮崎県': {
    prefecture: '宮崎県',
    region: '九州地方',
    area: '南九州',
    neighbors: ['熊本県', '大分県', '鹿児島県']
  },
  '鹿児島県': {
    prefecture: '鹿児島県',
    region: '九州地方',
    area: '南九州',
    neighbors: ['熊本県', '宮崎県', '沖縄県']
  },
  '沖縄県': {
    prefecture: '沖縄県',
    region: '沖縄地方',
    area: '沖縄',
    neighbors: ['鹿児島県']
  }
};

export function getRegionDistance(region1: string, region2: string): number {
  if (region1 === region2) return 0;
  
  const hierarchy1 = REGION_HIERARCHY[region1];
  const hierarchy2 = REGION_HIERARCHY[region2];
  
  if (!hierarchy1 || !hierarchy2) return Infinity;
  
  // 隣接している場合
  if (hierarchy1.neighbors.includes(region2)) return 1;
  
  // 同じエリア内の場合
  if (hierarchy1.area === hierarchy2.area) return 2;
  
  // 同じ地方内の場合
  if (hierarchy1.region === hierarchy2.region) return 3;
  
  // 異なる地方の場合、地方間の距離を計算
  const regionDistances: Record<string, Record<string, number>> = {
    '北海道地方': {
      '東北地方': 4, '関東地方': 5, '中部地方': 6, '近畿地方': 7, 
      '中国地方': 8, '四国地方': 9, '九州地方': 10, '沖縄地方': 11
    },
    '東北地方': {
      '北海道地方': 4, '関東地方': 4, '中部地方': 5, '近畿地方': 6,
      '中国地方': 7, '四国地方': 8, '九州地方': 9, '沖縄地方': 10
    },
    '関東地方': {
      '北海道地方': 5, '東北地方': 4, '中部地方': 4, '近畿地方': 5,
      '中国地方': 6, '四国地方': 7, '九州地方': 8, '沖縄地方': 9
    },
    '中部地方': {
      '北海道地方': 6, '東北地方': 5, '関東地方': 4, '近畿地方': 4,
      '中国地方': 5, '四国地方': 6, '九州地方': 7, '沖縄地方': 8
    },
    '近畿地方': {
      '北海道地方': 7, '東北地方': 6, '関東地方': 5, '中部地方': 4,
      '中国地方': 4, '四国地方': 4, '九州地方': 5, '沖縄地方': 6
    },
    '中国地方': {
      '北海道地方': 8, '東北地方': 7, '関東地方': 6, '中部地方': 5,
      '近畿地方': 4, '四国地方': 4, '九州地方': 4, '沖縄地方': 5
    },
    '四国地方': {
      '北海道地方': 9, '東北地方': 8, '関東地方': 7, '中部地方': 6,
      '近畿地方': 4, '中国地方': 4, '九州地方': 4, '沖縄地方': 5
    },
    '九州地方': {
      '北海道地方': 10, '東北地方': 9, '関東地方': 8, '中部地方': 7,
      '近畿地方': 5, '中国地方': 4, '四国地方': 4, '沖縄地方': 4
    },
    '沖縄地方': {
      '北海道地方': 11, '東北地方': 10, '関東地方': 9, '中部地方': 8,
      '近畿地方': 6, '中国地方': 5, '四国地方': 5, '九州地方': 4
    }
  };
  
  return regionDistances[hierarchy1.region]?.[hierarchy2.region] || Infinity;
}

export function getNearbyRegions(region: string, maxDistance: number = 3): string[] {
  const allRegions = Object.keys(REGION_HIERARCHY);
  const nearbyRegions: Array<{region: string, distance: number}> = [];
  
  for (const targetRegion of allRegions) {
    if (targetRegion === region) continue;
    
    const distance = getRegionDistance(region, targetRegion);
    if (distance <= maxDistance) {
      nearbyRegions.push({ region: targetRegion, distance });
    }
  }
  
  // 距離順でソート
  nearbyRegions.sort((a, b) => a.distance - b.distance);
  
  return nearbyRegions.map(r => r.region);
}

export function getAllRegions(): string[] {
  return Object.keys(REGION_HIERARCHY);
}