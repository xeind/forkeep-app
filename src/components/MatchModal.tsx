import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface MatchModalProps {
  userName: string;
  userPhoto: string;
  userId: string;
  matchId: string;
  onClose: () => void;
  currentIndex?: number;
  totalMatches?: number;
  isUnviewedCarousel?: boolean;
  allMatchIds?: string[];
}

export default function MatchModal({
  userName,
  userPhoto,
  userId,
  matchId,
  onClose,
  currentIndex,
  totalMatches,
  isUnviewedCarousel = false,
  allMatchIds = [],
}: MatchModalProps) {
  const navigate = useNavigate();
  const showCounter =
    currentIndex !== undefined &&
    totalMatches !== undefined &&
    totalMatches > 1;
  const isLastMatch =
    currentIndex !== undefined &&
    totalMatches !== undefined &&
    currentIndex === totalMatches - 1;

  const handlePrimaryAction = async () => {
    if (isUnviewedCarousel) {
      try {
        await api.matches.markAsViewed(matchId);
        if (allMatchIds.length > 0) {
          await Promise.all(
            allMatchIds
              .filter((id) => id !== matchId)
              .map((id) => api.matches.markAsViewed(id))
          );
        }
      } catch (error) {
        console.error('Failed to mark matches as viewed:', error);
      }
      navigate('/matches');
    } else {
      await api.matches.markAsViewed(matchId);
      navigate(`/profile/${userId}`);
    }
  };

  const handleClose = () => {
    api.matches.markAsViewed(matchId).catch(console.error);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        className="relative w-80 rounded-2xl bg-linear-to-br from-pink-500 to-purple-600 p-8 text-center text-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            mass: 0.5,
          }}
        >
          <h2 className="text-4xl font-bold">It's a Match!</h2>
          {showCounter && (
            <p className="mt-1 text-xs font-medium opacity-75">
              {currentIndex + 1} of {totalMatches}
            </p>
          )}
          <p className="mt-2 text-sm opacity-90">
            You and {userName} liked each other
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.25,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          className="my-6"
        >
          <img
            src={userPhoto}
            alt={userName}
            className="mx-auto h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
          />
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.25,
            ease: [0.215, 0.61, 0.355, 1],
          }}
        >
          <motion.button
            onClick={handlePrimaryAction}
            className="w-full rounded-full bg-white px-6 py-3 font-semibold text-purple-600 transition-all duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isUnviewedCarousel ? 'View Matches' : 'View Profile'}
          </motion.button>

          <motion.button
            onClick={handleClose}
            className="w-full rounded-full border-2 border-white/50 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)]"
            whileHover={{
              scale: 1.02,
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {isUnviewedCarousel && !isLastMatch ? 'Next' : 'Keep Swiping'}
          </motion.button>
        </motion.div>

        {showCounter && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.4,
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            className="mt-4 flex justify-center gap-1.5"
          >
            {Array.from({ length: totalMatches }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-200 ${
                  i === currentIndex ? 'w-4 bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

