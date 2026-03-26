import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginWithGoogle, logout } from '../firebase';
import { LayoutDashboard, CalendarCheck, BookOpen, MessageSquare, Users, Mic, ShieldAlert, LogOut, X, Loader2, BrainCircuit, Image as ImageIcon, ArrowLeft, Calendar, FileText, Video } from 'lucide-react';
import QuickAIHelper from './QuickAIHelper';

export default function Layout() {
  const { user, profile, loading } = useAuth();
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    sessionStorage.setItem('intended_role', 'admin');
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFellowLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
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
        {/* Admin Sign Up Portal Button in Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={() => setShowAdminPortal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-all backdrop-blur-md text-gray-300 hover:text-white"
          >
            <ShieldAlert className="w-4 h-4 text-[#ff4e00]" />
            Admin Portal
          </button>
        </div>

        {/* Admin Portal Modal */}
        {showAdminPortal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full relative">
              <button 
                onClick={() => setShowAdminPortal(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                disabled={isLoggingIn}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-[#ff4e00]/20">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2 font-serif text-white">Admin Access</h2>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                Sign in with your authorized Google workspace account to access the Golden Minds Command Center.
              </p>
              
              <button 
                onClick={handleAdminLogin}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                )}
                {isLoggingIn ? 'Signing in...' : 'Continue as Administrator'}
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                <p className="text-xs text-gray-500">
                  Requesting new admin access? Contact the program director.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-[#ff4e00]/20">
            <span className="text-3xl font-bold">GM</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Golden Minds</h1>
          <p className="text-gray-400 mb-8">Africa Fellowship App</p>
          <button 
            onClick={handleFellowLogin}
            disabled={isLoggingIn}
            className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            )}
            {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  const fellowNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/assignments', icon: FileText, label: 'Assignments' },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/rooms', icon: Video, label: 'Virtual Rooms' },
    { to: '/learning', icon: BookOpen, label: 'Learning Hub' },
    { to: '/forum', icon: MessageSquare, label: 'Forum' },
    { to: '/debates', icon: Users, label: 'Debates' },
    { to: '/notes', icon: Mic, label: 'AI Notes' },
  ];

  if (profile?.role === 'admin') {
    fellowNavItems.push({ to: '/admin', icon: ShieldAlert, label: 'Admin' });
  }

  const adminNavItems = [
    { to: '/admin?tab=overview', icon: BrainCircuit, label: 'AI Insights' },
    { to: '/admin?tab=users', icon: Users, label: 'Fellows' },
    { to: '/admin?tab=content', icon: BookOpen, label: 'CMS' },
    { to: '/admin?tab=debates', icon: MessageSquare, label: 'Debates' },
    { to: '/admin?tab=generator', icon: ImageIcon, label: 'Assets' },
  ];

  const currentNavItems = isAdminRoute ? adminNavItems : fellowNavItems;

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
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {currentNavItems.map((item) => {
            // Custom active logic for query params
            const isActive = isAdminRoute 
              ? location.search === item.to.split('?')[1] || (item.to === '/admin?tab=overview' && !location.search)
              : location.pathname === item.to;

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
