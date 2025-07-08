'use client';
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import BackupPanel from '@/components/BackupPanel';

const ManagementPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePath="/management" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">データ管理</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <BackupPanel />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagementPage; 