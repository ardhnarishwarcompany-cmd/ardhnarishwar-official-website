import { Navigate, useLocation } from 'react-router-dom';
import { isCandidateAuthed } from '../api/client';

export default function RequireCandidateAuth({ children }) {
  const location = useLocation();
  if (!isCandidateAuthed()) {
    return <Navigate to="/candidate/login" state={{ from: location }} replace />;
  }
  return children;
}
