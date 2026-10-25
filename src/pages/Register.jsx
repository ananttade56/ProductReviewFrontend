import React from 'react';
import { RegisterLeft } from '../components/Register/RegisterLeft';
import { RegisterRight } from '../components/Register/RegisterRight';

export const Register = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Container */}
      <div className="w-full max-w-[1020px] bg-transparent lg:bg-white lg:border-[1.5px] lg:border-slate-200 rounded-[24px] lg:shadow-xl lg:shadow-slate-200/50 flex flex-col lg:flex-row min-h-[580px] overflow-hidden">
        <RegisterLeft />
        <RegisterRight />
      </div>
    </div>
  );
};
