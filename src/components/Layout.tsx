import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, CalendarCheck, BookOpen, MessageSquare, Users, Mic, ShieldAlert, LogOut, X, Loader2, BrainCircuit, Image as ImageIcon, ArrowLeft, Calendar, FileText, Video, Globe, Briefcase, Cpu, Award, ShieldCheck, Database, Compass, FolderOpen, UserPlus, Mail, Lock, User, Menu, Eye, EyeOff, Diamond, Star, GraduationCap, Map, Crown } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, updateProfile, GoogleAuthProvider } from 'firebase/auth';
import QuickAIHelper from './QuickAIHelper';
import africanGovBg from '../assets/images/african_governance_bg_1781130107908.png';

export default function Layout() {
  const { user, profile, loading, setAccessToken } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  const [authSuccess, setAuthSuccess] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    
    // Basic client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setIsLoggingIn(true);
    setAuthError('');
    setAuthSuccess('');
    
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        setAuthSuccess('Registration successful!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      let errorMessage = error?.message || 'Unknown error';
      const lowerError = errorMessage.toLowerCase();
      
      if (lowerError.includes('auth/too-many-requests')) {
        errorMessage = 'Too many attempts. Please wait a few minutes.';
      } else if (lowerError.includes('auth/invalid-credential') || lowerError.includes('auth/user-not-found') || lowerError.includes('auth/wrong-password')) {
        errorMessage = 'Invalid email or password.';
      } else if (lowerError.includes('auth/invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (lowerError.includes('auth/email-already-in-use')) {
        errorMessage = 'An account with this email already exists.';
      }
      
      console.error("Auth failed:", errorMessage, error);
      setAuthError(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
    } catch (error: any) {
      console.error("Google login failed", error);
      setAuthError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0502] text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative overflow-y-auto overflow-x-hidden text-white"
        style={{
          backgroundImage: `url(${africanGovBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundColor: '#0a0502'
        }}
      >
        {/* Atmospheric Fog and dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0502]/80 via-[#0a0502]/60 to-[#0a0502]/95 backdrop-blur-[2px] z-0"></div>
        {/* Subtle orange glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent z-0 pointer-events-none"></div>

        {/* Main UI Card */}
        <div className="w-full max-w-md bg-black/60 backdrop-blur-2xl border border-orange-500/30 rounded-[32px] p-8 sm:p-10 shadow-[0_0_40px_rgba(255,140,0,0.15)] relative z-10 my-auto">
          
          <div className="text-center mb-10">
            {/* Logo */}
            <div className="w-20 h-20 bg-gradient-to-br from-amber-600 via-orange-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_25px_rgba(255,140,0,0.4)] border border-orange-400/30">
              <span className="text-3xl font-extrabold text-white tracking-wider">GM</span>
            </div>
            {/* Heading */}
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
              <span className="text-white">Golden</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 drop-shadow-[0_0_10px_rgba(255,140,0,0.3)]">Minds</span>
            </h1>
            <p className="text-gray-400 tracking-wide text-sm uppercase font-medium">Africa Fellowship</p>
          </div>

          {/* Toggle Login/Signup */}
          <div className="flex p-1.5 bg-black/50 border border-white/5 rounded-2xl mb-8 relative">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${authMode === 'login' ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${authMode === 'signup' ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm text-center backdrop-blur-md">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 text-sm text-center backdrop-blur-md">
              {authSuccess}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5 mb-8">
            {authMode === 'signup' && (
              <div className="relative group">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 font-medium transition-all focus:shadow-[0_0_15px_rgba(255,140,0,0.15)]"
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 font-medium transition-all focus:shadow-[0_0_15px_rgba(255,140,0,0.15)]"
              />
            </div>
            <div className="relative group">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-12 pr-12 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 font-medium transition-all focus:shadow-[0_0_15px_rgba(255,140,0,0.15)]"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:from-amber-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,140,0,0.3)] mt-2"
            >
              {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="relative flex items-center pb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium tracking-wide">or continue with</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            type="button"
            className="w-full py-4 px-4 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            )}
            Google
          </button>
        </div>

        {/* Values Section */}
        <div className="w-full max-w-4xl mt-16 relative z-10 grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 text-center px-4">
          <div className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl hover:border-orange-500/30 transition-colors">
            <ShieldCheck className="w-6 h-6 text-amber-500 mb-3" />
            <h3 className="font-bold text-white mb-1 text-sm">Integrity</h3>
            <p className="text-xs text-gray-400">Unwavering moral compass.</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl hover:border-orange-500/30 transition-colors">
            <Award className="w-6 h-6 text-amber-500 mb-3" />
            <h3 className="font-bold text-white mb-1 text-sm">Service</h3>
            <p className="text-xs text-gray-400">Dedicated to others.</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl hover:border-orange-500/30 transition-colors">
            <Database className="w-6 h-6 text-amber-500 mb-3" />
            <h3 className="font-bold text-white mb-1 text-sm">Knowledge</h3>
            <p className="text-xs text-gray-400">Pursuit of wisdom.</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl hover:border-orange-500/30 transition-colors">
            <Globe className="w-6 h-6 text-amber-500 mb-3" />
            <h3 className="font-bold text-white mb-1 text-sm">Africa First</h3>
            <p className="text-xs text-gray-400">Centering prosperity.</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl hover:border-orange-500/30 transition-colors col-span-2 md:col-span-1">
            <Crown className="w-6 h-6 text-amber-500 mb-3" />
            <h3 className="font-bold text-white mb-1 text-sm">Excellence</h3>
            <p className="text-xs text-gray-400">Highest standards.</p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-16 text-center relative z-10 w-full pb-8">
          <p className="text-gray-500 tracking-[0.2em] text-xs sm:text-sm font-medium uppercase">
            Strong Minds <span className="mx-1 sm:mx-2 text-orange-500">•</span> Great Leaders <span className="mx-1 sm:mx-2 text-orange-500">•</span> Greater Africa
          </p>
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
    { to: '/ecosystem', icon: Users, label: 'Content Ecosystem' },
    { to: '/showcase', icon: Globe, label: 'Global Showcase' },
  ];

  if (profile?.role === 'admin') {
    fellowNavItems.push({ to: '/admin', icon: ShieldAlert, label: 'Admin' });
  }

  const currentNavItems = fellowNavItems;

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-gray-900 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#5A5A40] to-[#8A8A60] rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              GM
            </div>
            <span className="font-bold text-xl tracking-tight">Golden Minds</span>
          </div>
          <button 
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto hide-scrollbar pb-20 md:pb-0">
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

        <div className="p-4 border-t border-gray-200 bg-white">
          {isAdminRoute && (
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-2 px-4 py-3 mb-4 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold">Fellow Dashboard</span>
            </button>
          )}
          <div 
            onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 mb-4 px-2 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
          >
            <img src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.name}`} alt="Avatar" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#5A5A40] to-[#8A8A60] rounded-lg flex items-center justify-center text-white font-bold">
              GM
            </div>
            <span className="font-bold">Golden Minds</span>
          </div>
          <button 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full">
          <Outlet />
        </div>
      </main>
      <QuickAIHelper />
    </div>
  );
}
