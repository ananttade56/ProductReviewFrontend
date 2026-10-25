import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { api } from '../../services/api';

const HeroPreviewCard = () => (
  <div className="w-full max-w-[620px] bg-white border-[1.5px] border-slate-200 rounded-[24px] overflow-hidden shadow-2xl shadow-slate-200/50">
    {/* Window Header */}
    <div className="h-12 bg-slate-900 flex items-center px-4 relative">
      <div className="flex gap-2 z-10">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
      </div>
      <div className="absolute w-full text-center text-slate-400 text-xs font-semibold left-0 pointer-events-none">Live AI Ingredient Analysis Preview</div>
    </div>

    <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-left">
      {/* Left Col */}
      <div className="space-y-4 md:space-y-6">
        <div className="bg-slate-800 border-2 border-dashed border-emerald-500 rounded-2xl p-4 relative">
          <div className="text-emerald-500 text-[11px] font-bold mb-3 tracking-wider">📷 CAPTURED PRODUCT IMAGE</div>
          <div className="bg-slate-700 rounded-xl p-4 relative overflow-hidden">
            <div className="text-white text-[11px] font-bold mb-2">INGREDIENTS:</div>
            <div className="text-slate-300 text-[11px] leading-relaxed relative z-10">
              Refined Wheat Flour (Maida), <br />
              Palm Oil, Sugar, INS 211, <br />
              Acidity Regulator (INS 330), <br />
              Synthetic Food Color (INS 102).
            </div>
            {/* Laser line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] z-20"></div>
          </div>
        </div>
        <div className="bg-slate-50 border-[1.5px] border-slate-200 rounded-2xl p-4">
          <div className="text-emerald-600 text-[11px] font-bold mb-2 tracking-wider">BUILT-IN AI SAFETY ENGINE:</div>
          <div className="text-slate-900 text-[13px] font-medium mb-3">
            Automatic HFSS (High Fat, Sugar, Salt), chemical preservatives & traffic light rating analysis.
          </div>
          <div className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold text-center py-1.5 rounded-lg">
            ✓ Ready-made Food Safety Prompt
          </div>
        </div>
      </div>

      {/* Right Col */}
      <div className="space-y-4 md:space-y-6 flex flex-col justify-between">
        <div className="bg-amber-50 border-[1.5px] border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 border-[3px] border-amber-500 flex items-center justify-center text-amber-700 font-extrabold text-sm shrink-0">
            54/100
          </div>
          <div>
            <div className="text-amber-800 font-bold text-[14px]">Moderate Risk</div>
            <div className="text-amber-700 text-[11px]">2 Red Flags Detected</div>
          </div>
        </div>

        <div className="bg-emerald-50 border-[1.5px] border-emerald-300 rounded-2xl p-4">
          <div className="text-emerald-700 text-[11px] font-bold mb-2 tracking-wider">✓ AI VERDICT:</div>
          <div className="text-slate-900 text-[12px] leading-relaxed">
            Avoid daily use. High in Refined Wheat Flour (Maida) and Palm Oil, plus synthetic preservative INS 211.
            <span className="block font-bold text-emerald-800 mt-1">Limit to 1x per week.</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center">
          <div>
            <div className="text-slate-900 text-[12px] font-bold">INS 211 (Sodium Benzoate)</div>
            <div className="text-slate-500 text-[11px]">Synthetic preservative</div>
          </div>
          <div className="bg-red-100 text-red-600 text-[11px] font-bold px-3 py-1 rounded-full">Avoid</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center">
          <div>
            <div className="text-slate-900 text-[12px] font-bold">Palm Oil & Maida</div>
            <div className="text-slate-500 text-[11px]">High saturated fat & GI spike</div>
          </div>
          <div className="bg-amber-100 text-amber-600 text-[11px] font-bold px-3 py-1 rounded-full">Caution</div>
        </div>
      </div>
    </div>
  </div>
);

export const Hero = () => {
  const navigate = useNavigate();
  const [typedCount, setTypedCount] = useState(0);
  const [quickQuery, setQuickQuery] = useState('');
  const [quickResults, setQuickResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const fullText = "Decode Every Product Label With AI Precision.";

  useEffect(() => {
    let audioCtx = null;
    const initAudio = () => {
      if (!audioCtx) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            audioCtx = new AudioContext();
            window.__heroAudioCtx = audioCtx;
          }
        } catch (e) {
          console.warn("AudioContext failed to initialize:", e);
        }
      }
    };

    initAudio();
    const handleInteract = () => initAudio();
    window.addEventListener('click', handleInteract, { once: true });

    const interval = setInterval(() => {
      setTypedCount((prev) => {
        if (prev < fullText.length) {
          const ctx = window.__heroAudioCtx;
          if (ctx && ctx.state !== 'suspended') {
            try {
              const oscillator = ctx.createOscillator();
              const gainNode = ctx.createGain();
              oscillator.type = 'triangle';
              oscillator.frequency.setValueAtTime(600 + Math.random() * 100, ctx.currentTime);
              oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03);
              gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
              oscillator.connect(gainNode);
              gainNode.connect(ctx.destination);
              oscillator.start();
              oscillator.stop(ctx.currentTime + 0.1);
            } catch (e) { }
          }
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 80);

    return () => {
      window.removeEventListener('click', handleInteract);
      clearInterval(interval);
    };
  }, []);

  // Quick additive lookup on homepage
  const handleAdditiveSearch = async (val) => {
    setQuickQuery(val);
    if (!val || val.trim().length < 2) {
      setQuickResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.searchIngredients(val.trim());
      if (res?.success && res.results) {
        setQuickResults(res.results.slice(0, 3));
      } else {
        setQuickResults([]);
      }
    } catch {
      setQuickResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const displayedText = fullText.slice(0, typedCount);
  const part1 = displayedText.slice(0, 21);
  const part2 = displayedText.slice(21, 27);
  const part3 = displayedText.slice(27);

  const letterVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.1 } }
  };

  return (
    <section className="relative mb-8 md:mb-10 py-2 md:py-4 z-0 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
      {/* Decorative Background Circle */}
      <div className="absolute -left-10 lg:-left-20 top-40 md:top-48 w-[320px] h-[320px] md:w-[440px] md:h-[440px] bg-emerald-600/[0.05] rounded-full -z-10 pointer-events-none"></div>

      {/* Left Text Column */}
      <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start w-full min-h-[500px]">
        <Badge variant="success">🔬 AI-POWERED INGREDIENT SCANNER</Badge>
        <h1 className="text-3xl md:text-4xl lg:text-[44px] xl:text-5xl font-extrabold leading-[1.2] my-4 md:my-5 text-slate-900 min-h-[110px] md:min-h-[130px] lg:min-h-[160px] xl:min-h-[180px]">
          {part1.split("").map((char, index) => (
            <motion.span key={`t1-${index}`} initial="hidden" animate="visible" variants={letterVariants}>
              {char}
            </motion.span>
          ))}
          {typedCount >= 21 && <br className="hidden md:block lg:hidden xl:block" />}
          {part2.split("").map((char, index) => (
            <motion.span key={`t2-${index}`} initial="hidden" animate="visible" variants={letterVariants}>
              {char}
            </motion.span>
          ))}
          <span className="text-emerald-600">
            {part3.split("").map((char, index) => (
              <motion.span key={`t3-${index}`} initial="hidden" animate="visible" variants={letterVariants}>
                {char}
              </motion.span>
            ))}
          </span>
          {/* Blinking Cursor */}
          <motion.span
            className="inline-block w-[3px] h-[1em] bg-emerald-500 align-middle ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "circInOut" }}
          />
        </h1>
        <p className="text-base md:text-[17px] text-slate-600 max-w-[600px] leading-relaxed mb-6 md:mb-[24px] px-2 lg:px-0">
          Capture any food or cosmetic ingredient list from your mobile or desktop, ask a custom health question, and get an instant AI safety verdict tailored to your age and profile.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 lg:px-0 mb-6">
          <Button variant="primary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/scanner')}>
            Scan a Product Now →
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/register')}>
            Create User Profile
          </Button>
        </div>

        {/* Live Additive Quick Lookup Widget */}
        <div className="w-full max-w-[540px] px-4 lg:px-0 mb-4">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 shadow-xs text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Quick Additive Check (Instant API Lookup)
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Live Database</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => handleAdditiveSearch(e.target.value)}
                placeholder="Type additive or INS code (e.g. 211, palm, sugar, MSG, aspartame)..."
                className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 text-xs text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Live Search Quick Results */}
            {quickResults.length > 0 && (
              <div className="mt-2.5 space-y-1.5 border-t border-slate-200 pt-2">
                {quickResults.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-2 border border-slate-200 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.riskLevel === 'high'
                        ? 'bg-red-100 text-red-700'
                        : item.riskLevel === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.riskLevel ? item.riskLevel.toUpperCase() : 'CHECK'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trust Stats Row */}
        <div className="w-full max-w-[620px] mt-4 pt-6 border-t-[1.5px] border-slate-200 px-4 lg:px-0">
          <div className="flex flex-col sm:flex-row justify-between gap-8 sm:gap-4">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">99.4%</h3>
              <p className="text-[13px] text-slate-500">OCR Label Accuracy</p>
            </div>
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">&lt; 2.5 Sec</h3>
              <p className="text-[13px] text-slate-500">Instant AI Prompt Response</p>
            </div>
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Age-Smart</h3>
              <p className="text-[13px] text-slate-500">Personalized Risk Scoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image/Card Column */}
      <div className="flex-1 w-full flex justify-center lg:justify-end relative">
        <HeroPreviewCard />
      </div>
    </section>
  );
};
