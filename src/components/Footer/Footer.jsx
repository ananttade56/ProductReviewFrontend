import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 w-full mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-4 h-auto md:h-12 flex flex-col md:flex-row justify-between items-center text-[12px] gap-2 md:gap-0">
        <div className="text-slate-400 text-center md:text-left">
          © 2026 NutriLens AI — Smart Product Ingredient Scanner. Mobile & Desktop Web App.
        </div>
        <div className="text-emerald-500 font-semibold text-center md:text-right">
          Powered by Gemini Vision API
        </div>
      </div>
    </footer>
  );
};
