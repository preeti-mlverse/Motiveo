import React, { useState } from 'react';
import { Phone, ArrowRight, SkipForward } from 'lucide-react';

interface PhoneVerificationProps {
  onSkip: () => void;
  onVerified: (phone: string) => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onSkip,
  onVerified
}) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    
    setIsLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setStep('otp');
      setIsLoading(false);
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    
    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      onVerified(phone);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F08A3E] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">
            {step === 'phone' ? 'Phone Verification' : 'Enter OTP'}
          </h2>
          <p className="text-[#CBD5E1]">
            {step === 'phone' 
              ? 'We\'ll send you a verification code for secure access'
              : `Code sent to ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`
            }
          </p>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          {step === 'phone' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleSendOTP}
                disabled={phone.length < 10 || isLoading}
                className="w-full bg-[#F08A3E] hover:bg-[#E17226] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Code</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none transition-colors text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || isLoading}
                className="w-full bg-[#F08A3E] hover:bg-[#E17226] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('phone')}
                className="w-full text-[#6BD0D2] font-medium py-2 hover:text-[#4BE0D1] transition-colors"
              >
                Change Phone Number
              </button>
            </div>
          )}
        </div>

        {/* Skip Option */}
        <button
          onClick={onSkip}
          className="w-full mt-6 text-[#CBD5E1] font-medium py-3 px-4 rounded-xl hover:bg-[#161B22] transition-all duration-300 flex items-center justify-center space-x-2 group"
        >
          <span>Skip for now</span>
          <SkipForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};