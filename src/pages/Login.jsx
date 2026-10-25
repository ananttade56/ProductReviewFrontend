import React from 'react';
import { LoginLeft } from '../components/Login/LoginLeft';
import { LoginRight } from '../components/Login/LoginRight';

export const Login = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Container */}
      <div className="w-full max-w-[840px] bg-transparent lg:bg-white lg:border-[1.5px] lg:border-slate-200 rounded-[24px] lg:shadow-xl lg:shadow-slate-200/50 flex flex-col lg:flex-row min-h-[200px] overflow-hidden">
        <LoginLeft />
        <LoginRight />
      </div>
    </div>
  );
};
