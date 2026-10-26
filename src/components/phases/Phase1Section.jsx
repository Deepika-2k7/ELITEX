import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Play, 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Maximize, 
  Minimize, 
  HelpCircle, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  RotateCcw,
  Trophy,
  Award,
  Zap,
  AlertTriangle,
  Calendar,
  Users,
  CheckCircle,
  Radio,
  Bookmark
} from 'lucide-react';
import { PRELIMS_QUESTIONS } from '../../data/prelimsQuizData';
import { soundFx } from '../../utils/audio';

const DEFAULT_SLOTS = [
  { id: 'slot-1', slotNumber: 1, time: '9:30 AM – 10:30 AM', date: 'Monday, 2 November 2026', totalCapacity: 50, bookedCount: 0, remainingCount: 50, isAvailable: true },
  { id: 'slot-2', slotNumber: 2, time: '11:00 AM – 12:00 PM', date: 'Monday, 2 November 2026', totalCapacity: 50, bookedCount: 0, remainingCount: 50, isAvailable: true },
  { id: 'slot-3', slotNumber: 3, time: '1:30 PM – 2:30 PM', date: 'Monday, 2 November 2026', totalCapacity: 50, bookedCount: 0, remainingCount: 50, isAvailable: true },
  { id: 'slot-4', slotNumber: 4, time: '2:45 PM – 3:45 PM', date: 'Monday, 2 November 2026', totalCapacity: 50, bookedCount: 0, remainingCount: 50, isAvailable: true }
];

export default function Phase1Section({ 
  team, 
  onBack, 
  onToast, 
  onTeamUpdate, 
  onNavigate 
}) {
  // Assessment View State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');

  // Slot Booking State
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedMemberSlot, setSelectedMemberSlot] = useState({}); // { [registerNumber]: slotId }
  const [editingBookingMember, setEditingBookingMember] = useState(null); // registerNumber currently editing
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Quiz Engine State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionId }
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60); // 30 minutes
  const [quizScore, setQuizScore] = useState(0);

  const quizContainerRef = useRef(null);

  // Members list from authenticated team
  const members = team?.members || [];

  // Fetch Live Slot Availability from Backend API
  const fetchSlotStatus = async () => {
    try {
      setSlotsLoading(true);
      const res = await fetch('/api/slots/status');
      const data = await res.json();
      if (res.ok && data.slots) {
        setSlots(data.slots);
      }
    } catch (err) {
      console.warn('Failed to fetch slot status:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotStatus();
  }, []);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(active);
      if (active) {
        setFullscreenError('');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // 30-Minute Assessment Countdown Timer
  useEffect(() => {
    let timer = null;
    if (isQuizActive && !quizSubmitted && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isQuizActive, quizSubmitted, secondsRemaining]);

  // Request Fullscreen helper (Browser API)
  const requestBrowserFullscreen = async () => {
    setFullscreenError('');
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch (err) {
      console.warn('Fullscreen entry blocked or unsupported by browser:', err);
      setFullscreenError(
        'Fullscreen mode was blocked by the browser. You may enable fullscreen manually using the button below.'
      );
      setIsFullscreen(false);
      return false;
    }
  };

  // Exit Fullscreen helper
  const exitBrowserFullscreen = async () => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Error exiting fullscreen:', err);
    }
    setIsFullscreen(false);
  };

  /**
   * Book Slot for an individual team member
   */
  const handleBookSlotForMember = async (registerNumber, targetSlotId) => {
    const slotId = targetSlotId || selectedMemberSlot[registerNumber];
    if (!slotId) {
      setBookingError(`Please select a slot for Register Number ${registerNumber}.`);
      return;
    }

    setBookingError('');
    setBookingMessage('');

    try {
      setBookingLoading(true);
      soundFx.playClick();

      const token = localStorage.getItem('elitex_token');
      const res = await fetch('/api/slots/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          registerNumber,
          slotId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book slot.');
      }

      soundFx.playSuccess();
      setBookingMessage(data.message || `Slot booked successfully!`);
      if (data.slots) setSlots(data.slots);

      if (onTeamUpdate && data.team) {
        onTeamUpdate(data.team);
        localStorage.setItem('elitex_team', JSON.stringify(data.team));
      }

      setEditingBookingMember(null);

      if (onToast) {
        onToast(`Slot confirmed: Reg No ${registerNumber} booked for ${data.booking?.slotTime}.`);
      }

    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  /**
   * Start Assessment Button Click
   * Must request Fullscreen synchronously from this user gesture
   */
  const handleStartAssessment = async () => {
    soundFx.playClick();
    
    // Direct user-gesture invocation of Fullscreen API
    await requestBrowserFullscreen();

    // Launch dedicated quiz interface
    setIsQuizActive(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setMarkedQuestions(new Set());
    setQuizSubmitted(false);
    setSecondsRemaining(30 * 60);

    if (onToast) {
      onToast('Phase 1 Prelims Assessment session initialized.');
    }
  };

  // Answer selection
  const handleSelectOption = (optionId) => {
    soundFx.playClick();
    const currentQ = PRELIMS_QUESTIONS[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  // Clear answer
  const handleClearAnswer = () => {
    soundFx.playClick();
    const currentQ = PRELIMS_QUESTIONS[currentQuestionIndex];
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      return updated;
    });
  };

  // Toggle mark for review
  const handleToggleMark = () => {
    soundFx.playClick();
    const currentQ = PRELIMS_QUESTIONS[currentQuestionIndex];
    setMarkedQuestions((prev) => {
      const updated = new Set(prev);
      if (updated.has(currentQ.id)) {
        updated.delete(currentQ.id);
      } else {
        updated.add(currentQ.id);
      }
      return updated;
    });
  };

  // Auto-submit when time expires
  const handleAutoSubmit = () => {
    calculateFinalScore();
    setQuizSubmitted(true);
    setShowSubmitModal(false);
    soundFx.playSuccess();
    if (onToast) onToast('Time expired! Your assessment has been automatically submitted.');
  };

  // Manual final submission
  const handleFinalSubmit = () => {
    calculateFinalScore();
    setQuizSubmitted(true);
    setShowSubmitModal(false);
    soundFx.playSuccess();
    if (onToast) onToast('Phase 1 Prelims Assessment successfully submitted!');
  };

  // Calculate score
  const calculateFinalScore = () => {
    let score = 0;
    PRELIMS_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });
    setQuizScore(score);
  };

  // Format timer seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQ = PRELIMS_QUESTIONS[currentQuestionIndex];
  const totalQuestions = PRELIMS_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;

  // -------------------------------------------------------------------------
  // 1. FULLSCREEN DEDICATED ASSESSMENT INTERFACE
  // -------------------------------------------------------------------------
  if (isQuizActive) {
    return (
      <div 
        ref={quizContainerRef}
        className="fixed inset-0 z-[100] bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden"
      >
        
        {/* Top Assessment Command Bar */}
        <header className="bg-navy-950 border-b border-slate-800 px-4 sm:px-8 py-3 shrink-0 flex items-center justify-between shadow-md">
          
          {/* Brand & Stage */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1.5 font-display font-black text-lg tracking-wider">
              <span className="text-emerald-400">ELITE</span>
              <span className="text-blue-400">X</span>
              <span className="text-white text-sm font-tech">2026</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-700 hidden sm:block"></div>

            <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>PHASE 1 PRELIMS ASSESSMENT</span>
            </span>
          </div>

          {/* Center: Live 30-Minute Timer */}
          {!quizSubmitted && (
            <div className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-xl border font-mono font-bold text-sm tracking-widest ${
              secondsRemaining < 300 
                ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-emerald-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span>TIME REMAINING: {formatTime(secondsRemaining)}</span>
            </div>
          )}

          {/* Right: Team Profile & Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Team Badge */}
            {team && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono">
                <span className="font-bold text-emerald-400">{team.teamId}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-200 truncate max-w-[120px]">{team.teamName}</span>
              </div>
            )}

            {/* Fullscreen Toggle / Retry Button */}
            <button
              onClick={isFullscreen ? exitBrowserFullscreen : requestBrowserFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Submit Test Button */}
            {!quizSubmitted && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowSubmitModal(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-navy-950 font-tech font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SUBMIT TEST</span>
              </button>
            )}

          </div>

        </header>

        {/* Fullscreen Warning Notice */}
        {!isFullscreen && !quizSubmitted && (
          <div className="bg-amber-950/80 border-b border-amber-600/40 px-4 py-2 text-xs font-mono text-amber-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Assessment is recommended in Fullscreen Mode for optimal proctoring.
              </span>
            </div>
            <button
              onClick={requestBrowserFullscreen}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-navy-950 font-bold uppercase text-[10px] tracking-wider transition-colors ml-4 shrink-0"
            >
              Enable Fullscreen Mode
            </button>
          </div>
        )}

        {/* Assessment Body: Palette + Question Stage OR Results Summary */}
        {!quizSubmitted ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left Sidebar: Question Navigation Palette */}
            <aside className="w-full lg:w-72 bg-navy-950/90 border-r border-slate-800 p-4 sm:p-5 shrink-0 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="font-tech font-bold text-xs text-slate-300 uppercase tracking-wider">
                    Question Palette
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {answeredCount} / {totalQuestions} Answered
                  </span>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500"></span>
                    <span>Marked Review</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-blue-500 ring-2 ring-blue-300"></span>
                    <span>Current</span>
                  </div>
                </div>

                {/* Grid of Question Numbers */}
                <div className="grid grid-cols-4 gap-2">
                  {PRELIMS_QUESTIONS.map((q, idx) => {
                    const isCurrent = idx === currentQuestionIndex;
                    const isAnswered = !!answers[q.id];
                    const isMarked = markedQuestions.has(q.id);

                    let btnClass = 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700';

                    if (isAnswered) {
                      btnClass = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                    }
                    if (isMarked) {
                      btnClass = 'bg-amber-600 text-white border-amber-500 font-bold';
                    }
                    if (isCurrent) {
                      btnClass += ' ring-2 ring-blue-400 scale-105';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          soundFx.playClick();
                          setCurrentQuestionIndex(idx);
                        }}
                        className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${btnClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Footer Info */}
              <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 text-center">
                ELITEX 2026 · 12 Questions Total
              </div>
            </aside>

            {/* Center Stage: Active Question & Options */}
            <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-10 overflow-y-auto bg-slate-900">
              
              <div className="max-w-4xl w-full mx-auto space-y-6">
                
                {/* Question Header & Category */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 font-mono text-xs font-bold">
                      QUESTION {currentQuestionIndex + 1} OF {totalQuestions}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs">
                      {currentQ.category}
                    </span>
                  </div>

                  <button
                    onClick={handleToggleMark}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors ${
                      markedQuestions.has(currentQ.id)
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>
                      {markedQuestions.has(currentQ.id) ? 'MARKED FOR REVIEW' : 'MARK FOR REVIEW'}
                    </span>
                  </button>
                </div>

                {/* Question Statement */}
                <div className="p-6 rounded-2xl bg-navy-950/80 border border-slate-800 shadow-sm">
                  <h2 className="font-tech text-lg sm:text-xl text-slate-100 font-semibold leading-relaxed">
                    {currentQ.question}
                  </h2>
                </div>

                {/* Option Cards (A, B, C, D) */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all flex items-start space-x-4 ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 shadow-lg ring-1 ring-emerald-500 text-white'
                            : 'bg-navy-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        {/* Option Identifier Badge */}
                        <div className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-emerald-500 text-navy-950'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {isSelected ? <Check className="w-4 h-4" /> : opt.id}
                        </div>

                        {/* Option Text */}
                        <div className="flex-1 font-sans text-sm sm:text-base leading-relaxed pt-1">
                          {opt.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="max-w-4xl w-full mx-auto pt-8 mt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                
                <div className="flex items-center space-x-3">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => {
                      soundFx.playClick();
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-tech font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>PREVIOUS</span>
                  </button>

                  {answers[currentQ.id] && (
                    <button
                      onClick={handleClearAnswer}
                      className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
                    >
                      Clear Choice
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-navy-950 font-tech font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
                    >
                      <span>NEXT</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setShowSubmitModal(true);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-navy-950 font-tech font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>FINALIZE & SUBMIT</span>
                    </button>
                  )}
                </div>

              </div>

            </main>

          </div>
        ) : (
          /* Assessment Completion & Result Screen */
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-900">
            <div className="max-w-md w-full bg-navy-950 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
              
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-1">
                ASSESSMENT SUBMITTED SUCCESSFULLY
              </div>

              <h2 className="font-display font-black text-3xl text-white tracking-wide">
                PHASE 1 COMPLETE
              </h2>

              <p className="font-sans text-xs text-slate-300 mt-2 leading-relaxed">
                Thank you, Team <strong className="text-white">{team?.teamName || 'Squad'}</strong>! Your Phase 1 Prelims answers have been recorded in the ELITEX evaluation ledger.
              </p>

              <div className="my-6 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Questions:</span>
                  <span className="font-bold text-white">{totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Questions Answered:</span>
                  <span className="font-bold text-emerald-400">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Preliminary Score:</span>
                  <span className="font-bold text-white text-base">
                    {quizScore} / {totalQuestions} ({Math.round((quizScore / totalQuestions) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    Under Jury Review
                  </span>
                </div>
              </div>

              <button
                onClick={async () => {
                  soundFx.playClick();
                  await exitBrowserFullscreen();
                  setIsQuizActive(false);
                  onBack();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-navy-950 font-tech font-bold text-sm uppercase tracking-wider transition-all shadow-lg active:scale-98 cursor-pointer"
              >
                EXIT ASSESSMENT & RETURN TO DASHBOARD
              </button>

            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in">
            <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-tech font-bold text-lg text-white">
                    Confirm Submission?
                  </h3>
                  <div className="text-xs font-mono text-slate-400">
                    Phase 1 Prelims Assessment
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 my-4 bg-navy-950 p-4 rounded-xl border border-slate-800 font-mono">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <strong className="text-emerald-400">{answeredCount} of {totalQuestions}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Questions Remaining:</span>
                  <strong className="text-amber-400">{totalQuestions - answeredCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Time Remaining:</span>
                  <strong className="text-white">{formatTime(secondsRemaining)}</strong>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Once submitted, answers are final and cannot be modified. Are you sure you wish to conclude your test?
              </p>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech font-bold text-xs uppercase"
                >
                  RETURN TO TEST
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-tech font-bold text-xs uppercase shadow-md shadow-emerald-600/30"
                >
                  CONFIRM & SUBMIT
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. PHASE 1 PRELIMS: SLOT BOOKING + START ASSESSMENT (STUDENT PANEL)
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen pt-4 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="inline-flex items-center space-x-2 text-xs font-tech font-bold text-slate-600 hover:text-emerald-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO DASHBOARD</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>EVENT DATE: MONDAY, 2 NOVEMBER 2026 (IST)</span>
        </div>
      </div>

      {/* ---------------- SECTION 1: BOOK YOUR PRELIMS ASSESSMENT SLOT ---------------- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Section Heading */}
        <div className="pb-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>OFFICIAL SLOT SCHEDULER</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-navy-950 tracking-wide">
              BOOK YOUR PRELIMS ASSESSMENT SLOT
            </h2>
            <p className="text-xs sm:text-sm font-sans text-slate-600 mt-1">
              Each of the four squad members, including the team leader, must book one individual screening assessment slot.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0">
            <div>Date: <strong className="text-navy-900">Monday, 2 November 2026</strong></div>
            <div>Timezone: <strong className="text-emerald-700">Asia/Kolkata (IST)</strong></div>
          </div>
        </div>

        {/* Slot Alerts */}
        {bookingError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-sans leading-relaxed">{bookingError}</span>
          </div>
        )}

        {bookingMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-sans font-medium leading-relaxed">{bookingMessage}</span>
          </div>
        )}

        {/* 4 Selectable Slot Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-tech font-bold text-sm text-navy-900 uppercase tracking-wider">
              Official Assessment Slots (50 Max Capacity Per Slot)
            </h3>
            {slotsLoading && (
              <span className="text-[11px] font-mono text-slate-400 animate-pulse">Syncing live availability...</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slots.map((slot) => {
              const isFull = !slot.isAvailable || slot.remainingCount <= 0;

              return (
                <div
                  key={slot.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isFull
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      SLOT {slot.slotNumber}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isFull
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {isFull ? 'FULL' : 'AVAILABLE'}
                    </span>
                  </div>

                  <div className="font-tech font-bold text-xl text-navy-950">
                    {slot.time}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 font-bold">
                      SLOT {slot.slotNumber} | {slot.time} | {slot.remainingCount}/50 SLOTS AVAILABLE
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {slot.bookedCount} Booked
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Member Booking List */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-tech font-bold text-base text-navy-950 uppercase tracking-wide">
                Squad Member Slot Allocation
              </h3>
              <p className="text-xs font-mono text-slate-500">
                Book individual screening slots for each registered squad member
              </p>
            </div>

            <span className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
              Squad: <strong className="text-navy-900">{members.length}/4 Members Configured</strong>
            </span>
          </div>

          {members.length === 0 ? (
            /* Call to action if no members configured yet */
            <div className="p-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-tech font-bold text-base text-navy-900">
                No Squad Members Added Yet
              </h4>
              <p className="text-xs font-sans text-slate-500 max-w-md mx-auto leading-relaxed">
                Before booking prelims slots, please enter your squad member details (Leader + 3 members) in the Team Details section.
              </p>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onBack(); // Return to dashboard where Team Details card is
                }}
                className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-tech font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Go to Team Details on Dashboard
              </button>
            </div>
          ) : (
            /* Member Booking Roster */
            <div className="space-y-3">
              {members.map((member, idx) => {
                const isLeader = member.isLeader || idx === 0;
                const isBooked = !!member.slotId;
                const isEditingThis = editingBookingMember === member.registerNumber;

                const currentSlot = slots.find(s => s.id === member.slotId);

                return (
                  <div
                    key={member.id || idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Member Info */}
                    <div className="flex items-start space-x-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isLeader 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        #{idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-tech font-bold text-base text-navy-950">
                            {member.name || `Member #${idx + 1}`}
                          </h4>
                          {isLeader && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                              TEAM LEADER
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-500 mt-1">
                          <span>Reg: <strong className="text-slate-800">{member.registerNumber}</strong></span>
                          <span>•</span>
                          <span>Dept: <strong className="text-slate-800">{member.department}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Slot Booking Action & Confirmed Badge */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      
                      {isBooked && !isEditingThis ? (
                        <div className="flex items-center space-x-3">
                          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800 flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>
                              Booked: <strong>Slot {currentSlot?.slotNumber || ''}</strong> ({member.slotTime || currentSlot?.time})
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setEditingBookingMember(member.registerNumber);
                              setSelectedMemberSlot(prev => ({ ...prev, [member.registerNumber]: member.slotId }));
                            }}
                            className="text-xs font-mono font-bold text-slate-600 hover:text-navy-900 underline"
                          >
                            Change Slot
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                          {/* Slot Selector */}
                          <select
                            value={selectedMemberSlot[member.registerNumber] || member.slotId || 'slot-1'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedMemberSlot(prev => ({ ...prev, [member.registerNumber]: val }));
                            }}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                          >
                            {slots.map(s => (
                              <option key={s.id} value={s.id} disabled={!s.isAvailable && s.id !== member.slotId}>
                                Slot {s.slotNumber}: {s.time} ({s.remainingCount} left) {!s.isAvailable && s.id !== member.slotId ? '[FULL]' : ''}
                              </option>
                            ))}
                          </select>

                          <button
                            disabled={bookingLoading}
                            onClick={() => handleBookSlotForMember(member.registerNumber)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center space-x-1 shadow-xs transition-all active:scale-95 disabled:opacity-60"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>{isEditingThis ? 'Confirm Change' : 'Confirm Slot'}</span>
                          </button>

                          {isEditingThis && (
                            <button
                              onClick={() => setEditingBookingMember(null)}
                              className="px-2.5 py-2 text-xs font-mono text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </section>

      {/* ---------------- SECTION 2: CLEAN START ASSESSMENT LAUNCH SCREEN ---------------- */}
      <section className="relative bg-white border border-slate-200 rounded-3xl p-8 sm:p-14 text-center shadow-xl shadow-slate-200/50 overflow-hidden">
        
        {/* Top Decorative Color Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-600"></div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          
          {/* Phase 1 Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>PHASE 1 — PRELIMS</span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-3xl sm:text-5xl text-navy-950 tracking-wide">
            Ready to Begin?
          </h1>

          {/* Prompt Description */}
          <p className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed">
            Start your prelims assessment when you're ready. Ensure you're prepared before entering fullscreen mode.
          </p>

          {/* Assessment Specifications Telemetry Bar */}
          <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase">Questions</span>
              <span className="font-bold text-navy-900 text-sm">12 Problems</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase">Session Duration</span>
              <span className="font-bold text-emerald-600 text-sm">30 Minutes</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase">Proctoring</span>
              <span className="font-bold text-blue-600 text-sm">Fullscreen API</span>
            </div>
          </div>

          {/* Fullscreen Notice Banner if browser had an issue */}
          {fullscreenError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono flex items-center justify-between text-left">
              <span>{fullscreenError}</span>
              <button
                onClick={requestBrowserFullscreen}
                className="ml-3 px-2.5 py-1 rounded bg-amber-600 text-white font-bold text-[10px] uppercase shrink-0"
              >
                Retry Fullscreen
              </button>
            </div>
          )}

          {/* Prominent Start Assessment Button with Subtle Hover Animation */}
          <div className="pt-2">
            <button
              onClick={handleStartAssessment}
              className="group relative inline-flex items-center justify-center space-x-3 px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-tech font-bold text-base sm:text-lg tracking-wider uppercase shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-300 cursor-pointer"
            >
              <ClipboardCheck className="w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
              <span>START ASSESSMENT</span>
              <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Helpful Proctoring Reminder */}
          <div className="text-[11px] font-mono text-slate-500 pt-2 flex items-center justify-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authenticated squad evaluation · Fullscreen proctoring active upon launch</span>
          </div>

        </div>

      </section>

    </div>
  );
}
