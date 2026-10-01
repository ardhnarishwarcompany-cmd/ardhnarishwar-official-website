import { Navigate, useLocation } from 'react-router-dom';
import { isAuthed } from '../api/client';

export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!isAuthed()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
