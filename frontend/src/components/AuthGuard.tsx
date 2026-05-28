import { Navigate, Outlet } from 'react-router-dom';
import { TokenService } from '../services/tokenService';

export default function AuthGuard() {
  const token = TokenService.getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
