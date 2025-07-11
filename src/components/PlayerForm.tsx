'use client';

import React, { useState } from 'react';
import { Player } from '@/types/player';
import { FiUser, FiHome, FiPlusCircle } from 'react-icons/fi';

interface PlayerFormProps {
  onPlayerAdded: (player: Player) => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ onPlayerAdded }) => {
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && affiliation.trim()) {
      onPlayerAdded({
        id: Date.now().toString(),
        name: name.trim(),
        affiliation: affiliation.trim(),
        createdAt: Date.now(),
      });
      setName('');
      setAffiliation('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-5">新規選手登録</h3>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          <FiUser className="inline-block mr-1 sm:mr-2 text-gray-500 w-4 h-4" />選手名
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm sm:text-base"
          placeholder="例: 山田太郎"
          required
        />
      </div>
      <div>
        <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700 mb-2">
          <FiHome className="inline-block mr-1 sm:mr-2 text-gray-500 w-4 h-4" />所属
        </label>
        <input
          type="text"
          id="affiliation"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm sm:text-base"
          placeholder="例: ○○高校、△△クラブ"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base"
      >
        <FiPlusCircle className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />選手を登録
      </button>
    </form>
  );
};

export default PlayerForm;