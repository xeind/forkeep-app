import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  photoUrl: string;
  location?: string;
  lookingFor: string;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    fetchProfile(userId);
    fetchMatchInfo(userId);
  }, [userId]);

  useEffect(() => {
    if (!matchId) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

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

  const fetchUnreadCount = async () => {
    if (!matchId) return;
    try {
      const data = await api.messages.getByMatch(matchId);
      const currentUserId = getCurrentUserId();
      const unread = data.messages.filter(
        (msg) => !msg.read && msg.receiverId === currentUserId
      ).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem('forkeep_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
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
          <h2 className="text-2xl font-bold text-gray-800">Profile not found</h2>
          <p className="mt-2 text-gray-600">
            This user profile could not be loaded.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/matches')}
            className="mt-6 rounded-full bg-pink-500 px-6 py-3 font-medium text-white shadow-md ring-1 ring-pink-600/20 transition-all duration-200 ease-out hover:bg-pink-600 hover:shadow-lg"
          >
            Back to Matches
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
            layout
            className="absolute h-[600px] w-96 overflow-hidden rounded-3xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-950/5"
          >
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20" />
            </div>
            <div className="p-6">
              <div className="flex justify-between">
                <h2 className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent">
                  {profile.name}
                </h2>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.age}
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>

              {profile.location && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-pink-50 to-purple-50 px-3 py-1.5">
                  <svg
                    className="h-3.5 w-3.5 text-pink-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-600">
                    {profile.location}
                  </span>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 rounded-xl bg-linear-to-r from-gray-50 to-gray-100 px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Gender:
                  </span>
                  <span className="text-sm text-gray-900">
                    {profile.gender}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-linear-to-r from-gray-50 to-gray-100 px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Looking for:
                  </span>
                  <span className="text-sm text-gray-900">
                    {profile.lookingFor}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {matchId && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => navigate(`/chat/${matchId}`)}
              className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 shadow-lg ring-1 ring-pink-600/20 transition-all duration-200 ease-out hover:bg-pink-600 hover:shadow-xl"
            >
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {unreadCount > 0 && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md ring-2 ring-white">
                  {unreadCount}
                </div>
              )}
            </motion.button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/matches')}
          className="w-96 rounded-full bg-linear-to-r from-gray-100 to-gray-200 px-6 py-3 font-semibold text-gray-700 shadow-md ring-1 ring-gray-300/50 transition-all duration-200 ease-out hover:shadow-lg"
        >
          Back to Matches
        </motion.button>
      </motion.div>
    </div>
  );
}
