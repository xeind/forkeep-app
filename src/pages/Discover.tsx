import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import SwipeCard from '../components/matching/SwipeCard';
import MatchModal from '../components/MatchModal';
import EmptyState from '../components/common/EmptyState';
import { api, type User, type Match } from '../lib/api';

// Cache users across component remounts
let cachedUsers: User[] = [];

export default function Discover() {
  const [users, setUsers] = useState<User[]>(cachedUsers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(cachedUsers.length === 0);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(cachedUsers.length > 0);
  const [initialLoad, setInitialLoad] = useState(cachedUsers.length === 0);
  const [exitingCard, setExitingCard] = useState<{
    id: string;
    direction: 'left' | 'right';
  } | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [unviewedMatches, setUnviewedMatches] = useState<Match[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const BATCH_SIZE = 10;
  const FETCH_THRESHOLD = 3;

  useEffect(() => {
    checkUnviewedMatches();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      preloadImages();
    } else if (!loading) {
      setImagesLoaded(true);
      setInitialLoad(false);
    }
  }, [users, loading]);

  useEffect(() => {
    const remainingUsers = users.length - currentIndex;
    if (
      remainingUsers <= FETCH_THRESHOLD &&
      hasMore &&
      !fetchingMore &&
      !loading
    ) {
      fetchMoreUsers();
    }
  }, [currentIndex, users.length, hasMore, fetchingMore, loading]);

  useEffect(() => {
    console.log('matchedUser state changed:', matchedUser);
  }, [matchedUser]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentIndex >= users.length || loading || !imagesLoaded || swiping)
        return;

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
      setInitialLoad(false);
    } catch (error) {
      console.error('Failed to preload images:', error);
      setImagesLoaded(true);
      setInitialLoad(false);
    }
  };

  const checkUnviewedMatches = async () => {
    try {
      const { matches } = await api.matches.unviewed();
      if (matches.length > 0) {
        setUnviewedMatches(matches);
        setCurrentMatchIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch unviewed matches:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.users.discover(undefined, BATCH_SIZE);
      cachedUsers = data.users;
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
      const updatedUsers = [...users, ...data.users];
      cachedUsers = updatedUsers;
      setUsers(updatedUsers);
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
    setExitingCard({ id: currentUser.id, direction });

    try {
      const result = await api.swipes.create(currentUser.id, direction);
      console.log('Swipe result:', result);

      if (result.match && result.matchId) {
        console.log('🎉 MATCH DETECTED! Setting matchedUser:', currentUser);
        setMatchedUser(currentUser);
        setMatchId(result.matchId);
      }
    } catch (error) {
      console.error('Swipe failed:', error);
      // If already swiped, still animate card away (it shouldn't be in feed anyway)
    } finally {
      setSwiping(false);
    }
  };

  const handleExitComplete = () => {
    console.log('Exit complete');
    // Increment index after exit animation completes
    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      // Update cache to reflect swiped cards are gone
      cachedUsers = users.slice(newIndex);
      return newIndex;
    });
    setExitingCard(null);
  };

  const closeMatchModal = () => {
    setMatchedUser(null);
    setMatchId(null);
  };

  const closeUnviewedMatchModal = () => {
    if (currentMatchIndex < unviewedMatches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      setUnviewedMatches([]);
    }
  };

  // Show nothing while loading to avoid skeleton flash
  if (loading || !imagesLoaded || initialLoad) {
    return <div className="flex h-screen items-center justify-center" />;
  }

  const showEmptyState =
    (users.length === 0 || currentIndex >= users.length) &&
    !matchedUser &&
    !exitingCard &&
    !loading &&
    imagesLoaded &&
    !initialLoad;

  // Current card is always at currentIndex (exitingCard just controls animation)
  const currentUser = currentIndex < users.length ? users[currentIndex] : null;
  
  // Next card (background) is always currentIndex + 1
  const nextUser = currentIndex + 1 < users.length ? users[currentIndex + 1] : null;

  return (
    <>
      <div className="flex h-screen items-center justify-center">
        {showEmptyState ? (
          <EmptyState
            title="No more profiles for today!"
            message="Check back later for more matches"
            action={{
              label: 'Refresh',
              onClick: () => {
                setCurrentIndex(0);
                setImagesLoaded(false);
                setInitialLoad(true);
                fetchUsers();
              },
            }}
          />
        ) : currentUser ? (
          <div className="relative h-[600px] w-96">
            <AnimatePresence mode="popLayout">
              {nextUser && (
                <SwipeCard
                  key={nextUser.id}
                  user={nextUser}
                  onSwipe={() => {}}
                  isBackground
                />
              )}

              <SwipeCard
                key={currentUser.id}
                user={currentUser}
                onSwipe={handleSwipe}
                onExitComplete={handleExitComplete}
                exitDirection={
                  exitingCard?.id === currentUser.id
                    ? exitingCard.direction
                    : null
                }
              />
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      {unviewedMatches.length > 0 && unviewedMatches[currentMatchIndex] && (
        <MatchModal
          userName={unviewedMatches[currentMatchIndex].matchedUser.name}
          userPhoto={unviewedMatches[currentMatchIndex].matchedUser.photoUrl}
          userId={unviewedMatches[currentMatchIndex].matchedUser.id}
          matchId={unviewedMatches[currentMatchIndex].id}
          onClose={closeUnviewedMatchModal}
          currentIndex={currentMatchIndex}
          totalMatches={unviewedMatches.length}
          isUnviewedCarousel={true}
          allMatchIds={unviewedMatches.map((m) => m.id)}
        />
      )}

      {matchedUser && matchId && (
        <MatchModal
          userName={matchedUser.name}
          userPhoto={matchedUser.photoUrl}
          userId={matchedUser.id}
          matchId={matchId}
          onClose={closeMatchModal}
        />
      )}
    </>
  );
}
