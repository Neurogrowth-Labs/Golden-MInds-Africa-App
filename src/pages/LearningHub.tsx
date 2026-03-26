import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, PlayCircle, FileText, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_MODULES = [
  {
    id: 1,
    title: "Module 1: AI in African Governance",
    materials: [
      { id: 'm1', title: "Policy Frameworks 2026", type: "pdf", url: "#" },
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

export default function LearningHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
                    <span className="text-sm uppercase tracking-wider opacity-70 font-bold">{mat.type}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
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
