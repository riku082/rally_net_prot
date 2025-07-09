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
}

const RadarChart: React.FC<RadarChartProps> = ({ data, maxValue = 4, size = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const progressRef = useRef<number>(0);

  // 4つの主要軸のデータを準備
  const axes = [
    { label: '外向性', value: data.E, opposite: '内向性', oppositeValue: data.I },
    { label: '感覚', value: data.S, opposite: '直観', oppositeValue: data.N },
    { label: '思考', value: data.T, opposite: '感情', oppositeValue: data.F },
    { label: '判断', value: data.J, opposite: '知覚', oppositeValue: data.P }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - 120) / 2;

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
  }, [data, size, maxValue]);

  const draw = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, progress: number) => {
    ctx.clearRect(0, 0, size, size);

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
    ctx.font = '12px "Hiragino Kaku Gothic Pro", "ヒラギノ角ゴ Pro W3", "Meiryo", "メイリオ", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    axes.forEach((axis, index) => {
      const angle = (index * Math.PI) / 2 - Math.PI / 2;
      const labelRadius = radius + 30;
      
      // 主要軸のラベル
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
      
      ctx.fillText(axis.label, x, y);

      // 対極軸のラベル
      const oppositeX = centerX + Math.cos(angle + Math.PI) * labelRadius;
      const oppositeY = centerY + Math.sin(angle + Math.PI) * labelRadius;
      
      // 対極軸のテキスト配置を調整
      if (index === 0) { // 下
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
      } else if (index === 1) { // 左
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
      } else if (index === 2) { // 上
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
      } else { // 右
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
      }
      
      ctx.fillText(axis.opposite, oppositeX, oppositeY);
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
      ctx.font = '10px "Hiragino Kaku Gothic Pro", "ヒラギノ角ゴ Pro W3", "Meiryo", "メイリオ", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axis.value.toString(), x, y - 15);
    });
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border border-gray-200 rounded-lg shadow-sm"
      />
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          各軸の数値が高いほど、その特性が強いことを示します
        </p>
      </div>
    </div>
  );
};

export default RadarChart;