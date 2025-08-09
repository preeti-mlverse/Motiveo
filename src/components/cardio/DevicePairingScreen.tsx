import React, { useState, useEffect } from 'react';
import { Heart, Watch, Camera, Scale, Bluetooth, CheckCircle, AlertCircle, SkipForward } from 'lucide-react';
import { ConnectedDevice } from '../../types/cardio';

interface DevicePairingScreenProps {
  onComplete: (devices: ConnectedDevice[]) => void;
  onSkip: () => void;
}

const availableDevices = [
  {
    type: 'heart_rate_monitor' as const,
    name: 'Heart Rate Monitor',
    icon: Heart,
    description: 'Chest strap or wrist-based HR monitor',
    color: '#EF4444',
    recommended: true
  },
  {
    type: 'smartwatch' as const,
    name: 'Smartwatch',
    icon: Watch,
    description: 'Apple Watch, Garmin, Fitbit, etc.',
    color: '#3B82F6',
    recommended: true
  },
  {
    type: 'phone_camera' as const,
    name: 'Phone Camera',
    icon: Camera,
    description: 'Use camera for heart rate detection',
    color: '#10B981',
    recommended: false
  },
  {
    type: 'smart_scale' as const,
    name: 'Smart Scale',
    icon: Scale,
    description: 'Track weight and body composition',
    color: '#F59E0B',
    recommended: false
  }
];

export const DevicePairingScreen: React.FC<DevicePairingScreenProps> = ({
  onComplete,
  onSkip
}) => {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [scanningDevices, setScanningDevices] = useState<string[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const toggleDevice = (deviceType: string) => {
    if (selectedDevices.includes(deviceType)) {
      setSelectedDevices(prev => prev.filter(d => d !== deviceType));
    } else {
      setSelectedDevices(prev => [...prev, deviceType]);
    }
  };

  const startScanning = async () => {
    if (selectedDevices.length === 0) return;
    
    setIsScanning(true);
    setScanningDevices(selectedDevices);
    
    // Simulate device scanning and pairing
    for (const deviceType of selectedDevices) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const device = availableDevices.find(d => d.type === deviceType);
      if (device) {
        const connectedDevice: ConnectedDevice = {
          id: `${deviceType}_${Date.now()}`,
          name: device.name,
          type: deviceType as any,
          status: 'connected',
          batteryLevel: Math.floor(Math.random() * 40) + 60,
          lastSync: new Date()
        };
        
        setConnectedDevices(prev => [...prev, connectedDevice]);
        setScanningDevices(prev => prev.filter(d => d !== deviceType));
      }
    }
    
    setIsScanning(false);
  };

  const handleComplete = () => {
    onComplete(connectedDevices);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#EF4444] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bluetooth className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Connect Your Devices</h2>
          <p className="text-[#CBD5E1]">
            Pair your devices for accurate heart rate monitoring and better insights
          </p>
        </div>

        {/* Device Selection */}
        <div className="space-y-4 mb-8">
          {availableDevices.map((device) => {
            const Icon = device.icon;
            const isSelected = selectedDevices.includes(device.type);
            const isScanning = scanningDevices.includes(device.type);
            const isConnected = connectedDevices.some(d => d.type === device.type);
            
            return (
              <button
                key={device.type}
                onClick={() => !isScanning && !isConnected && toggleDevice(device.type)}
                disabled={isScanning || isConnected}
                className={`
                  w-full p-4 rounded-2xl border-2 transition-all text-left relative
                  ${isConnected 
                    ? 'border-green-500 bg-green-500/10' 
                    : isSelected 
                      ? 'border-[#EF4444] bg-[#EF4444]/10' 
                      : 'border-[#2B3440] bg-[#161B22] hover:border-[#EF4444]/50'
                  }
                  ${(isScanning || isConnected) ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Recommended Badge */}
                {device.recommended && !isConnected && (
                  <div className="absolute top-2 right-2 bg-[#F59E0B] text-white px-2 py-1 rounded-full text-xs font-medium">
                    Recommended
                  </div>
                )}

                {/* Status Icon */}
                {isConnected && (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center`}
                    style={{ backgroundColor: `${device.color}20`, color: device.color }}
                  >
                    {isScanning ? (
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#F3F4F6]">{device.name}</h3>
                    <p className="text-sm text-[#CBD5E1]">{device.description}</p>
                    
                    {isConnected && (
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-400">Connected</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Connected Devices Summary */}
        {connectedDevices.length > 0 && (
          <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440] mb-6">
            <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">Connected Devices</h3>
            <div className="space-y-2">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between">
                  <span className="text-sm text-[#CBD5E1]">{device.name}</span>
                  <div className="flex items-center space-x-2">
                    {device.batteryLevel && (
                      <span className="text-xs text-[#6BD0D2]">{device.batteryLevel}%</span>
                    )}
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {selectedDevices.length > 0 && connectedDevices.length === 0 && (
            <button
              onClick={startScanning}
              disabled={isScanning}
              className="w-full bg-[#EF4444] hover:bg-[#DC2626] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Bluetooth className="w-5 h-5" />
                  <span>Start Pairing</span>
                </>
              )}
            </button>
          )}

          {connectedDevices.length > 0 && (
            <button
              onClick={handleComplete}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Continue with {connectedDevices.length} Device{connectedDevices.length > 1 ? 's' : ''}</span>
            </button>
          )}

          <button
            onClick={onSkip}
            className="w-full text-[#CBD5E1] font-medium py-3 px-4 rounded-xl hover:bg-[#161B22] transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <SkipForward className="w-4 h-4" />
            <span>Skip Device Setup</span>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-[#161B22] rounded-xl border border-[#2B3440]">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-[#F3F4F6] mb-1">Device Tips</h4>
              <ul className="text-xs text-[#CBD5E1] space-y-1">
                <li>• Heart rate monitors provide the most accurate readings</li>
                <li>• Make sure devices are charged and in pairing mode</li>
                <li>• You can add more devices later in settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};