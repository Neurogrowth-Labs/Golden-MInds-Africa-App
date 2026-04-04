import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginWithGoogle, logout, loginWithEmail, registerWithEmail } from '../firebase';
import { LayoutDashboard, CalendarCheck, BookOpen, MessageSquare, Users, Mic, ShieldAlert, LogOut, X, Loader2, BrainCircuit, Image as ImageIcon, ArrowLeft, Calendar, FileText, Video, Globe, Briefcase, Cpu, Award, ShieldCheck, Database, Compass, FolderOpen, UserPlus, Mail, Lock, User } from 'lucide-react';
import QuickAIHelper from './QuickAIHelper';

export default function Layout() {
  const { user, profile, loading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError('');
    
    try {
      if (authMode === 'signup') {
        // Note: The name will be updated in the AuthContext when the profile is created
        sessionStorage.setItem('temp_name', name);
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error: any) {
      console.error("Auth failed", error);
      setAuthError(error.message || `Failed to ${authMode === 'signup' ? 'sign up' : 'sign in'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError('');
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Google login failed", error);
      setAuthError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      const intendedRole = sessionStorage.getItem('intended_role');
      if (intendedRole === 'admin') {
        sessionStorage.removeItem('intended_role');
        if (profile.role === 'admin') {
          if (location.pathname !== '/admin') {
            navigate('/admin', { replace: true });
          }
        }
      } else if (profile.role !== 'admin' && !localStorage.getItem('onboardingComplete') && location.pathname !== '/onboarding') {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, profile, navigate, location]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0502] text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0502] text-white p-4 relative overflow-hidden">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-[#ff4e00]/20">
              <span className="text-3xl font-bold">GM</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Golden Minds</h1>
            <p className="text-gray-400">Africa Fellowship App</p>
          </div>

          {/* Toggle Login/Signup */}
          <div className="flex p-1 bg-black/40 rounded-xl mb-6">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${authMode === 'login' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${authMode === 'signup' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            {authMode === 'signup' && (
              <div>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4e00] transition-colors"
                  />
                </div>
              </div>
            )}
            <div>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4e00] transition-colors"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4e00] transition-colors"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 bg-[#ff4e00] text-white font-bold rounded-xl hover:bg-[#e64600] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">or continue with</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            type="button"
            className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            )}
            Google
          </button>
        </div>
      </div>
    );
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  const fellowNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/learning-hub', icon: BookOpen, label: 'Learning Hub' },
    { to: '/calendar', icon: Calendar, label: 'Smart Calendar' },
    { to: '/mentorship', icon: UserPlus, label: 'Mentors' },
    { to: '/projects', icon: Briefcase, label: 'Projects' },
    { to: '/portfolio', icon: FolderOpen, label: 'Digital Legacy' },
    { to: '/achievements', icon: Award, label: 'Achievements' },
    { to: '/rooms', icon: Video, label: 'Virtual Rooms' },
    { to: '/certifications', icon: ShieldCheck, label: 'Certifications' },
    { to: '/knowledge', icon: Database, label: 'Knowledge Vault' },
    { to: '/opportunities', icon: Compass, label: 'Opportunities' },
    { to: '/publications', icon: Users, label: 'Publications & Debates' },
    { to: '/showcase', icon: Globe, label: 'Global Showcase' },
  ];

  if (profile?.role === 'admin') {
    fellowNavItems.push({ to: '/admin', icon: ShieldAlert, label: 'Admin' });
  }

  const currentNavItems = fellowNavItems;

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#5A5A40] to-[#8A8A60] rounded-xl flex items-center justify-center text-white font-bold shadow-md">
            GM
          </div>
          <span className="font-bold text-xl tracking-tight">Golden Minds</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto hide-scrollbar">
          {currentNavItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to === '/admin' && location.pathname.startsWith('/admin'));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#5A5A40] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          {isAdminRoute && (
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-2 px-4 py-3 mb-4 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold">Fellow Dashboard</span>
            </button>
          )}
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.name}`} alt="Avatar" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#5A5A40] to-[#8A8A60] rounded-lg flex items-center justify-center text-white font-bold">
              GM
            </div>
            <span className="font-bold">Golden Minds</span>
          </div>
          {/* Mobile menu button would go here */}
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
      <QuickAIHelper />
    </div>
  );
}
