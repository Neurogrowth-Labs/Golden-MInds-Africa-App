import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Upload, CheckCircle2, Clock, Award, PlayCircle, Mic, Link as LinkIcon, Sparkles, AlertCircle, Save, ChevronRight, MessageSquare, BrainCircuit, X, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Assignments() {
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'reviewed'>('pending');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'points'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [content, setContent] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New state for submission features
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [linkInputType, setLinkInputType] = useState<'video' | 'url' | null>(null);
  const [linkValue, setLinkValue] = useState('');
  const [attachedLinks, setAttachedLinks] = useState<{type: string, url: string}[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioNote, setAudioNote] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setAudioNote(new Blob()); // Mock audio note
    } else {
      setRecordingTime(0);
      setIsRecording(true);
    }
  };

  const handleAddLink = () => {
    if (linkValue.trim() && linkInputType) {
      setAttachedLinks([...attachedLinks, { type: linkInputType, url: linkValue.trim() }]);
      setLinkValue('');
      setLinkInputType(null);
    }
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let prefix = '';
    let suffix = '';
    
    if (format === 'bold') {
      prefix = '**';
      suffix = '**';
    } else if (format === 'italic') {
      prefix = '*';
      suffix = '*';
    } else if (format === 'underline') {
      prefix = '__';
      suffix = '__';
    }
    
    const newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newContent);
    
    // Restore focus and cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const assignments = [
    { id: 1, title: 'Policy Brief: Digital Infrastructure', status: 'pending', due: 'Tonight, 23:59 GMT', dueDate: new Date(Date.now() + 8 * 3600000).toISOString(), type: 'Document', points: 100 },
    { id: 2, title: 'Leadership Reflection Video', status: 'submitted', due: 'Submitted 2 days ago', dueDate: new Date(Date.now() - 48 * 3600000).toISOString(), type: 'Video', points: 50 },
    { id: 3, title: 'Pan-African Trade Analysis', status: 'reviewed', due: 'Graded', dueDate: new Date(Date.now() - 100 * 3600000).toISOString(), type: 'Document', points: 100, score: 92 },
    { id: 4, title: 'Startup Pitch Deck', status: 'pending', due: 'Tomorrow, 12:00 GMT', dueDate: new Date(Date.now() + 24 * 3600000).toISOString(), type: 'Presentation', points: 150 },
  ];

  const sortedAssignments = [...assignments]
    .filter(a => a.status === activeTab)
    .sort((a, b) => {
      if (sortBy === 'points') {
        return sortOrder === 'asc' ? a.points - b.points : b.points - a.points;
      } else {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

  const handleAIFeedback = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    try {
      const selectedAssignmentData = selectedAssignment;
      
      let prompt = `Act as a strict but encouraging mentor for an African leadership fellowship. 
        Review the following assignment draft. Provide instant feedback on 3 areas: 
        1. Clarity 2. Argument Strength 3. African Context Relevance. 
        Keep it concise, bulleted, and actionable.
        
        Draft: "${content}"`;

      if (selectedAssignmentData?.type === 'Presentation') {
        prompt = `Act as a professional pitch coach for an African leadership fellowship.
        Review the following presentation draft. Provide "Presentation Intelligence" feedback on: 
        1. Slide Clarity 2. Storytelling 3. Argument Strength 4. Visual Design. 
        Keep it concise, bulleted, and actionable.
        
        Draft: "${content}"`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiFeedback(response.text || 'Feedback generation failed.');
    } catch (error) {
      console.error('Error generating feedback:', error);
      setAiFeedback('Unable to connect to AI Assistant.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2 text-[#022c22]">Showcase Your Brilliance</h1>
          <p className="text-gray-600">Submit, review, and build your leadership portfolio.</p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#d4af37] to-yellow-500 text-white px-5 py-2.5 rounded-full shadow-md">
          <Award className="w-4 h-4" />
          <span className="text-sm font-bold tracking-wide">Portfolio Builder Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assignment List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tabs */}
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
            {['pending', 'submitted', 'reviewed'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab as any); setSelectedAssignment(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                  activeTab === tab ? 'bg-[#022c22] text-[#d4af37] shadow-md' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List Controls */}
          <div className="flex justify-between items-center px-2">
            <span className="text-sm font-bold text-gray-500">{sortedAssignments.length} Assignments</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm bg-transparent border-none text-gray-700 font-bold focus:ring-0 cursor-pointer p-0"
              >
                <option value="dueDate">Due Date</option>
                <option value="points">Points</option>
              </select>
              <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {sortedAssignments.map((assignment, i) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedAssignment(assignment)}
                className={`bg-white rounded-3xl p-5 shadow-sm border cursor-pointer transition-all ${
                  selectedAssignment?.id === assignment.id ? 'border-[#022c22] ring-2 ring-[#022c22]/20' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-xl ${
                    assignment.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                    assignment.status === 'submitted' ? 'bg-blue-50 text-blue-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    {assignment.status === 'pending' && <Clock className="w-5 h-5" />}
                    {assignment.status === 'submitted' && <CheckCircle2 className="w-5 h-5" />}
                    {assignment.status === 'reviewed' && <Award className="w-5 h-5" />}
                  </div>
                  {assignment.score && (
                    <span className="font-bold text-lg text-[#022c22]">{assignment.score}%</span>
                  )}
                </div>
                <h3 className="font-bold font-serif text-gray-900 mb-1 line-clamp-2">{assignment.title}</h3>
                <p className="text-xs text-gray-500 font-medium mb-3">{assignment.due}</p>
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span>{assignment.type}</span>
                  <span>{assignment.points} PTS</span>
                </div>
              </motion.div>
            ))}
            {sortedAssignments.length === 0 && (
              <div className="text-center p-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No {activeTab} assignments.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editor / Details */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedAssignment ? (
              <motion.div
                key={selectedAssignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[600px]"
              >
                {/* Editor Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">
                    {selectedAssignment.type} Submission
                  </div>
                  <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">{selectedAssignment.title}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Due: {selectedAssignment.due}
                  </p>
                </div>

                {selectedAssignment.status === 'pending' ? (
                  <div className="flex-1 flex flex-col p-6">
                    {/* Multi-Format Upload Area */}
                    <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAttachedFile(e.target.files[0]);
                          }
                        }}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${attachedFile ? 'bg-[#022c22] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                        <Upload className="w-4 h-4" /> {attachedFile ? attachedFile.name : 'Upload PDF/DOCX'}
                      </button>
                      <button 
                        onClick={() => setLinkInputType(linkInputType === 'video' ? null : 'video')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${linkInputType === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                        <PlayCircle className="w-4 h-4" /> Video Link
                      </button>
                      <button 
                        onClick={toggleRecording}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : audioNote ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                        <Mic className="w-4 h-4" /> {isRecording ? `Recording... ${formatTime(recordingTime)}` : audioNote ? 'Audio Note Attached' : 'Audio Note'}
                      </button>
                      <button 
                        onClick={() => setLinkInputType(linkInputType === 'url' ? null : 'url')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${linkInputType === 'url' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                        <LinkIcon className="w-4 h-4" /> External URL
                      </button>
                    </div>

                    {/* Link Input Area */}
                    <AnimatePresence>
                      {linkInputType && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 flex gap-2"
                        >
                          <input 
                            type="text" 
                            value={linkValue}
                            onChange={(e) => setLinkValue(e.target.value)}
                            placeholder={`Paste your ${linkInputType === 'video' ? 'video' : 'external'} link here...`}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022c22]"
                          />
                          <button 
                            onClick={handleAddLink}
                            disabled={!linkValue.trim()}
                            className="px-4 py-2 bg-[#022c22] text-white rounded-xl font-bold disabled:opacity-50"
                          >
                            Add
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Attached Links Display */}
                    {attachedLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {attachedLinks.map((link, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                            {link.type === 'video' ? <PlayCircle className="w-4 h-4 text-blue-500" /> : <LinkIcon className="w-4 h-4 text-purple-500" />}
                            <span className="text-gray-600 truncate max-w-[200px]">{link.url}</span>
                            <button onClick={() => setAttachedLinks(attachedLinks.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Smart Editor */}
                    <div className="flex-1 border border-gray-200 rounded-2xl overflow-hidden flex flex-col focus-within:border-[#022c22] focus-within:ring-1 focus-within:ring-[#022c22] transition-all">
                      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center justify-between">
                        <div className="flex gap-1">
                          <button onClick={() => applyFormatting('bold')} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 font-bold">B</button>
                          <button onClick={() => applyFormatting('italic')} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 italic font-serif">I</button>
                          <button onClick={() => applyFormatting('underline')} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 underline">U</button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium px-2">
                          <Save className="w-3 h-3" /> Auto-saved
                        </div>
                      </div>
                      <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing your assignment here, or paste a link above..."
                        className="flex-1 w-full p-4 resize-none outline-none text-gray-700 leading-relaxed"
                      />
                    </div>

                    {/* AI Feedback Section */}
                    <div className="mt-6 space-y-4">
                      {aiFeedback && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                            <Sparkles className="w-5 h-5" /> AI Feedback Preview
                          </div>
                          <div className="prose prose-sm prose-emerald max-w-none text-emerald-900">
                            <div dangerouslySetInnerHTML={{ __html: aiFeedback.replace(/\n/g, '<br/>') }} />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={handleAIFeedback}
                          disabled={isAnalyzing || !content.trim()}
                          className="flex-1 py-3.5 bg-[#022c22] hover:bg-[#064e3b] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAnalyzing ? <Sparkles className="w-5 h-5 animate-pulse" /> : <BrainCircuit className="w-5 h-5" />}
                          {isAnalyzing ? 'Analyzing Draft...' : 'Get AI Feedback'}
                        </button>
                        <button className="flex-1 py-3.5 bg-[#d4af37] hover:bg-yellow-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20">
                          <Upload className="w-5 h-5" /> Submit Final
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                    {selectedAssignment.status === 'reviewed' ? (
                      <>
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100">
                          <span className="text-4xl font-bold text-green-600">{selectedAssignment.score}%</span>
                        </div>
                        <h3 className="text-2xl font-bold font-serif mb-2">Excellent Work!</h3>
                        <p className="text-gray-500 max-w-md mb-8">
                          Your assignment has been graded. It has been automatically added to your Public Leadership Portfolio.
                        </p>
                        <div className="w-full max-w-md bg-gray-50 rounded-2xl p-6 text-left border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-900 font-bold mb-3">
                            <MessageSquare className="w-5 h-5 text-[#d4af37]" /> Mentor Feedback
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed italic">
                            "Brilliant analysis of the digital infrastructure landscape. Your points on rural connectivity were particularly insightful and well-researched. Keep up the great critical thinking."
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle2 className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold font-serif mb-2">Successfully Submitted</h3>
                        <p className="text-gray-500 max-w-md">
                          Your assignment is currently under review by the facilitation team. You will be notified once grading is complete.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center h-full min-h-[600px] text-gray-400 p-8 text-center"
              >
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-bold font-serif text-gray-500 mb-2">Select an Assignment</h3>
                <p className="max-w-xs">Choose an assignment from the list to view details, draft your response, or see mentor feedback.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
