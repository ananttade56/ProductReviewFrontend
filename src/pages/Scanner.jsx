import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

export const Scanner = () => {
  const navigate = useNavigate();

  // Mode: 'camera' | 'text' | 'lookup'
  const [activeTab, setActiveTab] = useState('camera');

  // Camera & Capture State
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Manual Text Ingredients State
  const [manualIngredients, setManualIngredients] = useState('');

  // Additive Quick Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Initialize Camera and Load Backend History on Mount
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    }
    loadHistory();

    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getHistory();
      if (res && res.success && res.scans) {
        setScanHistory(res.scans);
      }
    } catch (err) {
      console.warn('Could not load scan history from backend:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera streaming not supported on this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Live camera stream unavailable:', err);
      setCameraError(err.message || 'Camera access not permitted. Tap below to capture or upload.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Capture Photo from Live Stream or Fallback to Native Camera
  const handleCapture = () => {
    if (cameraActive && videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      stopCamera();
      // Immediately send scanned image to backend AI with ready-made prompt
      handleRunAnalysis(dataUrl);
    } else {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  // Handle Image Upload (from Gallery or Native Camera file)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setCapturedImage(dataUrl);
        stopCamera();
        // Immediately send uploaded image to backend AI with ready-made prompt
        handleRunAnalysis(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset / Retake Photo
  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setScanError(null);
    setIsAnalyzing(false);
    startCamera();
  };

  // Additive search handler
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.searchIngredients(query.trim());
      if (res?.success && res.results) {
        setSearchResults(res.results);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Delete scan from history
  const handleDeleteScan = async (scanId) => {
    try {
      const res = await api.deleteScan(scanId);
      if (res?.success) {
        setScanHistory((prev) => prev.filter((item) => (item.id || item._id) !== scanId));
      }
    } catch (err) {
      console.warn('Failed to delete scan:', err);
    }
  };

  // Clear all scan history
  const handleClearHistory = async () => {
    if (!window.confirm('Clear all scan history?')) return;
    try {
      const res = await api.clearHistory();
      if (res?.success) {
        setScanHistory([]);
      }
    } catch (err) {
      console.warn('Failed to clear history:', err);
    }
  };

  // Run AI Analysis with Backend API (uses ready-made PREDEFINED_PROMPT in backend)
  const handleRunAnalysis = async (customImage = null) => {
    const targetImage = customImage || capturedImage;
    setScanError(null);
    setIsAnalyzing(true);
    try {
      const currentUser = api.getUser();
      const payload = {
        userProfile: currentUser ? { name: currentUser.name, age: currentUser.age } : { name: 'User', age: 26 },
      };

      if (activeTab === 'text') {
        if (!manualIngredients || manualIngredients.trim().length < 3) {
          throw new Error('Please type or paste product ingredients text first.');
        }
        payload.ingredientsText = manualIngredients.trim();
      } else {
        if (!targetImage) {
          throw new Error('Please capture or upload a product label photo first.');
        }
        payload.image = targetImage;
      }

      // Backend automatically applies ready-made food safety PREDEFINED_PROMPT
      const res = await api.analyzeScan(payload);

      if (res && res.success && res.scan) {
        setAnalysisResult(res.scan);
        setScanHistory((prev) => [
          res.scan,
          ...prev.filter((item) => String(item.id || item._id) !== String(res.scan.id || res.scan._id)),
        ]);
      } else {
        throw new Error(res?.message || 'Failed to analyze product');
      }
    } catch (err) {
      console.warn('Backend API error or fallback:', err);
      setScanError(err.message || 'Analysis could not be completed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full min-h-[100dvh] h-[100dvh] max-h-[100dvh] bg-[#0F172A] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Container: Fullscreen on mobile, centered compact on desktop */}
      <div className="w-full h-full md:max-w-[420px] md:h-[860px] md:max-h-[96vh] md:rounded-[36px] md:border-4 md:border-[#1E293B] md:shadow-2xl bg-[#0F172A] flex flex-col justify-between overflow-hidden relative">

        {/* Hidden File Inputs for Native Camera and Gallery */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          type="file"
          accept="image/*"
          ref={galleryInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Top Header */}
        <header className="px-4 pt-3 pb-2 shrink-0 z-20 flex items-center justify-between">
          <Link
            to="/"
            title="Back to Home"
            className="w-8 h-8 rounded-full bg-[#1E293B] border border-slate-700/60 flex items-center justify-center text-[#10B981] font-bold text-xs hover:bg-slate-700 transition-colors shadow-sm"
          >
            ←
          </Link>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#1E293B] p-0.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => { setActiveTab('camera'); setScanError(null); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${activeTab === 'camera'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span>📷 Camera</span>
            </button>
            <button
              onClick={() => { setActiveTab('text'); stopCamera(); setScanError(null); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${activeTab === 'text'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span>📝 Paste Text</span>
            </button>
            <button
              onClick={() => { setActiveTab('lookup'); stopCamera(); setScanError(null); }}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${activeTab === 'lookup'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span>🔍 INS</span>
            </button>
          </div>

          {/* History Button */}
          <button
            onClick={() => setShowHistory(true)}
            className="h-8 px-2.5 rounded-lg bg-[#1E293B] border border-slate-700/60 text-[#94A3B8] font-semibold text-[11px] hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </button>
        </header>

        {/* Viewport Area */}
        <div className="px-4 py-1 flex-1 flex flex-col justify-center min-h-0 relative z-10">
          <div className="w-full h-full bg-[#1E293B] rounded-[22px] border-2 border-dashed border-[#10B981] relative overflow-hidden flex flex-col items-center justify-center p-3 shadow-inner">

            {activeTab === 'camera' && (
              <>
                {capturedImage ? (
                  <div className="w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center bg-black">
                    <img
                      src={capturedImage}
                      alt="Captured Product Label"
                      className="w-full h-full object-cover"
                    />
                    {isAnalyzing ? (
                      <>
                        {/* Animated Scanning Laser Line */}
                        <motion.div
                          className="absolute left-0 w-full pointer-events-none z-10"
                          animate={{ y: [-130, 130, -130] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                        >
                          <div className="h-[2px] w-full bg-[#10B981] shadow-[0_0_12px_#10B981]"></div>
                          <div className="h-6 w-full bg-[#10B981]/25"></div>
                        </motion.div>
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-emerald-500/80 text-[#10B981] px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-md z-20">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          AI Analyzing Label...
                        </div>
                      </>
                    ) : (
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-emerald-500/60 text-[#10B981] px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                        Label Scanned
                      </div>
                    )}
                    {!isAnalyzing && (
                      <button
                        onClick={handleRetake}
                        className="absolute top-3 right-3 bg-slate-900/85 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-md font-medium transition-all cursor-pointer z-20"
                      >
                        Retake ↺
                      </button>
                    )}
                  </div>
                ) : cameraActive ? (
                  <div className="w-full h-full relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Laser Line */}
                    <motion.div
                      className="absolute left-0 w-full pointer-events-none"
                      animate={{ y: [-130, 130, -130] }}
                      transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                    >
                      <div className="h-[2px] w-full bg-[#10B981] shadow-[0_0_10px_#10B981]"></div>
                      <div className="h-5 w-full bg-[#10B981]/20"></div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col justify-between items-center relative py-1 text-center">
                    <div className="w-full max-w-[290px] bg-[#334155] rounded-xl p-3.5 text-left shadow-lg border border-slate-600/50 my-auto">
                      <div className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        CAMERA READY / DEMO PREVIEW
                      </div>
                      <div className="text-white text-xs font-bold mb-1">INGREDIENTS LABEL:</div>
                      <div className="text-slate-300 text-[11px] leading-relaxed">
                        Refined Wheat Flour (Maida), Palm Oil, Sugar, INS 211, INS 330, Tartrazine (INS 102).
                      </div>
                    </div>
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="mt-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload Label Image
                    </button>
                  </div>
                )}
                <div className="text-[#94A3B8] text-[10.5px] text-center font-medium mt-1 tracking-tight shrink-0">
                  Point camera at product label or upload photo
                </div>
              </>
            )}

            {activeTab === 'text' && (
              <div className="w-full h-full flex flex-col justify-between p-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Paste Ingredients Text
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setManualIngredients('Refined Wheat Flour, Palm Oil, Sugar, Liquid Glucose, INS 211, INS 102')}
                      className="text-[9px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Sample Biscuit
                    </button>
                    <button
                      onClick={() => setManualIngredients('Potatoes, Palmolein Oil, Salt, Maltodextrin, INS 621, Acidity Regulator 330')}
                      className="text-[9px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Sample Chips
                    </button>
                  </div>
                </div>

                <textarea
                  rows="4"
                  value={manualIngredients}
                  onChange={(e) => setManualIngredients(e.target.value)}
                  placeholder="Paste or type ingredients list here... (e.g. Palm oil, Sugar, INS 211, Maltodextrin)"
                  className="w-full flex-1 bg-[#0F172A] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-mono"
                />

                <p className="text-[10px] text-slate-400 mt-1">
                  Direct safety review using NutriLens AI & chemical additive rule engine.
                </p>
              </div>
            )}

            {activeTab === 'lookup' && (
              <div className="w-full h-full flex flex-col p-1 overflow-hidden">
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Instant Additive & INS Lookup
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search additive (e.g. 211, Palm oil, Aspartame, MSG)..."
                    className="w-full h-9 px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {isSearching && (
                    <div className="text-center text-xs text-slate-400 py-4">Searching database...</div>
                  )}

                  {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div className="text-center text-xs text-slate-500 py-4">No additives matched your search.</div>
                  )}

                  {!isSearching && searchQuery.length < 2 && (
                    <div className="text-center text-[11px] text-slate-400 py-3">
                      Try searching: <span className="text-emerald-400 cursor-pointer" onClick={() => handleSearch('211')}>INS 211</span>, <span className="text-emerald-400 cursor-pointer" onClick={() => handleSearch('palm')}>Palm Oil</span>, <span className="text-emerald-400 cursor-pointer" onClick={() => handleSearch('maltodextrin')}>Maltodextrin</span>
                    </div>
                  )}

                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0F172A] border border-slate-700/80 rounded-xl p-2.5 text-left text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white text-[12px]">{item.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.riskLevel === 'high'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : item.riskLevel === 'moderate'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                          {item.riskLevel ? item.riskLevel.toUpperCase() : 'CHECK'}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-400 mb-1">{item.category}</div>
                      <div className="text-[11px] text-slate-300 leading-tight">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Control Sheet */}
        <div className="bg-white rounded-t-[28px] pt-2 px-4 pb-3 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] shrink-0 relative z-20">
          <div className="w-10 h-1 bg-[#CBD5E1] rounded-full mx-auto my-1"></div>

          {/* Error Banner */}
          {scanError && (
            <div className="mb-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold flex items-center justify-between">
              <span>{scanError}</span>
              <button onClick={() => setScanError(null)} className="text-xs font-bold text-red-800 cursor-pointer">✕</button>
            </div>
          )}

          {/* Action Trigger Controls */}
          {activeTab === 'text' ? (
            <div className="pt-1 pb-1">
              <button
                onClick={() => handleRunAnalysis()}
                disabled={isAnalyzing || !manualIngredients.trim()}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Ingredients with AI...</span>
                  </>
                ) : (
                  <span>⚡ Analyze Ingredients Text</span>
                )}
              </button>
            </div>
          ) : (
            <>
              {isAnalyzing ? (
                <div className="py-2.5 flex flex-col items-center justify-center gap-1.5">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>AI Analyzing Ingredients & Safety...</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 text-center">
                    Reading product label & computing safety verdict
                  </p>
                </div>
              ) : capturedImage ? (
                <div className="pt-1.5 pb-1 flex gap-2">
                  <button
                    onClick={handleRetake}
                    className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                  >
                    <span>↺ Scan Another Product</span>
                  </button>
                  {analysisResult && (
                    <button
                      onClick={() => setAnalysisResult(analysisResult)}
                      className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <span>📋 View Verdict</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-1 pb-1 min-h-[68px]">
                  <button
                    onClick={handleCapture}
                    className="flex flex-col items-center justify-center focus:outline-none cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="w-[68px] h-[68px] rounded-full border-[3.5px] border-[#059669] bg-white flex items-center justify-center p-0.5 shadow-md">
                      <div className="w-full h-full rounded-full bg-[#059669] hover:bg-[#047857] flex items-center justify-center shadow-inner transition-colors">
                        <span className="text-white text-[11px] font-extrabold tracking-wider">
                          SCAN
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Bottom Home Indicator Bar */}
          <div className="w-24 h-1 bg-[#CBD5E1] rounded-full mx-auto mt-1"></div>
        </div>

        {/* Analysis Result Modal / Slide-up Overlay */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-[28px] p-5 shadow-2xl z-50 max-h-[85%] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3"></div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">AI Safety Verdict</span>
                  <h3 className="text-base font-bold text-slate-900">{analysisResult.name || 'Product Safety Report'}</h3>
                </div>
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Traffic Light Color Code Rating */}
              {(() => {
                const isRed =
                  analysisResult.overallRating?.includes('🔴') ||
                  analysisResult.statusColor === 'red' ||
                  analysisResult.status?.toLowerCase().includes('unsafe') ||
                  analysisResult.status?.toLowerCase().includes('high');
                const isGreen =
                  analysisResult.overallRating?.includes('🟢') ||
                  analysisResult.statusColor === 'green' ||
                  analysisResult.status?.toLowerCase().includes('safe') ||
                  analysisResult.status?.toLowerCase().includes('healthy');
                const badgeEmoji = isRed ? '🔴' : isGreen ? '🟢' : '🟡';
                const statusLabel = isRed ? 'Unsafe / Avoid (Khatarnak)' : isGreen ? 'Safe / Healthy (Surakshit)' : 'Moderate / Occasional (Kabhi-kabhi)';
                const subLabel = isRed ? 'High Fat, Sugar or Additives (HFSS Alert)' : isGreen ? 'Wholesome & Safe Nutritional Profile' : 'Consume in moderation; not recommended daily';

                return (
                  <div className={`border-[1.5px] rounded-2xl p-3.5 flex items-center gap-3.5 mb-3 shadow-xs ${isRed
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : isGreen
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}>
                    <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl shrink-0 shadow-sm ${isRed
                      ? 'bg-red-100 border-red-400'
                      : isGreen
                        ? 'bg-emerald-100 border-emerald-400'
                        : 'bg-amber-100 border-amber-400'
                      }`}>
                      {badgeEmoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 border border-slate-200">
                          Traffic Light Status
                        </span>
                        {analysisResult.score !== null && analysisResult.score !== undefined && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                            {analysisResult.score}/100
                          </span>
                        )}
                      </div>
                      <div className="font-extrabold text-[14px] mt-0.5 leading-tight">
                        {statusLabel}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                        {subLabel}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Age Group Rating */}
              {analysisResult.ageGroupRatings && analysisResult.ageGroupRatings.length > 0 && (
                <div className="mb-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-[11px] font-bold text-slate-900 mb-2 flex items-center justify-between">
                    <span>Age Group Rating (Traffic Light)</span>
                    <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">HFSS Check</span>
                  </div>
                  <div className="space-y-1.5">
                    {analysisResult.ageGroupRatings.map((ag, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-white border border-slate-200/80 rounded-lg p-2 text-xs">
                        <span className="text-base leading-none">{ag.rating || '🟡'}</span>
                        <div className="flex-1">
                          <div className="font-bold text-slate-800 text-[11px]">{ag.ageGroup}</div>
                          <div className="text-[10px] text-slate-600 leading-tight mt-0.5">{ag.reason}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Long Term Effects & Verdict */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 text-xs text-slate-700 leading-relaxed">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-emerald-700">
                  <span>📌 Lambe Samay Tak Prabhav (Long Term Effects)</span>
                </div>
                {analysisResult.longTermEffects || analysisResult.verdict || 'Standard product profile.'}
                {analysisResult.recommendation && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-emerald-800 font-semibold text-[11px]">
                    💡 Sujhav / Advice: {analysisResult.recommendation}
                  </div>
                )}
              </div>

              {/* Ingredients Table */}
              {analysisResult.ingredientRows && analysisResult.ingredientRows.length > 0 ? (
                <div className="mb-4">
                  <div className="text-[11px] font-bold text-slate-900 mb-1.5">Samagri Analysis (Ingredients):</div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-[10px] bg-white">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2">Samagri</th>
                          <th className="p-2">Matra</th>
                          <th className="p-2">Surakshit?</th>
                          <th className="p-2">Sujhav</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analysisResult.ingredientRows.map((row, idx) => (
                          <tr key={idx} className={row.safe?.toLowerCase().includes('nahi') ? 'bg-red-50/50' : ''}>
                            <td className="p-2 font-medium text-slate-900">{row.name}</td>
                            <td className="p-2 text-slate-500">{row.quantity || 'Detected'}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${row.safe?.toLowerCase().includes('nahi')
                                ? 'bg-red-100 text-red-700'
                                : row.safe?.toLowerCase().includes('haan')
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-800'
                                }`}>
                                {row.safe}
                              </span>
                            </td>
                            <td className="p-2 text-slate-600">{row.advice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="text-[11px] font-bold text-slate-900 mb-1.5">Detected Ingredients:</div>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.detectedIngredients?.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-800 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Slide-over Drawer */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex flex-col justify-end"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-white rounded-t-[28px] p-4 max-h-[75%] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Scans</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                      {scanHistory.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {scanHistory.length > 0 && (
                      <button
                        onClick={handleClearHistory}
                        className="text-[11px] text-red-600 hover:text-red-700 font-bold px-2 py-0.5 rounded bg-red-50 border border-red-200 cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setShowHistory(false)}
                      className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {historyLoading ? (
                  <div className="text-center py-6 text-xs text-slate-400">Loading scan history...</div>
                ) : scanHistory.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No scans saved yet. Scan a product label to get started!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {scanHistory.map((item) => (
                      <div
                        key={item.id || item._id}
                        onClick={() => {
                          setAnalysisResult(item);
                          setShowHistory(false);
                        }}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex-1 pr-2">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {item.name || 'Product Label'}
                          </div>
                          <div className="text-[10px] text-slate-500">{item.date || 'Past scan'}</div>
                          {item.prompt && (
                            <div className="text-[10px] text-emerald-600 mt-0.5 truncate max-w-[190px]">
                              "{item.prompt}"
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {(() => {
                            const isRed =
                              item.overallRating?.includes('🔴') ||
                              item.statusColor === 'red' ||
                              item.status?.toLowerCase().includes('unsafe') ||
                              item.status?.toLowerCase().includes('high');
                            const isGreen =
                              item.overallRating?.includes('🟢') ||
                              item.statusColor === 'green' ||
                              item.status?.toLowerCase().includes('safe') ||
                              item.status?.toLowerCase().includes('healthy');
                            const emoji = isRed ? '🔴' : isGreen ? '🟢' : '🟡';
                            const label = isRed ? 'Unsafe' : isGreen ? 'Safe' : 'Moderate';
                            return (
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border ${isRed
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : isGreen
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}>
                                <span>{emoji}</span>
                                <span>{label}</span>
                              </span>
                            );
                          })()}

                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScan(item.id || item._id);
                            }}
                            title="Delete scan"
                            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
