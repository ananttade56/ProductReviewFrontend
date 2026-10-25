import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { api } from '../../services/api';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [apiOnline, setApiOnline] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const localUser = api.getUser();
    setUser(localUser);

    // Check backend health
    api.getHealth()
      .then((res) => {
        setApiOnline(res?.status === 'healthy' || res?.status === 'online');
      })
      .catch(() => setApiOnline(false));

    // If logged in, optionally refresh user profile
    if (localUser && api.getToken()) {
      api.getMe().then((res) => {
        if (res?.success && res?.user) {
          setUser(res.user);
          api.setAuth(null, res.user);
        }
      });
    }
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="flex flex-wrap justify-between items-center py-4 px-4 md:px-10 mb-2 md:mb-4 bg-white border border-slate-200 rounded-[20px] shadow-sm relative z-50">
      <div className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-[10px] flex items-center justify-center">
          <div className="w-4 h-4 md:w-5 md:h-5 border-[2px] md:border-[2.2px] border-white rounded bg-transparent relative flex items-center">
            <div className="w-5 md:w-6 h-[2px] md:h-[2.2px] bg-emerald-200 absolute -left-[3px]"></div>
          </div>
        </div>
        <Link to="/" className="flex items-center gap-2">
          <span>NutriLens <span className="text-emerald-600">AI</span></span>
          {apiOnline !== null && (
            <span
              title={apiOnline ? "Backend API Online" : "Backend API Offline"}
              className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                apiOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {apiOnline ? 'API Connected' : 'Offline Mode'}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 text-slate-600 focus:outline-none cursor-pointer"
        aria-label="Toggle Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      <nav className={`${isOpen ? 'flex' : 'hidden'} w-full lg:w-auto lg:flex flex-col lg:flex-row gap-4 lg:gap-8 mt-4 lg:mt-0 order-3 lg:order-none pb-2 lg:pb-0 items-center`}>
        <Link to="/" className="text-sm font-semibold text-emerald-600 cursor-pointer transition-colors block py-2 lg:py-0">Home</Link>
        <Link to="/scanner" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5 py-2 lg:py-0">
          <span>AI Scanner</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">Live</span>
        </Link>

        {user ? (
          <div className="flex flex-col lg:flex-row items-center gap-3 mt-2 lg:mt-0">
            <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{user.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs">
              Sign Out
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile auth buttons inside menu */}
            <div className="flex lg:hidden flex-col gap-3 mt-2 w-full">
              <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); navigate('/login'); }}>Log In</Button>
              <Button variant="primary" className="w-full" onClick={() => { setIsOpen(false); navigate('/register'); }}>Register Free</Button>
            </div>
          </>
        )}
      </nav>

      {/* Desktop auth buttons */}
      {!user && (
        <div className="hidden lg:flex gap-3">
          <Button variant="outline" onClick={() => navigate('/login')}>Log In</Button>
          <Button variant="primary" onClick={() => navigate('/register')}>Register Free</Button>
        </div>
      )}
    </header>
  );
};
