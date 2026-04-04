import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Users, Calendar, Image as ImageIcon, Loader2, Download, 
  BarChart3, BookOpen, MessageSquare, Settings, BrainCircuit, 
  TrendingUp, AlertTriangle, FileText, Plus, Search, MoreVertical, Video,
  CheckCircle2, Clock, GraduationCap, Award, Mail, Trophy, Activity, Filter
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';

  const setActiveTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
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
    { id: 'analytics', label: 'Analytics & Reporting', icon: BarChart3 },
    { id: 'users', label: 'User & Role Management', icon: Users },
    { id: 'cohorts', label: 'Fellowship & Cohorts', icon: GraduationCap },
    { id: 'scoring', label: 'Performance & Scoring', icon: TrendingUp },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'recommendations', label: 'Recommendations', icon: Mail },
    { id: 'calendar', label: 'Calendar & Sessions', icon: Calendar },
    { id: 'leaderboard', label: 'Recognition & Leaderboard', icon: Trophy },
    { id: 'audit', label: 'Audit & Activity Logs', icon: Activity },
    { id: 'settings', label: 'Platform Configuration', icon: Settings },
  ];

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 overflow-y-auto hide-scrollbar pr-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Command Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Golden Minds Admin</p>
        </div>
        
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left ${
              activeTab === tab.id 
                ? 'bg-[#ff4e00] text-white shadow-md shadow-[#ff4e00]/20' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-white dark:bg-[#141414] rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Analytics & Reporting</h2>
                    <p className="text-gray-500 dark:text-gray-400">Real-time insights across the ecosystem</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Download className="w-4 h-4" /> Export Report
                  </button>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Fellows', value: '142', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Avg Engagement', value: '87%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Completion Rate', value: '94%', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { label: 'At-Risk Fellows', value: '4', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                      <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Insights Panel */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-8 shadow-xl text-white relative overflow-hidden border border-gray-800">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4e00]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3 text-[#ff4e00]">
                        <BrainCircuit className="w-6 h-6" />
                        <h3 className="text-xl font-bold font-serif text-white">Predictive Analytics Engine</h3>
                      </div>
                      <p className="text-gray-400 leading-relaxed max-w-xl">
                        Monitor cohort health, predict drop-offs, and generate automated intervention strategies based on real-time engagement data.
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
                    
                    <div className="flex-1 bg-black/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                      <h4 className="font-bold text-sm text-gray-400 mb-4 uppercase tracking-wider">Latest AI Insights</h4>
                      {isGeneratingReport ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="w-8 h-8 animate-spin text-[#ff4e00]" />
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                          {aiReport ? (
                            <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>') }} />
                          ) : (
                            <p className="text-gray-500 italic">Click generate to analyze current cohort data.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">User & Role Management</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage fellows, mentors, and administrators</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-black dark:hover:bg-gray-200 transition-colors">
                      <Plus className="w-4 h-4" /> Add User
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Last Active</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {loadingUsers ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                  {user.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                user.role === 'mentor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {user.role || 'fellow'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-current" /> Active
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">Just now</td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PLACEHOLDER FOR OTHER TABS */}
            {['cohorts', 'scoring', 'certifications', 'recommendations', 'calendar', 'leaderboard', 'audit', 'settings'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                  {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Settings, { className: "w-8 h-8" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    This module is currently under development. It will provide comprehensive controls and insights for this section of the platform.
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
