import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Users, Calendar, Image as ImageIcon, Loader2, Download, 
  BarChart3, BookOpen, MessageSquare, Settings, BrainCircuit, 
  TrendingUp, AlertTriangle, FileText, Plus, Search, MoreVertical, Video,
  CheckCircle2, Clock
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Image Generator State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Report State
  const [aiReport, setAiReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, 'users'), orderBy('name'));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio, imageSize: "1K" } }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate a brief, insightful predictive analytics report for the Golden Minds Africa Fellowship cohort. 
        Include sections on: 1. Engagement Trends, 2. Drop-off Predictions, 3. Recommended Interventions. 
        Keep it professional, data-driven, and concise (max 3 paragraphs).`
      });
      setAiReport(response.text || "Report generation failed.");
    } catch (error) {
      console.error("Error generating report:", error);
      setAiReport("Failed to connect to Golden Minds AI Core.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'AI Insights', icon: BrainCircuit },
    { id: 'users', label: 'Fellows', icon: Users },
    { id: 'onboarding', label: 'Onboarding Analytics', icon: TrendingUp },
    { id: 'content', label: 'CMS', icon: BookOpen },
    { id: 'debates', label: 'Debates', icon: MessageSquare },
    { id: 'rooms', label: 'Virtual Rooms', icon: Video },
    { id: 'generator', label: 'Assets', icon: ImageIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#1a1a1a] to-[#333] text-[#ff4e00] rounded-2xl flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-serif mb-1 text-gray-900">Command Center</h1>
            <p className="text-gray-600 font-medium">Golden Minds AI Core & Administration</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/40">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold text-gray-800 tracking-wide">System Online</span>
        </div>
      </div>

      {/* Navigation (Mobile Only) */}
      <div className="md:hidden flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-gray-200/50 rounded-2xl backdrop-blur-sm mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-[#ff4e00] shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Fellows', value: '142', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg Engagement', value: '87%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Active Debates', value: '12', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'At-Risk Fellows', value: '4', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Insights Panel */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-3xl p-8 shadow-xl text-white relative overflow-hidden border border-gray-800">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4e00]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3 text-[#ff4e00]">
                        <BrainCircuit className="w-6 h-6" />
                        <h2 className="text-2xl font-bold font-serif text-white">Golden Minds AI Core</h2>
                      </div>
                      <p className="text-gray-400 leading-relaxed max-w-xl">
                        Predictive analytics engine. Monitor cohort health, predict drop-offs, and generate automated intervention strategies based on real-time engagement data.
                      </p>
                      <button 
                        onClick={generateAIReport}
                        disabled={isGeneratingReport}
                        className="bg-[#ff4e00] hover:bg-[#e64600] text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                        Generate Predictive Report
                      </button>
                    </div>
                    
                    <div className="flex-1 bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-h-[200px]">
                      {isGeneratingReport ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-[#ff4e00]" />
                          <p className="font-medium animate-pulse">Analyzing cohort data patterns...</p>
                        </div>
                      ) : aiReport ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>') }} />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                          <FileText className="w-10 h-10 mb-3 opacity-20" />
                          <p>Click generate to run the predictive model.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h2 className="text-xl font-bold font-serif">User Management</h2>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search fellows..." 
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl text-sm"
                      />
                    </div>
                    <button className="bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Fellow</th>
                        <th className="p-4 font-bold">Role</th>
                        <th className="p-4 font-bold">Score</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingUsers ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                      ) : users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-bold">{user.name?.charAt(0)}</div>}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                              {user.role || 'Fellow'}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-gray-700">{user.participationScore || 0}</td>
                          <td className="p-4">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTENT & DEBATES PLACEHOLDERS */}
            {(activeTab === 'content' || activeTab === 'debates') && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-sm border border-white/50 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  {activeTab === 'content' ? <BookOpen className="w-10 h-10 text-gray-400" /> : <MessageSquare className="w-10 h-10 text-gray-400" />}
                </div>
                <h2 className="text-2xl font-bold font-serif mb-2">Module Coming Soon</h2>
                <p className="text-gray-500 max-w-md">
                  The {activeTab === 'content' ? 'Content Management System' : 'Debate Management'} module is currently being upgraded with blockchain credentialing and advanced AI moderation tools.
                </p>
              </div>
            )}

            {/* VIRTUAL ROOMS TAB */}
            {activeTab === 'rooms' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-serif">Virtual Rooms Analytics</h2>
                      <p className="text-sm text-gray-500">Monitor active sessions and engagement metrics.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Room
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Rooms</span>
                      <Video className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="text-4xl font-bold font-serif">2</span>
                    <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> +1 from yesterday
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Participants</span>
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-4xl font-bold font-serif">70</span>
                    <p className="text-sm text-gray-500 font-medium mt-2">Across all live sessions</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg. Engagement</span>
                      <BarChart3 className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-4xl font-bold font-serif">85%</span>
                    <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> High participation
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Room Name</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Facilitator</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Participants</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: 'Room Alpha', facilitator: 'Dr. Amina Mensah', status: 'Live', participants: 42, color: 'text-red-500', bg: 'bg-red-50' },
                        { name: 'Room Beta', facilitator: 'Prof. David Osei', status: 'Live', participants: 28, color: 'text-red-500', bg: 'bg-red-50' },
                        { name: 'Room Gamma', facilitator: 'Sarah Kiptoo', status: 'Waiting', participants: 15, color: 'text-blue-500', bg: 'bg-blue-50' },
                      ].map((room, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{room.name}</div>
                          </td>
                          <td className="p-4 text-gray-600">{room.facilitator}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${room.bg} ${room.color}`}>
                              {room.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">{room.participants} / 50</td>
                          <td className="p-4">
                            <button className="text-[#ff4e00] hover:text-[#e64600] font-medium text-sm">View Insights</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GENERATOR TAB */}
            {activeTab === 'onboarding' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Completion Rate</h3>
                      <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-gray-900 font-serif">92%</div>
                      <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +4% this cohort</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg. Time</h3>
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-gray-900 font-serif">8m 45s</div>
                      <p className="text-sm text-blue-600 font-medium mt-1 flex items-center gap-1">Optimal duration</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Drop-offs</h3>
                      <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-gray-900 font-serif">14</div>
                      <p className="text-sm text-red-600 font-medium mt-1 flex items-center gap-1">Needs attention</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Day 1 Engagement</h3>
                      <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-gray-900 font-serif">88%</div>
                      <p className="text-sm text-purple-600 font-medium mt-1 flex items-center gap-1">Highly active</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-gray-900">Drop-off Analysis</h2>
                      <p className="text-gray-500">Where users are abandoning the onboarding flow.</p>
                    </div>
                    <button className="px-4 py-2 bg-[#ff4e00] text-white rounded-xl font-bold text-sm hover:bg-[#e64600] transition-colors">
                      Send Nudges
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-gray-700">Phase 1: Welcome & Identity</span>
                        <span className="text-gray-500">100% completion</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-gray-700">Phase 2: Personal Goals</span>
                        <span className="text-gray-500">98% completion</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[98%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-gray-700">Phase 3: Program Orientation</span>
                        <span className="text-gray-500">95% completion</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 w-[95%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-gray-700">Phase 4: Platform Mastery</span>
                        <span className="text-red-500 font-bold">82% completion (High Drop-off)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[82%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'generator' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-50 text-[#ff4e00] rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-serif">Asset Generator</h2>
                    <p className="text-sm text-gray-500">Create cover images for sessions and modules.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Image Prompt</label>
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A modern African city skyline at sunset, digital art style, vibrant colors..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl transition-colors resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Aspect Ratio</label>
                      <select 
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl transition-colors font-medium"
                      >
                        <option value="1:1">1:1 (Square)</option>
                        <option value="4:3">4:3 (Standard)</option>
                        <option value="16:9">16:9 (Widescreen)</option>
                        <option value="21:9">21:9 (Cinematic)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                      </select>
                    </div>

                    <button 
                      onClick={handleGenerateImage}
                      disabled={!prompt || isGenerating}
                      className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Generating Asset...</>
                      ) : (
                        <><ImageIcon className="w-5 h-5" /> Generate Image</>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-3xl border border-gray-200 flex flex-col items-center justify-center min-h-[300px] overflow-hidden relative group">
                    {generatedImage ? (
                      <>
                        <img src={generatedImage} alt="Generated Cover" className="w-full h-full object-contain" />
                        <a 
                          href={generatedImage} 
                          download="session-cover.png"
                          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-xl hover:bg-white transition-all text-gray-900 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </>
                    ) : isGenerating ? (
                      <div className="flex flex-col items-center text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#ff4e00]" />
                        <p className="font-medium">Synthesizing pixels...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 p-8 text-center">
                        <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-medium">Your generated image will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
