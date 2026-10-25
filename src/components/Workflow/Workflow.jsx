import React from 'react';
import { Card } from '../Card/Card';

export const Workflow = () => {
  return (
    <section className="py-8 md:py-10 text-center">
      <div className="mb-10 md:mb-12">
        <div className="text-emerald-600 text-[11px] md:text-[12px] font-bold tracking-[1.5px] uppercase mb-2 md:mb-3">
          COMPLETE PROJECT WORKFLOW
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900">
          How NutriLens AI Works in 4 Simple Steps
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        {/* Step 1 */}
        <Card className="h-full flex flex-col">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 text-lg font-extrabold flex items-center justify-center mb-5 md:mb-6 shrink-0">
            01
          </div>
          <h3 className="text-[17px] md:text-[18px] font-bold text-slate-900 mb-2 md:mb-3">Quick Registration</h3>
          <p className="text-slate-500 text-[13px] leading-relaxed">
            Sign up with your Name, Email, Mobile No., Age, and Address so AI knows your health profile.
          </p>
        </Card>

        {/* Step 2 */}
        <Card className="h-full flex flex-col">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 text-lg font-extrabold flex items-center justify-center mb-5 md:mb-6 shrink-0">
            02
          </div>
          <h3 className="text-[17px] md:text-[18px] font-bold text-slate-900 mb-2 md:mb-3">Secure Login</h3>
          <p className="text-slate-500 text-[13px] leading-relaxed">
            Log in via Email/Mobile & OTP on mobile or desktop to access the camera scanner & history.
          </p>
        </Card>

        {/* Step 3 */}
        <Card className="h-full flex flex-col">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 text-lg font-extrabold flex items-center justify-center mb-5 md:mb-6 shrink-0">
            03
          </div>
          <h3 className="text-[17px] md:text-[18px] font-bold text-slate-900 mb-2 md:mb-3">Instant Label Scan</h3>
          <p className="text-slate-500 text-[13px] leading-relaxed">
            Snap or upload a photo of the product's ingredient list for automatic AI evaluation using our food safety engine.
          </p>
        </Card>

        {/* Step 4 */}
        <Card variant="dark" className="h-full flex flex-col">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white text-lg font-extrabold flex items-center justify-center mb-5 md:mb-6 shrink-0">
            04
          </div>
          <h3 className="text-[17px] md:text-[18px] font-bold text-white mb-2 md:mb-3">Instant AI Verdict</h3>
          <p className="text-emerald-100 text-[13px] leading-relaxed">
            Get a Traffic Light Safety Rating (🟢 Safe, 🟡 Moderate, 🔴 Unsafe), Samagri Analysis table, and Long-Term health effects.
          </p>
        </Card>
      </div>
    </section>
  );
};

