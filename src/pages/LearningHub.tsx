import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, PlayCircle, FileText, Sparkles, Loader2, BrainCircuit, TrendingUp, Clock, Download, PenTool } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_MODULES = [];


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
      const moduleContext = `
        Context for Golden Minds Africa Fellowship courses:
        - Module 1 (Leadership): Focuses on leadership vs authority vs influence. Ethics (Values-Based, Servant Leadership, Transformational, Authentic, Stakeholder-Centric). Self-assessment evaluates EQ, Decision-Making, Communication, Adaptability, Integrity.
        - Module 2 (Governance): Governance refers to decision-making systems (Authority, Legitimacy, Accountability, Performance). Covers Democracy, Autocracy, Hybrid. Institutions include Legislature, Executive, Judiciary, Independent bodies.
        - Module 3 (Ideologies & Power): Covers Liberalism, Socialism, Capitalism, African Governance (Ubuntu). Legitimacy from Traditional, Charismatic, Legal-Rational sources. Actors: State, Market, Civil Society.
        - Module 4 (Public Service & Ethics): Public Servants handle policy, delivery, advisory, oversight. Ethics vs Corruption (bribery, fraud, nepotism). Accountability mechanisms like audits, oversight.
        - Module 5 (Geopolitics): Geography shapes power. Hard, Soft, Economic, Technological powers. Africa shifting from resource exporter to value chain owner via AU/AfCFTA.
        - Module 6 (Global Institutions): Roles of UN, AU, IMF, World Bank. Diplomacy involves bilateral/multilateral talks, BATNA, and shifting from Zero-Sum to Win-Win.
        - Module 7 (Policy Formulation): Policy Cycle. Evidence-based policy making. McKinsey/Bloomberg style Policy Brief templates. Real-world African policy cases.
        - Module 8 (Economics): Macroeconomic indicators (GDP, Inflation), Growth Framework (Y=C+I+G+(X-M)), and the Leadership Decision Framework for tradeoffs.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: `${moduleContext}\n\nProvide a comprehensive summary and key takeaways for a learning material titled: "${materialTitle}". Focus on its relevance to the African context based on the provided module context. Keep it professional and educational.`,
      });
      setAiSummary(response.text || 'Summary could not be generated.');
    } catch (error) {
      console.error("Error generating summary:", error);
      setAiSummary('Failed to generate summary. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!selectedMaterial) return;
    const content = `# ${selectedMaterial.title}\n\n${selectedMaterial.description}\n\n[Simulated Material Document Content]\n`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedMaterial.title.replace(/[\s\W]+/g, '_')}.${selectedMaterial.type === 'pdf' ? 'pdf' : 'md'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenMaterial = () => {
    if (!selectedMaterial) return;
    const type = (selectedMaterial.type || '').toLowerCase();
    
    if (type === 'assignment') {
      navigate('/assignments');
    } else if (type === 'video') {
      navigate(`/learning-hub/watch/${selectedMaterial.id}`);
    } else if (type === 'article' || type === 'case study' || type === 'pdf') {
      navigate(`/learning-hub/read/${selectedMaterial.id}`);
    } else {
      handleDownload();
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

        <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => navigate('/learning-hub/modules')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
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
                        onDoubleClick={() => {
                           if (mat.type === 'assignment') {
                             navigate('/assignments');
                           } else if (mat.type === 'video') {
                             navigate(`/learning-hub/watch/${mat.id}`);
                           } else if (mat.type === 'article' || mat.type === 'case study') {
                             navigate(`/learning-hub/read/${mat.id}`);
                           }
                        }}
                        className={`group w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                          selectedMaterial?.id === mat.id 
                            ? 'bg-[#5A5A40] text-white' 
                            : 'bg-[#f5f5f0] hover:bg-[#e5e5e0] text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getIconForType(mat.type)}
                          <span className="font-medium text-left">{mat.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-70 transition-opacity">Double click to open</span>
                           <span className="text-xs uppercase tracking-wider font-bold opacity-70 shrink-0 ml-4">{mat.type}</span>
                        </div>
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
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setSelectedMaterial({...item, description: `Recommended for you. ${item.match}.`, type: item.type.toLowerCase()});
                      setAiSummary('');
                    }}
                    onDoubleClick={() => {
                       const itemType = item.type.toLowerCase();
                       if (itemType === 'assignment') {
                         navigate('/assignments');
                       } else if (itemType === 'video') {
                         navigate(`/learning-hub/watch/${item.id}`);
                       } else {
                         navigate(`/learning-hub/read/${item.id}`);
                       }
                    }}
                    className="group bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 text-[#ff4e00] rounded-xl flex items-center justify-center shrink-0">
                        {item.type === 'Video' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-[#ff4e00] transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="uppercase tracking-wider font-bold">{item.type}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2 shrink-0 sm:ml-4">
                          <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit">
                            <TrendingUp className="w-3 h-3" /> {item.match}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            Double click to open
                          </span>
                        </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - AI Assistant & Details */}
      <div className="w-full lg:w-96 space-y-6 lg:col-span-2">
        {selectedMaterial ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-6"
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
              <button 
                onClick={handleOpenMaterial}
                className="flex-1 py-3 bg-[#1a1a1a] text-white rounded-xl font-medium hover:bg-black transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2"
                title={selectedMaterial.type === 'assignment' ? 'Go to Assignment' : 'Open Material'}
              >
                {selectedMaterial.type === 'assignment' ? 'View Assignment' : 
                 selectedMaterial.type.toLowerCase() === 'video' ? 'Play Video' : 
                 'Read Document'}
              </button>
              {selectedMaterial.type === 'pdf' && (
                <button 
                  onClick={handleDownload}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center active:scale-95"
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
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center lg:sticky lg:top-6 flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px]">
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

const MASTER_CONTENT_PROMPT = `📌 ROLE
You are an elite curriculum designer, political science professor, governance strategist, and instructional designer specializing in:
- Leadership & Political Systems
- African Governance & Development
- Public Policy & Public Administration
- Geopolitics & Global Institutions
- Digital Governance & AI in Government
- Public Speaking, Influence & Crisis Leadership

You are designing content for a world-class African Leadership, Governance, and Public Policy program.
Your output must match the quality of institutions such as Harvard Kennedy School, Oxford Blavatnik School of Government, UN Leadership Training Programs, and African Union leadership initiatives.

🎯 OBJECTIVE
For the topic provided below, you must generate high-impact learning content that is:
- Deep, structured, and intellectually rigorous
- Africa-relevant (real examples, institutions, and challenges)
- Practical and applied (not just theory)
- Suitable for emerging leaders, policymakers, and executives
- Clear, engaging, and professionally formatted in pure Markdown

📚 PROFESSIONAL ARTICLE FORMAT STRUCTURE (CRITICAL FOR ARTICLES & PDFs)
If the content type is ARTICLE or PDF/DOCUMENT, you MUST strictly generate the content using this 12-point structure:

1. # TITLE
   Format: [Core Theme]: [Insight or Tension or Application]
   Make it a strong, precise, and intellectually engaging title.
2. ## EXECUTIVE SUMMARY
   A short overview (100–150 words) covering what it's about, why it matters, and the key insight.
3. ## INTRODUCTION
   Set the stage: real-world problem, global/African relevance, leading tension, and brief framing.
4. ## CORE CONCEPTS & THEORETICAL FRAMEWORKS
   Break down the intellectual foundation. Include key definitions, major theories, models, and foundational thinkers.
5. ## MAIN ANALYSIS
   The heart of the material. Structure into subsections:
   - Key Dynamics / Systems / Structures
   - How It Works in Practice
   - Strengths and Limitations
   - Comparative Perspectives (Global vs African context)
6. ## AFRICAN CONTEXT LENS 🌍
   How the concept applies in African governance systems, structural challenges, success stories, and specific country examples.
7. ## PRACTICAL APPLICATION (FROM THEORY TO ACTION)
   Show how leaders actually use this in Govt, Policy design, Diplomacy, NGOs, and Private sector.
8. ## CASE INSIGHT / REAL-WORLD EXAMPLE
   A short embedded case study: Situation, problem faced, decision made, outcome, key lesson.
9. ## KEY INSIGHTS / TAKEAWAYS
   Bullet-point summary of core lessons (5-8 points) for strategic decision-making.
10. ## DISCUSSION QUESTIONS
    3-5 high-level reflective questions promoting debate and policy reasoning.
11. ## PRACTICAL EXERCISE / APPLICATION TASK
    A real-world assignment (e.g. policy design, simulation) with instructions, context, deliverables, and evaluation criteria.
12. ## CONCLUSION
    End with a strategic reflection, future implications, or leadership call to action.

🎥 SPECIAL CONTENT RULES (OVERRIDES FOR SPECIFIC FORMATS)
Format the content according to this type rule:
- ARTICLE: Deep explanation (800–1500 words equivalent), structured academic tone using the 12-point structure above.
- VIDEO SCRIPT: Convert the core insights into a script format. Include an opening hook, teaching sections, real-world storytelling, and closing reflection.
- PDF / Document: Structured like a professional policy paper using the 12-point structure. Include text-based frameworks and tables.
- CASE STUDY: Must include Background context, Key problem, Stakeholders, Decision points, Lessons learned, and Alternative outcomes.
- ASSIGNMENT: Emphasize practical, simulation-based, and decision-oriented tasks.

🧠 STYLE GUIDELINES
- Write in an executive, academic tone. Be clear, structured, and analytical. Avoid fluff or motivational clichés.
- EXPLICIT CONNECTIONS: You MUST explicitly map the journey from Theory → Systems → Africa → Practice → Leadership Decision-Making in your prose.
- Think like a Policy advisor to a head of state or a UN strategist.

✨ MANDATORY ENHANCEMENTS (MUST INCLUDE IN ALL ARTICLES & PDFs)
You MUST include all of the following in your generated markdown:
1. **Insight Boxes:** Use blockquotes (e.g., > **Insight:** or > **Critical Definition:**) to highlight key concepts, critical definitions, or actionable advice.
2. **Comparative Tables:** Include at least one Markdown table comparing different governance models, leadership frameworks, or policy approaches.
3. **Text-Described Diagrams:** Include at least one visual framework described in text (e.g., using ASCII art, mermaid.js syntax blocks, or clear structured textual hierarchies representing a visual flow).

🚀 FINAL INSTRUCTION
👉 Focus on transforming learners into real-world leaders, not just students
👉 Every lesson must build decision-making power, analytical thinking, and leadership judgment
👉 Formatting MUST be pure Markdown so a React Markdown renderer displays it beautifully.`;

function LearningHubReader() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let matObj = null;
    for (const mod of MOCK_MODULES) {
      const mat = mod.materials.find((m: any) => m.id === materialId);
      if (mat) {
        matObj = mat;
        break;
      }
    }

    if (matObj) {
      generateContent(matObj);
    } else {
      setContent("# Post Not Found\nThe material you are looking for does not exist.");
      setIsLoading(false);
    }
  }, [materialId]);

  const generateContent = async (item: any) => {
    setIsLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `${MASTER_CONTENT_PROMPT}\n\nHere is the topic you must generate your elite content for. Apply your full expertise:\n\nTOPIC TITLE: ${item.title}\nTOPIC DESCRIPTION: ${item.description}\nCONTENT TYPE RULE TO APPLY: ${item.type.toUpperCase()}`
      });
      setContent(response.text || 'Content generation returned empty.');
    } catch (e) {
      console.error(e);
      setContent("# Error generating content\nPlease check your network connection and API limits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 p-4 md:p-8 space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 font-medium active:scale-95"
      >
        &larr; Back to Learning Hub
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] relative">
        {isLoading && (
           <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
             <Loader2 className="w-12 h-12 text-[#ff4e00] animate-spin mb-4" />
             <p className="text-gray-500 font-medium">Generating Elite Level Content...</p>
             <p className="text-gray-400 text-sm mt-1">Applying African Governance Context & Academic Rigor</p>
           </div>
        )}

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-6 uppercase font-bold tracking-widest">
            <BookOpen className="w-4 h-4 text-[#ff4e00]" /> Reading Mode
            <span className="w-1 h-1 bg-gray-300 rounded-full mx-2"></span>
            <Clock className="w-4 h-4" /> 5-10 MIN READ
          </div>

          <div className="prose prose-lg max-w-none text-gray-800 font-serif leading-relaxed mb-12 min-h-[40vh] space-y-6 [&>p]:mb-6">
            <Markdown remarkPlugins={[remarkGfm]}>
              {content}
            </Markdown>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-12 bg-gray-50/50 -mx-8 md:-mx-12 -mb-8 md:-mb-12 p-8 md:p-12">
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Engagement Tools</h4>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => alert('Saved to notes.')}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 rounded-xl font-medium transition-all shadow-sm"
               >
                Take Notes
              </button>
              <button 
                onClick={() => toast.success('🎉 Milestone Reached! Module completed successfully. Keep up the great work!', { duration: 4000 })}
                className="px-6 py-3 bg-[#ff4e00]/10 text-[#ff4e00] hover:bg-[#ff4e00]/20 active:scale-95 border border-[#ff4e00]/20 rounded-xl font-medium transition-all shadow-sm"
               >
                Log Read Completion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearningHubVideoPlayer() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('Video Lesson');
  const [description, setDescription] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let matObj = null;
    for (const mod of MOCK_MODULES) {
      const mat = mod.materials.find((m: any) => m.id === materialId);
      if (mat) {
        matObj = mat;
        setTitle(mat.title);
        setDescription(mat.description);
        break;
      }
    }

    if (matObj) {
      generateScript(matObj);
    } else {
      setScriptContent("# Video Not Found\nThe material you are looking for does not exist.");
      setIsLoading(false);
    }
  }, [materialId]);

  const generateScript = async (item: any) => {
    setIsLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `${MASTER_CONTENT_PROMPT}\n\nHere is the topic you must generate your elite content for. Apply your full expertise:\n\nTOPIC TITLE: ${item.title}\nTOPIC DESCRIPTION: ${item.description}\nCONTENT TYPE RULE TO APPLY: VIDEO SCRIPT`
      });
      setScriptContent(response.text || 'Video script generation returned empty.');
    } catch (e) {
      console.error(e);
      setScriptContent("# Error generating script\nPlease check your network connection and API limits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 p-4 md:p-8 space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 font-medium active:scale-95"
      >
        &larr; Back to Learning Hub
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group relative">
        {isLoading && (
           <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center min-h-[400px]">
             <Loader2 className="w-12 h-12 text-[#ff4e00] animate-spin mb-4" />
             <p className="text-gray-500 font-medium">Generating Video Transcript & Script...</p>
             <p className="text-gray-400 text-sm mt-1">Applying African Governance Context & Academic Rigor</p>
           </div>
        )}

        <div className="aspect-video bg-[#1a1a1a] relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <button 
             onClick={() => toast.success(`Tracking event: [Video Started] for ${title}`)}
             className="w-20 h-20 text-[#ff4e00] absolute z-10 cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-2xl rounded-full focus:outline-none focus:ring-4 focus:ring-orange-500/50"
             title="Open In App"
          >
             <PlayCircle className="w-full h-full" />
          </button>
          <p className="absolute bottom-6 left-6 text-2xl font-bold text-white z-10">{title}</p>
          <div className="absolute top-6 right-6 flex gap-3 z-10">
            <button 
              onClick={() => {
                toast.info(`Tracking event: [Redirect to YouTube] for ${title}`);
                window.open('https://youtube.com', '_blank');
              }}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-all shadow-md flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" /> Watch on YouTube
            </button>
          </div>
        </div>
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-4 font-serif group-hover:text-[#ff4e00] transition-colors">{title}</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {description}
          </p>

          <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 border-b border-gray-200 pb-6 uppercase font-bold tracking-widest">
              <FileText className="w-4 h-4 text-[#ff4e00]" /> Full Video Script & Curriculum
            </div>
            <div className="prose prose-lg max-w-none text-gray-800 font-serif leading-relaxed space-y-6 [&>p]:mb-6">
              <Markdown remarkPlugins={[remarkGfm]}>
                {scriptContent}
              </Markdown>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-12 bg-gray-50/50 -mx-8 md:-mx-12 -mb-8 md:-mb-12 p-8 md:p-12">
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Engagement Tools</h4>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => alert('Saved to notes.')}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 rounded-xl font-medium transition-all shadow-sm"
               >
                Take Notes
              </button>
              <button 
                onClick={() => toast.success('🎉 Milestone Reached! Module completed successfully. Keep up the great work!', { duration: 4000 })}
                className="px-6 py-3 bg-[#ff4e00]/10 text-[#ff4e00] hover:bg-[#ff4e00]/20 active:scale-95 border border-[#ff4e00]/20 rounded-xl font-medium transition-all shadow-sm"
               >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
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
      <Route path="read/:materialId" element={<LearningHubReader />} />
      <Route path="watch/:materialId" element={<LearningHubVideoPlayer />} />
    </Routes>
  );
}
