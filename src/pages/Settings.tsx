import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import AnimatedCheckbox from '../components/AnimatedCheckbox';
import { api } from '../lib/api';

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen items-start overflow-y-auto py-8">
      <div className="mx-auto max-w-4xl px-8">
        <div className="mb-8">
          <h1 className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
            Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl bg-white/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-white/20 backdrop-blur-xl">
            <div className="border-b border-zinc-950/5 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
            </div>
            <div className="divide-y divide-zinc-950/5">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h3 className="font-medium text-gray-900">New Matches</h3>
                  <p className="text-sm text-gray-600">
                    Get notified when you have a new match
                  </p>
                </div>
                <AnimatedCheckbox defaultChecked />
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h3 className="font-medium text-gray-900">Messages</h3>
                  <p className="text-sm text-gray-600">
                    Get notified when you receive a message
                  </p>
                </div>
                <AnimatedCheckbox defaultChecked />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-white/20 backdrop-blur-xl">
            <div className="border-b border-zinc-950/5 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Privacy</h2>
            </div>
            <div className="divide-y divide-zinc-950/5">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h3 className="font-medium text-gray-900">Show Distance</h3>
                  <p className="text-sm text-gray-600">
                    Display distance on your profile
                  </p>
                </div>
                <AnimatedCheckbox defaultChecked />
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h3 className="font-medium text-gray-900">Show Age</h3>
                  <p className="text-sm text-gray-600">
                    Display your age on your profile
                  </p>
                </div>
                <AnimatedCheckbox defaultChecked />
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-white/20 backdrop-blur-xl">
            <div className="border-b border-zinc-950/5 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Account</h2>
            </div>
            <div className="space-y-4 p-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full rounded-full bg-linear-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white shadow-[0_10px_30px_-5px_rgba(239,68,68,0.4)] ring-1 ring-red-600/20 transition-all duration-200 ease-out hover:shadow-[0_15px_40px_-5px_rgba(239,68,68,0.5)]"
              >
                Logout
              </motion.button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] ring-1 ring-white/20 backdrop-blur-xl">
            <div className="border-b border-zinc-950/5 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">About</h2>
            </div>
            <div className="space-y-2 px-6 py-4 text-sm text-gray-600">
              <p>Version 1.0.0</p>
              <p>Made with ❤️ by Swaylo Team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
