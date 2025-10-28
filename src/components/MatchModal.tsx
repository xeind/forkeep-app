import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface MatchModalProps {
  userName: string;
  userPhoto: string;
  onClose: () => void;
}

export default function MatchModal({ userName, userPhoto, onClose }: MatchModalProps) {
  const navigate = useNavigate();

  const handleViewMatches = () => {
    navigate('/matches');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        className="relative w-80 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 p-8 text-center text-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.25,
            ease: [0.215, 0.61, 0.355, 1],
          }}
        >
          <h2 className="text-4xl font-bold">It's a Match!</h2>
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

        <div className="space-y-3">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            onClick={handleViewMatches}
            className="w-full rounded-full bg-white px-6 py-3 font-semibold text-purple-600 transition-all duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Matches
          </motion.button>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.35,
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            onClick={onClose}
            className="w-full rounded-full border-2 border-white/50 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)]"
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.98 }}
          >
            Keep Swiping
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}