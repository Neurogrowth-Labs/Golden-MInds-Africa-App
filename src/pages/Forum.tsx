import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ThumbsUp, Plus, Search, User } from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function Forum() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'forum_posts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!user || !profile || !newPost.title || !newPost.content) return;
    try {
      await addDoc(collection(db, 'forum_posts'), {
        authorId: user.uid,
        authorName: profile.name,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        createdAt: new Date().toISOString(),
        upvotes: 0
      });
      setIsComposing(false);
      setNewPost({ title: '', content: '', category: 'General' });
      fetchPosts();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'forum_posts');
    }
  };

  const handleUpvote = async (postId: string, currentUpvotes: number) => {
    try {
      const postRef = doc(db, 'forum_posts', postId);
      await updateDoc(postRef, { upvotes: currentUpvotes + 1 });
      setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: currentUpvotes + 1 } : p));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `forum_posts/${postId}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2">Community Forum</h1>
          <p className="text-gray-600">Discuss ideas, share resources, and collaborate.</p>
        </div>
        <button 
          onClick={() => setIsComposing(true)}
          className="bg-[#ff4e00] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e64600] transition-colors flex items-center gap-2 shadow-lg shadow-[#ff4e00]/20"
        >
          <Plus className="w-5 h-5" />
          New Discussion
        </button>
      </div>

      {isComposing && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Start a Discussion</h2>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Discussion Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full px-4 py-3 bg-[#f5f5f0] border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl transition-colors"
            />
            <select 
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              className="w-full px-4 py-3 bg-[#f5f5f0] border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl transition-colors"
            >
              <option value="General">General</option>
              <option value="Leadership">Leadership</option>
              <option value="AI & Tech">AI & Tech</option>
              <option value="Policy">Policy</option>
            </select>
            <textarea 
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-[#f5f5f0] border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl transition-colors resize-none"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsComposing(false)}
                className="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePost}
                disabled={!newPost.title || !newPost.content}
                className="px-6 py-2 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading discussions...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No discussions yet. Be the first to start one!</p>
          </div>
        ) : (
          posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{post.authorName}</span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-500 text-sm">
                      {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-serif mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                  
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleUpvote(post.id, post.upvotes)}
                      className="flex items-center gap-2 text-gray-500 hover:text-[#ff4e00] transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-medium">{post.upvotes}</span>
                    </button>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
