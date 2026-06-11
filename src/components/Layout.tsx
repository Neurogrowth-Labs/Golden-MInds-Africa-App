import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, CalendarCheck, BookOpen, MessageSquare, Users, Mic, ShieldAlert, LogOut, X, Loader2, BrainCircuit, Image as ImageIcon, ArrowLeft, Calendar, FileText, Video, Globe, Briefcase, Cpu, Award, ShieldCheck, Database, Compass, FolderOpen, UserPlus, Mail, Lock, User, Menu, Eye, EyeOff, Diamond, Star, GraduationCap, Map, Crown } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, updateProfile, GoogleAuthProvider } from 'firebase/auth';
import QuickAIHelper from './QuickAIHelper';
import africanGovBg from '../assets/images/african_governance_bg_1781130107908.png';
import freedomFightersBg from '../assets/images/freedom_fighters_bg_1781179439940.png';
import appLogo from '../assets/images/logo.png';
import LandingPage from '../pages/LandingPage';
import FellowshipLanding from '../pages/FellowshipLanding';

const AFRICAN_QUOTES = [
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Forward ever, backward never.", author: "Kwame Nkrumah" },
  { text: "Without dignity there is no liberty, without justice there is no dignity.", author: "Patrice Lumumba" },
  { text: "We must dare to invent the future.", author: "Thomas Sankara" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The enemies of Africa are those who exploit its resources while the people starve.", author: "Wangari Maathai" }
];

export default function Layout() {
  const { user, profile, loading, setAccessToken } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);
  const [landingView, setLandingView] = useState<'main' | 'fellowship' | 'none'>('main');
  
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

  // Quote rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!user) {
      interval = setInterval(() => {
        setQuoteFade(false);
        setTimeout(() => {
          setQuoteIndex((prev) => (prev + 1) % AFRICAN_QUOTES.length);
          setQuoteFade(true);
        }, 500);
      }, 6000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0502] text-white">Loading...</div>;
  }

  if (!user) {
    if (landingView === 'main') {
      return <LandingPage onEnter={() => setLandingView('none')} onFellowshipClick={() => setLandingView('fellowship')} />;
    }
    if (landingView === 'fellowship') {
      return <FellowshipLanding onBack={() => setLandingView('main')} />;
    }
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-[#050505] p-2 sm:p-4 text-white font-sans sm:py-8 overflow-y-auto relative"
        style={{
          backgroundImage: `url(${freedomFightersBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        <button 
          onClick={() => setLandingView('main')}
          className="absolute top-6 left-6 text-white/50 hover:text-[#cca568] transition-colors flex items-center gap-2 text-sm font-medium z-20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        {/* Left Side Values */}
        <div className="hidden lg:flex absolute left-8 xl:left-12 top-1/2 -translate-y-1/2 flex-col gap-6 z-10 pointer-events-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col items-start text-left">
            <ShieldCheck className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Integrity</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We lead with<br/>honesty and<br/>transparency.</p>
          </div>
          <div className="flex flex-col items-start text-left">
            <Users className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Service</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We serve our<br/>communities and<br/>our continent.</p>
          </div>
          <div className="flex flex-col items-start text-left">
            <BookOpen className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Knowledge</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We learn<br/>continuously and<br/>think critically.</p>
          </div>
          <div className="flex flex-col items-start text-left">
            <Globe className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Africa First</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We believe in<br/>Africa's potential<br/>and prosperity.</p>
          </div>
          <div className="flex flex-col items-start text-left">
            <Star className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Excellence</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We pursue the<br/>highest impact in<br/>all we do.</p>
          </div>
        </div>

        {/* Right Side Motto */}
        <div className="hidden lg:flex absolute right-8 xl:right-12 top-1/2 -translate-y-1/2 flex-col justify-center z-10 pointer-events-none max-w-[160px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          <p className="text-[#cca568] text-[20px] font-serif font-bold text-right leading-[1.4]">
            Strong Minds.<br/><br/>Great Leaders.<br/><br/>Greater Africa.
          </p>
        </div>

        <div 
          className="w-full max-w-[440px] rounded-[36px] border border-[#2a2a2e] relative overflow-hidden flex flex-col pt-12 pb-12 px-6 sm:px-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 backdrop-blur-md"
        >
          {/* Background Image of the Card */}
          <div 
            className="absolute inset-0 z-0 transition-opacity"
            style={{
              backgroundImage: `url(${africanGovBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.9
            }}
          ></div>
          
          {/* Gradient Overlays: Dark middle for form visibility, lighter top/bottom for visuals */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/95 via-45% to-black/60 z-0 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center h-full">
            {/* Logo */}
            <div className="w-[120px] h-[120px] mb-4 flex items-center justify-center filter drop-shadow-[0_4px_25px_rgba(255,107,0,0.4)]">
              <img src={appLogo} alt="Golden Minds Africa Logo" className="w-full h-full object-contain" />
            </div>

            {/* Heading */}
            <h1 className="text-[34px] font-bold mb-2 tracking-tight sr-only">
              <span className="text-white">Golden </span>
              <span className="text-[#ff7f24]">Minds</span>
            </h1>

            {/* Rotating Quotes */}
            <div className="h-[48px] flex items-center justify-center mb-8 px-2 text-center overflow-hidden w-full">
              <div 
                className={`transition-all duration-700 ease-in-out flex flex-col items-center justify-center ${quoteFade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
              >
                <p className="text-[#cca568] italic text-[14px] leading-tight">"{AFRICAN_QUOTES[quoteIndex].text}"</p>
                <p className="text-[#8e8e93] text-[11px] font-bold mt-1.5 uppercase tracking-wider">— {AFRICAN_QUOTES[quoteIndex].author}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="w-full flex bg-[#1c1c1e] rounded-[18px] mb-8 border border-white/5 relative shadow-inner overflow-hidden">
              <div 
                 className="absolute bottom-0 h-[2px] bg-[#ff7f24] transition-all duration-300 ease-out"
                 style={{ width: '50%', left: authMode === 'login' ? '0' : '50%', borderRadius: '2px' }}
              />
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-[14px] text-[15px] font-semibold flex items-center justify-center gap-2 relative transition-all ${authMode === 'login' ? 'text-[#ff7f24]' : 'text-[#8e8e93] hover:text-gray-300'}`}
              >
                <User className="w-[18px] h-[18px]" strokeWidth={2.5} />
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 py-[14px] text-[15px] font-semibold flex items-center justify-center gap-2 relative transition-all ${authMode === 'signup' ? 'text-[#ff7f24]' : 'text-[#8e8e93] hover:text-gray-300'}`}
              >
                <UserPlus className="w-[18px] h-[18px]" strokeWidth={2} />
                Sign Up
              </button>
            </div>

            {/* Error/Success messages */}
            {authError && (
              <div className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-[14px] font-medium text-center backdrop-blur-md">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="w-full mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 text-[14px] font-medium text-center backdrop-blur-md">
                {authSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-8">
              {authMode === 'signup' && (
                <div className="relative group">
                  <User className="w-[20px] h-[20px] absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93] group-focus-within:text-[#ff7f24] transition-colors" strokeWidth={1.5} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-[16px] bg-[#1a1a1c] border border-white/5 rounded-[18px] text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#ff7f24]/50 focus:bg-[#1f1f21] text-[15px] transition-all"
                  />
                </div>
              )}
              
              <div className="relative group">
                <Mail className="w-[20px] h-[20px] absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93] group-focus-within:text-[#ff7f24] transition-colors" strokeWidth={1.5} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-[16px] bg-[#1a1a1c] border border-white/5 rounded-[18px] text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#ff7f24]/50 focus:bg-[#1f1f21] text-[15px] transition-all"
                />
              </div>

              <div className="relative group">
                <Lock className="w-[20px] h-[20px] absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93] group-focus-within:text-[#ff7f24] transition-colors" strokeWidth={1.5} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-[16px] bg-[#1a1a1c] border border-white/5 rounded-[18px] text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#ff7f24]/50 focus:bg-[#1f1f21] text-[15px] transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8e93] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-[16px] px-4 bg-gradient-to-r from-[#ff7300] to-[#ff4000] text-white text-[16px] font-bold rounded-[18px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(255,107,0,0.3)] mt-4 border border-[#ff7300]/50"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            <div className="relative flex items-center w-full mb-6">
              <div className="flex-grow border-t border-[#2a2a2e]"></div>
              <span className="flex-shrink-0 mx-4 text-[#8e8e93] text-[13px] font-medium tracking-wide">or continue with</span>
              <div className="flex-grow border-t border-[#2a2a2e]"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              type="button"
              className="w-full py-[16px] px-4 bg-white text-black text-[15px] font-bold rounded-[18px] hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mb-24"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin text-black" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[20px] h-[20px]" />
              )}
              Continue with Google
            </button>
          </div>

          {/* Authenticaton Loading Overlay */}
          {isLoggingIn && (
            <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center border border-[#ff7f24]/20 rounded-[36px]">
              {/* Internal styling for cinematic sliding bar */}
              <style>
                {`
                  @keyframes loading-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                  }
                  .animate-loading-slide {
                    animation: loading-slide 2s ease-in-out infinite;
                  }
                `}
              </style>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-[#ff7f24]/10 blur-[80px] rounded-full flex-shrink-0 animate-pulse pointer-events-none"></div>
              
              <div className="w-[110px] h-[110px] bg-white rounded-full p-2 mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(255,107,0,0.6)] animate-pulse border border-[#ff7f24]/50 relative">
                <div className="absolute inset-0 bg-[#ff7f24]/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
                <img src={appLogo} alt="Loading Golden Minds" className="w-full h-full object-contain relative z-10 rounded-full" />
              </div>
              
              <h2 className="text-[22px] font-bold text-white mb-3 tracking-wide">Authenticating</h2>
              <p className="text-[#cca568] text-[14px] text-center max-w-[250px] leading-relaxed opacity-80">
                Establishing secure connection to the fellowship...
              </p>

              <div className="w-[160px] h-[3px] bg-white/10 mt-12 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-[40%] bg-gradient-to-r from-transparent via-[#ff7f24] to-transparent animate-loading-slide"></div>
              </div>
            </div>
          )}

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
            <div className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden bg-white shadow-sm border border-gray-100">
              <img src={appLogo} alt="Golden Minds" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden md:block">Golden Minds</span>
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-gray-100">
              <img src={appLogo} alt="Golden Minds" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-gray-800">Golden Minds</span>
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
