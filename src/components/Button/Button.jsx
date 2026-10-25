import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center border-none cursor-pointer transition-all duration-200 font-semibold rounded-[10px]";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-[0_4px_12px_rgba(5,150,105,0.3)]",
    outline: "bg-white text-slate-900 border-[1.5px] border-slate-300 hover:bg-slate-50"
  };

  const sizes = {
    md: "h-10 px-5 text-sm",
    lg: "h-12 md:h-14 px-6 md:px-8 text-[15px] md:text-base rounded-[12px] md:rounded-[14px]"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
