import { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react';
import ProfileCard from '../components/ProfileCard';
import MatchModal from '../components/MatchModal';
import Spinner from '../components/Spinner';
import { api, type User } from '../lib/api';

function SwipeCard({
  user,
  onSwipe,
  onExitComplete,
  isBackground = false,
  swipeDirection,
}: {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
  onExitComplete?: () => void;
  isBackground?: boolean;
  swipeDirection?: 'left' | 'right' | null;
}) {
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
        x:
          swipeDirection === 'right'
            ? 1000
            : swipeDirection === 'left'
              ? -1000
              : x.get() > 0
                ? 1000
                : -1000,
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
      <ProfileCard user={user} />

      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute inset-y-0 left-0 w-64 bg-linear-to-r from-red-600/30 to-transparent"
      />

      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-linear-to-l from-green-700/30 to-transparent"
      />

      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute top-10 left-10 -rotate-12 rounded-xl border-4 border-red-500 px-6 py-3"
      >
        <span className="text-5xl font-bold text-red-500">NOPE</span>
      </motion.div>

      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute top-10 right-10 rotate-12 rounded-xl border-4 border-green-500 px-6 py-3"
      >
        <span className="text-5xl font-bold text-green-500">LIKE</span>
      </motion.div>
    </motion.div>
  );
}

export default function Discover() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [swipeDirections, setSwipeDirections] = useState<Record<string, 'left' | 'right'>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      preloadImages();
    } else if (!loading) {
      setImagesLoaded(true);
    }
  }, [users, loading]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentIndex >= users.length || loading || !imagesLoaded) return;

      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, users, loading, imagesLoaded]);

  const preloadImages = async () => {
    const imagePromises = users.slice(0, 5).map((user) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = user.photoUrl;
        img.onload = resolve;
        img.onerror = reject;

        if (user.photos) {
          user.photos.forEach((photoUrl) => {
            const photoImg = new Image();
            photoImg.src = photoUrl;
          });
        }
      });
    });

    try {
      await Promise.all(imagePromises);
      setImagesLoaded(true);
    } catch (error) {
      console.error('Failed to preload images:', error);
      setImagesLoaded(true);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.users.discover();
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentUser = users[currentIndex];

    console.log(`Swiped ${direction} on ${currentUser.name}`);

    setSwipeDirections((prev) => ({ ...prev, [currentUser.id]: direction }));
    setCurrentIndex((prev) => prev + 1);

    try {
      const result = await api.swipes.create(currentUser.id, direction);

      if (result.match) {
        setMatchedUser(currentUser);
      }
    } catch (error) {
      console.error('Swipe failed:', error);
    }
  };

  const handleExitComplete = () => {
  };

  const closeMatchModal = () => {
    setMatchedUser(null);
  };

  if (loading || !imagesLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner color="#ec4899" size={48} />
          <p className="mt-4 text-gray-600">Loading profiles.</p>
        </div>
      </div>
    );
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.3,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          className="text-center"
        >
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            className="text-2xl font-bold text-gray-800"
          >
            No more profiles for today!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            className="mt-2 text-gray-600"
          >
            Check back later for more matches
          </motion.p>
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{
              delay: 0.3,
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            onClick={() => {
              setCurrentIndex(0);
              setImagesLoaded(false);
              fetchUsers();
            }}
            className="mt-4 rounded-full bg-pink-500 px-6 py-3 font-medium text-white shadow-md ring-1 ring-pink-600/20 transition-all duration-200 ease-out hover:bg-pink-600"
          >
            Refresh
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentUser = users[currentIndex];
  const nextUser =
    currentIndex + 1 < users.length ? users[currentIndex + 1] : null;

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="relative h-[600px] w-96">
        {nextUser && (
          <SwipeCard user={nextUser} onSwipe={() => {}} isBackground />
        )}

        <AnimatePresence mode="popLayout">
          <SwipeCard
            key={currentUser.id}
            user={currentUser}
            onSwipe={handleSwipe}
            onExitComplete={handleExitComplete}
            swipeDirection={swipeDirections[currentUser.id] || null}
          />
        </AnimatePresence>
      </div>

      {matchedUser && (
        <MatchModal
          userName={matchedUser.name}
          userPhoto={matchedUser.photoUrl}
          onClose={closeMatchModal}
        />
      )}
    </div>
  );
}
