import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../lib/api';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        setError('Please enter a valid age (18-100)');
        setLoading(false);
        return;
      }

      await api.auth.signup({
        email,
        password,
        name,
        age: ageNum,
        gender: 'Other',
        lookingFor: 'Everyone',
        bio,
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
      });

      navigate('/discover');
    } catch (err) {
      setError('Signup failed. Email might already be in use.');
      console.error('Signup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white/80 p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-white/20 backdrop-blur-xl">
        <div className="text-center">
          <h1 className="bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text pb-1 text-5xl font-bold leading-tight text-transparent">
            Join Swaylo
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Create your profile and start matching
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border-0 bg-white/60 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-zinc-950/10 transition-all duration-200 ring-inset placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-gray-700"
              >
                Age
              </label>
              <input
                id="age"
                type="number"
                required
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 block w-full rounded-lg border-0 bg-white/60 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-zinc-950/10 transition-all duration-200 ring-inset placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                placeholder="18"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border-0 bg-white/60 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-zinc-950/10 transition-all duration-200 ring-inset placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border-0 bg-white/60 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-zinc-950/10 transition-all duration-200 ring-inset placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                required
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 block w-full resize-none rounded-lg border-0 bg-white/60 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-zinc-950/10 transition-all duration-200 ring-inset placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-6 py-3.5 font-semibold text-white shadow-[0_10px_30px_-5px_rgba(236,72,153,0.4)] ring-1 ring-pink-600/20 transition-all duration-200 ease-out hover:shadow-[0_15px_40px_-5px_rgba(236,72,153,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </motion.button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/"
              className="font-medium text-pink-600 transition-colors duration-200 hover:text-pink-500"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
