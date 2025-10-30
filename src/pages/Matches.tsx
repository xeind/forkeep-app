import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api, type Match } from '../lib/api';
import { getCurrentUserId } from '../utils/auth';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const MotionCard = motion.create(Card);

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [unmatchDialogOpen, setUnmatchDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{
    id: string;
    name: string;
  } | null>(null);
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
      const currentUserId = getCurrentUserId();
      await Promise.all(
        matches.map(async (match) => {
          const data = await api.messages.getByMatch(match.id);
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

  const handleCardClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessageClick = (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation();
    navigate(`/chat/${matchId}`);
  };

  const handleUnmatchClick = (
    e: React.MouseEvent,
    matchId: string,
    userName: string
  ) => {
    e.stopPropagation();
    setSelectedMatch({ id: matchId, name: userName });
    setUnmatchDialogOpen(true);
  };

  const handleUnmatchConfirm = async () => {
    if (!selectedMatch) return;

    try {
      await api.matches.delete(selectedMatch.id);
      setMatches((prev) => prev.filter((m) => m.id !== selectedMatch.id));
      setUnmatchDialogOpen(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to unmatch:', error);
      alert('Failed to unmatch. Please try again.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading matches..." />;
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        icon="💔"
        title="No matches yet"
        message="Keep swiping to find your perfect match!"
        action={{
          label: 'Start Swiping',
          onClick: () => navigate('/discover'),
        }}
      />
    );
  }

  return (
    <div className="flex h-screen items-start overflow-y-auto py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        className="mx-auto max-w-4xl px-8"
      >
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
            <MotionCard
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
              className="group overflow-hidden rounded-3xl border-zinc-950/10 p-0 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-zinc-950/10 transition-all duration-300 ease-out hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]"
            >
              <div
                onClick={() => handleCardClick(match.matchedUser.id)}
                className="cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
              >
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
                  {(match.matchedUser.city || match.matchedUser.province) && (
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
                      {[match.matchedUser.city, match.matchedUser.province]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 border-t border-gray-100 p-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
                  onClick={(e) =>
                    handleUnmatchClick(e, match.id, match.matchedUser.name)
                  }
                  className="flex items-center justify-center rounded-xl bg-gray-100 px-4 py-2.5 transition-all duration-200 ease-out hover:bg-gray-200"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
                  onClick={(e) => handleMessageClick(e, match.id)}
                  className="relative flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-500 py-2.5 font-semibold text-white shadow-md ring-1 ring-pink-600/20 transition-all duration-200 ease-out hover:bg-pink-600 hover:shadow-lg"
                >
                  <svg
                    className="h-4 w-4"
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
                  <span className="text-sm">Message</span>
                  {unreadCounts[match.id] > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs shadow-md ring-2 ring-white"
                    >
                      {unreadCounts[match.id]}
                    </Badge>
                  )}
                </motion.button>
              </div>
            </MotionCard>
          ))}
        </div>
      </motion.div>

      <AlertDialog open={unmatchDialogOpen} onOpenChange={setUnmatchDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unmatch with {selectedMatch?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will no longer be able to
              message each other and this match will be removed from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnmatchConfirm}
              className="rounded-xl bg-red-500 hover:bg-red-600"
            >
              Unmatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
