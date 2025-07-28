#!/usr/bin/env node

// API経由でテスト用公開練習カードを作成するスクリプト
const http = require('http');

// テスト用公開練習カードデータ
const samplePublicCards = [
  {
    title: "基礎スマッシュ練習",
    description: "初心者向けの基本的なスマッシュ練習です。正しいフォームとタイミングを身につけましょう。",
    drill: {
      id: "drill_smash_001",
      name: "基礎スマッシュ",
      description: "高い球をスマッシュで打ち返す練習",
      duration: 15,
      sets: 3,
      reps: 10,
      restTime: 60,
      skillCategory: "smash",
      notes: "腕の振りを意識してください"
    },
    difficulty: "beginner",
    equipment: ["シャトル", "ラケット"],
    courtInfo: {
      targetAreas: ["backcourt_center"],
      focusArea: "backcourt_center",
      courtType: "singles",
      notes: "後方のセンターエリアを中心に練習"
    },
    tags: ["スマッシュ", "基礎", "初心者", "攻撃"],
    isPublic: true,
    sharingSettings: {
      visibility: "public",
      allowComments: true,
      allowRating: true,
      allowCopy: true,
      allowModification: false
    },
    usageCount: 0,
    rating: 4.5,
    userRatings: [
      {
        userId: "demo_user_1",
        rating: 5,
        comment: "とても分かりやすい練習です",
        effectiveness: 5,
        createdAt: Date.now() - 86400000
      },
      {
        userId: "demo_user_2", 
        rating: 4,
        comment: "基礎練習に最適",
        effectiveness: 4,
        createdAt: Date.now() - 172800000
      }
    ],
    downloads: 25,
    favorites: 12,
    comments: [],
    category: "basic_technique",
    userId: "demo_user_creator",
    createdBy: "demo_user_creator",
    createdAt: Date.now() - 604800000, // 1週間前
    updatedAt: Date.now() - 604800000
  },
  {
    title: "ネットプレイ基礎",
    description: "ネット際での素早い反応とタッチを向上させる練習メニューです。",
    drill: {
      id: "drill_net_001",
      name: "ネット前ドロップ",
      description: "ネット前での繊細なタッチ練習",
      duration: 20,
      sets: 4,
      reps: 15,
      restTime: 45,
      skillCategory: "net_play",
      notes: "シャトルをそっと落とすように"
    },
    difficulty: "intermediate",
    equipment: ["シャトル", "ラケット"],
    courtInfo: {
      targetAreas: ["frontcourt_center", "frontcourt_left", "frontcourt_right"],
      focusArea: "frontcourt_center",
      courtType: "doubles",
      notes: "ネット際全体をカバー"
    },
    tags: ["ネットプレイ", "ドロップ", "中級", "技術"],
    isPublic: true,
    sharingSettings: {
      visibility: "public", 
      allowComments: true,
      allowRating: true,
      allowCopy: true,
      allowModification: true
    },
    usageCount: 0,
    rating: 4.2,
    userRatings: [
      {
        userId: "demo_user_3",
        rating: 4,
        comment: "ネット前が上達しました",
        effectiveness: 4,
        createdAt: Date.now() - 432000000
      }
    ],
    downloads: 18,
    favorites: 8,
    comments: [],
    category: "net_play",
    userId: "demo_user_creator_2",
    createdBy: "demo_user_creator_2", 
    createdAt: Date.now() - 432000000, // 5日前
    updatedAt: Date.now() - 432000000
  },
  {
    title: "フットワーク強化メニュー",
    description: "コート全体を動き回るフットワークの基礎から応用まで。体力と敏捷性を向上させます。",
    drill: {
      id: "drill_footwork_001",
      name: "4コーナーフットワーク", 
      description: "コートの4隅を移動するフットワーク練習",
      duration: 25,
      sets: 5,
      reps: 8,
      restTime: 90,
      skillCategory: "footwork",
      notes: "素早い切り返しを意識"
    },
    difficulty: "intermediate",
    equipment: ["コーン", "ラケット"],
    courtInfo: {
      targetAreas: ["full_court"],
      focusArea: "full_court",
      courtType: "singles",
      notes: "コート全体を使用"
    },
    tags: ["フットワーク", "体力", "敏捷性", "基礎"],
    isPublic: true,
    sharingSettings: {
      visibility: "public",
      allowComments: true, 
      allowRating: true,
      allowCopy: true,
      allowModification: false
    },
    usageCount: 0,
    rating: 4.7,
    userRatings: [
      {
        userId: "demo_user_4",
        rating: 5,
        comment: "かなりハードですが効果的",
        effectiveness: 5,
        createdAt: Date.now() - 259200000
      },
      {
        userId: "demo_user_5",
        rating: 4,
        comment: "体力向上に最適",
        effectiveness: 4,
        createdAt: Date.now() - 345600000
      }
    ],
    downloads: 32,
    favorites: 19,
    comments: [],
    category: "footwork",
    userId: "demo_user_creator_3",
    createdBy: "demo_user_creator_3",
    createdAt: Date.now() - 259200000, // 3日前
    updatedAt: Date.now() - 259200000
  },
  {
    title: "クリア練習・ロング基礎",
    description: "確実に後方に飛ばすクリアショットの練習。守備の基本となる重要な技術です。",
    drill: {
      id: "drill_clear_001", 
      name: "クリア連続練習",
      description: "後方への高いクリアを連続で打つ練習",
      duration: 18,
      sets: 3,
      reps: 12,
      restTime: 75,
      skillCategory: "clear",
      notes: "高さと飛距離を意識"
    },
    difficulty: "beginner",
    equipment: ["シャトル", "ラケット"],
    courtInfo: {
      targetAreas: ["backcourt_left", "backcourt_center", "backcourt_right"],
      focusArea: "backcourt_center",
      courtType: "singles",
      notes: "後方全体をターゲット"
    },
    tags: ["クリア", "守備", "基礎", "初心者"],
    isPublic: true,
    sharingSettings: {
      visibility: "public",
      allowComments: true,
      allowRating: true, 
      allowCopy: true,
      allowModification: true
    },
    usageCount: 0,
    rating: 4.3,
    userRatings: [
      {
        userId: "demo_user_6",
        rating: 4,
        comment: "クリアが安定しました",
        effectiveness: 4,
        createdAt: Date.now() - 518400000
      }
    ],
    downloads: 22,
    favorites: 11,
    comments: [],
    category: "basic_technique",
    userId: "demo_user_creator_4",
    createdBy: "demo_user_creator_4",
    createdAt: Date.now() - 518400000, // 6日前
    updatedAt: Date.now() - 518400000
  },
  {
    title: "ダブルス連携練習",
    description: "ペアとの連携を高めるダブルス特化練習。ローテーションとカバーリングを学びます。",
    drill: {
      id: "drill_doubles_001",
      name: "ダブルスローテーション",
      description: "前後・左右のローテーション練習",
      duration: 30,
      sets: 4,
      reps: 6,
      restTime: 120,
      skillCategory: "strategy",
      notes: "パートナーとの息を合わせる"
    },
    difficulty: "advanced",
    equipment: ["シャトル", "ラケット"],
    courtInfo: {
      targetAreas: ["full_court"],
      focusArea: "full_court", 
      courtType: "doubles",
      notes: "ダブルスコート全体"
    },
    tags: ["ダブルス", "連携", "戦術", "上級"],
    isPublic: true,
    sharingSettings: {
      visibility: "public",
      allowComments: true,
      allowRating: true,
      allowCopy: true,
      allowModification: false
    },
    usageCount: 0,
    rating: 4.8,
    userRatings: [
      {
        userId: "demo_user_7",
        rating: 5,
        comment: "ペアプレイが劇的に改善",
        effectiveness: 5,
        createdAt: Date.now() - 172800000
      },
      {
        userId: "demo_user_8",
        rating: 5,
        comment: "上級者にも効果的",
        effectiveness: 5,
        createdAt: Date.now() - 86400000
      }
    ],
    downloads: 41,
    favorites: 27,
    comments: [],
    category: "doubles_formation",
    userId: "demo_user_creator_5",
    createdBy: "demo_user_creator_5",
    createdAt: Date.now() - 172800000, // 2日前
    updatedAt: Date.now() - 172800000
  }
];

async function checkApiEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/practice-cards/public',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('API request timeout'));
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  console.log('🚀 公開練習カードAPI確認スクリプト開始\n');
  
  try {
    console.log('🔍 現在のAPIエンドポイントを確認中...');
    console.log('   GET http://localhost:3000/api/practice-cards/public');
    
    const result = await checkApiEndpoint();
    
    console.log(`📊 API応答: HTTP ${result.status}`);
    
    if (result.status === 200) {
      const cardCount = result.data.cards ? result.data.cards.length : 0;
      console.log(`✅ APIが正常に動作しています`);
      console.log(`📋 公開練習カード数: ${cardCount}件`);
      
      if (cardCount > 0) {
        console.log('\n📚 取得された公開練習カード:');
        result.data.cards.forEach((card, index) => {
          console.log(`${index + 1}. ${card.title} (難易度: ${card.difficulty}, 評価: ${card.rating || 'なし'})`);
        });
      } else {
        console.log('\n⚠️  APIは動作していますが、公開練習カードが0件です');
        console.log('    Firebaseに直接データを作成する必要があります');
      }
    } else {
      console.log(`❌ API応答エラー: ${result.status}`);
      console.log('応答内容:', result.data);
    }
    
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('❌ Next.jsアプリケーションが起動していません');
      console.log('   以下のコマンドでアプリを起動してください:');
      console.log('   npm run dev');
    } else if (error.message.includes('timeout')) {
      console.log('❌ API応答がタイムアウトしました');
      console.log('   アプリケーションの起動を確認してください');
    } else {
      console.log('❌ エラーが発生しました:', error.message);
    }
  }
  
  console.log('\n📝 次のステップ:');
  console.log('1. Next.jsアプリが起動していることを確認');
  console.log('2. http://localhost:3000/api/practice-cards/public をテスト');
  console.log('3. 必要に応じてFirebaseコンソールで直接データを追加');
  console.log('4. または、Firebase Admin SDKを使用した管理スクリプトを作成');
  
  console.log('\n✨ スクリプト実行完了');
}

// スクリプト実行
main().catch(error => {
  console.error('🚨 スクリプト実行エラー:', error);
  process.exit(1);
});