"use client";

import React from 'react';

interface TestComponentProps {
  message?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ message = "テストコンポーネント" }) => {
  return (
    <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        {message}
      </h3>
      <p className="text-blue-600">
        このコンポーネントはGemini CLIで作成されました
      </p>
      <p className="text-sm text-blue-500 mt-2">
        作成日時: {new Date().toLocaleString('ja-JP')}
      </p>
    </div>
  );
};

export default TestComponent; 