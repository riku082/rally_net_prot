'use client';

import React from 'react';

const PracticeCardVisualEditorTest: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 h-full" onClick={(e) => e.stopPropagation()}>
      <div>Test</div>
    </div>
  );
};

export default PracticeCardVisualEditorTest;