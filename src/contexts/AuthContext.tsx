import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';

interface CustomUser extends User {
  id: string; // The UUID generated from Firebase UID
  firebaseUid: string; // The original Firebase UID
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

// Generate a deterministic UUID from a Firebase UID
async function getUuidFromFirebaseUid(uid: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(uid);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;
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
// test error
    const mockUser = {
      id: superAdminUuid,
      uid: superAdminUuid,
      firebaseUid: superAdminUuid,
      email: 'simao@neurogrowthlabs.co.za',
      displayName: 'Simao Simas',
      emailVerified: true
    } as any;
    
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

  useEffect(() => {
    let mounted = true;

    // Check if we are already logged in as super-admin
    if (sessionStorage.getItem('gma-super-admin-authenticated') === 'true') {
      loginSuperAdmin();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (mounted) {
        if (currentUser) {
          const supabaseUuid = await getUuidFromFirebaseUid(currentUser.uid);
          const customUser = Object.assign({}, currentUser, { id: supabaseUuid, firebaseUid: currentUser.uid }) as CustomUser;
          (currentUser as any).id = supabaseUuid;
          (currentUser as any).firebaseUid = currentUser.uid;
          setUser(customUser);
          await fetchProfile(customUser);
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
      unsubscribe();
    };
  }, []);

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
        // Create profile in Supabase for the new Firebase user
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
