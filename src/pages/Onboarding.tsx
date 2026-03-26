import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Camera, 
  Target, 
  Brain, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  PlayCircle, 
  Mic, 
  Globe, 
  Award,
  ArrowRight
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  
  // Form State
  const [profile, setProfile] = useState({ name: '', country: '', cohort: 'Cohort 4' });
  const [goals, setGoals] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('');
  
  // Interactive State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [commitments, setCommitments] = useState({ attendance: false, download: false, forum: false });
  const [masteryStep, setMasteryStep] = useState(0);

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleAiInteraction = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the Golden Minds Africa AI Assistant. The user asked: "${aiQuery}". Respond in 2-3 short sentences, welcoming them and showing how you can help them achieve their goals in leadership and tech.`
      });
      setAiResponse(response.text || 'I am here to assist you on your journey.');
    } catch (error) {
      setAiResponse('I am ready to help you learn faster and perform better.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const completeOnboarding = () => {
    // Save onboarding state to local storage or backend
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/');
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Cinematic Welcome
        return (
          <motion.div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-[#d4af37] to-yellow-600 flex items-center justify-center shadow-[0_0_60px_rgba(212,175,55,0.4)]"
            >
              <Globe className="w-16 h-16 text-[#022c22]" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight"
            >
              Golden Minds <span className="text-[#d4af37]">Africa</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl"
            >
              Where leaders are built, not born.
            </motion.p>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              onClick={nextStep}
              className="mt-12 px-8 py-4 bg-[#d4af37] hover:bg-yellow-500 text-[#022c22] rounded-full font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              Begin Your Fellowship Journey <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        );

      case 1: // Identity Setup
        return (
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif font-bold text-white">Establish Your Identity</h2>
              <p className="text-gray-400">Set up your elite fellow profile.</p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative w-32 h-32 rounded-full bg-gray-800 border-2 border-[#d4af37] flex items-center justify-center overflow-hidden group cursor-pointer">
                <Camera className="w-8 h-8 text-gray-500 group-hover:text-white transition-colors" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-white">Upload Photo</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                  placeholder="e.g. Amina Mensah"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">Country</label>
                <input 
                  type="text" 
                  value={profile.country}
                  onChange={(e) => setProfile({...profile, country: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                  placeholder="e.g. Ghana"
                />
              </div>
            </div>

            <button 
              onClick={nextStep}
              disabled={!profile.name || !profile.country}
              className="w-full py-4 bg-[#d4af37] text-[#022c22] rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-yellow-500"
            >
              Continue
            </button>
          </div>
        );

      case 2: // Personal Goals Mapping
        const interestOptions = ['Leadership', 'AI & Technology', 'Entrepreneurship', 'Policy & Governance', 'Climate Action', 'Education'];
        return (
          <div className="max-w-xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white">Map Your Goals</h2>
              <p className="text-gray-400">Select up to 3 core interests to personalize your experience.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => {
                    if (goals.includes(interest)) {
                      setGoals(goals.filter(g => g !== interest));
                    } else if (goals.length < 3) {
                      setGoals([...goals, interest]);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    goals.includes(interest) 
                      ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' 
                      : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <span className="font-medium">{interest}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={nextStep}
              disabled={goals.length === 0}
              className="w-full py-4 bg-[#d4af37] text-[#022c22] rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-yellow-500"
            >
              Continue ({goals.length}/3 Selected)
            </button>
          </div>
        );

      case 3: // Skill Level
        const levels = [
          { id: 'beginner', title: 'Emerging Leader', desc: 'Building foundational skills' },
          { id: 'intermediate', title: 'Practitioner', desc: 'Applying skills in real-world contexts' },
          { id: 'advanced', title: 'Domain Expert', desc: 'Leading initiatives and mentoring others' }
        ];
        return (
          <div className="max-w-xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white">Assess Your Level</h2>
              <p className="text-gray-400">Help us tailor the curriculum to your current expertise.</p>
            </div>

            <div className="space-y-4">
              {levels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSkillLevel(level.id)}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                    skillLevel === level.id 
                      ? 'border-[#d4af37] bg-[#d4af37]/10' 
                      : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <div>
                    <h3 className={`font-bold text-lg ${skillLevel === level.id ? 'text-[#d4af37]' : 'text-white'}`}>
                      {level.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{level.desc}</p>
                  </div>
                  {skillLevel === level.id && <CheckCircle2 className="w-6 h-6 text-[#d4af37]" />}
                </button>
              ))}
            </div>

            <button 
              onClick={nextStep}
              disabled={!skillLevel}
              className="w-full py-4 bg-[#d4af37] text-[#022c22] rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-yellow-500"
            >
              Generate Personalized Path
            </button>
          </div>
        );

      case 4: // Program Orientation
        return (
          <div className="max-w-2xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif font-bold text-white">The Golden Standard</h2>
              <p className="text-gray-400">What it takes to be a Golden Minds Fellow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center space-y-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-white">Attendance</h3>
                <p className="text-sm text-gray-400">90% minimum attendance required for all live sessions.</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center space-y-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-bold text-white">Participation</h3>
                <p className="text-sm text-gray-400">Active engagement in forums, debates, and assignments.</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center space-y-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-bold text-white">Collaboration</h3>
                <p className="text-sm text-gray-400">Build cross-border networks and support your peers.</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 relative aspect-video flex items-center justify-center group cursor-pointer">
              <img src="https://picsum.photos/seed/leadership/800/450" alt="Orientation" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" />
              <div className="relative z-10 w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <PlayCircle className="w-8 h-8 text-[#022c22]" />
              </div>
              <div className="absolute bottom-4 left-4 z-10">
                <p className="text-white font-bold">Welcome from the Directors</p>
                <p className="text-xs text-gray-300">2:45 mins</p>
              </div>
            </div>

            <button 
              onClick={nextStep}
              className="w-full py-4 bg-[#d4af37] text-[#022c22] rounded-xl font-bold transition-all hover:bg-yellow-500"
            >
              Master the Platform
            </button>
          </div>
        );

      case 5: // Platform Mastery
        const masteryFeatures = [
          { id: 'attendance', title: 'Mark Attendance', icon: <CheckCircle2 className="w-6 h-6 text-blue-400" />, action: 'Tap to mark present', success: 'Attendance logged successfully!' },
          { id: 'learning', title: 'Learning Hub', icon: <BookOpen className="w-6 h-6 text-emerald-400" />, action: 'Download material', success: 'Material downloaded. AI summary generated.' },
          { id: 'forum', title: 'Forum', icon: <MessageSquare className="w-6 h-6 text-purple-400" />, action: 'Post comment', success: 'Comment posted. AI replied instantly.' },
          { id: 'debate', title: 'Debate Room', icon: <Mic className="w-6 h-6 text-red-400" />, action: 'Join room', success: 'Joined mock debate. AI argument simulated.' }
        ];
        return (
          <div className="max-w-xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif font-bold text-white">Platform Mastery</h2>
              <p className="text-gray-400">Interactive walkthrough of your core tools.</p>
            </div>

            <div className="space-y-4">
              {masteryFeatures.map((feature, idx) => (
                <div key={feature.id} className={`p-4 rounded-2xl border-2 transition-all ${masteryStep > idx ? 'border-gray-700 bg-gray-800/50' : masteryStep === idx ? 'border-[#d4af37] bg-gray-900' : 'border-gray-800 bg-gray-900 opacity-50 pointer-events-none'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{feature.title}</h3>
                        {masteryStep > idx ? (
                          <p className="text-sm text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {feature.success}</p>
                        ) : (
                          <p className="text-sm text-gray-400">{feature.action}</p>
                        )}
                      </div>
                    </div>
                    {masteryStep === idx && (
                      <button 
                        onClick={() => setMasteryStep(prev => prev + 1)}
                        className="px-4 py-2 bg-[#d4af37] text-[#022c22] rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors"
                      >
                        Simulate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={nextStep}
              disabled={masteryStep < masteryFeatures.length}
              className="w-full py-4 bg-[#d4af37] text-[#022c22] rounded-xl font-bold disabled:opacity-50 transition-all hover:bg-yellow-500"
            >
              Meet Your AI Assistant
            </button>
          </div>
        );

      case 6: // AI Activation
        return (
          <div className="max-w-xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(52,211,153,0.3)] rotate-3">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white">Meet Your AI Co-Pilot</h2>
              <p className="text-gray-400">I'll help you learn faster, think deeper, and perform better.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                    {profile.name ? profile.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 text-sm text-gray-200">
                    Summarize what this fellowship is about.
                  </div>
                </div>
                
                {aiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 flex-row-reverse"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-2xl rounded-tr-none p-4 text-sm text-emerald-100">
                      {aiResponse}
                    </div>
                  </motion.div>
                )}
              </div>

              {!aiResponse && (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAiInteraction()}
                  />
                  <button 
                    onClick={handleAiInteraction}
                    disabled={isAiLoading || !aiQuery.trim()}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold disabled:opacity-50 transition-colors"
                  >
                    {isAiLoading ? '...' : 'Send'}
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={nextStep}
              disabled={!aiResponse}
              className="w-full py-4 bg-[#d4af37] text-[#022c22] rounded-xl font-bold disabled:opacity-50 transition-all hover:bg-yellow-500"
            >
              Continue to Final Step
            </button>
          </div>
        );

      case 7: // Commitment Trigger
        const allCompleted = commitments.attendance && commitments.download && commitments.forum;
        return (
          <div className="max-w-xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif font-bold text-white">Your First Actions</h2>
              <p className="text-gray-400">Complete these steps to unlock your dashboard.</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setCommitments({...commitments, attendance: true})}
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${commitments.attendance ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${commitments.attendance ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-bold ${commitments.attendance ? 'text-green-400' : 'text-white'}`}>Mark First Attendance</h3>
                    <p className="text-xs text-gray-500">Symbolic check-in to the fellowship.</p>
                  </div>
                </div>
                {commitments.attendance && <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">Done</span>}
              </button>

              <button 
                onClick={() => setCommitments({...commitments, download: true})}
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${commitments.download ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${commitments.download ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-bold ${commitments.download ? 'text-blue-400' : 'text-white'}`}>Download Syllabus</h3>
                    <p className="text-xs text-gray-500">Get your first learning material.</p>
                  </div>
                </div>
                {commitments.download && <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Done</span>}
              </button>

              <button 
                onClick={() => setCommitments({...commitments, forum: true})}
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${commitments.forum ? 'bg-purple-900/20 border-purple-500/50' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${commitments.forum ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-bold ${commitments.forum ? 'text-purple-400' : 'text-white'}`}>Introduce Yourself</h3>
                    <p className="text-xs text-gray-500">Post a quick hello in the forum.</p>
                  </div>
                </div>
                {commitments.forum && <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Done</span>}
              </button>
            </div>

            <AnimatePresence>
              {allCompleted && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-gradient-to-r from-[#d4af37]/20 to-yellow-600/20 border border-[#d4af37]/50 rounded-2xl p-6 text-center space-y-4"
                >
                  <Award className="w-12 h-12 text-[#d4af37] mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Onboarding Completed</h3>
                    <p className="text-sm text-[#d4af37]">You are now officially a Golden Minds Fellow.</p>
                  </div>
                  <button 
                    onClick={completeOnboarding}
                    className="w-full py-3 bg-[#d4af37] text-[#022c22] rounded-xl font-bold transition-all hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                  >
                    Enter Dashboard
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background African Pattern Overlay (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      
      {/* Top Progress Bar */}
      {step > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900 z-50">
          <motion.div 
            className="h-full bg-[#d4af37]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full flex items-center justify-center"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation (Optional, for debugging or manual back) */}
      {step > 0 && step < 7 && (
        <div className="absolute bottom-8 left-8 z-50">
          <button 
            onClick={prevStep}
            className="text-gray-500 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </button>
        </div>
      )}
    </div>
  );
}
