import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import SwipeCard from '../components/matching/SwipeCard';
import MatchModal from '../components/MatchModal';
import EmptyState from '../components/common/EmptyState';
import { api, type User, type Match } from '../lib/api';
import { getAllProvinces, getCitiesByProvince } from '../data/philippinesLocations';

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
  const [showFilters, setShowFilters] = useState(false);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [provinces] = useState(getAllProvinces());
  const [cities, setCities] = useState<string[]>([]);

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
      const data = await api.users.discover(undefined, BATCH_SIZE, minAge, maxAge, selectedProvince, selectedCity);
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
      const data = await api.users.discover(nextCursor, BATCH_SIZE, minAge, maxAge, selectedProvince, selectedCity);
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

  const applyFilters = () => {
    setCurrentIndex(0);
    setUsers([]);
    cachedUsers = [];
    setNextCursor(null);
    setHasMore(true);
    setImagesLoaded(false);
    setInitialLoad(true);
    setShowFilters(false);
    fetchUsers();
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

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedCity('');
    if (province) {
      setCities(getCitiesByProvince(province));
    } else {
      setCities([]);
    }
  };

  const hasActiveFilters = minAge !== 18 || maxAge !== 99 || selectedProvince || selectedCity;

  const getFilterSummary = () => {
    const filters: Array<{ label: string; type: 'age' | 'location' }> = [];
    if (minAge !== 18 || maxAge !== 99) {
      filters.push({ label: `${minAge}-${maxAge} yrs`, type: 'age' });
    }
    if (selectedCity && selectedProvince) {
      filters.push({ label: `${selectedCity}, ${selectedProvince}`, type: 'location' });
    } else if (selectedProvince) {
      filters.push({ label: selectedProvince, type: 'location' });
    }
    return filters;
  };

  const clearAgeFilter = () => {
    setMinAge(18);
    setMaxAge(99);
  };

  const clearLocationFilter = () => {
    setSelectedProvince('');
    setSelectedCity('');
    setCities([]);
  };

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

      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-full px-6 py-3 font-medium shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all ${
            hasActiveFilters
              ? 'bg-pink-500/90 text-white dark:bg-pink-600/90'
              : 'bg-white/90 text-gray-700 dark:bg-gray-800/90 dark:text-gray-200'
          } dark:shadow-[0px_0px_1px_1px_rgba(255,255,255,0.05)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.5),0px_0px_0px_0.5px_rgba(255,255,255,0.1)]`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="flex h-2 w-2 items-center justify-center rounded-full bg-white dark:bg-pink-200" />
          )}
        </motion.button>

        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2"
          >
            {getFilterSummary().map((filter, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  if (filter.type === 'age') {
                    clearAgeFilter();
                  } else {
                    clearLocationFilter();
                  }
                  applyFilters();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 rounded-full bg-pink-500/90 px-3 py-2 text-xs font-medium text-white shadow-md backdrop-blur-xl transition-colors hover:bg-pink-600/90 dark:bg-pink-600/90 dark:hover:bg-pink-700/90"
              >
                {filter.label}
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="fixed bottom-24 left-1/2 z-40 w-[440px] -translate-x-1/2 rounded-3xl bg-white/95 p-6 shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_rgba(0,0,0,0.1)] backdrop-blur-xl dark:bg-gray-800/95 dark:shadow-[0px_0px_1px_1px_rgba(255,255,255,0.05)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.5),0px_0px_0px_0.5px_rgba(255,255,255,0.1)]"
          >
            <h3 className="mb-5 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Discovery Filters
            </h3>

            <div className="space-y-5">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Age Range
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Min Age: {minAge}
                    </label>
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={minAge}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= maxAge) {
                          setMinAge(value);
                        }
                      }}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg"
                      style={{
                        background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((minAge - 18) / (99 - 18)) * 100}%, #e5e7eb ${((minAge - 18) / (99 - 18)) * 100}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Max Age: {maxAge}
                    </label>
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={maxAge}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= minAge) {
                          setMaxAge(value);
                        }
                      }}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg"
                      style={{
                        background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((maxAge - 18) / (99 - 18)) * 100}%, #e5e7eb ${((maxAge - 18) / (99 - 18)) * 100}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Preferred Location
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Province
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 transition-all focus:ring-2 focus:ring-pink-500 dark:bg-gray-700/60 dark:text-gray-100 dark:ring-white/10 dark:focus:ring-pink-900/50"
                    >
                      <option value="">All Provinces</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProvince && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                        City
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 transition-all focus:ring-2 focus:ring-pink-500 dark:bg-gray-700/60 dark:text-gray-100 dark:ring-white/10 dark:focus:ring-pink-900/50"
                      >
                        <option value="">All Cities</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setMinAge(18);
                    setMaxAge(99);
                    setSelectedProvince('');
                    setSelectedCity('');
                    setCities([]);
                  }}
                  className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Clear All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyFilters}
                  className="flex-1 rounded-full bg-linear-to-b from-pink-500 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200"
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
