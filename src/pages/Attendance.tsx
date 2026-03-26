import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { MapPin, CheckCircle2, AlertCircle, Fingerprint } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function Attendance() {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<'idle' | 'locating' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  useEffect(() => {
    // Check if already attended today
    const checkAttendance = async () => {
      if (!user) return;
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const q = query(
          collection(db, 'attendance'),
          where('userId', '==', user.uid),
          where('timestamp', '>=', today.toISOString())
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setTodayAttendance(snapshot.docs[0].data());
          setStatus('success');
        }
      } catch (error) {
        console.error("Error checking attendance:", error);
      }
    };
    checkAttendance();
  }, [user]);

  const handleSignPresence = () => {
    setStatus('locating');
    
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser');
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus('verifying');
        try {
          // In a real app, we would verify the coordinates against the session location
          const { latitude, longitude } = position.coords;
          
          // Write to Firestore
          const attendanceData = {
            sessionId: 'current-session-id', // Mocked for now
            userId: user?.uid,
            timestamp: new Date().toISOString(),
            status: 'present',
            geoVerified: true,
            location: { lat: latitude, lng: longitude }
          };

          await addDoc(collection(db, 'attendance'), attendanceData);
          setTodayAttendance(attendanceData);
          setStatus('success');
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'attendance');
          setErrorMessage('Failed to record attendance. Please try again.');
          setStatus('error');
        }
      },
      (error) => {
        setErrorMessage('Unable to retrieve your location. Please enable location services.');
        setStatus('error');
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif mb-2">Smart Attendance</h1>
        <p className="text-gray-600">Geo-verified presence signing for today's session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Action Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] text-center"
        >
          {status === 'idle' && (
            <>
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Fingerprint className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign Presence</h2>
              <p className="text-gray-500 mb-8 max-w-xs">
                Ensure you are within the venue. We will verify your location.
              </p>
              <button 
                onClick={handleSignPresence}
                className="w-full max-w-xs py-4 px-6 bg-[#1a1a1a] text-white rounded-2xl font-bold text-lg hover:bg-black transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-3"
              >
                <MapPin className="w-5 h-5" />
                Mark Attendance
              </button>
            </>
          )}

          {status === 'locating' && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 border-4 border-gray-100 border-t-[#ff4e00] rounded-full animate-spin mb-6" />
              <h2 className="text-xl font-bold">Acquiring Location...</h2>
            </div>
          )}

          {status === 'verifying' && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 border-4 border-gray-100 border-t-[#5A5A40] rounded-full animate-spin mb-6" />
              <h2 className="text-xl font-bold">Verifying Coordinates...</h2>
            </div>
          )}

          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Attendance Recorded</h2>
              <p className="text-gray-500">
                You have successfully signed in for today's session.
              </p>
              <div className="mt-8 p-4 bg-gray-50 rounded-xl w-full text-left">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-1">Timestamp</p>
                <p className="font-mono text-gray-900">
                  {todayAttendance?.timestamp ? new Date(todayAttendance.timestamp).toLocaleString() : new Date().toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
                <AlertCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
              <p className="text-gray-500 mb-8 max-w-xs">{errorMessage}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="py-3 px-6 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </motion.div>

        {/* Stats & Info */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#5A5A40] text-white rounded-3xl p-8 shadow-sm"
          >
            <h3 className="text-xl font-bold font-serif mb-6">Your Streak</h3>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-6xl font-bold">{profile?.attendanceStreak || 0}</span>
              <span className="text-lg text-white/70 pb-2">days</span>
            </div>
            <p className="text-white/80 text-sm">
              You are in the top 20% of your cohort for attendance consistency. Keep it up!
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            <h3 className="font-bold mb-4">Recent History</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">Session {10 - i}</p>
                    <p className="text-sm text-gray-500">Oct {25 - i}, 2023</p>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider rounded-full">
                    Present
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
