import React, { useEffect, useState } from 'react';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { useAppStore } from './store/useAppStore';
import { useWeightLossStore } from './store/useWeightLossStore';

// Onboarding Components
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { PhoneVerification } from './components/onboarding/PhoneVerification';
import { ProfileSetup } from './components/onboarding/ProfileSetup';
import { GoalSelection } from './components/onboarding/GoalSelection';
import { WeightLossSetup } from './components/weightLoss/WeightLossSetup';
import { DevicePairingScreen } from './components/cardio/DevicePairingScreen';
import { CardioSetup } from './components/cardio/CardioSetup';
import { StrengthDevicePairingScreen } from './components/strength/StrengthDevicePairingScreen';
import { StrengthSetup } from './components/strength/StrengthSetup';
import { SleepDevicePairingScreen } from './components/sleep/SleepDevicePairingScreen';
import { SleepSetup } from './components/sleep/SleepSetup';
import { StepsDevicePairingScreen } from './components/steps/StepsDevicePairingScreen';
import { StepsSetup } from './components/steps/StepsSetup';

// Main App Components
import { MainTabs } from './components/main/MainTabs';
import { TodayTab } from './components/main/TodayTab';
import { ProgressTab } from './components/main/ProgressTab';
import { PlanTab } from './components/main/PlanTab';
import { ProfileTab } from './components/main/ProfileTab';

// Types
import { GoalType, UserProfile, Goal } from './types';
import { WeightLossProfile } from './types/weightLoss';
import { CardioProfile, ConnectedDevice } from './types/cardio';
import { StrengthProfile, EquipmentType } from './types/strength';
import { SleepProfile, ConnectedSleepDevice } from './types/sleep';
import { StepsProfile, ConnectedStepsDevice } from './types/steps';
import { useCardioStore } from './store/useCardioStore';
import { useStrengthStore } from './store/useStrengthStore';
import { useSleepStore } from './store/useSleepStore';
import { useStepsStore } from './store/useStepsStore';

function App() {
  const {
    currentScreen,
    currentTab,
    userProfile,
    goals,
    setCurrentScreen,
    setCurrentTab,
    setUserProfile,
    addGoal
  } = useAppStore();

  const {
    profile: weightLossProfile,
    setProfile: setWeightLossProfile
  } = useWeightLossStore();

  const {
    profile: cardioProfile,
    setProfile: setCardioProfile
  } = useCardioStore();
  
  const {
    profile: strengthProfile,
    setProfile: setStrengthProfile
  } = useStrengthStore();
  
  const {
    profile: sleepProfile,
    setProfile: setSleepProfile
  } = useSleepStore();
  
  const {
    profile: stepsProfile,
    setProfile: setStepsProfile
  } = useStepsStore();

  const [pendingCardioDevices, setPendingCardioDevices] = useState<ConnectedDevice[]>([]);
  const [pendingStrengthEquipment, setPendingStrengthEquipment] = useState<EquipmentType[]>([]);
  const [pendingSleepDevices, setPendingSleepDevices] = useState<ConnectedSleepDevice[]>([]);
  const [pendingStepsDevices, setPendingStepsDevices] = useState<ConnectedStepsDevice[]>([]);

  // Initialize sample achievements and AI recommendations
  useEffect(() => {
    // Sample achievements would be loaded here
    // Sample AI recommendations would be generated here
  }, []);

  const handleGetStarted = () => {
    setCurrentScreen('phone');
  };

  const handlePhoneSkip = () => {
    setCurrentScreen('profile');
  };

  const handlePhoneVerified = (phone: string) => {
    setCurrentScreen('profile');
  };

  const handleProfileComplete = (profileData: any) => {
    // Create user profile with all required data
    const profile: UserProfile = {
      id: Date.now().toString(),
      weight: profileData.weight,
      weightUnit: profileData.weightUnit,
      height: profileData.height,
      heightUnit: profileData.heightUnit,
      age: profileData.age,
      gender: profileData.gender,
      selectedGoals: [],
      createdAt: new Date()
    };
    setUserProfile(profile);
    setCurrentScreen('goals');
  };

  const handleGoalsSelected = (selectedGoals: GoalType[]) => {
    // Filter out goals that already exist
    const existingGoalTypes = goals.map(goal => goal.type);
    const newGoals = selectedGoals.filter(goalType => !existingGoalTypes.includes(goalType));
    
    // If no new goals to add, just go back to main
    if (newGoals.length === 0) {
      setCurrentScreen('main');
      return;
    }

    // Update user profile with new goals
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        selectedGoals: [...userProfile.selectedGoals, ...newGoals]
      });
    } else {
      const profile: UserProfile = {
        id: Date.now().toString(),
        selectedGoals: newGoals,
        weightUnit: 'pounds',
        heightUnit: 'feet',
        createdAt: new Date()
      };
      setUserProfile(profile);
    }

    // Check if weight loss is selected first (priority)
    if (newGoals.includes('weight_loss')) {
      setCurrentScreen('goal-setup');
      return;
    }
    
    // Check if cardio endurance is selected
    if (newGoals.includes('cardio_endurance')) {
      setCurrentScreen('goal-setup');
      return;
    }

    // For other goals, create them directly and go to main
    newGoals.forEach((goalType, index) => {
      const goalData = getGoalData(goalType);
      const goal: Goal = {
        id: `goal_${Date.now()}_${index}`,
        type: goalType,
        title: goalData.title,
        description: goalData.description,
        icon: goalData.icon,
        targetValue: goalData.defaultTarget,
        targetTimeframe: 12, // 12 weeks
        currentValue: 0,
        isActive: true,
        createdAt: new Date()
      };
      
      addGoal(goal);
    });

    setCurrentScreen('main');
  };

  const handleCardioDevicesPaired = (devices: ConnectedDevice[]) => {
    setPendingCardioDevices(devices);
    // Continue to cardio setup with devices
    // The step will be handled in goal-setup screen
  };

  const handleCardioSetupComplete = (profile: CardioProfile) => {
    setCardioProfile(profile);
    
    // Create the cardio endurance goal
    const goal: Goal = {
      id: profile.goalId,
      type: 'cardio_endurance',
      title: 'Cardio Endurance',
      description: `Improve cardiovascular fitness with ${profile.fitnessObjective.replace('_', ' ')} focus`,
      icon: 'heart',
      targetValue: profile.fitnessObjective === 'fat_burn' ? 150 : 
                   profile.fitnessObjective === 'endurance' ? 180 : 200, // Target minutes per week
      targetTimeframe: 12,
      currentValue: 0,
      isActive: true,
      createdAt: new Date()
    };
    
    addGoal(goal);

    // Add other selected goals (excluding cardio_endurance since we just added it)
    const otherGoals = userProfile?.selectedGoals.filter(goalType => goalType !== 'cardio_endurance') || [];
    otherGoals.forEach((goalType, index) => {
      const goalData = getGoalData(goalType);
      const otherGoal: Goal = {
        id: `goal_${Date.now()}_${index + 1}`,
        type: goalType,
        title: goalData.title,
        description: goalData.description,
        icon: goalData.icon,
        targetValue: goalData.defaultTarget,
        targetTimeframe: 12, // 12 weeks
        currentValue: 0,
        isActive: true,
        createdAt: new Date()
      };
      
      addGoal(otherGoal);
    });

    setCurrentScreen('main');
  };

  const handleStrengthEquipmentSelected = (equipment: EquipmentType[]) => {
    setPendingStrengthEquipment(equipment);
    // Continue to strength setup with equipment
  };

  const handleStrengthSetupComplete = (profile: StrengthProfile) => {
    setStrengthProfile(profile);
    
    // Create the strength building goal
    const goal: Goal = {
      id: profile.goalId,
      type: 'strength_building',
      title: 'Strength Building',
      description: `Build ${profile.primaryGoal.replace('_', ' ')} with ${profile.workoutFrequency}x/week training`,
      icon: 'dumbbell',
      targetValue: profile.workoutFrequency * 4, // Target sessions per month
      targetTimeframe: 12,
      currentValue: 0,
      isActive: true,
      createdAt: new Date()
    };
    
    addGoal(goal);

    // Add other selected goals (excluding strength_building since we just added it)
    const otherGoals = userProfile?.selectedGoals.filter(goalType => goalType !== 'strength_building') || [];
    otherGoals.forEach((goalType, index) => {
      const goalData = getGoalData(goalType);
      const otherGoal: Goal = {
        id: `goal_${Date.now()}_${index + 1}`,
        type: goalType,
        title: goalData.title,
        description: goalData.description,
        icon: goalData.icon,
        targetValue: goalData.defaultTarget,
        targetTimeframe: 12, // 12 weeks
        currentValue: 0,
        isActive: true,
        createdAt: new Date()
      };
      
      addGoal(otherGoal);
    });

    setCurrentScreen('main');
  };

  const handleSleepDevicesPaired = (devices: ConnectedSleepDevice[]) => {
    setPendingSleepDevices(devices);
    // Continue to sleep setup with devices
  };

  const handleSleepSetupComplete = (profile: SleepProfile) => {
    setSleepProfile(profile);
    
    // Create the sleep tracking goal
    const goal: Goal = {
      id: profile.goalId,
      type: 'sleep_tracking',
      title: 'Sleep Tracking',
      description: `Improve sleep quality with ${profile.targetSleepHours}h target`,
      icon: 'moon',
      targetValue: profile.targetSleepHours,
      targetTimeframe: 12,
      currentValue: 0,
      isActive: true,
      createdAt: new Date()
    };
    
    addGoal(goal);

    // Add other selected goals (excluding sleep_tracking since we just added it)
    const otherGoals = userProfile?.selectedGoals.filter(goalType => goalType !== 'sleep_tracking') || [];
    otherGoals.forEach((goalType, index) => {
      const goalData = getGoalData(goalType);
      const otherGoal: Goal = {
        id: `goal_${Date.now()}_${index + 1}`,
        type: goalType,
        title: goalData.title,
        description: goalData.description,
        icon: goalData.icon,
        targetValue: goalData.defaultTarget,
        targetTimeframe: 12, // 12 weeks
        currentValue: 0,
        isActive: true,
        createdAt: new Date()
      };
      
      addGoal(otherGoal);
    });

    setCurrentScreen('main');
  };

  const handleWeightLossSetupComplete = (profile: WeightLossProfile) => {
    setWeightLossProfile(profile);
    
    // Create the weight loss goal
    const goal: Goal = {
      id: profile.goalId,
      type: 'weight_loss',
      title: 'Weight Loss',
      description: `Lose ${profile.currentWeight - profile.targetWeight}kg in ${Math.ceil((Date.now() - profile.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000))} weeks`,
      icon: 'target',
      targetValue: profile.targetWeight,
      targetTimeframe: 12,
      currentValue: profile.currentWeight,
      isActive: true,
      createdAt: new Date()
    };
    
    addGoal(goal);

    // Check if cardio endurance is also selected
    const hasCardioGoal = userProfile?.selectedGoals.includes('cardio_endurance');
    const hasSleepGoal = userProfile?.selectedGoals.includes('sleep_tracking');
    
    if (hasCardioGoal && !cardioProfile) {
      // Update user profile with new goals
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          selectedGoals: userProfile.selectedGoals
        });
      }
      
      setCurrentScreen('goal-setup');
      return;
    }
    
    if (hasSleepGoal && !sleepProfile) {
      setCurrentScreen('goal-setup');
      return;
    }

    // Add other selected goals (excluding weight_loss and cardio_endurance)
    const otherGoals = userProfile?.selectedGoals.filter(goalType => 
      goalType !== 'weight_loss' && goalType !== 'cardio_endurance' && goalType !== 'sleep_tracking'
    ) || [];
    otherGoals.forEach((goalType, index) => {
      const goalData = getGoalData(goalType);
      const otherGoal: Goal = {
        id: `goal_${Date.now()}_${index + 1}`,
        type: goalType,
        title: goalData.title,
        description: goalData.description,
        icon: goalData.icon,
        targetValue: goalData.defaultTarget,
        targetTimeframe: 12, // 12 weeks
        currentValue: 0,
        isActive: true,
        createdAt: new Date()
      };
      
      addGoal(otherGoal);
    });

    setCurrentScreen('main');
  };

  const handleStepsDevicesPaired = (devices: ConnectedStepsDevice[]) => {
    setPendingStepsDevices(devices);
    // Continue to steps setup with devices
  };

  const handleStepsSetupComplete = (profile: StepsProfile) => {
    setStepsProfile(profile);
    
    // Create the daily steps goal
    const goal: Goal = {
      id: profile.goalId,
      type: 'daily_steps',
      title: 'Daily Steps',
      description: `Walk ${profile.dailyStepTarget.toLocaleString()} steps daily`,
      icon: 'footprints',
      targetValue: profile.dailyStepTarget,
      targetTimeframe: 12,
      currentValue: 0,
      isActive: true,
      createdAt: new Date()
    };
    
    addGoal(goal);

    // Add other selected goals (excluding daily_steps since we just added it)
    const otherGoals = userProfile?.selectedGoals.filter(goalType => goalType !== 'daily_steps') || [];
    otherGoals.forEach((goalType, index) => {
      const goalData = getGoalData(goalType);
      const otherGoal: Goal = {
        id: `goal_${Date.now()}_${index + 1}`,
        type: goalType,
        title: goalData.title,
        description: goalData.description,
        icon: goalData.icon,
        targetValue: goalData.defaultTarget,
        targetTimeframe: 12, // 12 weeks
        currentValue: 0,
        isActive: true,
        createdAt: new Date()
      };
      
      addGoal(otherGoal);
    });

    setCurrentScreen('main');
  };

  const renderGoalSetup = () => {
    // Priority: Weight Loss first
    const needsWeightLossSetup = userProfile?.selectedGoals.includes('weight_loss') && !weightLossProfile;
    if (needsWeightLossSetup) {
      return (
        <WeightLossSetup
          onComplete={handleWeightLossSetupComplete}
          userProfile={userProfile}
        />
      );
    }

    // Then: Cardio Endurance
    const needsCardioSetup = userProfile?.selectedGoals.includes('cardio_endurance') && !cardioProfile;
    if (needsCardioSetup) {
      // Check if we need device pairing first
      if (pendingCardioDevices.length === 0) {
        return (
          <DevicePairingScreen
            onComplete={handleCardioDevicesPaired}
            onSkip={() => handleCardioDevicesPaired([])}
          />
        );
      } else {
        return (
          <CardioSetup
            onComplete={handleCardioSetupComplete}
            userProfile={userProfile}
            connectedDevices={pendingCardioDevices}
          />
        );
      }
    }
    
    // Then: Strength Building
    const needsStrengthSetup = userProfile?.selectedGoals.includes('strength_building') && !strengthProfile;
    if (needsStrengthSetup) {
      // Check if we need equipment selection first
      if (pendingStrengthEquipment.length === 0) {
        return (
          <StrengthDevicePairingScreen
            onComplete={handleStrengthEquipmentSelected}
            onSkip={() => handleStrengthEquipmentSelected(['bodyweight_only'])}
          />
        );
      } else {
        return (
          <StrengthSetup
            onComplete={handleStrengthSetupComplete}
            userProfile={userProfile}
            availableEquipment={pendingStrengthEquipment}
          />
        );
      }
    }
    
    // Then: Sleep Tracking
    const needsSleepSetup = userProfile?.selectedGoals.includes('sleep_tracking') && !sleepProfile;
    if (needsSleepSetup) {
      // Check if we need device pairing first
      if (pendingSleepDevices.length === 0) {
        return (
          <SleepDevicePairingScreen
            onComplete={handleSleepDevicesPaired}
            onSkip={() => handleSleepDevicesPaired([])}
          />
        );
      } else {
        return (
          <SleepSetup
            onComplete={handleSleepSetupComplete}
            userProfile={userProfile}
            connectedDevices={pendingSleepDevices}
          />
        );
      }
    }
    
    // Then: Daily Steps
    const needsStepsSetup = userProfile?.selectedGoals.includes('daily_steps') && !stepsProfile;
    if (needsStepsSetup) {
      // Check if we need device pairing first
      if (pendingStepsDevices.length === 0) {
        return (
          <StepsDevicePairingScreen
            onComplete={handleStepsDevicesPaired}
            onSkip={() => handleStepsDevicesPaired([])}
          />
        );
      } else {
        return (
          <StepsSetup
            onComplete={handleStepsSetupComplete}
            userProfile={userProfile}
            connectedDevices={pendingStepsDevices}
          />
        );
      }
    }

    // If no setup needed, go to main
    setCurrentScreen('main');
    return null;
  };

  const getGoalData = (goalType: GoalType) => {
    const goalData = {
      weight_loss: {
        title: 'Weight Loss',
        description: 'Lose weight through calorie tracking and exercise',
        icon: 'target',
        defaultTarget: userProfile?.weightUnit === 'kg' ? 5 : 10
      },
      cardio_endurance: {
        title: 'Cardio Endurance',
        description: 'Build cardiovascular fitness',
        icon: 'heart',
        defaultTarget: 150 // minutes per week
      },
      strength_building: {
        title: 'Strength Building',
        description: 'Increase muscle strength',
        icon: 'dumbbell',
        defaultTarget: 12 // sessions per month (3x/week)
      },
      daily_steps: {
        title: 'Daily Steps',
        description: 'Stay active with daily step goals',
        icon: 'footprints',
        defaultTarget: 10000 // steps per day
      },
      workout_consistency: {
        title: 'Workout Consistency',
        description: 'Build exercise habits',
        icon: 'calendar',
        defaultTarget: 5 // days per week
      },
      sleep_tracking: {
        title: 'Sleep Tracking',
        description: 'Improve sleep quality',
        icon: 'moon',
        defaultTarget: 8 // hours
      }
    };

    return goalData[goalType];
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
      
      case 'phone':
        return (
          <PhoneVerification
            onSkip={handlePhoneSkip}
            onVerified={handlePhoneVerified}
          />
        );
      
      case 'profile':
        return <ProfileSetup onComplete={handleProfileComplete} />;
      
      case 'goals':
        return <GoalSelection onGoalsSelected={handleGoalsSelected} />;
      
      case 'goal-setup':
        return renderGoalSetup();
      
      case 'ai-setup':
        return (
          <AISetupWelcome 
            onComplete={() => setCurrentScreen('main')} 
            onSkip={() => setCurrentScreen('main')} 
          />
        );
      
      case 'main':
        return (
          <div className="min-h-screen bg-[#0D1117]">
            {renderMainContent()}
            <MainTabs activeTab={currentTab} onTabChange={setCurrentTab} />
          </div>
        );
      
      default:
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }
  };

  const renderMainContent = () => {
    switch (currentTab) {
      case 'today':
        return <TodayTab />;
      case 'progress':
        return <ProgressTab />;
      case 'plan':
        return <PlanTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <TodayTab />;
    }
  };

  return (
    <AuthWrapper>
      <div className="App">
        {renderCurrentScreen()}
      </div>
    </AuthWrapper>
  );
}

export default App;