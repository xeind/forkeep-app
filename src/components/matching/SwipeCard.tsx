import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react';
import { useState, useRef } from 'react';
import { ProfileCardFront, ProfileCardBack } from '../ProfileCard';
import { type User } from '../../lib/api';

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
  onExitComplete?: () => void;
  isBackground?: boolean;
  exitDirection?: 'left' | 'right' | null;
  onDragStateChange?: (isDragging: boolean) => void;
}

export default function SwipeCard({
  user,
  onSwipe,
  onExitComplete,
  isBackground = false,
  exitDirection,
  onDragStateChange,
}: SwipeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const isDraggingRef = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const likeOpacity = useTransform(x, [0, 300], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -300], [0, 1]);

  const handleDragStart = () => {
    isDraggingRef.current = true;
    onDragStateChange?.(true);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 100;

    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }

    onDragStateChange?.(false);

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleClick = () => {
    if (!isDraggingRef.current && !isFlipping) {
      setIsFlipping(true);
      setIsFlipped(!isFlipped);

      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
    }
  };

  if (isBackground) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: 0.95,
          opacity: 0.8,
        }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 20,
          mass: 0.8,
          duration: 0.6,
        }}
        className="pointer-events-none absolute inset-0"
        style={{ filter: 'blur(12px)' }}
      >
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
          <ProfileCardFront user={user} />
        </div>
      </motion.div>
    );
  }

  const exitX =
    exitDirection === 'right'
      ? 1000
      : exitDirection === 'left'
        ? -1000
        : x.get() > 0
          ? 1000
          : -1000;

  return (
    <motion.div
      style={{ x, y }}
      drag={!isFlipping}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`absolute inset-0 ${!isFlipping ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
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
        type: 'spring',
        stiffness: 120,
        damping: 20,
        mass: 0.8,
        duration: 0.6,
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          perspective: '1000px',
        }}
      >
        <motion.div
          className="relative h-full w-full"
          style={{
            rotate,
            transformStyle: 'preserve-3d',
          }}
        >
          {!isFlipping && (
            <>
              <motion.div
                style={{ opacity: likeOpacity }}
                className="pointer-events-none absolute -inset-1 z-10 rounded-[28px] bg-green-500/40 blur-xl"
              />

              <motion.div
                style={{ opacity: nopeOpacity }}
                className="pointer-events-none absolute -inset-1 z-10 rounded-[28px] bg-red-500/40 blur-xl"
              />

              <motion.div
                style={{ opacity: nopeOpacity }}
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl"
              >
                <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-red-600/30 to-transparent" />
              </motion.div>

              <motion.div
                style={{ opacity: likeOpacity }}
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl"
              >
                <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-green-700/30 to-transparent" />
              </motion.div>

              <motion.div
                style={{ opacity: nopeOpacity }}
                className="pointer-events-none absolute top-10 left-10 z-30 -rotate-12 rounded-xl border-4 border-red-500 px-6 py-3"
              >
                <span className="text-5xl font-bold text-red-500">NOPE</span>
              </motion.div>

              <motion.div
                style={{ opacity: likeOpacity }}
                className="pointer-events-none absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
              >
                <motion.svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  className="drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                  style={{ rotate: -15 }}
                >
                  <path
                    d="M90 150c-3.5 0-6.5-2-8-5-15-30-45-50-45-75 0-20 15-35 35-35 10 0 18 4 23 10 5-6 13-10 23-10 20 0 35 15 35 35 0 25-30 45-45 75-1.5 3-4.5 5-8 5z"
                    fill="#dc2626"
                    opacity="0.9"
                  />
                  <ellipse
                    cx="90"
                    cy="90"
                    rx="85"
                    ry="88"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="8"
                    opacity="0.7"
                  />
                  <text
                    x="90"
                    y="160"
                    textAnchor="middle"
                    className="font-serif text-2xl font-bold"
                    fill="#dc2626"
                    opacity="0.8"
                  >
                    LIKED
                  </text>
                </motion.svg>
              </motion.div>
            </>
          )}

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
            {/* Front outer face */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0px)',
                width: '100%',
                height: '100%',
              }}
            >
              <ProfileCardFront user={user} />
            </div>

            {/* Back outer face - rotated 180deg to face opposite direction */}
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
              <ProfileCardBack user={user} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
