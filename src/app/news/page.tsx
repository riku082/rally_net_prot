'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import Articles from '@/components/Articles';

const NewsPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePath="/news" />
      <MobileNav activePath="/news" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Articles />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewsPage;