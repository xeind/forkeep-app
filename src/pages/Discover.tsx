import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import SwipeCard from '../components/matching/SwipeCard';
import MatchModal from '../components/MatchModal';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { api, type User } from '../lib/api';

export default function Discover() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [exitingCard, setExitingCard] = useState<{ id: string; direction: 'left' | 'right' } | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [swiping, setSwiping] = useState(false);

  const BATCH_SIZE = 10;
  const FETCH_THRESHOLD = 3;

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
    const remainingUsers = users.length - currentIndex;
    if (remainingUsers <= FETCH_THRESHOLD && hasMore && !fetchingMore && !loading) {
      fetchMoreUsers();
    }
  }, [currentIndex, users.length, hasMore, fetchingMore, loading]);

  useEffect(() => {
    console.log('matchedUser state changed:', matchedUser);
  }, [matchedUser]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentIndex >= users.length || loading || !imagesLoaded || swiping) return;

      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, users, loading, imagesLoaded, swiping]);

  const preloadImages = async () => {
    const endIndex = Math.min(currentIndex + 5, users.length);
    const usersToPreload = users.slice(currentIndex, endIndex);
    
    const imagePromises = usersToPreload.map((user) => {
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
      const data = await api.users.discover(undefined, BATCH_SIZE);
      setUsers(data.users);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreUsers = async () => {
    if (!nextCursor || fetchingMore) return;

    try {
      setFetchingMore(true);
      const data = await api.users.discover(nextCursor, BATCH_SIZE);
      setUsers((prev) => [...prev, ...data.users]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch more users:', error);
    } finally {
      setFetchingMore(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (swiping) return;

    const currentUser = users[currentIndex];

    console.log(`Swiped ${direction} on ${currentUser.name}`);

    setSwiping(true);

    try {
      const result = await api.swipes.create(currentUser.id, direction);
      console.log('Swipe result:', result);

      if (result.match) {
        console.log('🎉 MATCH DETECTED! Setting matchedUser:', currentUser);
        setMatchedUser(currentUser);
      }

      setExitingCard({ id: currentUser.id, direction });
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Swipe failed:', error);
      setExitingCard({ id: currentUser.id, direction });
      setCurrentIndex((prev) => prev + 1);
    } finally {
      setSwiping(false);
    }
  };

  const handleExitComplete = () => {};

  const closeMatchModal = () => {
    setMatchedUser(null);
  };

  if (loading || !imagesLoaded) {
    return <LoadingState message="Loading profiles..." />;
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <EmptyState
        title="No more profiles for today!"
        message="Check back later for more matches"
        action={{
          label: 'Refresh',
          onClick: () => {
            setCurrentIndex(0);
            setImagesLoaded(false);
            fetchUsers();
          },
        }}
      />
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

        <AnimatePresence mode="popLayout" onExitComplete={() => setExitingCard(null)}>
          <SwipeCard
            key={currentUser.id}
            user={currentUser}
            onSwipe={handleSwipe}
            onExitComplete={handleExitComplete}
            exitDirection={exitingCard?.id === currentUser.id ? exitingCard.direction : null}
          />
        </AnimatePresence>
      </div>

      {matchedUser && (
        <MatchModal
          userName={matchedUser.name}
          userPhoto={matchedUser.photoUrl}
          userId={matchedUser.id}
          onClose={closeMatchModal}
        />
      )}
    </div>
  );
}
