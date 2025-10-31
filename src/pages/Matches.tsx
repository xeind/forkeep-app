import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api, type Match } from '../lib/api';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { ProfileCardFront } from '../components/ProfileCard';

import { MotionButton } from '../components/MotionButton';
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

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [unmatchDialogOpen, setUnmatchDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await api.matches.list();
      setMatches(data.matches);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
      setHasAnimated(true);
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
    <div className="flex h-screen items-start overflow-y-auto py-8 pl-[100px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        className="mx-auto max-w-4xl px-8"
      >
        <div className="mb-8 text-center">
          <h1
            style={{
              fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif",
            }}
            className="bg-linear-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-3xl font-bold text-transparent"
          >
            Your Matches
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            You have {matches.length}{' '}
            {matches.length === 1 ? 'match' : 'matches'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={hasAnimated ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.215, 0.61, 0.355, 1],
                delay: hasAnimated ? 0 : index * 0.05,
              }}
              className="flex h-[420px] w-full flex-col"
            >
              <div className="relative flex h-full flex-col items-center">
                <div
                  onClick={() => handleCardClick(match.matchedUser.id)}
                  className="relative cursor-pointer"
                  style={{
                    transform: 'scale(0.6)',
                    transformOrigin: 'top center',
                    width: '384px',
                    height: '600px',
                  }}
                >
                  <ProfileCardFront
                    user={{
                      ...match.matchedUser,
                      birthday: match.matchedUser.birthday || undefined,
                      photos: match.matchedUser.photos || [],
                    }}
                  />
                </div>

                <div
                  className="flex w-[230px] justify-between"
                  style={{ transform: 'translateY(-16px)' }}
                >
                  <MotionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnmatchClick(e, match.id, match.matchedUser.name);
                    }}
                    gradientStyle="gray"
                    className="rounded-md px-4 py-3 text-sm font-semibold"
                    style={{
                      fontFamily:
                        "'Noto Serif', Georgia, 'Times New Roman', serif",
                    }}
                  >
                    ✕
                  </MotionButton>

                  <MotionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessageClick(e, match.id);
                    }}
                    gradientStyle="brand"
                    className="ml-4 flex-1 rounded-md py-3 text-sm font-semibold"
                    style={{
                      fontFamily:
                        "'Noto Serif', Georgia, 'Times New Roman', serif",
                    }}
                  >
                    Message
                  </MotionButton>
                </div>
              </div>
            </motion.div>
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
