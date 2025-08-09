import { GoalType, UserProfile, LogEntry } from '../types';

export const generateAIRecommendation = (
  goalType: GoalType,
  userProfile: UserProfile,
  recentLogs: LogEntry[]
): string[] => {
  const recommendations: { [key in GoalType]: (profile: UserProfile, logs: LogEntry[]) => string[] } = {
    weight_loss: (profile, logs) => {
      const recentWeightLogs = logs.filter(log => log.goalType === 'weight_loss').slice(-7);
      const avgProgress = recentWeightLogs.length > 0 ? recentWeightLogs.reduce((sum, log) => sum + log.value, 0) / recentWeightLogs.length : 0;
      
      return [
        `Based on your recent progress, aim for a 500-750 calorie deficit daily for sustainable weight loss.`,
        `Try incorporating 30 minutes of cardio 4-5 times per week alongside strength training.`,
        `Focus on whole foods: lean proteins, vegetables, and complex carbs to maintain satiety.`,
        `Track your water intake - aim for at least 8 glasses daily to support metabolism.`,
        `Plan your meals in advance to avoid impulsive food choices when busy.`
      ];
    },
    
    cardio_endurance: (profile, logs) => {
      return [
        `Gradually increase your running distance by 10% each week to build endurance safely.`,
        `Include one long run, one tempo run, and 2-3 easy runs in your weekly schedule.`,
        `Focus on breathing rhythm: try the 3:2 pattern (inhale for 3 steps, exhale for 2).`,
        `Add cross-training activities like cycling or swimming to prevent overuse injuries.`,
        `Monitor your heart rate zones: 80% of training should be in Zone 1-2 (easy effort).`
      ];
    },
    
    strength_building: (profile, logs) => {
      return [
        `Focus on compound movements: squats, deadlifts, bench press, and rows for maximum strength gains.`,
        `Aim for 3-4 strength sessions per week, allowing 48 hours recovery between training same muscle groups.`,
        `Progressive overload is key: increase weight by 2.5-5 lbs when you can complete all sets with good form.`,
        `Include adequate protein: aim for 0.8-1g per pound of body weight daily for muscle recovery.`,
        `Prioritize form over weight - consider working with a trainer for compound lift technique.`
      ];
    },
    
    daily_steps: (profile, logs) => {
      const avgSteps = logs.length > 0 ? logs.reduce((sum, log) => sum + log.value, 0) / logs.length : 0;
      
      return [
        `Take walking breaks every hour during work - even 5 minutes helps break up sedentary time.`,
        `Park farther away or get off public transport one stop early to add natural steps.`,
        `Use stairs instead of elevators when possible for extra step count and strength.`,
        `Schedule walking meetings or phone calls to make steps part of your work routine.`,
        `Set hourly step reminders on your phone to maintain consistent movement throughout the day.`
      ];
    },
    
    workout_consistency: (profile, logs) => {
      return [
        `Start with 20-30 minute workouts to build the habit before increasing intensity or duration.`,
        `Schedule your workouts at the same time each day to create a consistent routine.`,
        `Prepare backup 15-minute bodyweight workouts for busy days - consistency beats perfection.`,
        `Find an accountability partner or join fitness groups to maintain motivation.`,
        `Track your streak and celebrate small wins - even 5 minutes of movement counts as a win.`
      ];
    },
    
    sleep_tracking: (profile, logs) => {
      return [
        `Maintain a consistent sleep schedule - go to bed and wake up at the same time daily.`,
        `Create a relaxing bedtime routine: dim lights, no screens 1 hour before bed.`,
        `Keep your bedroom cool (65-68°F), dark, and quiet for optimal sleep quality.`,
        `Avoid caffeine after 2 PM and large meals 3 hours before bedtime.`,
        `Consider a sleep diary to identify patterns affecting your sleep quality.`
      ];
    }
  };

  return recommendations[goalType](userProfile, recentLogs);
};

export const getMotivationalMessage = (goalType: GoalType, progress: number): string => {
  const messages: { [key in GoalType]: { [key: string]: string } } = {
    weight_loss: {
      low: "Every healthy choice you make is an investment in your future self. Keep going! 💪",
      medium: "You're making real progress! Your body is adapting and getting stronger every day. 🌟",
      high: "Incredible work! You're proving to yourself that you can achieve anything you set your mind to! 🎉"
    },
    cardio_endurance: {
      low: "Building endurance takes time. Every step forward is progress worth celebrating! 🏃‍♀️",
      medium: "Your cardiovascular system is getting stronger! Feel that improved energy? 💨",
      high: "Your endurance gains are remarkable! You're becoming an unstoppable force! 🚀"
    },
    strength_building: {
      low: "Rome wasn't built in a day, and neither is strength. You're laying a solid foundation! 🏗️",
      medium: "Your muscles are adapting and growing stronger! Feel that power building up? ⚡",
      high: "You're crushing your strength goals! Your dedication is truly inspiring! 💥"
    },
    daily_steps: {
      low: "Every step counts! You're building a healthy habit that will benefit you for life. 👟",
      medium: "Look at you go! Your daily movement is becoming second nature. Keep stepping! 🚶‍♀️",
      high: "Step master! Your consistent movement is setting an amazing example! 🏆"
    },
    workout_consistency: {
      low: "Consistency is the key to success. You're building something amazing, one workout at a time! 📅",
      medium: "Your workout routine is becoming a powerful habit! Feel that momentum building? 🔄",
      high: "You're a consistency champion! Your dedication to showing up is incredible! 🎯"
    },
    sleep_tracking: {
      low: "Quality sleep is the foundation of health. You're taking an important step! 😴",
      medium: "Your sleep patterns are improving! Better rest means better days ahead. 🌙",
      high: "Sleep champion! Your commitment to rest is powering your success in all areas! ⭐"
    }
  };

  const level = progress < 33 ? 'low' : progress < 67 ? 'medium' : 'high';
  return messages[goalType][level];
};