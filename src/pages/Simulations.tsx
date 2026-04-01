import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, AlertTriangle, ShieldAlert, Building2, Users, Play, CheckCircle2, Clock, BarChart3, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Simulations() {
  const { profile } = useAuth();
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const simulations = [
    {
      id: 'sim-1',
      title: 'Founding a Nation',
      category: 'Governance Systems',
      difficulty: 'Medium',
      duration: '120 mins',
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Create a constitution, governance structure, and economic model using GDP and population datasets.',
      completed: true,
      score: 92,
    },
    {
      id: 'sim-2',
      title: 'Budget War Room',
      category: 'Political Economy',
      difficulty: 'Hard',
      duration: '180 mins',
      icon: BarChart3,
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Allocate the national budget across competing ministries while navigating surprise fiscal shocks and inflation spikes.',
      completed: true,
      score: 88,
    },
    {
      id: 'sim-3',
      title: 'Constitution Drafting Assembly',
      category: 'Institutional Design',
      difficulty: 'Medium',
      duration: '150 mins',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Design judiciary independence, electoral systems, and checks and balances based on comparative constitutional models.',
      completed: false,
    },
    {
      id: 'sim-4',
      title: 'Financial Crisis War Room',
      category: 'Crisis Governance',
      difficulty: 'Extreme',
      duration: '120 mins',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      description: 'Manage a currency collapse, inflation spike, and capital flight. Draft an emergency stabilization plan.',
      completed: false,
    },
    {
      id: 'sim-5',
      title: 'Diplomatic Negotiation Table',
      category: 'Geopolitics',
      difficulty: 'Hard',
      duration: '150 mins',
      icon: ShieldAlert,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      description: 'Mediate a cross-border conflict using trade dependency maps and military capacity indices.',
      completed: false,
    },
    {
      id: 'sim-6',
      title: 'National Security War Room',
      category: 'Crisis Governance',
      difficulty: 'Extreme',
      duration: '180 mins',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      description: 'Respond to civil unrest escalation, intelligence ambiguity, and media misinformation in real-time.',
      completed: false,
    },
    {
      id: 'sim-7',
      title: 'Policy Lab Studio',
      category: 'Public Systems',
      difficulty: 'Medium',
      duration: '120 mins',
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Design a national reform program for education and healthcare systems using capacity models.',
      completed: false,
    },
    {
      id: 'sim-8',
      title: 'AI Governance Council',
      category: 'Technology Policy',
      difficulty: 'Hard',
      duration: '150 mins',
      icon: Cpu,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      description: 'Regulate national AI systems while balancing algorithm bias metrics and data privacy risk models.',
      completed: false,
    },
    {
      id: 'sim-9',
      title: 'African Union Policy Summit',
      category: 'Regional Integration',
      difficulty: 'Hard',
      duration: '180 mins',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Navigate post-colonial governance transitions and resource governance challenges in a regional summit.',
      completed: false,
    },
    {
      id: 'sim-10',
      title: 'Leadership Decision Audit Room',
      category: 'Case Analysis',
      difficulty: 'Medium',
      duration: '120 mins',
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      description: 'Reconstruct and analyze failed decisions from the 2008 financial crisis and COVID-19 governance failures.',
      completed: false,
    },
    {
      id: 'sim-11',
      title: 'Multilateral Trade Negotiation',
      category: 'Diplomacy',
      difficulty: 'Hard',
      duration: '150 mins',
      icon: BarChart3,
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Negotiate resource sharing agreements and sanctions using global trade flow data and tariff structures.',
      completed: false,
    },
    {
      id: 'sim-12',
      title: 'Final Integrated State Simulation',
      category: 'Capstone',
      difficulty: 'Extreme',
      duration: '240 mins',
      icon: ShieldAlert,
      color: 'text-red-600',
      bg: 'bg-red-50',
      description: 'Manage the economy, security, diplomacy, and policy system simultaneously amidst dynamic shocks.',
      completed: false,
    }
  ];

  const completedSims = simulations.filter(s => s.completed);
  const avgScore = completedSims.length > 0 
    ? Math.round(completedSims.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedSims.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-serif text-gray-900">Leadership Simulation Lab</h1>
          <p className="text-gray-500 mt-2">Test your decision-making skills in high-stakes, AI-driven scenarios.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Simulations Completed</p>
            <p className="text-2xl font-bold text-gray-900 font-serif">{completedSims.length} <span className="text-sm text-gray-400 font-sans">/ {simulations.length}</span></p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Avg. Score</p>
            <p className="text-2xl font-bold text-green-600 font-serif">{avgScore}%</p>
          </div>
        </div>
      </div>

      {!activeSimulation ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {simulations.map((sim) => (
            <div key={sim.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer" onClick={() => setActiveSimulation(sim.id)}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${sim.bg} ${sim.color}`}>
                    <sim.icon className="w-7 h-7" />
                  </div>
                  {sim.completed ? (
                    <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Score: {sim.score}%
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-bold text-sm">
                      <Clock className="w-4 h-4" /> {sim.duration}
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold font-serif text-gray-900 mb-2">{sim.title}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{sim.category}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className={`text-sm font-bold ${
                    sim.difficulty === 'Hard' ? 'text-red-500' : 'text-yellow-500'
                  }`}>{sim.difficulty}</span>
                </div>
                <p className="text-gray-600 mb-8">{sim.description}</p>
                
                <button className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
                  sim.completed 
                    ? 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100' 
                    : 'bg-[#ff4e00] text-white hover:bg-[#e64600] shadow-lg shadow-[#ff4e00]/20'
                }`}>
                  {sim.completed ? 'Review Feedback' : 'Start Simulation'} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveSimulation(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <div>
                <h2 className="text-xl font-bold font-serif">{simulations.find(s => s.id === activeSimulation)?.title}</h2>
                <p className="text-sm text-gray-400">Simulation in progress...</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full font-bold text-sm border border-red-500/30">
              <Clock className="w-4 h-4" /> 44:59 remaining
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900">Situation Update: Day 1, 08:00 AM</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Minister, we have a critical situation. The Rand has devalued 18% overnight following a massive investor withdrawal. Inflation is spiking, and early reports indicate public unrest is rising in major urban centers. The President needs your immediate recommendation to stabilize the economy.
                </p>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-sm font-bold text-gray-900 mb-2">Key Data Points:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Currency Devaluation: 18% (24hr)</li>
                    <li>Inflation Spike: Projected +4.5% this month</li>
                    <li>Foreign Capital Flight: $2.4B withdrawn</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Your Action:</h4>
                <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00]">A. Raise Interest Rates Aggressively</p>
                  <p className="text-sm text-gray-500 mt-1">Defend the currency and curb inflation, but risk triggering a severe recession and higher unemployment.</p>
                </button>
                <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00]">B. Request IMF Intervention</p>
                  <p className="text-sm text-gray-500 mt-1">Secure emergency stabilization funds, but accept strict austerity measures and political backlash.</p>
                </button>
                <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00]">C. Implement Capital Control Policies</p>
                  <p className="text-sm text-gray-500 mt-1">Halt the immediate outflow of foreign capital, but severely damage long-term investor confidence.</p>
                </button>
                <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00]">D. Announce Emergency Stimulus Package</p>
                  <p className="text-sm text-gray-500 mt-1">Calm public unrest and support local businesses, but risk hyperinflation and further currency collapse.</p>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gray-400" /> Current Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Market Confidence</span>
                      <span className="font-bold text-red-600">22%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[22%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Political Stability</span>
                      <span className="font-bold text-yellow-600">55%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-[55%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Public Sentiment</span>
                      <span className="font-bold text-orange-600">40%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[40%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Cpu className="w-5 h-5" /> AI Sovereign Advisor</h3>
                <p className="text-sm text-blue-800 italic">
                  "Minister, historical data from similar emerging market shocks suggests that capital controls (Option C) provide immediate relief but take years to recover from. An aggressive rate hike (Option A) is the standard orthodox response, though it will hurt the working class immediately."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
