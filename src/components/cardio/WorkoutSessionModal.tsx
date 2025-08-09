import React, { useState } from 'react';
import { Save, X, Activity, Heart, Zap, Clock } from 'lucide-react';
import { WorkoutSession, HeartRateReading, HeartRateZones, ZoneDistribution } from '../../types/cardio';

interface WorkoutSessionModalProps {
  startTime: Date;
  duration: number;
  heartRateHistory: HeartRateReading[];
  zones: HeartRateZones;
  onSave: (session: WorkoutSession) => void;
  onCancel: () => void;
}

export const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
  startTime,
  duration,
  heartRateHistory,
  zones,
  onSave,
  onCancel
}) => {
  const [activityType, setActivityType] = useState('Running');
  const [notes, setNotes] = useState('');

  const calculateSessionStats = () => {
    if (heartRateHistory.length === 0) {
      return {
        averageHeartRate: 0,
        maxHeartRate: 0,
        minHeartRate: 0,
        caloriesBurned: 0,
        zoneDistribution: { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 }
      };
    }

    const heartRates = heartRateHistory.map(r => r.bpm);
    const averageHeartRate = Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length);
    const maxHeartRate = Math.max(...heartRates);
    const minHeartRate = Math.min(...heartRates);

    // Calculate zone distribution
    const zoneDistribution = heartRateHistory.reduce((acc, reading) => {
      const zoneKey = `zone${reading.zone}` as keyof ZoneDistribution;
      acc[zoneKey] = (acc[zoneKey] || 0) + 1;
      return acc;
    }, {} as ZoneDistribution);

    // Convert to percentages
    const totalReadings = heartRateHistory.length;
    Object.keys(zoneDistribution).forEach(key => {
      const zoneKey = key as keyof ZoneDistribution;
      zoneDistribution[zoneKey] = (zoneDistribution[zoneKey] / totalReadings) * 100;
    });

    // Estimate calories burned (simplified formula)
    const durationMinutes = duration / 60;
    const caloriesBurned = Math.round(
      durationMinutes * (averageHeartRate * 0.6309 + 55.0969 * 70 / 1000 + 20.4022 * 25 / 1000 - 55.0969 * 0.09036)
    );

    return {
      averageHeartRate,
      maxHeartRate,
      minHeartRate,
      caloriesBurned: Math.max(caloriesBurned, Math.round(durationMinutes * 8)), // Minimum 8 cal/min
      zoneDistribution
    };
  };

  const stats = calculateSessionStats();

  const handleSave = () => {
    const session: WorkoutSession = {
      id: Date.now().toString(),
      goalId: 'cardio-goal',
      activityType,
      startTime,
      endTime: new Date(),
      duration,
      averageHeartRate: stats.averageHeartRate,
      maxHeartRate: stats.maxHeartRate,
      minHeartRate: stats.minHeartRate,
      zoneDistribution: stats.zoneDistribution,
      caloriesBurned: stats.caloriesBurned,
      recoveryTime: Math.round(stats.maxHeartRate * 0.5), // Simplified recovery estimate
      notes,
      aiInsights: generateAIInsights(stats, duration)
    };

    onSave(session);
  };

  const generateAIInsights = (stats: any, duration: number): string[] => {
    const insights: string[] = [];
    
    if (stats.averageHeartRate > 0) {
      if (stats.zoneDistribution.zone4 + stats.zoneDistribution.zone5 > 30) {
        insights.push("High intensity session - ensure adequate recovery time");
      }
      
      if (stats.zoneDistribution.zone2 + stats.zoneDistribution.zone3 > 60) {
        insights.push("Great aerobic base building session");
      }
      
      if (duration > 1800) { // 30 minutes
        insights.push("Excellent endurance work - your cardiovascular fitness is improving");
      }
      
      if (stats.maxHeartRate > 180) {
        insights.push("Monitor recovery - high max heart rate achieved");
      }
    }

    return insights;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getZoneColor = (zone: number): string => {
    const zoneKey = `zone${zone}` as keyof HeartRateZones;
    return zones[zoneKey]?.color || '#6B7280';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F3F4F6]">Save Workout</h2>
                <p className="text-sm text-[#CBD5E1]">Duration: {formatDuration(duration)}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Activity Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#F3F4F6] mb-3">Activity Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['Running', 'Cycling', 'Swimming', 'Walking', 'Strength', 'Other'].map((activity) => (
                <button
                  key={activity}
                  onClick={() => setActivityType(activity)}
                  className={`p-3 rounded-xl font-medium transition-all ${
                    activityType === activity
                      ? 'bg-[#EF4444] text-white'
                      : 'bg-[#0D1117] text-[#CBD5E1] hover:bg-[#2B3440]'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          {/* Workout Stats */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">Workout Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#0D1117] rounded-xl">
                <Heart className="w-5 h-5 text-[#EF4444] mx-auto mb-1" />
                <div className="text-lg font-bold text-[#F3F4F6]">{stats.averageHeartRate}</div>
                <div className="text-xs text-[#CBD5E1]">Avg HR</div>
              </div>
              <div className="text-center p-3 bg-[#0D1117] rounded-xl">
                <Zap className="w-5 h-5 text-[#F08A3E] mx-auto mb-1" />
                <div className="text-lg font-bold text-[#F3F4F6]">{stats.caloriesBurned}</div>
                <div className="text-xs text-[#CBD5E1]">Calories</div>
              </div>
              <div className="text-center p-3 bg-[#0D1117] rounded-xl">
                <div className="text-lg font-bold text-[#EF4444]">{stats.maxHeartRate}</div>
                <div className="text-xs text-[#CBD5E1]">Max HR</div>
              </div>
              <div className="text-center p-3 bg-[#0D1117] rounded-xl">
                <Clock className="w-5 h-5 text-[#6BD0D2] mx-auto mb-1" />
                <div className="text-lg font-bold text-[#F3F4F6]">{Math.round(duration / 60)}</div>
                <div className="text-xs text-[#CBD5E1]">Minutes</div>
              </div>
            </div>
          </div>

          {/* Zone Distribution */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">Zone Distribution</h3>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((zone) => {
                const percentage = stats.zoneDistribution[`zone${zone}` as keyof ZoneDistribution] || 0;
                return (
                  <div key={zone} className="flex items-center space-x-3">
                    <div className="w-8 text-xs text-[#CBD5E1]">Z{zone}</div>
                    <div className="flex-1 bg-[#2B3440] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: getZoneColor(zone)
                        }}
                      />
                    </div>
                    <div className="w-12 text-xs text-[#CBD5E1] text-right">
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#F3F4F6] mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any observations..."
              rows={3}
              className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#EF4444] focus:outline-none resize-none"
            />
          </div>

          {/* AI Insights Preview */}
          {generateAIInsights(stats, duration).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">AI Insights</h3>
              <div className="space-y-2">
                {generateAIInsights(stats, duration).map((insight, index) => (
                  <div key={index} className="p-3 bg-[#F8B84E]/10 border border-[#F8B84E]/30 rounded-xl">
                    <p className="text-sm text-[#F3F4F6]">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2B3440]">
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-[#2B3440] hover:bg-[#0D1117] text-[#CBD5E1] font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Workout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};