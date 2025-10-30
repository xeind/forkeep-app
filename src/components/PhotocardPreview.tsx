import { motion } from 'motion/react';

interface PhotocardPreviewProps {
  photoUrl: string;
  name: string;
  age: string;
  province?: string;
  city?: string;
}

export default function PhotocardPreview({
  photoUrl,
  name,
  age,
  province,
  city,
}: PhotocardPreviewProps) {
  const today = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name || 'Preview'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center text-gray-400">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm">Upload a photo</p>
            </div>
          </div>
        )}

        <div className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-1 font-mono text-xs text-white/90 backdrop-blur-sm">
          {today}
        </div>
      </div>

      <div className="bg-white p-6">
        <h2 className="font-serif text-3xl font-bold text-gray-900">
          {name || 'Your Name'}
          {age && `, ${age}`}
        </h2>
        {(city || province) && (
          <p className="mt-1 flex items-center text-sm text-gray-600">
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {city && province ? `${city}, ${province}` : city || province}
          </p>
        )}
      </div>
    </motion.div>
  );
}
