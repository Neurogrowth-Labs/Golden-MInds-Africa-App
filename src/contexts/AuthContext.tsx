import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';

interface CustomUser extends User {
  id: string;
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
          const customUser = Object.assign({}, currentUser, { id: currentUser.uid }) as CustomUser;
          // Note: using currentUser for Firebase methods, object.assign will copy properties
          // but we can just add a getter for id to the currentUser object itself:
          (currentUser as any).id = currentUser.uid;
          setUser(currentUser as CustomUser);
          await fetchProfile(currentUser as CustomUser);
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
        .eq('id', currentUser.uid)
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
          id: currentUser.uid,
          full_name: currentUser.displayName || 'Fellow',
          avatar_url: currentUser.photoURL || '',
          role: 'fellow',
        };
        await supabase.from('profiles').insert([newProfile]);

        setProfile({
          id: currentUser.uid,
          uid: currentUser.uid,
          name: currentUser.displayName || 'Fellow',
          email: currentUser.email || '',
          role: 'fellow',
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
