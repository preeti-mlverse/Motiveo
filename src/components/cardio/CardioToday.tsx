import React, { useState, useEffect } from 'react';
import { Heart, Activity, Play, Pause, Square, TrendingUp, Award, Zap, MessageCircle, Sparkles } from 'lucide-react';
import { CardioProfile, WorkoutSession, HeartRateReading } from '../../types/cardio';
import { LiveHeartRateMonitor } from './LiveHeartRateMonitor';
import { ZoneDistributionChart } from './ZoneDistributionChart';
import { WorkoutSessionModal } from './WorkoutSessionModal';

interface CardioTodayProps {
  profile: CardioProfile;
  onWorkoutLogged: (session: WorkoutSession) => void;
}

export const CardioToday: React.FC<CardioTodayProps> = ({
  profile,
  onWorkoutLogged
}) => {
  const [currentHeartRate, setCurrentHeartRate] = useState<number>(profile.restingHeartRate);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [todaysSessions, setTodaysSessions] = useState<WorkoutSession[]>([]);
  const [heartRateHistory, setHeartRateHistory] = useState<HeartRateReading[]>([]);

  // Simulate heart rate updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isWorkoutActive) {
        // Simulate workout heart rate (higher and more variable)
        const targetZone = profile.fitnessObjective === 'fat_burn' ? 2 : 
                          profile.fitnessObjective === 'endurance' ? 3 : 4;
        const zoneKey = `zone${targetZone}` as keyof typeof profile.zones;
        const zone = profile.zones[zoneKey];
        const targetHR = Math.random() * (zone.max - zone.min) + zone.min;
        const variation = (Math.random() - 0.5) * 20;
        setCurrentHeartRate(Math.round(targetHR + variation));
      } else {
        // Simulate resting heart rate with small variations
        const variation = (Math.random() - 0.5) * 10;
        setCurrentHeartRate(Math.round(profile.restingHeartRate + variation));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isWorkoutActive, profile]);

  // Update workout duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive && workoutStartTime) {
      interval = setInterval(() => {
        setWorkoutDuration(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, workoutStartTime]);

  // Track heart rate history during workout
  useEffect(() => {
    if (isWorkoutActive) {
      const reading: HeartRateReading = {
        timestamp: new Date(),
        bpm: currentHeartRate,
        zone: getCurrentZone(currentHeartRate),
        activity: 'workout'
      };
      setHeartRateHistory(prev => [...prev.slice(-299), reading]); // Keep last 300 readings
    }
  }, [currentHeartRate, isWorkoutActive]);

  const getCurrentZone = (hr: number): number => {
    const zones = profile.zones;
    if (hr <= zones.zone1.max) return 1;
    if (hr <= zones.zone2.max) return 2;
    if (hr <= zones.zone3.max) return 3;
    if (hr <= zones.zone4.max) return 4;
    return 5;
  };

  const getZoneColor = (zone: number): string => {
    const zoneKey = `zone${zone}` as keyof typeof profile.zones;
    return profile.zones[zoneKey].color;
  };

  const getZoneName = (zone: number): string => {
    const zoneKey = `zone${zone}` as keyof typeof profile.zones;
    return profile.zones[zoneKey].name;
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutStartTime(new Date());
    setWorkoutDuration(0);
    setHeartRateHistory([]);
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(false);
  };

  const resumeWorkout = () => {
    setIsWorkoutActive(true);
  };

  const stopWorkout = () => {
    if (workoutStartTime && heartRateHistory.length > 0) {
      setShowWorkoutModal(true);
    } else {
      resetWorkout();
    }
  };

  const resetWorkout = () => {
    setIsWorkoutActive(false);
    setWorkoutStartTime(null);
    setWorkoutDuration(0);
    setHeartRateHistory([]);
  };

  const handleWorkoutSave = (session: WorkoutSession) => {
    setTodaysSessions(prev => [...prev, session]);
    onWorkoutLogged(session);
    resetWorkout();
    setShowWorkoutModal(false);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentZone = getCurrentZone(currentHeartRate);
  const currentZoneColor = getZoneColor(currentZone);
  const currentZoneName = getZoneName(currentZone);

  const todaysStats = {
    totalDuration: todaysSessions.reduce((sum, session) => sum + session.duration, 0),
    totalCalories: todaysSessions.reduce((sum, session) => sum + session.caloriesBurned, 0),
    avgHeartRate: todaysSessions.length > 0 
      ? Math.round(todaysSessions.reduce((sum, session) => sum + session.averageHeartRate, 0) / todaysSessions.length)
      : 0,
    sessionsCount: todaysSessions.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F3F4F6]">Cardio Training</h2>
          <p className="text-[#CBD5E1]">
            Goal: {profile.fitnessObjective.replace('_', ' ')} • {profile.connectedDevices?.length || 0} devices
          </p>
        </div>
        <div className="w-12 h-12 bg-[#EF4444] rounded-2xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Live Heart Rate Monitor */}
      <LiveHeartRateMonitor
        currentHeartRate={currentHeartRate}
        currentZone={currentZone}
        currentZoneColor={currentZoneColor}
        currentZoneName={currentZoneName}
        zones={profile.zones}
        isWorkoutActive={isWorkoutActive}
        workoutDuration={workoutDuration}
        heartRateHistory={heartRateHistory}
      />

      {/* Workout Controls */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F3F4F6]">Workout Control</h3>
          {isWorkoutActive && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400">Recording</span>
            </div>
          )}
        </div>

        {workoutStartTime && (
          <div className="mb-4 p-3 bg-[#0D1117] rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-[#CBD5E1]">Duration</span>
              <span className="text-2xl font-bold text-[#F3F4F6]">{formatDuration(workoutDuration)}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          {!isWorkoutActive && !workoutStartTime && (
            <button
              onClick={startWorkout}
              className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Start Workout</span>
            </button>
          )}

          {isWorkoutActive && (
            <>
              <button
                onClick={pauseWorkout}
                className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
              <button
                onClick={stopWorkout}
                className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </>
          )}

          {!isWorkoutActive && workoutStartTime && (
            <>
              <button
                onClick={resumeWorkout}
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Resume</span>
              </button>
              <button
                onClick={stopWorkout}
                className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <Square className="w-5 h-5" />
                <span>Finish</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Today's Stats */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F3F4F6]">Today's Summary</h3>
          <TrendingUp className="w-6 h-6 text-[#6BD0D2]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#4BE0D1]">{Math.floor(todaysStats.totalDuration / 60)}</div>
            <div className="text-sm text-[#CBD5E1]">Minutes</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#F08A3E]">{todaysStats.totalCalories}</div>
            <div className="text-sm text-[#CBD5E1]">Calories</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#EF4444]">{todaysStats.avgHeartRate || profile.restingHeartRate}</div>
            <div className="text-sm text-[#CBD5E1]">Avg HR</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#6BD0D2]">{todaysStats.sessionsCount}</div>
            <div className="text-sm text-[#CBD5E1]">Sessions</div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {todaysSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#F3F4F6]">Today's Sessions</h3>
          {todaysSessions.map((session) => (
            <div key={session.id} className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-[#6BD0D2]" />
                  <div>
                    <h4 className="font-medium text-[#F3F4F6]">{session.activityType}</h4>
                    <p className="text-sm text-[#CBD5E1]">
                      {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#F08A3E]">{session.caloriesBurned}</div>
                  <div className="text-xs text-[#CBD5E1]">calories</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#CBD5E1]">Avg HR: {session.averageHeartRate} BPM</span>
                <span className="text-[#CBD5E1]">Max HR: {session.maxHeartRate} BPM</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone Distribution Chart */}
      {heartRateHistory.length > 0 && (
        <ZoneDistributionChart
          heartRateHistory={heartRateHistory}
          zones={profile.zones}
        />
      )}

      {/* AI Cardio Coach */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center space-x-3 mb-4">
          <MessageCircle className="w-6 h-6 text-[#EF4444]" />
          <div>
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Cardio Coach</h3>
            <p className="text-sm text-[#CBD5E1]">Get personalized heart rate and endurance advice</p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
          <p className="text-sm text-[#F3F4F6]">
            {isWorkoutActive 
              ? `Currently in Zone ${currentZone} - ${currentZoneName}. How are you feeling?`
              : `Ready for your next cardio session? I can help optimize your training zones.`
            }
          </p>
        </div>
        
        <button
          onClick={() => {
            const event = new CustomEvent('openGoalAI', { 
              detail: { goalType: 'cardio_endurance' } 
            });
            window.dispatchEvent(event);
          }}
          className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Ask Cardio Coach</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Workout Session Modal */}
      {showWorkoutModal && workoutStartTime && (
        <WorkoutSessionModal
          startTime={workoutStartTime}
          duration={workoutDuration}
          heartRateHistory={heartRateHistory}
          zones={profile.zones}
          onSave={handleWorkoutSave}
          onCancel={() => {
            setShowWorkoutModal(false);
            resetWorkout();
          }}
        />
      )}
    </div>
  );
};