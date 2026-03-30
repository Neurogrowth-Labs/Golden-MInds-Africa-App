import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Sparkles, TrendingUp, Award, Loader2, Trophy, Medal, Star, MessageCircle, BookOpen, Upload, CheckCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [nextSession, setNextSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyHubs, setNearbyHubs] = useState('');
  const [findingHubs, setFindingHubs] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const sessionsRef = collection(db, 'sessions');
        const q = query(sessionsRef, where('date', '>=', new Date().toISOString().split('T')[0]), orderBy('date', 'asc'), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          setNextSession({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        } else {
          setNextSession({
            title: "W1A: Leadership in the Modern World (Theory)",
            date: new Date().toISOString(),
            startTime: "14:00",
            endTime: "16:00",
            type: "lecture",
            location: { lat: -1.2921, lng: 36.8219 }
          });
        }

        // Fetch Leaderboard
        const usersRef = collection(db, 'users');
        const leaderboardQuery = query(usersRef, orderBy('participationScore', 'desc'), limit(5));
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const leaderboardData = leaderboardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const earnedBadges = [
    { id: 'pioneer', name: 'Pioneer', description: 'Joined the platform', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', earned: true },
    { id: 'attendance', name: 'Consistent', description: '3+ day streak', icon: Calendar, color: 'text-green-600', bg: 'bg-green-50', earned: (profile?.attendanceStreak || 0) >= 3 },
    { id: 'debater', name: 'Top Debater', description: 'Score > 50', icon: MessageCircle, color: 'text-[#ff4e00]', bg: 'bg-orange-50', earned: (profile?.participationScore || 0) >= 50 },
    { id: 'contributor', name: 'Contributor', description: 'Score > 20', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', earned: (profile?.participationScore || 0) >= 20 },
  ].filter(b => b.earned);

  const findNearbyHubs = async () => {
    setFindingHubs(true);
    try {
      if (!navigator.geolocation) throw new Error("Geolocation not supported");
      
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Find good cafes, libraries, or co-working spaces nearby where I can study for my fellowship.",
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: { latitude, longitude }
              }
            }
          }
        });
        
        setNearbyHubs(response.text || "No hubs found nearby.");
        setFindingHubs(false);
      }, () => {
        setNearbyHubs("Please enable location services to find nearby study hubs.");
        setFindingHubs(false);
      });
    } catch (error) {
      console.error("Error finding hubs:", error);
      setNearbyHubs("Failed to find nearby hubs.");
      setFindingHubs(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2">
            Welcome back, {profile?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-600">Here's your fellowship overview for today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Fellowship Active</span>
        </div>
      </div>

      {/* Quick Actions (shadcn/ui) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-lg border-gray-100">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <Calendar size={32} className="text-[#ff4e00]" />
            <h2 className="text-xl font-semibold">View Schedule</h2>
            <Button onClick={() => navigate('/schedule')} className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl">Open</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-gray-100">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <Upload size={32} className="text-[#5A5A40]" />
            <h2 className="text-xl font-semibold">Submit Assignment</h2>
            <Button onClick={() => navigate('/assignments')} className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl">Upload</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-gray-100">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <CheckCircle size={32} className="text-green-600" />
            <h2 className="text-xl font-semibold">Mark Attendance</h2>
            <Button onClick={() => navigate('/attendance')} className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl">Check In</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Session Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ff4e00]/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#ff8c00] font-medium mb-4 text-sm uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Up Next</span>
              </div>
              
              <h2 className="text-3xl font-bold font-serif mb-4">
                {nextSession?.title || "Loading..."}
              </h2>
              
              <div className="flex flex-wrap gap-6 text-gray-300 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{nextSession?.startTime} - {nextSession?.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="capitalize">{nextSession?.type} Room</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Insights & Maps Grounding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-[#ff4e00]" />
                <h3 className="text-xl font-bold font-serif">AI Leadership Copilot</h3>
              </div>
              <div className="bg-[#f5f5f0] rounded-2xl p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed text-sm mb-4">
                  Based on your recent participation in the "Policy & Tech" debate, you showed strong analytical skills. Consider reviewing the upcoming material on "Digital Infrastructure" to prepare for tomorrow's session.
                </p>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">AI Future Pathway Predictor</p>
                  <p className="text-sm font-medium text-[#5A5A40]">
                    "Based on your engagement in policy debates and research contributions, you are well suited for governance and public leadership roles."
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="text-xl font-bold font-serif">Study Hubs</h3>
              </div>
              
              <div className="flex-1 bg-[#f5f5f0] rounded-2xl p-6 border border-gray-200 overflow-y-auto">
                {findingHubs ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    <span className="text-sm">Locating hubs...</span>
                  </div>
                ) : nearbyHubs ? (
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: nearbyHubs.replace(/\n/g, '<br/>') }} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-sm text-gray-500 mb-4">Find nearby cafes or co-working spaces to study.</p>
                    <button 
                      onClick={findNearbyHubs}
                      className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                    >
                      Find Nearby
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Personal Impact Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#ff4e00]" />
                <h3 className="text-xl font-bold font-serif">Personal Impact Dashboard</h3>
              </div>
              <button className="text-sm text-[#ff4e00] font-bold hover:underline">View Full Report</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Attendance</p>
                <p className="text-2xl font-bold text-gray-900 font-serif">95%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Debate Score</p>
                <p className="text-2xl font-bold text-gray-900 font-serif">88</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Collab Score</p>
                <p className="text-2xl font-bold text-gray-900 font-serif">92</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Leadership</p>
                <p className="text-2xl font-bold text-gray-900 font-serif">Top 10%</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">AI Performance Insight</p>
                <p className="text-sm text-blue-800">"Your debate engagement increased 40% this month. You collaborate most effectively with fellows in policy discussions."</p>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-bold font-serif">Top Fellows</h3>
              </div>
              <span className="text-sm text-gray-500 font-medium">Global Leaderboard</span>
            </div>
            
            <div className="space-y-4">
              {leaderboard.map((user, index) => (
                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} key={user.id} className="flex items-center justify-between p-4 bg-[#f5f5f0] rounded-2xl border border-gray-200 transition-colors hover:bg-white">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-white text-gray-500 border border-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white font-medium">
                            {user.name?.charAt(0) || 'F'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role || 'Fellow'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-lg">{user.participationScore || 0}</span>
                  </div>
                </motion.div>
              ))}
              {leaderboard.length === 0 && !loading && (
                <p className="text-center text-gray-500 py-4">No data available yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-orange-50 text-[#ff4e00] rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold mb-1">{profile?.participationScore || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Score</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold mb-1">{profile?.attendanceStreak || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Streak</span>
            </motion.div>
          </div>

          {/* My Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">My Badges</h3>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {earnedBadges.length} Earned
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {earnedBadges.map(badge => (
                <div key={badge.id} className={`${badge.bg} rounded-2xl p-4 flex flex-col items-center text-center border border-white/50 shadow-sm`}>
                  <badge.icon className={`w-8 h-8 ${badge.color} mb-2`} />
                  <span className="text-sm font-bold text-gray-900 leading-tight mb-1">{badge.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{badge.description}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Previews based on user request */}
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Your Schedule</h2>
              <div className="space-y-3">
                <div className="p-3 border border-gray-100 bg-gray-50 rounded-xl text-sm font-medium">W1A: Leadership in the Modern World - 14:00 GMT</div>
                <div className="p-3 border border-gray-100 bg-gray-50 rounded-xl text-sm font-medium">W1B: Leadership Practice - 14:00 GMT</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Submit Assignment</h2>
              <div className="flex flex-col gap-3">
                <input type="file" className="border border-gray-200 bg-gray-50 p-2 text-sm rounded-lg w-full" />
                <Button className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl">Submit</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Attendance</h2>
              <div className="flex flex-col gap-3">
                <Button className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl">Check In Now</Button>
                <p className="text-sm text-gray-500 font-medium text-center">Attendance Rate: 85%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
