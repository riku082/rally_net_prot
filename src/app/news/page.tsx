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
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Articles />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewsPage;