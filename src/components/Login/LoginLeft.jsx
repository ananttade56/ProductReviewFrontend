import React from 'react';

export const LoginLeft = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between w-[380px] bg-emerald-900 p-10 text-white relative shrink-0">
      {/* Background circles */}
      <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] bg-emerald-700/40 rounded-full pointer-events-none"></div>
      <div className="absolute -top-16 -right-16 w-[280px] h-[280px] bg-emerald-500/15 rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full justify-center">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-11 h-11 bg-emerald-500 rounded-[10px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-5 h-5 border-[2.2px] border-white rounded bg-transparent relative flex items-center">
              <div className="w-6 h-[2.2px] bg-emerald-100 absolute -left-[3px]"></div>
            </div>
          </div>
          <span className="text-xl font-extrabold text-white tracking-wide">NutriLens <span className="text-emerald-300">AI</span></span>
        </div>

        <div>
          <h2 className="text-[28px] font-bold mb-3">Welcome Back!</h2>
          <p className="text-emerald-200 text-[14px] leading-relaxed max-w-[280px] mb-8">
            Log in to access your saved scans, custom prompts, and AI health insights.
          </p>
        </div>

        <div className="bg-emerald-800 border border-emerald-700 rounded-2xl p-5 relative z-10 flex gap-4 items-center">
          <div className="w-12 h-12 bg-emerald-700/50 rounded-xl flex items-center justify-center font-bold text-white shrink-0">
            AI
          </div>
          <div>
            <div className="font-semibold text-[14px] text-white">Instant OCR + Gemini AI</div>
            <div className="text-emerald-100 text-[12px] mt-1">Scan any food or cosmetic label</div>
          </div>
        </div>
      </div>
    </div>
  );
};
