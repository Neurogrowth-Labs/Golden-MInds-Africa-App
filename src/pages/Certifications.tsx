import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Award, Share2, Download, CheckCircle2, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_CERTIFICATES = [
  { 
    id: 'cert-001', 
    title: 'Golden Minds Africa Fellowship', 
    type: 'Full Fellowship', 
    issueDate: '2026-12-15', 
    status: 'In Progress', 
    progress: 45,
    skills: ['Policy Analysis', 'Tech Ecosystems', 'Leadership', 'Cross-border Collaboration']
  },
  { 
    id: 'leadership-foundations', 
    title: 'AI Governance Masterclass', 
    type: 'Micro-Credential', 
    issueDate: '2026-02-20', 
    status: 'Earned', 
    progress: 100,
    skills: ['AI Ethics', 'Data Sovereignty', 'Regulatory Frameworks']
  },
];

function CertificationsMain() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedCert, setSelectedCert] = useState(MOCK_CERTIFICATES[1]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      const cert = MOCK_CERTIFICATES.find(c => c.id === id);
      if (cert) setSelectedCert(cert);
    }
  }, [id]);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short, professional LinkedIn summary (2 sentences) for a fellow who just earned the "${selectedCert.title}" certification, highlighting these skills: ${selectedCert.skills.join(', ')}.`
      });
      setAiSummary(response.text);
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Smart Certifications</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your digital credentials and share your achievements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Certificate List */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Your Credentials</h2>
          {MOCK_CERTIFICATES.map(cert => (
            <button
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedCert.id === cert.id 
                  ? 'bg-white dark:bg-[#141414] border-[#ff4e00] shadow-md' 
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 hover:border-[#ff4e00]/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-xl ${cert.status === 'Earned' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  <Award className="w-5 h-5" />
                </div>
                {cert.status === 'Earned' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{cert.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{cert.type}</p>
              
              {cert.status === 'In Progress' ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-medium text-gray-500">
                    <span>Progress</span>
                    <span>{cert.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cert.progress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="text-xs font-medium text-green-600 dark:text-green-400">
                  Issued: {new Date(cert.issueDate).toLocaleDateString()}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Certificate Detail & Sharing */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCert.status === 'Earned' ? (
            <>
              {/* Digital Certificate Preview */}
              <div className="bg-gradient-to-br from-[#022c22] to-[#011a14] rounded-3xl p-8 text-center relative overflow-hidden shadow-xl border border-[#d4af37]/20">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-6 border border-[#d4af37]/30">
                    <ShieldCheck className="w-10 h-10 text-[#d4af37]" />
                  </div>
                  <h4 className="text-[#d4af37] font-bold tracking-widest uppercase text-sm mb-2">Certificate of Completion</h4>
                  <h2 className="text-3xl font-serif font-bold text-white mb-6">{selectedCert.title}</h2>
                  <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
                    This certifies that the fellow has successfully completed the requirements for the {selectedCert.type}, demonstrating proficiency in:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {selectedCert.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-8 border-t border-white/10 pt-6 w-full justify-center">
                    <div className="text-left">
                      <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Issue Date</p>
                      <p className="text-white text-sm font-medium">{new Date(selectedCert.issueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-left">
                      <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Credential ID</p>
                      <p className="text-white text-sm font-mono">{selectedCert.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 bg-[#ff4e00] hover:bg-[#ff6a00] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <Share2 className="w-5 h-5" /> Share to LinkedIn
                </button>
                <button className="flex-1 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:border-[#ff4e00] dark:hover:border-[#ff4e00] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <Download className="w-5 h-5" /> Download PDF
                </button>
                <button className="px-6 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:border-[#ff4e00] dark:hover:border-[#ff4e00] rounded-xl font-bold flex items-center justify-center transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>

              {/* AI LinkedIn Post Generator */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white">AI Post Generator</h3>
                </div>
                {aiSummary ? (
                  <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 border border-white/20 dark:border-white/5 relative">
                    {aiSummary}
                    <button 
                      onClick={() => navigator.clipboard.writeText(aiSummary)}
                      className="absolute top-2 right-2 text-xs font-medium text-blue-500 hover:text-blue-600 bg-blue-500/10 px-2 py-1 rounded"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Generate a professional summary of your achievement to share with your network.
                  </p>
                )}
                {!aiSummary && (
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="py-2 px-4 rounded-xl bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate LinkedIn Post'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Award className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Keep Going!</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                You are currently working towards the {selectedCert.title}. Complete all required modules and assignments to unlock your digital credential.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Certifications() {
  return (
    <Routes>
      <Route path="/" element={<CertificationsMain />} />
      <Route path="certificate/:id" element={<CertificationsMain />} />
    </Routes>
  );
}
