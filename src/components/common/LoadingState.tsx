import Spinner from '../Spinner';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Spinner color="#ec4899" size={48} />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
