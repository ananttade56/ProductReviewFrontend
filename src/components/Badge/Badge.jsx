import React from 'react';

export const Badge = ({ children, variant = 'success', className = '', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center px-3.5 py-1.5 rounded-[17px] text-[12px] font-bold tracking-[0.5px] border-[1.5px]";
  
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-600 border-amber-200",
    danger: "bg-red-100 text-red-600 border-red-300"
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
