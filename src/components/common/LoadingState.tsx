import Spinner from '../Spinner';
import { Skeleton } from '../ui/skeleton';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'profile-card';
}

export default function LoadingState({
  message = 'Loading...',
  variant = 'spinner',
}: LoadingStateProps) {
  if (variant === 'profile-card') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="relative h-[600px] w-96 overflow-hidden rounded-3xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_1px_0_rgba(0,0,0,0.2)] ring-1 ring-zinc-950/10">
          <Skeleton className="h-64 w-full rounded-none" />

          <div className="p-6">
            <div className="mb-3 flex items-end justify-between">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-8 w-12" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <Skeleton className="mt-3 h-7 w-32 rounded-full" />

            <div className="mt-5 flex gap-2">
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <Skeleton className="h-20 w-20 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Spinner color="#ec4899" size={48} />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
