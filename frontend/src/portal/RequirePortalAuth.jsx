import { Navigate, useLocation } from 'react-router-dom';
import { isPlatformAuthed } from '../api/client';

export default function RequirePortalAuth({ children }) {
  const location = useLocation();
  if (!isPlatformAuthed()) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }
  return children;
}
