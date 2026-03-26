import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, MapPin, Video, FileText, Bell, Globe, CheckCircle2, BrainCircuit, Sparkles, ChevronRight, Users } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Schedule() {
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [studyPlan, setStudyPlan] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);

  const sessions = [
    { id: 1, title: 'AI in African Governance', type: 'Masterclass', speaker: 'Dr. Amina Yusuf', time: '14:00 - 16:00 GMT', date: 'Today', link: '#', isLive: true },
    { id: 2, title: 'Digital Infrastructure Policy', type: 'Workshop', speaker: 'Prof. Kwame Osei', time: '10:00 - 12:00 GMT', date: 'Tomorrow', link: '#', isLive: false },
    { id: 3, title: 'Tech Diplomacy Roundtable', type: 'Speaker Session', speaker: 'Amb. Sarah Ndiaye', time: '15:00 - 17:00 GMT', date: 'Friday', link: '#', isLive: false },
  ];

  useEffect(() => {
    generateStudyPlan();
  }, []);

  const generateStudyPlan = async () => {
    setLoadingPlan(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a short, personalized AI study planner for an African fellowship student. 
        Suggest optimal study times based on typical productivity curves, and recommend 1 specific focus area for this week. 
        Keep it under 3 sentences, encouraging, and use a professional tone.`
      });
      setStudyPlan(response.text || 'Study plan unavailable.');
    } catch (error) {
      console.error('Error generating study plan:', error);
      setStudyPlan('Unable to generate study plan at this time.');
    } finally {
      setLoadingPlan(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2 text-[#022c22]">Your Leadership Journey</h1>
          <p className="text-gray-600">Dynamic schedule and intelligent study planning.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#022c22] text-[#d4af37] px-5 py-2.5 rounded-full shadow-md">
          <Globe className="w-4 h-4" />
          <span className="text-sm font-bold tracking-wide">GMT Timezone Synced</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calendar Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex gap-1">
              {['daily', 'weekly', 'monthly'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                    viewMode === mode ? 'bg-[#022c22] text-[#d4af37] shadow-md' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 text-sm font-bold text-[#022c22] hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Sync Calendar
            </button>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {sessions.map((session, i) => (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
              >
                {session.isLive && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                )}
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        session.type === 'Masterclass' ? 'bg-purple-100 text-purple-700' :
                        session.type === 'Workshop' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {session.type}
                      </span>
                      {session.isLive && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600" /> LIVE NOW
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold font-serif text-gray-900 group-hover:text-[#022c22] transition-colors">
                      {session.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#d4af37]" /> {session.date} • {session.time}</div>
                      <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#d4af37]" /> {session.speaker}</div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0">
                    <button className="p-3 bg-gray-50 hover:bg-[#022c22] hover:text-[#d4af37] text-gray-600 rounded-xl transition-all">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-gray-50 hover:bg-[#022c22] hover:text-[#d4af37] text-gray-600 rounded-xl transition-all">
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Study Planner */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-[#022c22] to-[#064e3b] rounded-3xl p-8 shadow-xl text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4af37]/20 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#d4af37] mb-4">
                <BrainCircuit className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">AI Study Planner</h3>
              </div>
              {loadingPlan ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-4 bg-white/20 rounded w-full"></div>
                  <div className="h-4 bg-white/20 rounded w-5/6"></div>
                </div>
              ) : (
                <p className="text-gray-200 leading-relaxed text-sm font-medium">
                  {studyPlan}
                </p>
              )}
            </div>
          </motion.div>

          {/* Smart Notifications */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-[#022c22]" />
              <h3 className="font-bold text-lg">Smart Alerts</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 p-3 bg-red-50 text-red-800 rounded-xl text-sm font-medium border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                <p>Masterclass starts in 10 minutes. Attendance required.</p>
              </div>
              <div className="flex gap-3 p-3 bg-orange-50 text-orange-800 rounded-xl text-sm font-medium border border-orange-100">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <p>Policy Assignment due tonight at 23:59 GMT.</p>
              </div>
            </div>
          </motion.div>

          {/* Progress Integration */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-bold text-lg mb-6">Journey Progress</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-600">Modules Completed</span>
                  <span className="text-[#022c22]">65%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-[#022c22] h-2.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="text-green-600">92%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-600">Assignments</span>
                  <span className="text-[#d4af37]">4/5</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-[#d4af37] h-2.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
