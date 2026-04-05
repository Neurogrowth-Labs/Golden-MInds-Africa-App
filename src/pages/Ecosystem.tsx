import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Mic, Video, Users, MessageSquare, Plus, Search, Filter, ThumbsUp, MessageCircle, Share2, Swords, PlayCircle, FileText, Radio, Users2, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

type ContentType = 'article' | 'podcast' | 'video' | 'debate' | 'community_post';

export default function Ecosystem() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [isComposing, setIsComposing] = useState(false);
  const [composeType, setComposeType] = useState<ContentType>('article');
  const [searchQuery, setSearchQuery] = useState('');
  const [feed, setFeed] = useState<any[]>([]);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedDebate, setSelectedDebate] = useState<any>(null);

  // New states for Communities
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', rules: '', invites: '' });
  const [communities, setCommunities] = useState<any[]>([]);
  const [activeCommunityChat, setActiveCommunityChat] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // New states for Debates
  const [showCreateDebate, setShowCreateDebate] = useState(false);
  const [newDebate, setNewDebate] = useState({ topic: '', date: '' });
  const [debateRooms, setDebateRooms] = useState<any[]>([]);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [aiSuggestedArguments, setAiSuggestedArguments] = useState<{pro: string[], con: string[]} | null>(null);

  // New state for Media Upload
  const [mediaFileUrl, setMediaFileUrl] = useState<string | null>(null);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeTags, setComposeTags] = useState('');

  // New states for Feed Filtering and AI Summaries
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [articleSummaries, setArticleSummaries] = useState<Record<number, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<number, boolean>>({});

  const MOCK_DEBATE_ROOMS = [
    { id: 1, topic: 'Universal Basic Income in Africa', status: 'live', proTeam: ['Amina M.'], conTeam: ['Kwame O.'], aiScore: { pro: 85, con: 82 } },
    { id: 2, topic: 'AI Regulation vs Innovation', status: 'upcoming', proTeam: [], conTeam: [], aiScore: null },
    { id: 3, topic: 'Data Sovereignty Laws', status: 'completed', proTeam: ['Sarah N.'], conTeam: ['Lusima D.'], aiScore: { pro: 92, con: 88 } },
  ];

  const MOCK_COMMUNITIES = [
    { id: 1, name: 'Policy Innovators', members: 145, description: 'Discussing public policy and governance.', rules: 'Be respectful.' },
    { id: 2, name: 'AgriTech Frontier', members: 89, description: 'Innovations in agriculture and food security.', rules: 'Share relevant research.' },
    { id: 3, name: 'Women in Tech Africa', members: 210, description: 'Empowering female leaders in the tech space.', rules: 'Supportive environment.' }
  ];

  useEffect(() => {
    // Initialize with mock data, but in a real app this would fetch from Firestore
    setFeed(MOCK_FEED);
    setCommunities(MOCK_COMMUNITIES);
    setDebateRooms(MOCK_DEBATE_ROOMS);
  }, []);

  const handlePublish = () => {
    // In a real app, this would save to Firestore
    const newItem = {
      id: Date.now(),
      type: composeType,
      author: profile?.name || 'Current User',
      title: composeTitle || 'New Content Title',
      summary: composeBody || 'This is a newly published piece of content...',
      likes: 0,
      comments: 0,
      tags: composeTags ? composeTags.split(',').map(t => t.trim()) : ['New'],
      time: 'Just now',
      mediaUrl: mediaFileUrl
    };
    setFeed([newItem, ...feed]);
    setIsComposing(false);
    setComposeTitle('');
    setComposeBody('');
    setComposeTags('');
    setMediaFileUrl(null);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to Firebase Storage. Here we use a local object URL for preview.
      const url = URL.createObjectURL(file);
      setMediaFileUrl(url);
    }
  };

  const handleCreateCommunity = () => {
    const newGroup = {
      id: Date.now(),
      name: newCommunity.name,
      description: newCommunity.description,
      rules: newCommunity.rules,
      members: 1
    };
    setCommunities([newGroup, ...communities]);
    setShowCreateCommunity(false);
    setNewCommunity({ name: '', description: '', rules: '', invites: '' });
  };

  const handleCreateDebate = () => {
    const newRoom = {
      id: Date.now(),
      topic: newDebate.topic,
      status: 'upcoming',
      proTeam: [],
      conTeam: [],
      aiScore: null
    };
    setDebateRooms([newRoom, ...debateRooms]);
    setShowCreateDebate(false);
    setNewDebate({ topic: '', date: '' });
  };

  const handleRespond = (item: any) => {
    setSelectedDebate(item);
    setShowRespondModal(true);
  };

  const handleSuggestDebateTopic = () => {
    setIsGeneratingTopic(true);
    // Simulate AI generation
    setTimeout(() => {
      setNewDebate({ ...newDebate, topic: 'The Impact of AI on Traditional African Agriculture' });
      setAiSuggestedArguments({
        pro: ['Increases crop yield through predictive analytics', 'Optimizes resource usage (water, fertilizer)'],
        con: ['High initial cost and infrastructure requirements', 'Risk of displacing traditional farming knowledge']
      });
      setIsGeneratingTopic(false);
    }, 1500);
  };

  const handleGenerateSummary = (articleId: number) => {
    setLoadingSummaries(prev => ({ ...prev, [articleId]: true }));
    // Simulate AI summary generation
    setTimeout(() => {
      setArticleSummaries(prev => ({
        ...prev,
        [articleId]: "AI Summary: This article highlights the critical need for robust digital infrastructure to support economic growth, focusing on broadband expansion and policy reforms to bridge the digital divide."
      }));
      setLoadingSummaries(prev => ({ ...prev, [articleId]: false }));
    }, 1500);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      sender: profile?.name || 'Current User',
      text: chatMessage,
      time: 'Just now',
      isAi: false
    };
    
    setChatMessages([...chatMessages, newMsg]);
    setChatMessage('');

    // Simulate AI Moderator response occasionally
    if (chatMessage.toLowerCase().includes('help') || chatMessage.toLowerCase().includes('ai')) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'AI Moderator',
          text: 'I noticed you asked a question. Here are some resources from our Knowledge Vault that might help.',
          time: 'Just now',
          isAi: true
        }]);
      }, 1000);
    }
  };

  const MOCK_FEED = [
    {
      id: 1,
      type: 'article',
      author: 'Dr. Amina Mensah',
      title: 'The Future of Digital Infrastructure in East Africa',
      summary: 'An in-depth analysis of broadband penetration and its impact on local economies...',
      likes: 124,
      comments: 32,
      tags: ['Policy', 'Infrastructure'],
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'podcast',
      author: 'Kwame Osei',
      title: 'Tech Innovators Podcast: Ep 12 - AI in Agriculture',
      summary: 'Discussing how machine learning models are predicting crop yields with 90% accuracy.',
      likes: 89,
      comments: 15,
      tags: ['Podcast', 'AgriTech', 'AI'],
      time: '5 hours ago'
    },
    {
      id: 3,
      type: 'debate',
      author: 'Sarah Ndlovu',
      title: 'Challenge: Data Sovereignty vs. Global Integration',
      summary: 'I am challenging the recent whitepaper on open data borders. We need to discuss local data protection.',
      likes: 210,
      comments: 84,
      tags: ['Debate', 'Data Privacy'],
      time: '1 day ago'
    },
    {
      id: 4,
      type: 'video',
      author: 'Lusima Dio',
      title: 'Webinar Recording: Smart City Planning',
      summary: 'Catch up on yesterday\'s live session about integrating IoT into urban development.',
      likes: 156,
      comments: 45,
      tags: ['Video', 'Urban Planning'],
      time: '2 days ago'
    }
  ];

  const tabs = [
    { id: 'feed', label: 'My Feed', icon: MessageSquare },
    { id: 'publications', label: 'Publications', icon: BookOpen },
    { id: 'media', label: 'Podcasts & Media', icon: Mic },
    { id: 'communities', label: 'Communities', icon: Users2 },
    { id: 'discourse', label: 'Debates & Discourse', icon: Swords },
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'podcast': return <Radio className="w-5 h-5 text-purple-500" />;
      case 'video': return <PlayCircle className="w-5 h-5 text-red-500" />;
      case 'debate': return <Swords className="w-5 h-5 text-orange-500" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A1F44] to-[#051024] rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A646]/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">Content & Engagement Ecosystem</h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Publish research, host podcasts, build communities, and engage in rigorous intellectual discourse. Your hub for thought leadership.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setIsComposing(true)}
              className="bg-[#C9A646] hover:bg-[#b8972e] text-[#0A1F44] px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Publish Content
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, podcasts, debates..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#C9A646] transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-[#0A1F44]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="ecosystemTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A646]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Compose Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-serif text-gray-900">Create New Content</h2>
              <button onClick={() => setIsComposing(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { id: 'article', label: 'Article/Research', icon: FileText },
                { id: 'podcast', label: 'Podcast Episode', icon: Radio },
                { id: 'video', label: 'Video/Media', icon: PlayCircle },
                { id: 'debate', label: 'Debate Challenge', icon: Swords },
                { id: 'community_post', label: 'Community Post', icon: Users2 },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setComposeType(type.id as ContentType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    composeType === type.id ? 'bg-[#0A1F44] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <type.icon className="w-4 h-4" /> {type.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Title" 
                value={composeTitle}
                onChange={(e) => setComposeTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
              />
              
              {composeType === 'podcast' || composeType === 'video' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                  <input 
                    type="file" 
                    accept={composeType === 'podcast' ? "audio/*" : "video/*"}
                    onChange={handleMediaUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {composeType === 'podcast' ? <Mic className="w-6 h-6 text-gray-500" /> : <Video className="w-6 h-6 text-gray-500" />}
                  </div>
                  <p className="text-gray-600 font-medium">
                    {mediaFileUrl ? 'File selected. Click to change.' : `Click to upload ${composeType === 'podcast' ? 'audio' : 'video'} file`}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">MP3, WAV, MP4, MOV up to 500MB</p>
                </div>
              ) : null}

              <textarea 
                placeholder={composeType === 'debate' ? "State your challenge or thesis clearly..." : "Write your content here..."}
                rows={6}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
              />

              <input 
                type="text" 
                placeholder="Tags (comma separated)" 
                value={composeTags}
                onChange={(e) => setComposeTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => setIsComposing(false)}
                  className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePublish}
                  className="px-6 py-2.5 bg-[#0A1F44] text-white font-bold rounded-xl hover:bg-[#051024] transition-colors"
                >
                  Publish
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Respond to Debate Modal */}
      {showRespondModal && selectedDebate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-serif text-gray-900">Respond to Challenge</h2>
              <button onClick={() => setShowRespondModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Replying to {selectedDebate.author}'s challenge:</p>
              <p className="font-medium text-gray-900">"{selectedDebate.title}"</p>
            </div>

            <div className="space-y-4">
              <textarea 
                placeholder="Formulate your structured response..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
              />
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => setShowRespondModal(false)}
                  className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowRespondModal(false)}
                  className="px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Submit Response
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateCommunity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-serif text-gray-900">Create Community</h2>
              <button onClick={() => setShowCreateCommunity(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Community Name" 
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
              />
              <textarea 
                placeholder="Description"
                rows={3}
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
              />
              <textarea 
                placeholder="Rules (e.g., Be respectful, no spam)"
                rows={3}
                value={newCommunity.rules}
                onChange={(e) => setNewCommunity({...newCommunity, rules: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
              />
              <input 
                type="text" 
                placeholder="Invite Members (emails, comma separated)" 
                value={newCommunity.invites}
                onChange={(e) => setNewCommunity({...newCommunity, invites: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
              />
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => setShowCreateCommunity(false)}
                  className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateCommunity}
                  className="px-6 py-2.5 bg-[#0A1F44] text-white font-bold rounded-xl hover:bg-[#051024] transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Debate Room Modal */}
      {showCreateDebate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-serif text-gray-900">Create Debate Room</h2>
              <button onClick={() => setShowCreateDebate(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Debate Topic" 
                  value={newDebate.topic}
                  onChange={(e) => setNewDebate({...newDebate, topic: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
                />
                <button 
                  onClick={handleSuggestDebateTopic}
                  disabled={isGeneratingTopic}
                  className="px-4 py-3 bg-[#0A1F44] text-white rounded-xl font-bold hover:bg-[#051024] transition-colors whitespace-nowrap disabled:opacity-70 flex items-center gap-2"
                >
                  {isGeneratingTopic ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Target className="w-4 h-4" />}
                  Suggest Topic
                </button>
              </div>

              {aiSuggestedArguments && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> AI Generated Arguments
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-bold text-green-700 mb-1">Pro</h5>
                      <ul className="list-disc pl-4 text-gray-700 space-y-1">
                        {aiSuggestedArguments.pro.map((arg, i) => <li key={i}>{arg}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-bold text-red-700 mb-1">Con</h5>
                      <ul className="list-disc pl-4 text-gray-700 space-y-1">
                        {aiSuggestedArguments.con.map((arg, i) => <li key={i}>{arg}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <input 
                type="datetime-local" 
                value={newDebate.date}
                onChange={(e) => setNewDebate({...newDebate, date: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C9A646] focus:border-transparent"
              />
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => setShowCreateDebate(false)}
                  className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateDebate}
                  className="px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Create Room
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Feed / Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'communities' ? (
            activeCommunityChat ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveCommunityChat(null)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <div>
                      <h3 className="font-bold text-gray-900">{activeCommunityChat.name}</h3>
                      <p className="text-xs text-gray-500">{activeCommunityChat.members} members • Live Chat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-gray-600">Active</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  <div className="text-center text-xs text-gray-400 my-4">Welcome to the {activeCommunityChat.name} chat!</div>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === profile?.name ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-700">{msg.sender}</span>
                        <span className="text-[10px] text-gray-400">{msg.time}</span>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                        msg.isAi 
                          ? 'bg-blue-100 text-blue-900 rounded-tl-none border border-blue-200' 
                          : msg.sender === profile?.name 
                            ? 'bg-[#0A1F44] text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    <input 
                      type="text" 
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message... (Ask AI for help)" 
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#C9A646] focus:border-transparent text-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!chatMessage.trim()}
                      className="p-2 bg-[#C9A646] text-white rounded-full hover:bg-[#b8972e] transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Active Communities</h2>
                <button 
                  onClick={() => setShowCreateCommunity(true)}
                  className="text-[#0A1F44] font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Create Group
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communities.map(community => (
                  <div key={community.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                      <Users2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{community.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{community.description}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm">
                        Join
                      </button>
                      <button 
                        onClick={() => {
                          setActiveCommunityChat(community);
                          setChatMessages([
                            { id: 1, sender: 'System', text: `Welcome to ${community.name}! Say hi to the members.`, time: 'Just now', isAi: false }
                          ]);
                        }}
                        className="flex-1 py-2 bg-[#C9A646] text-white rounded-xl font-bold hover:bg-[#b8972e] transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" /> Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )
          ) : activeTab === 'discourse' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Debate Rooms</h2>
                <button 
                  onClick={() => setShowCreateDebate(true)}
                  className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-bold hover:bg-orange-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Create Room
                </button>
              </div>
              <div className="space-y-4">
                {debateRooms.map(room => (
                  <div key={room.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{room.topic}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        room.status === 'live' ? 'bg-red-50 text-red-600' : 
                        room.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-bold text-gray-700 text-sm mb-2">Pro Team</h4>
                        <div className="text-sm text-gray-600">{room.proTeam.length > 0 ? room.proTeam.join(', ') : 'Open slots'}</div>
                        {room.aiScore && <div className="mt-2 text-green-600 font-bold text-sm">AI Score: {room.aiScore.pro}</div>}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-bold text-gray-700 text-sm mb-2">Con Team</h4>
                        <div className="text-sm text-gray-600">{room.conTeam.length > 0 ? room.conTeam.join(', ') : 'Open slots'}</div>
                        {room.aiScore && <div className="mt-2 text-green-600 font-bold text-sm">AI Score: {room.aiScore.con}</div>}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                        {room.status === 'completed' ? 'View Transcript' : 'Join Room'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Feed Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto hide-scrollbar">
                  <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-700 shrink-0">Filter:</span>
                  {['all', 'article', 'podcast', 'video', 'debate'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                        filterType === type ? 'bg-[#0A1F44] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm font-medium text-gray-700 shrink-0">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#C9A646] focus:border-[#C9A646] block w-full p-2"
                  >
                    <option value="recent">Recency</option>
                    <option value="popular">Popularity</option>
                  </select>
                </div>
              </div>

              {feed.filter(item => {
                if (activeTab === 'feed') {
                  return filterType === 'all' || item.type === filterType;
                }
                if (activeTab === 'publications' && item.type === 'article') return true;
                if (activeTab === 'media' && (item.type === 'podcast' || item.type === 'video')) return true;
                return false;
              }).sort((a, b) => {
                if (sortBy === 'popular') return b.likes - a.likes;
                return b.id - a.id; // Mock recency sort
              }).map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${item.author}&background=random`} alt={item.author} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{item.author}</h4>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-full">
                      {getIconForType(item.type)}
                      <span className="text-xs font-medium text-gray-600 capitalize">{item.type}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.summary}</p>

                  {item.type === 'article' && (
                    <div className="mb-4">
                      {!articleSummaries[item.id] ? (
                        <button 
                          onClick={() => handleGenerateSummary(item.id)}
                          disabled={loadingSummaries[item.id]}
                          className="text-sm font-bold text-[#C9A646] hover:text-[#b8972e] flex items-center gap-1 transition-colors disabled:opacity-70"
                        >
                          {loadingSummaries[item.id] ? <div className="w-3 h-3 border-2 border-[#C9A646] border-t-transparent rounded-full animate-spin" /> : <Target className="w-3 h-3" />}
                          Generate AI Summary
                        </button>
                      ) : (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900">
                          <strong className="flex items-center gap-1 mb-1"><Target className="w-4 h-4" /> AI Summary</strong>
                          {articleSummaries[item.id]}
                        </div>
                      )}
                    </div>
                  )}

                  {item.mediaUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {item.type === 'video' ? (
                      <video src={item.mediaUrl} controls className="w-full max-h-96 object-contain" />
                    ) : item.type === 'podcast' ? (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#C9A646] rounded-full flex items-center justify-center shrink-0">
                          <Mic className="w-6 h-6 text-white" />
                        </div>
                        <audio src={item.mediaUrl} controls className="w-full" />
                      </div>
                    ) : (
                      <img src={item.mediaUrl} alt="Media" className="w-full max-h-96 object-cover" />
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-[#C9A646] transition-colors">
                    <ThumbsUp className="w-4 h-4" /> <span className="text-sm font-medium">{item.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-[#C9A646] transition-colors">
                    <MessageCircle className="w-4 h-4" /> <span className="text-sm font-medium">{item.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-[#C9A646] transition-colors ml-auto">
                    <Share2 className="w-4 h-4" /> <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </div>

        {/* Right Column: Trending & Suggestions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#C9A646]" /> Live Now
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Webinar</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">AI Regulation Frameworks</h4>
                <p className="text-xs text-gray-600 mb-3">Hosted by Tech Policy Group</p>
                <button className="w-full py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
                  Join Session
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C9A646]" /> Trending Debates
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Universal Basic Income in Developing Nations', participants: 45 },
                { title: 'The Role of Blockchain in Voting Systems', participants: 32 },
              ].map((debate, i) => (
                <div key={i} className="group cursor-pointer">
                  <h4 className="font-medium text-gray-900 text-sm group-hover:text-[#C9A646] transition-colors line-clamp-2 mb-1">
                    {debate.title}
                  </h4>
                  <p className="text-xs text-gray-500">{debate.participants} active participants</p>
                </div>
              ))}
            </div>
          </div>

          {/* Discover More Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" /> Discover More
            </h3>
            <p className="text-xs text-gray-600 mb-4">AI-curated recommendations based on your interests and activity.</p>
            <div className="space-y-4">
              {[
                { title: 'Research: AI in African Healthcare', type: 'Article', match: '98%' },
                { title: 'Podcast: The Future of EdTech', type: 'Podcast', match: '92%' },
              ].map((rec, i) => (
                <div key={i} className="bg-white p-3 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase text-gray-500">{rec.type}</span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{rec.match} Match</span>
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{rec.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
