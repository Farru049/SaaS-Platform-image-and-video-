'use client';

import { Menu, Bell, User, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

// Header component
const Header = () => (
  <header className="bg-[#44475a] border-b border-[#6272a4] px-4 py-3">
    <div className="flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center space-x-4">
        <div className="md:hidden">
          <Menu className="w-6 h-6" />
        </div>
        <div className="text-2xl font-bold text-[#ff79c6]">SaasApp</div>
        <nav className="hidden md:flex items-center space-x-6 ml-8">
          <div className="hover:text-[#50fa7b] cursor-pointer">Dashboard</div>
          <div className="hover:text-[#50fa7b] cursor-pointer">Features</div>
          <div className="hover:text-[#50fa7b] cursor-pointer">Pricing</div>
          <div className="hover:text-[#50fa7b] cursor-pointer">Documentation</div>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#282a36] text-[#f8f8f2] pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50fa7b]"
            />
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-[#6272a4]" />
          </div>
        </div>
        <div className="p-2 hover:bg-[#6272a4] rounded cursor-pointer">
          <Bell className="w-5 h-5" />
        </div>
        <div className="p-2 hover:bg-[#6272a4] rounded cursor-pointer">
          <User className="w-5 h-5" />
        </div>
      </div>
    </div>
  </header>
);

// Sidebar component
const Sidebar = ({ router }) => (
  <aside className="w-64 bg-[#44475a] text-[#f8f8f2] p-6 flex-shrink-0 hidden md:block">
    <h2 className="text-2xl font-bold mb-6">Menu</h2>
    <div className="space-y-4">
      <div
        onClick={() => router.push('/social-share')}
        className="w-full text-left py-2 px-4 bg-[#6272a4] hover:bg-[#50fa7b] rounded transition-colors cursor-pointer"
      >
        Image Upload
      </div>
      <div
        onClick={() => router.push('/video-upload')}
        className="w-full text-left py-2 px-4 bg-[#6272a4] hover:bg-[#50fa7b] rounded transition-colors cursor-pointer"
      >
        Video Upload
      </div>
    </div>
  </aside>
);

// Main content component
const MainContent = () => (
  <main className="flex-1 p-6 md:p-10 overflow-y-auto">
    <h1 className="text-4xl font-bold mb-6 text-[#ff79c6]">Welcome to the Home Page</h1>
  </main>
);

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-[#282a36] text-[#f8f8f2] overflow-hidden">
      {/* Render Header */}
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Render Sidebar */}
        <Sidebar router={router} />
        {/* Render Main Content */}
        <MainContent />
      </div>
    </div>
  );
}