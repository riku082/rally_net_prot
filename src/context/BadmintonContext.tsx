"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Shot, Rally, AnalysisData, ShotType } from '@/types/badminton';

interface BadmintonContextType {
  currentRally: Rally | null;
  rallies: Rally[];
  startRally: () => void;
  endRally: () => void;
  addShot: (shot: Omit<Shot, 'id' | 'timestamp'>) => void;
  analysisData: AnalysisData;
}

const BadmintonContext = createContext<BadmintonContextType | undefined>(undefined);

export const BadmintonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRally, setCurrentRally] = useState<Rally | null>(null);
  const [rallies, setRallies] = useState<Rally[]>([]);

  const startRally = useCallback(() => {
    const newRally: Rally = {
      id: Date.now().toString(),
      shots: [],
      startTime: Date.now(),
      endTime: 0,
    };
    setCurrentRally(newRally);
  }, []);

  const endRally = useCallback(() => {
    if (currentRally) {
      const completedRally = {
        ...currentRally,
        endTime: Date.now(),
      };
      setRallies((prev) => [...prev, completedRally]);
      setCurrentRally(null);
    }
  }, [currentRally]);

  const addShot = useCallback((shot: Omit<Shot, 'id' | 'timestamp'>) => {
    if (currentRally) {
      const newShot: Shot = {
        ...shot,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      setCurrentRally((prev) => prev ? {
        ...prev,
        shots: [...prev.shots, newShot],
      } : null);
    }
  }, [currentRally]);

  const analysisData: AnalysisData = {
    totalRallies: rallies.length,
    shotDistribution: rallies.reduce((acc, rally) => {
      rally.shots.forEach((shot) => {
        acc[shot.type] = (acc[shot.type] || 0) + 1;
      });
      return acc;
    }, {} as Record<ShotType, number>),
    averageRallyLength: rallies.length > 0
      ? rallies.reduce((sum, rally) => sum + rally.shots.length, 0) / rallies.length
      : 0,
    commonPatterns: [], // TODO: パターン分析の実装
  };

  return (
    <BadmintonContext.Provider
      value={{
        currentRally,
        rallies,
        startRally,
        endRally,
        addShot,
        analysisData,
      }}
    >
      {children}
    </BadmintonContext.Provider>
  );
};

export const useBadminton = () => {
  const context = useContext(BadmintonContext);
  if (context === undefined) {
    throw new Error('useBadminton must be used within a BadmintonProvider');
  }
  return context;
}; 