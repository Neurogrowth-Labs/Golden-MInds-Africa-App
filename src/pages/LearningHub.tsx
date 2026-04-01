import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, PlayCircle, FileText, Sparkles, Loader2, BrainCircuit, TrendingUp, Clock, Download, PenTool } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_MODULES = [
  {
    id: 1,
    title: "Week 1: Leadership in the Modern World",
    materials: [
      { id: 'm1', title: "Handbook Introduction & Overview", type: "pdf", url: "#", description: "This handbook is designed as a world-class intellectual and practical guide for emerging leaders, policymakers, and innovators across Africa and globally." },
      { id: 'm2', title: "1.1 Understanding Leadership", type: "article", url: "#", description: "Leadership is the ability to influence direction, behavior, and outcomes toward a defined vision." },
      { id: 'm3', title: "1.2 Evolution of Leadership", type: "video", url: "#", description: "From Ancient to Digital Leadership." },
      { id: 'm4', title: "1.3 Leadership Models Explained", type: "article", url: "#", description: "Transformational, Transactional, Adaptive, and Systems Leadership." },
      { id: 'm5', title: "1.4 Ethical Leadership", type: "article", url: "#", description: "Utilitarian, Deontological, Virtue Ethics, and Ubuntu Philosophy." },
      { id: 'm6', title: "1.5 Practical Lab: Leadership Self-Assessment", type: "assignment", url: "#", description: "Evaluate decision-making patterns, emotional intelligence, and leadership philosophy." },
    ]
  },
  {
    id: 2,
    title: "Week 2: Governance Systems",
    materials: [
      { id: 'm7', title: "2.1 What is Governance?", type: "article", url: "#", description: "Systems, processes, and institutions through which decisions are made and implemented." },
      { id: 'm8', title: "2.2 Types of Governance Systems", type: "article", url: "#", description: "Democracy, Autocracy, and Hybrid Systems." },
      { id: 'm9', title: "2.3 Role of Institutions", type: "video", url: "#", description: "Judiciary, Legislature, Executive, Regulatory bodies." },
      { id: 'm10', title: "2.4 State Capacity", type: "article", url: "#", description: "Implement policies, collect taxes, maintain order, deliver services." },
      { id: 'm11', title: "2.5 Practical Simulation: Government Formation", type: "assignment", url: "#", description: "Form political groups, negotiate power, and build a functioning government." },
    ]
  },
  {
    id: 3,
    title: "Week 3: Political Ideologies & Power",
    materials: [
      { id: 'm12', title: "3.1 Understanding Ideology", type: "article", url: "#", description: "A set of beliefs about how society should be organized and governed." },
      { id: 'm13', title: "3.2 Major Ideologies", type: "article", url: "#", description: "Liberalism, Socialism, Capitalism, and African Governance Models." },
      { id: 'm14', title: "3.3 Power and Legitimacy", type: "video", url: "#", description: "Traditional, Charismatic, and Legal-rational legitimacy." },
      { id: 'm15', title: "3.4 Practical Debate: State vs Market vs Society", type: "assignment", url: "#", description: "Engage in structured debate representing different ideological positions." },
    ]
  },
  {
    id: 4,
    title: "Week 4: Public Service & Ethics",
    materials: [
      { id: 'm16', title: "4.1 Role of Public Servants", type: "article", url: "#", description: "Implement policies and deliver services to citizens." },
      { id: 'm17', title: "4.2 Ethics and Accountability", type: "article", url: "#", description: "Audits, Oversight bodies, Public reporting." },
      { id: 'm18', title: "4.3 Corruption Explained", type: "video", url: "#", description: "Bribery, Embezzlement, Nepotism, and their causes." },
      { id: 'm19', title: "4.4 Practical Simulation: Ethics Tribunal", type: "assignment", url: "#", description: "Analyze a corruption case and deliver judgment based on evidence and ethical reasoning." },
      { id: 'm20', title: "4.5 Case Study Analysis", type: "article", url: "#", description: "Compare a failed public system with a successful governance model." },
      { id: 'm21', title: "Final Note: Transformation", type: "pdf", url: "#", description: "Leadership is not a concept. It is a responsibility. Governance is not theory. It is power in action." },
    ]
  },
  {
    id: 5,
    title: "Week 5: Fundamentals of Geopolitics",
    materials: [
      { id: 'm22', title: "5.1 Power, Geography, and Global Influence", type: "article", url: "#", description: "Hard Power, Soft Power, and Strategic Geography." },
      { id: 'm23', title: "5.2 Regional Blocs and Alliances", type: "article", url: "#", description: "African regional integration systems, European unions, and BRICS." },
      { id: 'm24', title: "5.3 Global Power Dynamics", type: "video", url: "#", description: "Rising vs declining powers, strategic rivalries, and regional tensions." },
      { id: 'm25', title: "5.4 Practical Exercise: Map-Based Geopolitical Simulation", type: "assignment", url: "#", description: "Analyze global regions, identify strategic interests, and predict conflicts." },
    ]
  },
  {
    id: 6,
    title: "Week 6: Global Institutions & Diplomacy",
    materials: [
      { id: 'm26', title: "6.1 Major Global Institutions", type: "article", url: "#", description: "United Nations System, African Union, IMF, and World Bank." },
      { id: 'm27', title: "6.2 Diplomacy and Negotiation Theory", type: "article", url: "#", description: "Interest-based negotiation, power balance awareness, and cultural intelligence." },
      { id: 'm28', title: "6.3 Strategic Diplomacy", type: "video", url: "#", description: "Building alliances, managing conflicts, and influencing global agendas." },
      { id: 'm29', title: "6.4 Practical Exercise: Diplomatic Negotiation Role-Play", type: "assignment", url: "#", description: "Simulate international negotiations involving trade, conflict, or climate." },
    ]
  },
  {
    id: 7,
    title: "Week 7: Policy Formulation & Analysis",
    materials: [
      { id: 'm30', title: "7.1 The Policy Cycle", type: "article", url: "#", description: "Agenda Setting, Policy Formulation, Implementation, and Evaluation." },
      { id: 'm31', title: "7.2 Evidence-Based Policy Making", type: "article", url: "#", description: "Quantitative data, qualitative insights, and comparative analysis." },
      { id: 'm32', title: "7.3 Policy Analysis Tools", type: "video", url: "#", description: "Cost-benefit analysis, impact assessment, and scenario planning." },
      { id: 'm33', title: "7.4 Practical Exercise: Policy Brief Development", type: "assignment", url: "#", description: "Draft a professional policy brief addressing a real-world issue." },
    ]
  },
  {
    id: 8,
    title: "Week 8: Economics for Public Leaders",
    materials: [
      { id: 'm34', title: "8.1 Macroeconomics Basics", type: "article", url: "#", description: "GDP, Inflation, Unemployment, Monetary and Fiscal policy." },
      { id: 'm35', title: "8.2 Public Budgeting", type: "article", url: "#", description: "Revenue, Expenditure, and Deficit/surplus management." },
      { id: 'm36', title: "8.3 Fiscal Policy and Economic Stability", type: "video", url: "#", description: "Stimulating growth, controlling inflation, and investing in development." },
      { id: 'm37', title: "8.4 Practical Exercise: National Budget Simulation", type: "assignment", url: "#", description: "Design a national budget by allocating resources and balancing priorities." },
      { id: 'm38', title: "8.5 Practical Exercise: Crisis Allocation", type: "assignment", url: "#", description: "Respond to an economic crisis by reallocating limited resources." },
    ]
  },
  {
    id: 9,
    title: "Week 9: Crisis Leadership & Decision Making",
    materials: [
      { id: 'm39', title: "9.1 Leading in Uncertainty", type: "article", url: "#", description: "Making decisions with imperfect data and prioritizing speed." },
      { id: 'm40', title: "9.2 Risk Management", type: "article", url: "#", description: "Risk Identification, Assessment, and Mitigation." },
      { id: 'm41', title: "9.3 Resilience Building", type: "video", url: "#", description: "Creating adaptive systems and empowering decentralized decision-making." },
      { id: 'm42', title: "9.4 Practical Exercise: Crisis Simulation", type: "assignment", url: "#", description: "High-intensity simulation involving a pandemic, economic collapse, or conflict." },
    ]
  },
  {
    id: 10,
    title: "Week 10: Governance & Technology",
    materials: [
      { id: 'm43', title: "10.1 AI and Digital Governance", type: "article", url: "#", description: "Smart cities, digital identity systems, and AI-driven policy analysis." },
      { id: 'm44', title: "10.2 Surveillance vs Freedom", type: "article", url: "#", description: "Balancing security and civil liberties, data control, and preventing misuse." },
      { id: 'm45', title: "10.3 Innovation in Public Systems", type: "video", url: "#", description: "E-government platforms, blockchain for transparency, and AI in public services." },
      { id: 'm46', title: "10.4 Practical Exercise: Digital Governance Solution", type: "assignment", url: "#", description: "Design a scalable digital governance system addressing a public service challenge." },
    ]
  },
  {
    id: 11,
    title: "Week 11: Public Speaking & Influence",
    materials: [
      { id: 'm47', title: "11.1 Strategic Communication", type: "article", url: "#", description: "Audience analysis, message framing, and emotional intelligence." },
      { id: 'm48', title: "11.2 Political Messaging & Media Handling", type: "video", url: "#", description: "Crafting clear messages, handling difficult questions, and controlling narratives." },
      { id: 'm49', title: "11.3 Influence and Persuasion", type: "article", url: "#", description: "Building credibility, logic, and emotional connection with the audience." },
      { id: 'm50', title: "11.4 Practical Exercise: Press Conference", type: "assignment", url: "#", description: "Conduct a live press briefing and respond to media questions." },
      { id: 'm51', title: "11.5 Practical Exercise: Parliamentary Debate", type: "assignment", url: "#", description: "Engage in structured debates, present policy arguments, and defend positions." },
    ]
  },
  {
    id: 12,
    title: "Week 12: Capstone Policy Lab & Leadership Summit",
    materials: [
      { id: 'm52', title: "12.1 Policy Proposal", type: "pdf", url: "#", description: "A comprehensive policy addressing a critical societal issue." },
      { id: 'm53', title: "12.2 Governance Strategy", type: "pdf", url: "#", description: "A strategic framework outlining institutional structures and risk management." },
      { id: 'm54', title: "12.3 Leadership Implementation Plan", type: "pdf", url: "#", description: "A practical roadmap detailing execution strategy and resource allocation." },
      { id: 'm55', title: "12.4 Final Presentation: Leadership Summit", type: "assignment", url: "#", description: "Present to an expert panel in a high-level summit environment." },
    ]
  }
];

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'video': return <PlayCircle className="w-5 h-5" />;
    case 'pdf': return <FileText className="w-5 h-5" />;
    case 'article': return <BookOpen className="w-5 h-5" />;
    case 'assignment': return <PenTool className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

const getIconForTypeLarge = (type: string) => {
  switch (type.toLowerCase()) {
    case 'video': return <PlayCircle className="w-6 h-6" />;
    case 'pdf': return <FileText className="w-6 h-6" />;
    case 'article': return <BookOpen className="w-6 h-6" />;
    case 'assignment': return <PenTool className="w-6 h-6" />;
    default: return <FileText className="w-6 h-6" />;
  }
};

// SMART_FEED is now dynamically generated

function LearningHubMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [smartFeed, setSmartFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Determine active tab from URL
  const activeTab = location.pathname.includes('/feed') ? 'feed' : 
                    location.pathname.includes('/search') ? 'search' : 'modules';

  useEffect(() => {
    if (activeTab === 'feed' && smartFeed.length === 0 && !isLoadingFeed) {
      generateSmartFeed();
    }
  }, [activeTab]);

  const generateSmartFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const prompt = `Act as an AI learning recommendation engine for an African leadership fellowship.
      Based on a user who has completed modules in "Leadership" and "Governance", is interested in "Tech Entrepreneurship", and engages mostly with "Videos" and "Case Studies", suggest 4 highly relevant learning resources.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING, description: "Article, Video, or Case Study" },
                time: { type: Type.STRING, description: "e.g., 5 min read or 12 mins" },
                match: { type: Type.STRING, description: "e.g., 98% Match" }
              },
              required: ["id", "title", "type", "time", "match"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      setSmartFeed(data);
    } catch (error) {
      console.error("Error generating smart feed:", error);
      setSmartFeed([
        { id: 'f1', title: "From 'Heroic' to Ubuntu Leadership", type: "Article", time: "5 min read", match: "98% Match" },
        { id: 'f2', title: "Case Study: Botswana's Stable Democracy", type: "Case Study", time: "15 min read", match: "95% Match" },
        { id: 'f3', title: "The Role of the African Union & RECs", type: "Video", time: "12 mins", match: "88% Match" },
        { id: 'f4', title: "Navigating Chinese Investment in Africa", type: "Article", time: "8 min read", match: "85% Match" },
      ]);
    } finally {
      setIsLoadingFeed(false);
    }
  };

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
          <h1 className="text-4xl font-bold font-serif mb-2 cursor-pointer hover:underline" onClick={() => navigate('/learning-hub')}>Learning Hub</h1>
          <p className="text-gray-600">Access your course materials and AI-augmented insights.</p>
        </div>

        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => navigate('/learning-hub/modules')}
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
            onClick={() => navigate('/learning-hub/feed')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
              activeTab === 'feed' ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-5 h-5" /> Smart Learning Feed
            {activeTab === 'feed' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]" />
            )}
          </button>
          <button
            onClick={() => navigate('/learning-hub/search')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
              activeTab === 'search' ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Search className="w-5 h-5" /> Search
            {activeTab === 'search' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]" />
            )}
          </button>
        </div>

        {(activeTab === 'modules' || activeTab === 'search') && (
          <>
            {activeTab === 'search' && (
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search modules, topics, or materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff4e00] transition-shadow shadow-sm"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-6">
              {MOCK_MODULES.filter(mod => 
                activeTab === 'modules' || 
                mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mod.materials.some(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
              ).map((mod) => (
                <motion.div 
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                  <h2 
                    className="text-xl font-bold font-serif mb-4 cursor-pointer hover:text-[#ff4e00] transition-colors"
                    onClick={() => navigate(`/learning-hub/weeks/${mod.id}`)}
                  >
                    {mod.title}
                  </h2>
                  <div className="space-y-3">
                    {mod.materials.filter(m => activeTab === 'modules' || m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((mat) => (
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
                          {getIconForType(mat.type)}
                          <span className="font-medium text-left">{mat.title}</span>
                        </div>
                        <span className="text-xs uppercase tracking-wider font-bold opacity-70 shrink-0 ml-4">{mat.type}</span>
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
              {isLoadingFeed ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-3xl border border-gray-200">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#ff4e00]" />
                  <p className="text-sm font-medium">Curating your personalized learning feed...</p>
                </div>
              ) : (
                smartFeed.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 text-[#ff4e00] rounded-xl flex items-center justify-center shrink-0">
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
                    <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ml-4">
                      <TrendingUp className="w-3 h-3" /> {item.match}
                    </div>
                  </div>
                ))
              )}
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
              {getIconForTypeLarge(selectedMaterial.type)}
            </div>
            <h3 className="text-xl font-bold mb-2">{selectedMaterial.title}</h3>
            <p className="text-gray-500 text-sm mb-4 uppercase tracking-wider font-bold">{selectedMaterial.type} Document</p>
            {selectedMaterial.description && (
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {selectedMaterial.description}
              </p>
            )}
            
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

export default function LearningHub() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="modules" replace />} />
      <Route path="modules" element={<LearningHubMain />} />
      <Route path="feed" element={<LearningHubMain />} />
      <Route path="search" element={<LearningHubMain />} />
      <Route path="weeks/:weekId" element={<LearningHubMain />} />
      <Route path="weeks/:weekId/:moduleId" element={<LearningHubMain />} />
      <Route path="resource/:weekId/:slug/:type" element={<LearningHubMain />} />
      <Route path="ai-summary/:materialId" element={<LearningHubMain />} />
      <Route path="ai/:contentId/insights" element={<LearningHubMain />} />
    </Routes>
  );
}
