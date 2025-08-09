import React from 'react';
import { Home, TrendingUp, Calendar, User } from 'lucide-react';
import { MainTab } from '../../types';

interface MainTabsProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const tabs = [
  { id: 'today' as MainTab, label: 'Today', icon: Home },
  { id: 'progress' as MainTab, label: 'Progress', icon: TrendingUp },
  { id: 'plan' as MainTab, label: 'Plan', icon: Calendar },
  { id: 'profile' as MainTab, label: 'Profile', icon: User }
];

export const MainTabs: React.FC<MainTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#161B22] border-t border-[#2B3440] safe-bottom">
      <div className="grid grid-cols-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center py-3 px-2 space-y-1 transition-all duration-300
                ${isActive 
                  ? 'text-[#F08A3E] bg-[#F08A3E]/10' 
                  : 'text-[#CBD5E1] hover:text-[#F3F4F6] hover:bg-[#0D1117]/50'
                }
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform duration-300`} />
              <span className="text-xs font-medium">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#F08A3E] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};