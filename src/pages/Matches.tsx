import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api, type Match } from '../lib/api';
import Spinner from '../components/Spinner';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => {
      fetchUnreadCounts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await api.matches.list();
      setMatches(data.matches);
      await fetchUnreadCounts();
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const counts: Record<string, number> = {};
      await Promise.all(
        matches.map(async (match) => {
          const data = await api.messages.getByMatch(match.id);
          const currentUserId = getCurrentUserId();
          const unreadCount = data.messages.filter(
            (msg) => !msg.read && msg.receiverId === currentUserId
          ).length;
          counts[match.id] = unreadCount;
        })
      );
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Failed to fetch unread counts:', error);
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem('swaylo_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };

  const handleCardClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessageClick = (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation();
    navigate(`/chat/${matchId}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner color="#ec4899" size={48} />
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">💔</div>
          <h2 className="text-2xl font-bold text-gray-800">No matches yet</h2>
          <p className="mt-2 text-gray-600">
            Keep swiping to find your perfect match!
          </p>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/discover')}
            className="mt-6 rounded-full bg-pink-500 px-6 py-3 font-medium text-white shadow-md ring-1 ring-pink-600/20 transition-all duration-200 ease-out hover:bg-pink-600 hover:shadow-lg"
          >
            Start Swiping
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-start overflow-y-auto py-8">
      <div className="mx-auto max-w-4xl px-8">
        <div className="mb-8">
          <h1 className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
            Your Matches
          </h1>
          <p className="mt-2 text-gray-600">
            You have {matches.length}{' '}
            {matches.length === 1 ? 'match' : 'matches'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <div
              key={match.id}
              onClick={() => handleCardClick(match.matchedUser.id)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-zinc-950/5 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] active:scale-[0.98]"
            >
              {unreadCounts[match.id] > 0 && (
                <div className="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white shadow-lg ring-2 ring-white">
                  {unreadCounts[match.id]}
                </div>
              )}
              <div className="aspect-square overflow-hidden bg-linear-to-t from-black/20">
                <img
                  src={match.matchedUser.photoUrl}
                  alt={match.matchedUser.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="p-5">
                <h3 className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold text-transparent">
                  {match.matchedUser.name}, {match.matchedUser.age}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  {match.matchedUser.bio}
                </p>
                {match.matchedUser.location && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-linear-to-r from-pink-50 to-purple-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                    <svg
                      className="h-3 w-3 text-pink-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {match.matchedUser.location}
                  </div>
                )}
                <button
                  onClick={(e) => handleMessageClick(e, match.id)}
                  className="mt-3 flex w-full items-center text-sm font-semibold text-pink-600 transition-colors duration-200 hover:text-pink-700"
                >
                  <span>Send a message</span>
                  <svg
                    className="ml-1 h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
