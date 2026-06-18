import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#F7FAFC]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D9E4E3] border-t-[#1B4D3E]" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
