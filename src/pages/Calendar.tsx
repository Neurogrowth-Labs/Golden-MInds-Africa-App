import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, Sparkles, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Badge } from '@/components/ui/badge';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_EVENTS = [
  { id: 1, title: 'Policy & Tech Ecosystems Lecture', type: 'Lecture', date: '2026-03-27', time: '14:00 - 15:30 GMT', location: 'Virtual Room A', attendees: 45 },
  { id: 2, title: 'Mentor 1:1 with Dr. Amina Mensah', type: 'Mentorship', date: '2026-03-28', time: '10:00 - 10:45 GMT', location: 'Google Meet', attendees: 2 },
  { id: 3, title: 'Regional Debate: AI Sovereignty', type: 'Debate', date: '2026-03-29', time: '16:00 - 18:00 GMT', location: 'Virtual Arena', attendees: 120 },
  { id: 4, title: 'Project Builder Workshop', type: 'Workshop', date: '2026-03-30', time: '13:00 - 15:00 GMT', location: 'Virtual Room B', attendees: 30 },
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 26)); // March 26, 2026
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleAISchedule = async () => {
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on a fellow's typical schedule (lectures, mentorship, project work), suggest an optimal time block for "Deep Work & Project Building" next week. Return a short, encouraging 2-sentence suggestion.`
      });
      setAiSuggestion(response.text);
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Smart Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your fellowship schedule and get AI-powered time management insights.</p>
        </div>
        <button className="bg-[#ff4e00] hover:bg-[#ff6a00] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="h-24 rounded-xl border border-transparent" />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = MOCK_EVENTS.filter(e => e.date === dateStr);
              const isToday = day === 26 && currentDate.getMonth() === 2 && currentDate.getFullYear() === 2026;

              return (
                <div 
                  key={day} 
                  className={`h-24 rounded-xl border p-2 transition-colors hover:border-[#ff4e00]/50 ${
                    isToday 
                      ? 'border-[#ff4e00] bg-[#ff4e00]/5' 
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[#ff4e00]' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div key={event.id} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-[#ff4e00]/10 text-[#ff4e00] font-medium">
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-[#ff4e00]/10 to-purple-600/10 border border-[#ff4e00]/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4e00]/10 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff4e00] to-[#ff6a00] flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">AI Schedule Assistant</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Optimize your time</p>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              {aiSuggestion ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 border border-white/20 dark:border-white/5"
                >
                  {aiSuggestion}
                </motion.div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  I can analyze your upcoming deadlines and meetings to suggest optimal blocks for deep work.
                </p>
              )}
              
              <button 
                onClick={handleAISchedule}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-sm border border-gray-200 dark:border-gray-700 hover:border-[#ff4e00] dark:hover:border-[#ff4e00] transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Analyzing Schedule...' : 'Suggest Deep Work Time'}
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {MOCK_EVENTS.slice(0, 3).map(event => (
                <div key={event.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#ff4e00]/10 text-[#ff4e00] shrink-0">
                    <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-black leading-none">{new Date(event.date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{event.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time.split(' ')[0]}</span>
                      <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Virtual</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-[#ff4e00] hover:bg-[#ff4e00]/10 rounded-lg transition-colors">
              View All Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
