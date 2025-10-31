import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';
import { useTheme } from '../hooks/useTheme';

export default function Settings() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.profile.getMe();
        setEmail(data.user.email);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner color="#ec4899" size={48} />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-start overflow-y-auto py-8 pl-28">
      <div className="mx-auto w-full max-w-2xl px-8">
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-3xl font-bold text-transparent">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account</p>
          {email && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Logged in as{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-zinc-950/10 dark:ring-white/10 backdrop-blur-xl">
            <div className="border-b border-zinc-950/5 dark:border-white/10 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account</h2>
            </div>
            <div className="p-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full rounded-full bg-linear-to-b from-red-500 to-red-600 px-6 py-3 font-semibold text-white shadow-[0px_0px_1px_1px_rgba(255,255,255,0.08)_inset,0px_1px_1.5px_0px_rgba(0,0,0,0.32),0px_0px_0px_0.5px_#dc2626] transition-all duration-200 ease-out [text-shadow:0px_1px_1.5px_rgba(0,0,0,0.16)]"
              >
                Logout
              </motion.button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-zinc-950/10 dark:ring-white/10 backdrop-blur-xl">
            <div className="border-b border-zinc-950/5 dark:border-white/10 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
            </div>
            <div className="space-y-3 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose your interface theme</p>
              
              <div className="space-y-2">
                {(['light', 'dark', 'system'] as const).map((mode) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setTheme(mode)}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                      theme === mode
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        theme === mode ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        {mode === 'light' && (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                        {mode === 'dark' && (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        )}
                        {mode === 'system' && (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{mode}</p>
                        <p className={`text-xs ${theme === mode ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          {mode === 'light' && 'Always use light theme'}
                          {mode === 'dark' && 'Always use dark theme'}
                          {mode === 'system' && 'Match system preference'}
                        </p>
                      </div>
                    </div>
                    {theme === mode && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-zinc-950/10 dark:ring-white/10 backdrop-blur-xl">
            <div className="border-b border-zinc-950/5 dark:border-white/10 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">About</h2>
            </div>
            <div className="space-y-2 px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Version 0.0.1</p>
              <p>
                Made by Xein Virgines for{' '}
                <span className="">White Cloak Technologies</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
