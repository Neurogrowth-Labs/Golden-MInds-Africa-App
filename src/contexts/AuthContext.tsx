import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface CustomUser {
  id: string; // The original Supabase Auth UUID
  email?: string;
  displayName?: string;
  photoURL?: string;
}

interface UserProfile {
  id: string; // Supabase uses id instead of uid
  uid: string; // Keep for backward compatibility
  name: string;
  email: string;
  role: 'fellow' | 'admin' | 'moderator' | 'student' | 'mentor';
  avatar?: string;
  participationScore?: number;
  attendanceStreak?: number;
  bio?: string;
  skills?: string;
  showBioAndSkills?: boolean;
}

interface AuthContextType {
  user: CustomUser | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loginSuperAdmin?: () => void;
  logoutSuperAdmin?: () => void;
  isSuperAdmin?: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true, 
  refreshProfile: async () => {},
  accessToken: null,
  setAccessToken: () => {},
  loginSuperAdmin: () => {},
  logoutSuperAdmin: () => {},
  isSuperAdmin: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const loginSuperAdmin = async () => {
    sessionStorage.setItem('gma-super-admin-authenticated', 'true');
    const superAdminUuid = 'e0000000-0000-0000-0000-000000000000';
    
    // Asynchronously upsert the super admin profile directly to database to avoid FK violation constraints
    try {
      await supabase.from('profiles').upsert({
        id: superAdminUuid,
        full_name: 'Simao Simas',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        role: 'admin',
        bio: 'Super Admin Command center root administrator of Golden Minds Africa.',
        participationScore: 100,
        attendanceStreak: 12
      });
    } catch (err) {
      console.error("Failed to upsert super-admin profile:", err);
    }

    const mockUser: CustomUser = {
      id: superAdminUuid,
      email: 'simao@neurogrowthlabs.co.za',
      displayName: 'Simao Simas',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
    };
    
    const mockProfile: UserProfile = {
      id: superAdminUuid,
      uid: superAdminUuid,
      name: 'Simao Simas',
      email: 'simao@neurogrowthlabs.co.za',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      participationScore: 100,
      attendanceStreak: 12
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);
  };

  const logoutSuperAdmin = () => {
    sessionStorage.removeItem('gma-super-admin-authenticated');
    setUser(null);
    setProfile(null);
  };

  const fetchProfile = async (currentUser: CustomUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        if (error.message !== 'TypeError: Failed to fetch' && !error.message.includes('Failed to fetch')) {
          console.error('Error fetching profile:', error);
        }
      }

      if (data) {
        setProfile({
          id: data.id,
          uid: data.id,
          name: data.full_name || currentUser.displayName || 'Fellow',
          email: currentUser.email || '',
          role: data.role || 'fellow',
          avatar: data.avatar_url || currentUser.photoURL || '',
          bio: data.bio,
          skills: data.skills?.join(', ') || '',
        });
      } else {
        // Create profile in Supabase for the new user
        const newProfile = {
          id: currentUser.id,
          full_name: currentUser.displayName || 'Student',
          avatar_url: currentUser.photoURL || '',
          role: 'student', // Changed from 'fellow' to match valid enum
        };
        const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
        if (insertError) {
          if (insertError.message !== 'TypeError: Failed to fetch' && !insertError.message.includes('Failed to fetch')) {
             console.error("Profile creation error:", insertError);
          }
        }

        setProfile({
          id: currentUser.id,
          uid: currentUser.id,
          name: currentUser.displayName || 'Student',
          email: currentUser.email || '',
          role: 'student',
          avatar: currentUser.photoURL || '',
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check if we are already logged in as super-admin
    if (sessionStorage.getItem('gma-super-admin-authenticated') === 'true') {
      loginSuperAdmin();
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          const mappedUser: CustomUser = {
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
            photoURL: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
          };
          setUser(mappedUser);
          fetchProfile(mappedUser);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    // Listen to Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session?.user) {
          const mappedUser: CustomUser = {
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
            photoURL: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
          };
          setUser(mappedUser);
          await fetchProfile(mappedUser);
        } else {
          setUser(null);
          setProfile(null);
          setAccessToken(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const isSuperAdmin = !!(
    (user && user.email === 'simao@neurogrowthlabs.co.za') || 
    sessionStorage.getItem('gma-super-admin-authenticated') === 'true'
  );

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, accessToken, setAccessToken, loginSuperAdmin, logoutSuperAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
