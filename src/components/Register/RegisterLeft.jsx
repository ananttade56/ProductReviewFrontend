import React from 'react';

export const RegisterLeft = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between w-[440px] bg-emerald-900 p-10 text-white relative shrink-0">
      {/* Background circles */}
      <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] bg-emerald-700/40 rounded-full pointer-events-none"></div>
      <div className="absolute -top-16 -right-16 w-[280px] h-[280px] bg-emerald-500/15 rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full justify-center">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-11 h-11 bg-emerald-500 rounded-[10px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-5 h-5 border-[2.2px] border-white rounded bg-transparent relative flex items-center">
              <div className="w-6 h-[2.2px] bg-emerald-100 absolute -left-[3px]"></div>
            </div>
          </div>
          <span className="text-xl font-extrabold text-white tracking-wide">NutriLens <span className="text-emerald-300">AI</span></span>
        </div>

        <div className="text-emerald-200 text-[12px] font-bold tracking-widest mb-3 uppercase">AI INGREDIENT SCANNER</div>
        <h2 className="text-[32px] font-bold leading-[1.2] mb-4">
          Know What Goes<br />Into Your Body.
        </h2>
        <p className="text-emerald-50 text-[14px] leading-relaxed mb-10 opacity-90">
          Snap a photo of any product's ingredient list, ask your custom health question, and get an instant AI review.
        </p>

        <div className="space-y-4">
          <div className="bg-emerald-800/80 border border-emerald-700 rounded-2xl p-4 flex gap-4 items-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-[13px]">
              1
            </div>
            <div>
              <div className="font-bold text-[14px] text-white">Age-Personalized Analysis</div>
              <div className="text-emerald-100/80 text-[12px] mt-0.5">Tailors ingredient warnings to your exact age group</div>
            </div>
          </div>

          <div className="bg-emerald-800/80 border border-emerald-700 rounded-2xl p-4 flex gap-4 items-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-[13px]">
              2
            </div>
            <div>
              <div className="font-bold text-[14px] text-white">Custom Prompt Q&A</div>
              <div className="text-emerald-100/80 text-[12px] mt-0.5">Ask specific dietary, allergy, or daily-use questions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
