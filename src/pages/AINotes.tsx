import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Play, Loader2, FileText, Sparkles } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AINotes() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const startRecording = async () => {
    setIsConnecting(true);
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          },
          systemInstruction: "You are an AI note-taking assistant for the Golden Minds Africa Fellowship. Listen to the user's lecture or thoughts, provide brief encouraging audio feedback, and output a structured text summary of what they said.",
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsRecording(true);
            
            processorRef.current!.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
              }
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768.0;
              }
              playbackQueueRef.current.push(float32);
              playNextAudio();
            }

            // Handle transcription
            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              setSummary(prev => prev + message.serverContent!.modelTurn!.parts[0]!.text);
            }
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            stopRecording();
          },
          onclose: () => {
            stopRecording();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Error starting recording:", error);
      setIsConnecting(false);
    }
  };

  const playNextAudio = () => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0 || !audioContextRef.current) return;
    
    isPlayingRef.current = true;
    const audioData = playbackQueueRef.current.shift()!;
    const audioBuffer = audioContextRef.current.createBuffer(1, audioData.length, 24000);
    audioBuffer.getChannelData(0).set(audioData);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      playNextAudio();
    };
    source.start();
  };

  const stopRecording = async () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (sessionRef.current) {
      const session = await sessionRef.current;
      session.close();
      sessionRef.current = null;
    }
    setIsRecording(false);
    setIsConnecting(false);
  };

  const saveNote = async () => {
    if (!user || !summary) return;
    try {
      await addDoc(collection(db, 'ai_notes'), {
        userId: user.uid,
        sessionId: 'live-session',
        content: summary,
        summary: summary,
        tags: ['live-note'],
        createdAt: new Date().toISOString()
      });
      alert('Note saved successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ai_notes');
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col p-4 md:p-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">AI Notes & Knowledge</h1>
        <p className="text-gray-600 text-sm sm:text-base">Real-time transcription and AI summarization.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recording Controls */}
        <div className="bg-[#151619] text-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff4e00] to-transparent opacity-50" />
          
          <div className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full border-2 flex items-center justify-center mb-6 sm:mb-8 transition-all duration-500 ${
            isRecording ? 'border-[#ff4e00] shadow-[0_0_40px_rgba(255,78,0,0.3)]' : 'border-gray-800'
          }`}>
            <div className={`w-24 h-24 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
              isRecording ? 'bg-[#ff4e00]/20' : 'bg-gray-800/50'
            }`}>
              {isConnecting ? (
                <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-[#ff4e00]" />
              ) : isRecording ? (
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: ['20%', '80%', '20%'] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1.5 sm:w-2 bg-[#ff4e00] rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <Mic className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
              )}
            </div>
          </div>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isConnecting}
            className={`py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-2 sm:gap-3 transition-all w-full sm:w-auto justify-center ${
              isRecording 
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-[#ff4e00] text-white hover:bg-[#e64600]'
            } disabled:opacity-50`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                Stop Recording
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                Start AI Assistant
              </>
            )}
          </button>
          
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 text-center max-w-xs">
            Speak naturally. The AI will transcribe your thoughts and provide a structured summary.
          </p>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-[#5A5A40]">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-xl sm:text-2xl font-bold font-serif">Live Summary</h2>
            </div>
            {summary && (
              <button 
                onClick={saveNote}
                className="px-4 py-2 bg-[#f5f5f0] text-gray-900 rounded-xl font-medium hover:bg-[#e5e5e0] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <FileText className="w-4 h-4" />
                Save Note
              </button>
            )}
          </div>

          <div className="flex-1 bg-[#f5f5f0] rounded-2xl p-4 sm:p-6 overflow-y-auto border border-gray-200">
            {summary ? (
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-wrap">
                {summary}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Your AI-generated summary will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
