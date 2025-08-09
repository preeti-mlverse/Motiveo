import React from 'react';
import { User, Settings, Target, Award, LogOut, Edit3 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FloatingAIAssistant } from '../common/FloatingAIAssistant';

export const ProfileTab: React.FC = () => {
  const { userProfile, goals, logEntries, achievements, setCurrentScreen } = useAppStore();
  
  const activeGoals = goals.filter(g => g.isActive);
  const totalLogs = logEntries.length;
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

  const handleEditProfile = () => {
    // Implementation for editing profile
    console.log('Edit profile');
  };

  const handleManageGoals = () => {
    // Pass existing goals context when navigating to goal selection
    setCurrentScreen('goals');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6]">Profile</h1>
          <p className="text-[#CBD5E1]">Manage your account and preferences</p>
        </div>
        <div className="w-12 h-12 bg-[#F08A3E] rounded-2xl flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F08A3E] to-[#E17226] rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#F3F4F6]">Fitness Enthusiast</h2>
            {userProfile?.phone && (
              <p className="text-[#CBD5E1]">{userProfile.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
            )}
            <p className="text-sm text-[#6BD0D2]">
              Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Today'}
            </p>
          </div>
          <button
            onClick={handleEditProfile}
            className="p-2 text-[#CBD5E1] hover:text-[#F3F4F6] hover:bg-[#0D1117] rounded-xl transition-all"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        {/* User Stats */}
        {userProfile && (
          <div className="grid grid-cols-2 gap-4">
            {userProfile.weight && (
              <div className="text-center p-3 bg-[#0D1117] rounded-xl">
                <div className="text-lg font-bold text-[#F3F4F6]">
                  {userProfile.weight} {userProfile.weightUnit}
                </div>
                <div className="text-sm text-[#CBD5E1]">Weight</div>
              </div>
            )}
            {userProfile.height && (
              <div className="text-center p-3 bg-[#0D1117] rounded-xl">
                <div className="text-lg font-bold text-[#F3F4F6]">
                  {userProfile.height} {userProfile.heightUnit}
                </div>
                <div className="text-sm text-[#CBD5E1]">Height</div>
              </div>
            )}
            {userProfile.age && (
              <div className="text-center p-3 bg-[#0D1117] rounded-xl">
                <div className="text-lg font-bold text-[#F3F4F6]">{userProfile.age}</div>
                <div className="text-sm text-[#CBD5E1]">Age</div>
              </div>
            )}
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#F3F4F6]">{activeGoals.length}</div>
              <div className="text-sm text-[#CBD5E1]">Active Goals</div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Activity Summary</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#4BE0D1] mb-1">{totalLogs}</div>
            <div className="text-sm text-[#CBD5E1]">Total Logs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F8B84E] mb-1">{unlockedAchievements}</div>
            <div className="text-sm text-[#CBD5E1]">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F08A3E] mb-1">
              {userProfile?.createdAt ? Math.floor((Date.now() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-sm text-[#CBD5E1]">Days Active</div>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <button
          onClick={handleManageGoals}
          className="w-full flex items-center justify-between p-4 bg-[#161B22] hover:bg-[#2B3440] border border-[#2B3440] rounded-xl transition-all group"
        >
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-[#F08A3E]" />
            <span className="text-[#F3F4F6] font-medium">Manage Goals</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#CBD5E1]">{activeGoals.length} active</span>
            <div className="w-5 h-5 text-[#CBD5E1] group-hover:text-[#F3F4F6] transition-colors">→</div>
          </div>
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-[#161B22] hover:bg-[#2B3440] border border-[#2B3440] rounded-xl transition-all group">
          <div className="flex items-center space-x-3">
            <Award className="w-6 h-6 text-[#F8B84E]" />
            <span className="text-[#F3F4F6] font-medium">Achievements</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#CBD5E1]">{unlockedAchievements} unlocked</span>
            <div className="w-5 h-5 text-[#CBD5E1] group-hover:text-[#F3F4F6] transition-colors">→</div>
          </div>
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-[#161B22] hover:bg-[#2B3440] border border-[#2B3440] rounded-xl transition-all group">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-[#6BD0D2]" />
            <span className="text-[#F3F4F6] font-medium">Settings</span>
          </div>
          <div className="w-5 h-5 text-[#CBD5E1] group-hover:text-[#F3F4F6] transition-colors">→</div>
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>

      {/* App Version */}
      <div className="text-center pt-6 pb-4">
        <p className="text-xs text-[#CBD5E1] opacity-50">
          FitTracker v1.0.0
        </p>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
};