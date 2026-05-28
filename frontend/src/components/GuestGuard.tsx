import { Navigate, Outlet } from 'react-router-dom';
import { TokenService } from '../services/tokenService';

export default function GuestGuard() {
  const token = TokenService.getToken();
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}
