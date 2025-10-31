import { Link, useLocation } from 'react-router-dom';
import { memo, useCallback } from 'react';
import { motion } from 'motion/react';

function Navbar() {
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  return (
    <nav
      className="fixed left-6 z-40 flex flex-col gap-2 rounded-3xl bg-white/80 dark:bg-gray-800/80 p-3 shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_rgba(0,0,0,0.1)] dark:shadow-[0px_0px_1px_1px_rgba(255,255,255,0.05)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.5),0px_0px_0px_0.5px_rgba(255,255,255,0.1)] backdrop-blur-xl"
      style={{
        top: '50%',
        transform: 'translate3d(0, -50%, 0)',
        willChange: 'transform',
      }}
    >
      <Link
        to="/discover"
        className={`group relative flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200 ease-out ${
          isActive('/discover')
            ? 'text-white'
            : 'text-zinc-400 dark:text-zinc-500 hover:scale-105 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500'
        }`}
        title="Discover"
      >
        {isActive('/discover') && (
          <motion.div
            layoutId="navGlow"
            className="absolute inset-0 rounded-xl bg-linear-to-b from-[#FB64B6] to-[#E60076] shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_#ec4899]"
            transition={{
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          />
        )}
        <svg
          className="relative z-10 h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </Link>

      <Link
        to="/matches"
        className={`group relative flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200 ease-out ${
          isActive('/matches')
            ? 'text-white'
            : 'text-zinc-400 dark:text-zinc-500 hover:scale-105 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500'
        }`}
        title="Matches"
      >
        {isActive('/matches') && (
          <motion.div
            layoutId="navGlow"
            className="absolute inset-0 rounded-xl bg-linear-to-b from-[#FB64B6] to-[#E60076] shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_#ec4899]"
            transition={{
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          />
        )}
        <svg
          className="relative z-10 h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>
      </Link>

      <Link
        to="/profile"
        className={`group relative flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200 ease-out ${
          isActive('/profile')
            ? 'text-white'
            : 'text-zinc-400 dark:text-zinc-500 hover:scale-105 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500'
        }`}
        title="Profile"
      >
        {isActive('/profile') && (
          <motion.div
            layoutId="navGlow"
            className="absolute inset-0 rounded-xl bg-linear-to-b from-[#FB64B6] to-[#E60076] shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_#ec4899]"
            transition={{
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          />
        )}
        <svg
          className="relative z-10 h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </Link>

      <div className="my-2 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent" />

      <Link
        to="/settings"
        className={`group relative flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200 ease-out ${
          isActive('/settings')
            ? 'text-white'
            : 'text-zinc-400 dark:text-zinc-500 hover:scale-105 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500'
        }`}
        title="Settings"
      >
        {isActive('/settings') && (
          <motion.div
            layoutId="navGlow"
            className="absolute inset-0 rounded-xl bg-linear-to-b from-[#FB64B6] to-[#E60076] shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_#ec4899]"
            transition={{
              duration: 0.25,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          />
        )}
        <svg
          className="relative z-10 h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </Link>
    </nav>
  );
}

export default memo(Navbar);
