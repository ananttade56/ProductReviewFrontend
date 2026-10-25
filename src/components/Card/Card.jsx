import React from 'react';

export const Card = ({ children, variant = 'default', className = '', ...props }) => {
  const baseClasses = "rounded-[20px] p-6 transition-all duration-200";
  
  const variants = {
    default: "bg-white border-[1.5px] border-slate-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md",
    dark: "bg-emerald-900 text-white border-transparent"
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
