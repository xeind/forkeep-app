import type { User } from '../lib/api';

export function ProfileCardFront({ user }: { user: User }) {
  return (
    <div className="absolute h-[600px] w-96 overflow-hidden rounded-3xl bg-[#f5f1e8] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-600/20 select-none">
      <div className="relative h-[420px] w-full p-3">
        <div className="h-full w-full overflow-hidden rounded-[12px] ring-1 ring-zinc-950/20">
          <img
            src={user.photoUrl}
            alt={user.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      </div>

      <div className="relative flex h-[180px] flex-col justify-between px-3 pt-4 pb-6">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <h2 className="font-serif text-4xl leading-none font-normal text-[#6b5d4f]">
              {user.name}
            </h2>
            <span className="ml-3 font-serif text-3xl font-normal text-[#8b7d6f]">
              {user.age}
            </span>
          </div>

          {(user.city || user.province) && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#f7d4d4] px-3 py-1.5 text-xs font-medium text-[#8b6b6b]">
              <svg
                className="h-3.5 w-3.5 text-[#d4a5a5]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {user.city && user.province
                ? `${user.city}, ${user.province}`
                : user.city || user.province}
            </div>
          )}
        </div>

        <div className="text-center text-xs font-medium text-[#a8998a]">
          Tap to see more
        </div>
      </div>
    </div>
  );
}

export function ProfileCardBack({ user }: { user: User }) {
  return (
    <div className="absolute h-[600px] w-96 overflow-hidden rounded-3xl bg-[#f5f1e8] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-950/20 select-none">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.30]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'multiply',
        }}
      />
      <div className="relative z-10 flex h-full flex-col p-8">
        <div className="mb-6">
          <h3 className="mb-2 font-serif text-2xl font-bold text-[#6b5d4f]">
            About {user.name}
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

          {user.photos && user.photos.length > 1 && (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold tracking-wide text-[#a8998a] uppercase">
                More Photos
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {user.photos.slice(0, 6).map((photo, i) => (
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
