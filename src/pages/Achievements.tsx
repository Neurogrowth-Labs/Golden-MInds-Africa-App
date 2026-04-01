import React from 'react';
import { motion } from 'motion/react';
import { Award, Star, Trophy, Target, Zap, Shield, Crown, Medal, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BADGES = [
  { id: 'pioneer', name: 'Pioneer', description: 'Joined the platform early', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', condition: () => true },
  { id: 'attendance_3', name: 'Consistent', description: '3+ day attendance streak', icon: Zap, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', condition: (p: any) => (p?.attendanceStreak || 0) >= 3 },
  { id: 'attendance_10', name: 'Dedicated', description: '10+ day attendance streak', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', condition: (p: any) => (p?.attendanceStreak || 0) >= 10 },
  { id: 'debater_50', name: 'Top Debater', description: 'Debate score > 50', icon: Target, color: 'text-[#ff4e00]', bg: 'bg-orange-50', border: 'border-orange-200', condition: (p: any) => (p?.participationScore || 0) >= 50 },
  { id: 'debater_100', name: 'Master Orator', description: 'Debate score > 100', icon: Crown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', condition: (p: any) => (p?.participationScore || 0) >= 100 },
  { id: 'contributor_20', name: 'Contributor', description: 'Overall score > 20', icon: Star, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', condition: (p: any) => (p?.participationScore || 0) >= 20 },
  { id: 'contributor_200', name: 'Visionary', description: 'Overall score > 200', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', condition: (p: any) => (p?.participationScore || 0) >= 200 },
];

export default function Achievements() {
  const { profile } = useAuth();

  const score = profile?.participationScore || 0;
  const level = Math.floor(score / 50) + 1;
  const nextLevelScore = level * 50;
  const progress = (score % 50) / 50 * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif mb-2">Fellowship Achievements</h1>
        <p className="text-gray-600">Track your progress, earn badges, and climb the leaderboard.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Level & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff4e00] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#ff4e00]/30 border-4 border-white/10">
                <span className="text-4xl font-bold font-serif">{level}</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">Level {level} Fellow</h2>
              <p className="text-gray-400 text-sm mb-6">Keep participating to level up!</p>

              <div className="w-full bg-white/10 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="w-full flex justify-between text-xs text-gray-400 font-medium mb-6">
                <span>{score} XP</span>
                <span>{nextLevelScore} XP</span>
              </div>

              <button 
                onClick={() => window.location.href = '/certifications/certificate/leadership-foundations'}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" /> View Certificate
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-bold font-serif text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#5A5A40]" />
              Impact Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Total Score</span>
                <span className="font-bold text-lg">{score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Attendance Streak</span>
                <span className="font-bold text-lg">{profile?.attendanceStreak || 0} days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Global Rank</span>
                <span className="font-bold text-lg text-[#ff4e00]">Top 15%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Badges */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-serif flex items-center gap-3">
                <Medal className="w-6 h-6 text-[#ff4e00]" />
                Badges & Honors
              </h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
                {BADGES.filter(b => b.condition(profile)).length} / {BADGES.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGES.map((badge, index) => {
                const isEarned = badge.condition(profile);
                return (
                  <motion.div 
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`relative overflow-hidden rounded-2xl p-6 flex flex-col items-center text-center border-2 transition-all ${
                      isEarned 
                        ? `${badge.bg} ${badge.border} shadow-sm` 
                        : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isEarned ? 'bg-white shadow-sm' : 'bg-gray-200'}`}>
                      <badge.icon className={`w-8 h-8 ${isEarned ? badge.color : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`font-bold mb-1 ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>{badge.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{badge.description}</p>
                    
                    {!isEarned && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-gray-900 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                          Locked
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
