import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, AlertTriangle, ShieldAlert, Building2, Users, Play, CheckCircle2, Clock, BarChart3, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Simulations() {
  const { profile } = useAuth();
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const simulations = [
    {
      id: 'crisis-1',
      title: 'National Health Crisis',
      category: 'Crisis Management',
      difficulty: 'Hard',
      duration: '45 mins',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      description: 'A sudden outbreak threatens the capital. You are the Minister of Health. Balance public safety, economic impact, and international relations.',
      completed: false,
    },
    {
      id: 'policy-1',
      title: 'Tech Infrastructure Bill',
      category: 'Policy Negotiation',
      difficulty: 'Medium',
      duration: '30 mins',
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Negotiate a controversial bill to expand digital infrastructure while protecting data privacy against lobbying groups.',
      completed: true,
      score: 85,
    },
    {
      id: 'governance-1',
      title: 'Navigating Chinese FDI',
      category: 'Global Systems',
      difficulty: 'Hard',
      duration: '60 mins',
      icon: BarChart3,
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Negotiate a major infrastructure deal with Chinese investors. Balance the need for development with concerns over debt and neo-colonialism.',
      completed: false,
    },
    {
      id: 'community-1',
      title: 'Resource Allocation Dispute',
      category: 'Community Leadership',
      difficulty: 'Medium',
      duration: '40 mins',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Mediate a conflict between two communities over water rights and agricultural subsidies.',
      completed: false,
    }
  ];

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
            <p className="text-2xl font-bold text-gray-900 font-serif">1 <span className="text-sm text-gray-400 font-sans">/ 4</span></p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Avg. Score</p>
            <p className="text-2xl font-bold text-green-600 font-serif">85%</p>
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
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900">Situation Update: Day 1, 08:00 AM</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Minister, we have confirmed 50 cases of the unknown pathogen in the central district. Hospitals are reporting a surge in respiratory distress. The media has caught wind of the situation, and panic is beginning to spread. The President is expecting your recommendation in 10 minutes.
                </p>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-sm font-bold text-gray-900 mb-2">Key Data Points:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>R0 estimated at 2.5 (highly contagious)</li>
                    <li>Central district population: 2.5 million</li>
                    <li>Current hospital capacity: 85% full</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Your Action:</h4>
                <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00]">A. Immediate Lockdown of Central District</p>
                  <p className="text-sm text-gray-500 mt-1">Contain the spread immediately, but risk severe economic disruption and public backlash.</p>
                </button>
                <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00]">B. Issue Public Warning & Increase Hospital Funding</p>
                  <p className="text-sm text-gray-500 mt-1">Maintain economic activity while preparing medical infrastructure, but risk wider spread.</p>
                </button>
                <button className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00]">C. Request International Assistance Quietly</p>
                  <p className="text-sm text-gray-500 mt-1">Seek expert help without causing panic, but delay immediate local action.</p>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gray-400" /> Current Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Public Trust</span>
                      <span className="font-bold text-green-600">80%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[80%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Economic Stability</span>
                      <span className="font-bold text-yellow-600">65%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-[65%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Containment</span>
                      <span className="font-bold text-red-600">30%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[30%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Cpu className="w-5 h-5" /> AI Advisor</h3>
                <p className="text-sm text-blue-800 italic">
                  "Minister, historical data suggests that early containment is crucial for unknown pathogens, despite the immediate economic cost. However, a lockdown without clear communication will severely damage public trust."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
