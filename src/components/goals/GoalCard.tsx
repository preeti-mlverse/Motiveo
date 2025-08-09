import React from 'react';
import { Target, Heart, Dumbbell, Footprints, Calendar, Moon } from 'lucide-react';
import { GoalType } from '../../types';

interface GoalCardProps {
  type: GoalType;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const goalIcons: { [key in GoalType]: React.ReactNode } = {
  weight_loss: <Target className="w-8 h-8" />,
  cardio_endurance: <Heart className="w-8 h-8" />,
  strength_building: <Dumbbell className="w-8 h-8" />,
  daily_steps: <Footprints className="w-8 h-8" />,
  workout_consistency: <Calendar className="w-8 h-8" />,
  sleep_tracking: <Moon className="w-8 h-8" />
};

export const GoalCard: React.FC<GoalCardProps> = ({
  type,
  title,
  description,
  isSelected,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300 text-left w-full
        transform hover:scale-105 active:scale-95
        ${isSelected 
          ? 'border-[#F08A3E] bg-gradient-to-br from-[#F08A3E]/10 to-[#E17226]/5 shadow-lg shadow-orange-500/20' 
          : 'border-[#2B3440] bg-[#161B22] hover:border-[#F08A3E]/50 hover:shadow-md'
        }
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-[#F08A3E] rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      )}

      {/* Icon */}
      <div className={`
        inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4
        ${isSelected 
          ? 'bg-[#F08A3E] text-white shadow-lg shadow-orange-500/30' 
          : 'bg-[#2B3440] text-[#6BD0D2]'
        }
      `}>
        {goalIcons[type]}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-[#F3F4F6] mb-2">
        {title}
      </h3>
      <p className="text-[#CBD5E1] leading-relaxed">
        {description}
      </p>

      {/* Hover effect */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
        ${isSelected ? '' : 'hover:opacity-100'}
        bg-gradient-to-r from-[#F08A3E]/5 to-[#6BD0D2]/5
      `} />
    </button>
  );
};