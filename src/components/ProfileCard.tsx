import type { User } from '../lib/api';
import { User as UserIcon, Cake, Search } from 'lucide-react';

const formatPreferences = (lookingForGenders: string[]): string => {
  if (lookingForGenders.includes('Everyone')) {
    return 'Everyone';
  }

  const allOptions = ['Men', 'Women', 'Non-binary'];
  const hasAll = allOptions.every((option) =>
    lookingForGenders.includes(option)
  );

  if (hasAll) {
    return 'Everyone';
  }

  return lookingForGenders.join(' + ');
};

export function ProfileCardFront({ user }: { user: User }) {
  return (
    <div className="absolute h-[600px] w-96 overflow-hidden rounded-3xl bg-[#F5F5F5] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-600/20 select-none">
      <div className="relative h-[450px] w-full p-3">
        <div className="h-full w-full overflow-hidden rounded-tl-[20px] rounded-tr-[20px] rounded-br-md rounded-bl-md ring-1 ring-zinc-950/20">
          <img
            src={user.photoUrl}
            alt={user.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      </div>

      <div className="relative flex h-[220px] flex-col justify-between px-3 pb-6">
        <div>
          <div className="mb-2">
            <h2 className="font-serif text-3xl leading-none font-normal text-[#6b5d4f]">
              {user.name}
            </h2>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <span className="flex items-center font-serif text-2xl font-normal text-[#8b7d6f]">
              {user.age}
            </span>
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                user.gender === 'Male'
                  ? 'bg-blue-100 text-blue-700'
                  : user.gender === 'Female'
                    ? 'bg-pink-100 text-pink-700'
                    : user.gender === 'Non-binary'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-200 text-gray-700'
              }`}
            >
              <UserIcon className="h-3 w-3" />
              <span className="text-xs font-medium">{user.gender}</span>
            </div>
            {user.lookingForGenders && user.lookingForGenders.length > 0 && (
              <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                <Search className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {formatPreferences(user.lookingForGenders)}
                </span>
              </div>
            )}
            {user.birthday && (
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                <Cake className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {new Date(user.birthday).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {(user.city || user.province) && (
            <div className="">
              <span className="text-l font-serif font-normal text-[#8b7d6f]">
                {user.city && user.province
                  ? `${user.city}, ${user.province}`
                  : user.city || user.province}
              </span>
            </div>
          )}
        </div>

        <div className="text-center text-xs font-medium text-[#a8998a]">
          Tap to flip
        </div>
      </div>
    </div>
  );
}

export function ProfileCardBack({ user }: { user: User }) {
  return (
    <div className="absolute h-[600px] w-96 overflow-hidden rounded-3xl bg-[#FCFBF7] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-950/20 select-none">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'multiply',
        }}
      />
      <div className="relative z-10 flex h-full flex-col p-8">
        <div className="mb-6">
          <h3
            className="mb-2 text-3xl font-bold text-[#6b5d4f]"
            style={{ fontFamily: 'cursive' }}
          >
            About Me
          </h3>
          <div className="h-px bg-linear-to-r from-[#d4a5a5] via-[#d4c5b0] to-transparent" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold tracking-wide text-[#a8998a] uppercase">
              Bio
            </h4>
            <p className="leading-relaxed text-[#6b5d4f]">{user.bio}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-20 font-semibold text-[#6b5d4f]">Gender:</span>
              <span className="text-[#8b7d6f]">{user.gender}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-20 font-semibold text-[#6b5d4f]">Age:</span>
              <span className="text-[#8b7d6f]">{user.age}</span>
            </div>
            {user.lookingForGenders && user.lookingForGenders.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="w-20 font-semibold text-[#6b5d4f]">
                  Looking for:
                </span>
                <span className="font-medium text-[#8b7d6f]">
                  {formatPreferences(user.lookingForGenders)}
                </span>
              </div>
            )}
            {user.birthday && (
              <div className="flex items-center gap-3 text-sm">
                <span className="w-20 font-semibold text-[#6b5d4f]">
                  Birthday:
                </span>
                <span className="text-[#8b7d6f]">
                  {new Date(user.birthday).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {(user.city || user.province) && (
              <div className="flex items-center gap-3 text-sm">
                <span className="w-20 font-semibold text-[#6b5d4f]">
                  Location:
                </span>
                <span className="text-[#8b7d6f]">
                  {user.city && user.province
                    ? `${user.city}, ${user.province}`
                    : user.city || user.province}
                </span>
              </div>
            )}
          </div>

          {user.photos && user.photos.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold tracking-wide text-[#a8998a] uppercase">
                More Photos
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {user.photos
                  .filter((photo) => photo && photo.trim() !== '')
                  .slice(0, 6)
                  .map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-xl ring-1 ring-[#d4c5b0]/30"
                    >
                      <img
                        src={photo}
                        alt={`${user.name} ${i + 1}`}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs font-medium text-[#a8998a]">
          Tap to flip back
        </div>
      </div>
    </div>
  );
}

export default function ProfileCard({ user }: { user: User }) {
  return (
    <div className="relative">
      <ProfileCardFront user={user} />
    </div>
  );
}
