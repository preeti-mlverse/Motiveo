import React from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import { HeartRateReading, HeartRateZones } from '../../types/cardio';

interface ZoneDistributionChartProps {
  heartRateHistory: HeartRateReading[];
  zones: HeartRateZones;
}

export const ZoneDistributionChart: React.FC<ZoneDistributionChartProps> = ({
  heartRateHistory,
  zones
}) => {
  // Calculate time spent in each zone
  const zoneDistribution = heartRateHistory.reduce((acc, reading) => {
    acc[reading.zone] = (acc[reading.zone] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const totalReadings = heartRateHistory.length;
  const zonePercentages = Object.entries(zoneDistribution).map(([zone, count]) => ({
    zone: parseInt(zone),
    count,
    percentage: (count / totalReadings) * 100
  })).sort((a, b) => a.zone - b.zone);

  const getZoneColor = (zone: number): string => {
    const zoneKey = `zone${zone}` as keyof HeartRateZones;
    return zones[zoneKey]?.color || '#6B7280';
  };

  const getZoneName = (zone: number): string => {
    const zoneKey = `zone${zone}` as keyof HeartRateZones;
    return zones[zoneKey]?.name || `Zone ${zone}`;
  };

  return (
    <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#F3F4F6]">Zone Distribution</h3>
        <PieChart className="w-6 h-6 text-[#6BD0D2]" />
      </div>

      {/* Pie Chart Visualization */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {zonePercentages.reduce((acc, zone, index) => {
              const startAngle = acc.currentAngle;
              const angle = (zone.percentage / 100) * 360;
              const endAngle = startAngle + angle;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              acc.elements.push(
                <path
                  key={zone.zone}
                  d={pathData}
                  fill={getZoneColor(zone.zone)}
                  opacity="0.8"
                  className="hover:opacity-100 transition-opacity"
                />
              );
              
              acc.currentAngle = endAngle;
              return acc;
            }, { elements: [] as React.ReactElement[], currentAngle: 0 }).elements}
            
            {/* Center circle */}
            <circle cx="50" cy="50" r="20" fill="#0D1117" />
            <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-xs fill-[#F3F4F6]">
              {totalReadings}
            </text>
            <text x="50" y="50" textAnchor="middle" dy="1.5em" className="text-xs fill-[#CBD5E1]">
              readings
            </text>
          </svg>
        </div>
      </div>

      {/* Zone Breakdown */}
      <div className="space-y-3">
        {zonePercentages.map((zone) => (
          <div key={zone.zone} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getZoneColor(zone.zone) }}
              />
              <span className="text-[#F3F4F6] font-medium">
                Zone {zone.zone} - {getZoneName(zone.zone)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-[#F3F4F6] font-semibold">
                {zone.percentage.toFixed(1)}%
              </div>
              <div className="text-xs text-[#CBD5E1]">
                {Math.round((zone.count * 2) / 60)} min
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart Alternative */}
      <div className="mt-6 pt-6 border-t border-[#2B3440]">
        <h4 className="text-sm font-medium text-[#F3F4F6] mb-3 flex items-center space-x-2">
          <BarChart3 className="w-4 h-4" />
          <span>Time Distribution</span>
        </h4>
        
        <div className="space-y-2">
          {zonePercentages.map((zone) => (
            <div key={zone.zone} className="flex items-center space-x-3">
              <div className="w-12 text-xs text-[#CBD5E1]">Z{zone.zone}</div>
              <div className="flex-1 bg-[#2B3440] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ 
                    width: `${zone.percentage}%`,
                    backgroundColor: getZoneColor(zone.zone)
                  }}
                />
              </div>
              <div className="w-12 text-xs text-[#CBD5E1] text-right">
                {zone.percentage.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};