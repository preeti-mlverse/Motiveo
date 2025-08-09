import React from 'react';
import { Heart, Activity, AlertTriangle } from 'lucide-react';
import { HeartRateZones, HeartRateReading } from '../../types/cardio';

interface LiveHeartRateMonitorProps {
  currentHeartRate: number;
  currentZone: number;
  currentZoneColor: string;
  currentZoneName: string;
  zones: HeartRateZones;
  isWorkoutActive: boolean;
  workoutDuration: number;
  heartRateHistory: HeartRateReading[];
}

export const LiveHeartRateMonitor: React.FC<LiveHeartRateMonitorProps> = ({
  currentHeartRate,
  currentZone,
  currentZoneColor,
  currentZoneName,
  zones,
  isWorkoutActive,
  workoutDuration,
  heartRateHistory
}) => {
  const getZoneAlert = () => {
    if (currentZone >= 5) {
      return { message: "Slow down - you're in Max zone!", type: 'danger' };
    }
    if (currentZone >= 4) {
      return { message: "High intensity - monitor closely", type: 'warning' };
    }
    if (currentZone <= 1 && isWorkoutActive) {
      return { message: "Consider increasing intensity", type: 'info' };
    }
    return null;
  };

  const alert = getZoneAlert();

  // Create mini heart rate graph
  const recentReadings = heartRateHistory.slice(-20);
  const maxHR = Math.max(...recentReadings.map(r => r.bpm), currentHeartRate);
  const minHR = Math.min(...recentReadings.map(r => r.bpm), currentHeartRate);
  const range = maxHR - minHR || 1;

  return (
    <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
      {/* Alert Banner */}
      {alert && (
        <div className={`mb-4 p-3 rounded-xl flex items-center space-x-3 ${
          alert.type === 'danger' ? 'bg-red-500/10 border border-red-500/30' :
          alert.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
          'bg-blue-500/10 border border-blue-500/30'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${
            alert.type === 'danger' ? 'text-red-400' :
            alert.type === 'warning' ? 'text-yellow-400' :
            'text-blue-400'
          }`} />
          <span className={`text-sm font-medium ${
            alert.type === 'danger' ? 'text-red-400' :
            alert.type === 'warning' ? 'text-yellow-400' :
            'text-blue-400'
          }`}>
            {alert.message}
          </span>
        </div>
      )}

      {/* Main Heart Rate Display */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div 
            className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
              isWorkoutActive ? 'animate-pulse' : ''
            }`}
            style={{ 
              borderColor: currentZoneColor,
              backgroundColor: `${currentZoneColor}20`
            }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-[#F3F4F6]">{currentHeartRate}</div>
              <div className="text-sm text-[#CBD5E1]">BPM</div>
            </div>
          </div>
          
          {/* Pulsing heart icon */}
          <div className="absolute -top-2 -right-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isWorkoutActive ? 'animate-pulse' : ''
            }`} style={{ backgroundColor: currentZoneColor }}>
              <Heart className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div 
            className="text-lg font-semibold mb-1"
            style={{ color: currentZoneColor }}
          >
            Zone {currentZone} - {currentZoneName}
          </div>
          <div className="text-sm text-[#CBD5E1]">
            Target: {zones[`zone${currentZone}` as keyof HeartRateZones].min} - {zones[`zone${currentZone}` as keyof HeartRateZones].max} BPM
          </div>
        </div>
      </div>

      {/* Heart Rate Graph */}
      {recentReadings.length > 1 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-[#F3F4F6] mb-3">Live Heart Rate</h4>
          <div className="relative h-20 bg-[#0D1117] rounded-xl p-2 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Zone background bands */}
              {Object.entries(zones).map(([key, zone]) => {
                const zoneMin = ((zone.min - minHR) / range) * 100;
                const zoneMax = ((zone.max - minHR) / range) * 100;
                return (
                  <rect
                    key={key}
                    x="0"
                    y={100 - zoneMax}
                    width="100"
                    height={zoneMax - zoneMin}
                    fill={zone.color}
                    opacity="0.1"
                  />
                );
              })}
              
              {/* Heart rate line */}
              <polyline
                points={recentReadings.map((reading, index) => {
                  const x = (index / (recentReadings.length - 1)) * 100;
                  const y = 100 - ((reading.bpm - minHR) / range) * 100;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={currentZoneColor}
                strokeWidth="2"
                className="drop-shadow-sm"
              />
              
              {/* Current point */}
              {recentReadings.length > 0 && (
                <circle
                  cx="100"
                  cy={100 - ((currentHeartRate - minHR) / range) * 100}
                  r="2"
                  fill={currentZoneColor}
                  className="drop-shadow-sm"
                />
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Zone Indicators */}
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(zones).map(([key, zone]) => {
          const zoneNumber = parseInt(key.slice(-1));
          const isCurrentZone = zoneNumber === currentZone;
          
          return (
            <div
              key={key}
              className={`text-center p-2 rounded-lg transition-all ${
                isCurrentZone 
                  ? 'bg-opacity-20 border-2' 
                  : 'bg-opacity-10 border border-opacity-30'
              }`}
              style={{ 
                backgroundColor: `${zone.color}${isCurrentZone ? '40' : '20'}`,
                borderColor: zone.color
              }}
            >
              <div className="text-xs font-bold" style={{ color: zone.color }}>
                Z{zoneNumber}
              </div>
              <div className="text-xs text-[#CBD5E1]">{zone.name}</div>
              <div className="text-xs text-[#CBD5E1]">
                {zone.min}-{zone.max}
              </div>
            </div>
          );
        })}
      </div>

      {/* Device Status */}
      <div className="mt-4 pt-4 border-t border-[#2B3440]">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[#CBD5E1]">Heart Rate Monitor Connected</span>
          </div>
          <div className="text-[#CBD5E1]">
            {isWorkoutActive ? 'Recording' : 'Monitoring'}
          </div>
        </div>
      </div>
    </div>
  );
};