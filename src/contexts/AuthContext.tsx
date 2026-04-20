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
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

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
        console.error('Error fetching profile:', error);
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
           console.error("Profile creation error:", insertError);
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

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
