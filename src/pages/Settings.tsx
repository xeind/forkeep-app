import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';

export default function Settings() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
          <h1 className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
            Settings
          </h1>
          <p className="mt-2 text-gray-600">Manage your account</p>
          {email && (
            <p className="mt-3 text-sm text-gray-500">
              Logged in as{' '}
              <span className="font-medium text-gray-700">{email}</span>
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl bg-white/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-zinc-950/10 backdrop-blur-xl">
            <div className="border-b border-zinc-950/5 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Account</h2>
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

          <div className="overflow-hidden rounded-3xl bg-white/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-zinc-950/10 backdrop-blur-xl">
            <div className="border-b border-zinc-950/5 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">About</h2>
            </div>
            <div className="space-y-2 px-6 py-4 text-sm text-gray-600">
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
