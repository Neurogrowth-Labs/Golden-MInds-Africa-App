import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Video, Users, Clock, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROOMS = [
  {
    id: 'alpha',
    name: 'Room Alpha',
    topic: 'Policy & Tech Ecosystems',
    facilitator: 'Dr. Amina Mensah',
    participants: 42,
    maxCapacity: 50,
    status: 'live',
    color: 'bg-[#ff4e00]',
    textColor: 'text-[#ff4e00]'
  },
  {
    id: 'beta',
    name: 'Room Beta',
    topic: 'Sustainable Infrastructure',
    facilitator: 'Prof. David Osei',
    participants: 28,
    maxCapacity: 50,
    status: 'live',
    color: 'bg-[#5A5A40]',
    textColor: 'text-[#5A5A40]'
  },
  {
    id: 'gamma',
    name: 'Room Gamma',
    topic: 'Open Forum & Networking',
    facilitator: 'Sarah Kiptoo',
    participants: 15,
    maxCapacity: 50,
    status: 'waiting',
    color: 'bg-blue-600',
    textColor: 'text-blue-600'
  }
];

export default function VirtualRooms() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleJoin = (roomId: string) => {
    setSelectedRoom(roomId);
    setAccessCode('');
    setError('');
  };

  const handleVerify = () => {
    if (!accessCode.trim()) {
      setError('Please enter your fellowship access code.');
      return;
    }
    
    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      if (accessCode.toUpperCase() === 'GMAF2026') {
        navigate(`/rooms/${selectedRoom}`);
      } else {
        setError('Invalid access code. Please try again.');
        setIsVerifying(false);
      }
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif mb-2">Virtual Lecture Rooms</h1>
        <p className="text-gray-600">Join live, AI-powered sessions with real-time translation and transcription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ROOMS.map((room) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden"
          >
            {room.status === 'live' && (
              <div className="absolute top-0 right-0 mt-6 mr-6 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Live</span>
              </div>
            )}

            <div className={`w-12 h-12 rounded-2xl ${room.color} text-white flex items-center justify-center mb-6`}>
              <Video className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-bold font-serif mb-1">{room.name}</h2>
            <p className="text-gray-600 font-medium mb-4">{room.topic}</p>

            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{room.participants} / {room.maxCapacity} Fellows</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Facilitator: {room.facilitator}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Unlimited Duration</span>
              </div>
            </div>

            <button
              onClick={() => handleJoin(room.id)}
              className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                room.status === 'live' 
                  ? 'bg-[#1a1a1a] text-white hover:bg-black' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {room.status === 'live' ? 'Join Session' : 'Enter Waiting Room'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Access Code Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden text-white">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/20">
                  <Lock className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-center mb-2">Fellowship Authentication</h3>
                <p className="text-white/60 text-center mb-8 text-sm">
                  Please enter your unique fellowship access code to join {ROOMS.find(r => r.id === selectedRoom)?.name}.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">Access Code</label>
                    <Input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="e.g., GMAF2026"
                      className="w-full px-4 py-6 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-center font-mono text-lg uppercase tracking-widest"
                      onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRoom(null)}
                      className="flex-1 py-6 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl font-bold transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="flex-1 py-6 bg-white/20 text-white border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify & Join'}
                    </Button>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-xs text-white/40">Hint: Use code GMAF2026</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
