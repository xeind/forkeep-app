import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { toast } from 'sonner';

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
        toast.success(`You have ${totalMatches || 1} new ${totalMatches === 1 ? 'match' : 'matches'}! 💕`);
      } catch (error) {
        console.error('Failed to mark matches as viewed:', error);
      }
      navigate('/matches');
    } else {
      await api.matches.markAsViewed(matchId);
      toast.success(`It's a match with ${userName}! 🎉`);
      navigate(`/profile/${userId}`);
    }
  };

  const handleClose = () => {
    api.matches.markAsViewed(matchId).catch(console.error);
    onClose();
  };

  return (
    <DialogPrimitive.Root open={true} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20 dark:bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-[100] w-80 translate-x-[-50%] translate-y-[-50%] rounded-3xl border-0 bg-linear-to-b from-[#FB64B6] to-[#E60076] p-8 text-center text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 sm:max-w-[20rem]">
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
            <h2 className="font-serif text-4xl font-bold" style={{ fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif" }}>It's a Match!</h2>
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
              className="w-full rounded-md bg-white px-6 py-3 font-semibold text-[#E60076] transition-all duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)]"
              style={{ fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isUnviewedCarousel ? 'View Matches' : 'View Profile'}
            </motion.button>

            <motion.button
              onClick={handleClose}
              className="w-full rounded-md border-2 border-white/50 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)]"
              style={{ fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif" }}
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
