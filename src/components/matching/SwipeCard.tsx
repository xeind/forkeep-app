import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react';
import ProfileCard from '../ProfileCard';
import { type User } from '../../lib/api';

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
  onExitComplete?: () => void;
  isBackground?: boolean;
  exitDirection?: 'left' | 'right' | null;
}

export default function SwipeCard({
  user,
  onSwipe,
  onExitComplete,
  isBackground = false,
  exitDirection,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -100], [0, 1]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 100;

    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
  };

  if (isBackground) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 0.95, opacity: 0.8 }}
        className="pointer-events-none absolute inset-0"
      >
        <ProfileCard user={user} />
      </motion.div>
    );
  }

  const exitX = exitDirection === 'right' ? 1000 : exitDirection === 'left' ? -1000 : x.get() > 0 ? 1000 : -1000;

  return (
    <motion.div
      style={{ x, y, rotate }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      initial={{ scale: 0.95, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        x: exitX,
        opacity: 0,
        transition: {
          duration: 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        },
      }}
      onAnimationComplete={(definition) => {
        if (definition === 'exit' && onExitComplete) {
          onExitComplete();
        }
      }}
      whileDrag={{ scale: 1.05 }}
      transition={{
        duration: 0.25,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      <div className="relative h-full w-full">
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute -inset-1 rounded-[28px] bg-green-500/40 blur-xl pointer-events-none"
        />

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute -inset-1 rounded-[28px] bg-red-500/40 blur-xl pointer-events-none"
        />

        <ProfileCard user={user} />
      </div>

      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-y-0 left-0 w-64 bg-linear-to-r from-red-600/30 to-transparent" />
      </motion.div>

      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-y-0 right-0 w-64 bg-linear-to-l from-green-700/30 to-transparent" />
      </motion.div>

      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute top-10 left-10 -rotate-12 rounded-xl border-4 border-red-500 px-6 py-3"
      >
        <span className="text-5xl font-bold text-red-500">NOPE</span>
      </motion.div>

      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute top-10 right-10 rotate-12 rounded-xl border-4 border-green-500 px-6 py-3 shadow-[0_0_30px_rgba(34,197,94,0.6)]"
      >
        <span className="text-5xl font-bold text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">LIKE</span>
      </motion.div>
    </motion.div>
  );
}
