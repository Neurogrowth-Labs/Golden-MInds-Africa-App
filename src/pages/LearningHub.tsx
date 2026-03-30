import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, PlayCircle, FileText, Sparkles, Loader2, BrainCircuit, TrendingUp, Clock, Download } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_MODULES = [
  {
    id: 1,
    title: "Foundation: African Leadership, Governance & Global Systems",
    materials: [
      { id: 'm1', title: "African Leadership & Governance Lesson", type: "pdf", url: "/African_Leadership_Governance.pdf", description: "A comprehensive lesson exploring definitions, colonial legacies, governance models, regional bodies, and contemporary challenges shaping leadership across the African continent." },
      { id: 'm2', title: "Keynote: Digital Infrastructure", type: "video", url: "#" }
    ]
  },
  {
    id: 2,
    title: "Module 2: Sustainable Tech Ecosystems",
    materials: [
      { id: 'm3', title: "Green Tech Startups Report", type: "pdf", url: "#" },
      { id: 'm4', title: "Panel Discussion: Funding", type: "video", url: "#" }
    ]
  }
];

const SMART_FEED = [
  { id: 'f1', title: "From 'Heroic' to Ubuntu Leadership", type: "Article", time: "5 min read", match: "98% Match" },
  { id: 'f2', title: "Case Study: Botswana's Stable Democracy", type: "Case Study", time: "15 min read", match: "95% Match" },
  { id: 'f3', title: "The Role of the African Union & RECs", type: "Video", time: "12 mins", match: "88% Match" },
  { id: 'f4', title: "Navigating Chinese Investment in Africa", type: "Article", time: "8 min read", match: "85% Match" },
];

export default function LearningHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('modules');

  const handleGenerateSummary = async (materialTitle: string) => {
    setIsGenerating(true);
    setAiSummary('');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a comprehensive summary and key takeaways for a learning material titled: "${materialTitle}". Focus on its relevance to the African tech and governance ecosystem.`,
        config: {
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });
      setAiSummary(response.text || 'Summary could not be generated.');
    } catch (error) {
      console.error("Error generating summary:", error);
      setAiSummary('Failed to generate summary. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left Column - Modules */}
      <div className="flex-1 space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif mb-2">Learning Hub</h1>
          <p className="text-gray-600">Access your course materials and AI-augmented insights.</p>
        </div>

        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
              activeTab === 'modules' ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-5 h-5" /> Course Modules
            {activeTab === 'modules' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
              activeTab === 'feed' ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-5 h-5" /> Smart Learning Feed
            {activeTab === 'feed' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]" />
            )}
          </button>
        </div>

        {activeTab === 'modules' && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search modules, topics, or materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff4e00] transition-shadow shadow-sm"
              />
            </div>

            <div className="space-y-6">
              {MOCK_MODULES.map((mod) => (
                <motion.div 
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                  <h2 className="text-xl font-bold font-serif mb-4">{mod.title}</h2>
                  <div className="space-y-3">
                    {mod.materials.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => {
                          setSelectedMaterial(mat);
                          setAiSummary('');
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                          selectedMaterial?.id === mat.id 
                            ? 'bg-[#5A5A40] text-white' 
                            : 'bg-[#f5f5f0] hover:bg-[#e5e5e0] text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {mat.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          <span className="font-medium">{mat.title}</span>
                        </div>
                        <span className="text-xs uppercase tracking-wider font-bold opacity-70">{mat.type}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4e00] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl font-bold font-serif mb-4">Smart Learning Feed</h2>
                <p className="text-gray-300 mb-6">A dynamic stream of articles, videos, and case studies personalized by AI based on your interests, engagement patterns, and skill gaps.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {SMART_FEED.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-[#ff4e00] rounded-xl flex items-center justify-center">
                      {item.type === 'Video' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="uppercase tracking-wider font-bold">{item.type}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {item.match}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - AI Assistant & Details */}
      <div className="w-full lg:w-96 space-y-6">
        {selectedMaterial ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6"
          >
            <div className="w-12 h-12 bg-orange-50 text-[#ff4e00] rounded-xl flex items-center justify-center mb-4">
              {selectedMaterial.type === 'video' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <h3 className="text-xl font-bold mb-2">{selectedMaterial.title}</h3>
            <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider font-bold">{selectedMaterial.type} Document</p>
            
            <div className="flex gap-3 mb-8">
              <button className="flex-1 py-3 bg-[#1a1a1a] text-white rounded-xl font-medium hover:bg-black transition-colors">
                Open Material
              </button>
              {selectedMaterial.type === 'pdf' && (
                <button 
                  onClick={() => {
                    // In a real app, this would trigger a download
                    alert('Downloading ' + selectedMaterial.title);
                  }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#ff4e00] font-bold">
                  <Sparkles className="w-5 h-5" />
                  <span>AI Assistant</span>
                </div>
                {!aiSummary && !isGenerating && (
                  <button 
                    onClick={() => handleGenerateSummary(selectedMaterial.title)}
                    className="text-sm text-[#5A5A40] font-semibold hover:underline"
                  >
                    Generate Summary
                  </button>
                )}
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#ff4e00]" />
                  <p className="text-sm">Analyzing material and gathering context...</p>
                </div>
              ) : aiSummary ? (
                <div className="prose prose-sm max-w-none text-gray-700 bg-[#f5f5f0] p-4 rounded-2xl border border-gray-200">
                  <div dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  Select "Generate Summary" to get an AI-powered overview of this material, enriched with real-time web context.
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center sticky top-6 flex flex-col items-center justify-center min-h-[400px]">
            <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Material Selected</h3>
            <p className="text-gray-400 text-sm max-w-[200px]">
              Select a module material to view details and generate AI summaries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
