import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, FileText, Award, Download, Share2, Globe, ExternalLink, Edit3, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Portfolio() {
  const { profile } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [portfolioSummary, setPortfolioSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const prompt = `Act as an expert career coach. Write a compelling, 3-sentence professional summary for an African leadership fellow named ${profile?.name || 'a fellow'}. 
      Highlight their focus on policy, entrepreneurship, and their active participation in debates and projects. 
      Make it sound confident and ready for a LinkedIn profile or personal website.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setPortfolioSummary(response.text || 'Summary generation failed.');
    } catch (error) {
      console.error('Error generating summary:', error);
      setPortfolioSummary('Unable to connect to AI Assistant.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000); // Mock export
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2 text-[#022c22]">Digital Portfolio Builder</h1>
          <p className="text-gray-600">Your professional showcase of projects, debates, and achievements.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-bold">Share Link</span>
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-[#022c22] text-white px-5 py-2.5 rounded-full shadow-md hover:bg-[#064e3b] transition-colors disabled:opacity-70"
          >
            {isExporting ? <CheckCircle2 className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4 text-[#d4af37]" />}
            <span className="text-sm font-bold">{isExporting ? 'Exporting...' : 'Export as Website'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 mb-4 overflow-hidden border-4 border-white shadow-lg">
              <img src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-1">{profile?.name || 'Fellow Name'}</h2>
            <p className="text-sm text-[#d4af37] font-bold uppercase tracking-wider mb-4">Golden Minds Fellow</p>
            
            <div className="flex justify-center gap-3 mb-6">
              <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 transition-colors"><Globe className="w-5 h-5" /></button>
              <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-400 transition-colors"><ExternalLink className="w-5 h-5" /></button>
            </div>

            <div className="text-left border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Professional Summary</h3>
                <button 
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="text-xs font-bold text-[#022c22] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> {isGeneratingSummary ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {portfolioSummary || "Passionate leader focused on sustainable development and tech innovation in Africa. Experienced in policy analysis and community building."}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-bold font-serif text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#d4af37]" />
              Key Achievements
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Top 10% Debate Score
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> 3 Published Policy Briefs
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div> Innovation Grant Finalist
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#022c22]" />
              Featured Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-5 hover:border-[#022c22] transition-colors group cursor-pointer">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#022c22] transition-colors">
                    <Briefcase className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">AgriTech Supply Chain</h4>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">A blockchain-based solution for tracking agricultural produce from farm to market in East Africa.</p>
                  <div className="flex gap-2">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">React</span>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Logistics</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#022c22]" />
              Publications & Debates
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">The Future of Digital Currencies in Africa</h4>
                    <p className="text-sm text-gray-500 mb-2">Published in Fellowship Journal • March 2026</p>
                    <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Read Article →</a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
