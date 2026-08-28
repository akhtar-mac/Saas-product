import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

interface Props {
  children: React.ReactNode;
}

export default function ClientProtectedRoute({ children }: Props) {
  const { isCustomerAuthenticated, customer } = useAuthStore();
  const location = useLocation();

  if (!isCustomerAuthenticated || !customer) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
