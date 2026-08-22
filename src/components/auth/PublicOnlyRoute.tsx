import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { firebaseUser, onboardingComplete, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0F1D] text-white">
        <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (firebaseUser) {
    return <Navigate to={onboardingComplete ? '/guardian' : '/onboarding'} replace />;
  }

  return <>{children}</>;
};
