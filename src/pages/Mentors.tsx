import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, Calendar, MessageSquare, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_MENTORS = [
  { id: 1, name: 'Dr. Amina Yusuf', role: 'Former Minister of Tech, Nigeria', industry: 'Public Policy & Tech', match: 98, avatar: 'https://ui-avatars.com/api/?name=Amina+Yusuf&background=022c22&color=fff' },
  { id: 2, name: 'Kwame Osei', role: 'Founder, AgriTech Africa', industry: 'Entrepreneurship', match: 85, avatar: 'https://ui-avatars.com/api/?name=Kwame+Osei&background=d4af37&color=fff' },
  { id: 3, name: 'Sarah Ndlovu', role: 'Director, Pan-African Trade Board', industry: 'Economics', match: 92, avatar: 'https://ui-avatars.com/api/?name=Sarah+Ndlovu&background=5A5A40&color=fff' },
];

export default function Mentors() {
  const { profile } = useAuth();
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState('');

  const handleAIMatch = async () => {
    setIsMatching(true);
    try {
      const prompt = `Act as an AI mentor matching engine for an African leadership fellowship. 
      The fellow's name is ${profile?.name || 'a fellow'} and they are interested in Policy and Tech.
      Based on the available mentors (Dr. Amina Yusuf - Public Policy & Tech, Kwame Osei - Entrepreneurship, Sarah Ndlovu - Economics), 
      recommend the best mentor for them and explain why in 2 short sentences.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setMatchResult(response.text || 'Match generation failed.');
    } catch (error) {
      console.error('Error generating match:', error);
      setMatchResult('Unable to connect to AI Assistant.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2 text-[#022c22]">AI Mentor Matching</h1>
          <p className="text-gray-600">Connect with industry leaders and alumni based on your career goals.</p>
        </div>
        <button 
          onClick={handleAIMatch}
          disabled={isMatching}
          className="flex items-center gap-2 bg-[#d4af37] text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition-colors disabled:opacity-70 font-bold"
        >
          {isMatching ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
          Find My Perfect Match
        </button>
      </div>

      {matchResult && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#022c22] to-[#064e3b] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#d4af37] font-bold mb-4 uppercase tracking-wider text-sm">
              <Sparkles className="w-5 h-5" /> AI Match Recommendation
            </div>
            <div className="prose prose-invert max-w-none text-lg leading-relaxed font-medium">
              <div dangerouslySetInnerHTML={{ __html: matchResult.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_MENTORS.map((mentor, i) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm">
                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border-2 border-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {mentor.match}%
              </div>
            </div>
            
            <h3 className="font-bold font-serif text-xl mb-1 text-gray-900">{mentor.name}</h3>
            <p className="text-sm text-[#d4af37] font-bold mb-2">{mentor.role}</p>
            <p className="text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full mb-6">{mentor.industry}</p>
            
            <div className="flex gap-2 w-full mt-auto">
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors">
                <MessageSquare className="w-4 h-4" /> Message
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#022c22] hover:bg-[#064e3b] text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
                <Calendar className="w-4 h-4" /> Schedule
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
