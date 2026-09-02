import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0c]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#cca568] mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-mono">Verifying administration signature...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    toast.error("Unauthorized Access: Super Admin credentials required.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
