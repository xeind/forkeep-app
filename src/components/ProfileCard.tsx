import type { User } from '../lib/api';

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="absolute h-[600px] w-96 select-none overflow-hidden rounded-3xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_1px_0_rgba(0,0,0,0.2)] ring-1 ring-black/5 backdrop-blur-xl transition-shadow duration-300">
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src={user.photoUrl}
          alt={user.name}
          className="h-full w-full object-cover transition-transform duration-500"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>
      
      <div className="relative p-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            {user.name}
          </h2>
          <span className="text-2xl font-semibold text-gray-700">{user.age}</span>
        </div>

        <p className="text-sm leading-relaxed text-gray-600">{user.bio}</p>

        {user.location && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-pink-50 to-purple-50 px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-pink-200/50">
            <svg className="h-3.5 w-3.5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {user.location}
          </div>
        )}

        {user.photos && user.photos.length > 1 && (
          <div className="mt-5 flex gap-2">
            {user.photos.slice(0, 3).map((photo, i) => (
              <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-2xl ring-1 ring-black/5 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <img
                  src={photo}
                  alt={`${user.name} ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
