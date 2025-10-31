import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';
import { ProfileCardFront, ProfileCardBack } from '../components/ProfileCard';
import { MotionButton } from '../components/MotionButton';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  photoUrl: string;
  province?: string | null;
  city?: string | null;
  lookingForGenders: string[];
  birthday?: string | null;
  photos?: string[];
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    fetchProfile(userId);
    fetchMatchInfo(userId);
  }, [userId]);

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.profile.getById(id);
      setProfile(data.user);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchInfo = async (userId: string) => {
    try {
      const data = await api.matches.list();
      const match = data.matches.find((m) => m.matchedUser.id === userId);
      if (match) {
        setMatchId(match.id);
      }
    } catch (err) {
      console.error('Failed to fetch match info:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner color="#ec4899" size={48} />
          <p className="mt-4 text-gray-600">Loading profile.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">😕</div>
          <h2 className="text-2xl font-bold text-gray-800">
            Profile not found
          </h2>
          <p className="mt-2 text-gray-600">
            This user profile could not be loaded.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/matches')}
            className="mt-6 rounded-full bg-pink-500 px-6 py-3 font-medium text-white shadow-md ring-1 ring-pink-600/20 transition-all duration-200 ease-out hover:bg-pink-600 hover:shadow-lg"
          >
            Back
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative h-[600px] w-96">
          <motion.div
            onClick={() => setIsFlipped(!isFlipped)}
            className="absolute inset-0 cursor-pointer"
            style={{
              perspective: '1000px',
            }}
          >
            <motion.div
              animate={{
                rotateY: isFlipped ? 180 : 0,
              }}
              transition={{
                duration: 0.6,
                ease: [0.785, 0.135, 0.15, 0.86],
              }}
              style={{
                transformStyle: 'preserve-3d',
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0px)',
                  width: '100%',
                  height: '100%',
                }}
              >
                <ProfileCardFront
                  user={{
                    ...profile,
                    birthday: profile.birthday || undefined,
                    photos: [],
                  }}
                />
              </div>

              <div
                style={{
                  backfaceVisibility: 'hidden',
                  position: 'absolute',
                  inset: 0,
                  transform: 'rotateY(180deg) translateZ(0px)',
                  width: '100%',
                  height: '100%',
                }}
              >
                <ProfileCardBack
                  user={{
                    ...profile,
                    birthday: profile.birthday || undefined,
                    photos: [],
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="flex w-96 justify-between gap-3">
          <MotionButton
            onClick={() => navigate('/matches')}
            gradientStyle="gray"
            className="rounded-md px-6 py-3 text-base font-semibold"
            style={{
              fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif",
            }}
          >
            Back
          </MotionButton>

          {matchId && (
            <MotionButton
              onClick={() => navigate(`/chat/${matchId}`)}
              gradientStyle="brand"
              className="flex-1 rounded-md py-3 text-base font-semibold"
              style={{
                fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif",
              }}
            >
              Message
            </MotionButton>
          )}
        </div>
      </motion.div>
    </div>
  );
}
