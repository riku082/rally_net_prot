'use client';

import React, { useEffect, useRef } from 'react';

interface RadarChartProps {
  data: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  maxValue?: number;
  size?: number;
  mobileSize?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, maxValue = 4, size = 350, mobileSize = 280 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const currentSize = isMobile ? mobileSize : size;

  // 4つの主要軸のデータを準備（優勢な特性のみ表示）
  const axes = [
    { 
      label: data.E > data.I ? '外向性' : '内向性', 
      value: data.E > data.I ? data.E : data.I,
      rawE: data.E,
      rawI: data.I
    },
    { 
      label: data.S > data.N ? '感覚' : '直観', 
      value: data.S > data.N ? data.S : data.N,
      rawS: data.S,
      rawN: data.N
    },
    { 
      label: data.T > data.F ? '思考' : '感情', 
      value: data.T > data.F ? data.T : data.F,
      rawT: data.T,
      rawF: data.F
    },
    { 
      label: data.J > data.P ? '判断' : '知覚', 
      value: data.J > data.P ? data.J : data.P,
      rawJ: data.J,
      rawP: data.P
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = currentSize / 2;
    const centerY = currentSize / 2;
    const radius = (currentSize - 140) / 2;

    const animate = () => {
      if (progressRef.current < 1) {
        progressRef.current += 0.02;
        draw(ctx, centerX, centerY, radius, progressRef.current);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        draw(ctx, centerX, centerY, radius, 1);
      }
    };

    // 初期化
    progressRef.current = 0;
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, currentSize, maxValue]);

  const draw = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, progress: number) => {
    ctx.clearRect(0, 0, currentSize, currentSize);

    // 背景グリッドを描画
    drawGrid(ctx, centerX, centerY, radius);

    // 軸ラベルを描画
    drawAxisLabels(ctx, centerX, centerY, radius);

    // データポリゴンを描画
    drawDataPolygon(ctx, centerX, centerY, radius, progress);

    // データポイントを描画
    drawDataPoints(ctx, centerX, centerY, radius, progress);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // 同心円を描画
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 軸線を描画
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();
    }
  };

  const drawAxisLabels = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.fillStyle = '#374151';
    const fontSize = isMobile ? 10 : 12;
    ctx.font = `${fontSize}px "Hiragino Kaku Gothic Pro", "ヒラギノ角ゴ Pro W3", "Meiryo", "メイリオ", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    axes.forEach((axis, index) => {
      const angle = (index * Math.PI) / 2 - Math.PI / 2;
      
      // ラベル距離を調整（優勢な特性のラベルのみ表示）
      const labelDistance = isMobile ? 35 : 45;
      const labelRadius = radius + labelDistance;
      
      // ラベル位置を計算
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      
      // テキストの配置を調整
      if (index === 0) { // 上
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
      } else if (index === 1) { // 右
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
      } else if (index === 2) { // 下
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
      } else { // 左
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
      }
      
      // 優勢な特性のラベルのみを表示
      ctx.fillText(axis.label, x, y);
    });
  };

  const drawDataPolygon = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, progress: number) => {
    ctx.beginPath();
    
    axes.forEach((axis, index) => {
      const angle = (index * Math.PI) / 2 - Math.PI / 2;
      const value = axis.value * progress;
      const distance = (value / maxValue) * radius;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    
    // 塗りつぶし
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    
    // 輪郭
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawDataPoints = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, progress: number) => {
    axes.forEach((axis, index) => {
      const angle = (index * Math.PI) / 2 - Math.PI / 2;
      const value = axis.value * progress;
      const distance = (value / maxValue) * radius;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // データポイント
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      
      // 値のラベル
      ctx.fillStyle = '#1f2937';
      const valueFontSize = isMobile ? 9 : 11;
      ctx.font = `bold ${valueFontSize}px "Hiragino Kaku Gothic Pro", "ヒラギノ角ゴ Pro W3", "Meiryo", "メイリオ", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axis.value.toString(), x, y - (isMobile ? 12 : 15));
    });
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={currentSize}
        height={currentSize}
        className="border border-gray-200 rounded-lg shadow-sm max-w-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="mt-3 sm:mt-4 text-center px-2">
        <p className="text-xs sm:text-sm text-gray-600">
          診断結果に基づく優勢な特性を表示しています
        </p>
      </div>
    </div>
  );
};

export default RadarChart;