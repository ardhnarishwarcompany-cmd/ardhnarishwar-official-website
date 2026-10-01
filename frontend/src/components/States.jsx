export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="py-24 text-center text-muted text-sm">{label}</div>
  );
}

export function ErrorState({ message = 'Something went wrong. Please check that the backend server is running.' }) {
  return (
    <div className="py-24 text-center text-muted text-sm max-w-md mx-auto">
      {message}
    </div>
  );
}
