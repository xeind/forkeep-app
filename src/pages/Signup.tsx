/**
 * LEGACY FILE - NOT CURRENTLY USED
 *
 * This is a simple, single-page signup form that was replaced by SignupWizard.tsx.
 *
 * Current routing (see src/main.tsx):
 * - /signup route → SignupWizard.tsx (multi-step wizard)
 *
 * This file is kept for reference and as a potential fallback/alternative signup flow.
 * If you want to use this instead of the wizard, update the route in src/main.tsx:
 *
 *   import Signup from './pages/Signup.tsx';
 *   <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
 *
 * Last Updated: Phase 2.2 (shadcn migration - Card + Alert components)
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { MotionButton } from '@/components/MotionButton';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
        lookingForGenders: ['Everyone'],
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
      <Card className="w-full max-w-md rounded-3xl border-0 bg-white/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-zinc-950/20 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <h1 className="rounded-md bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text pb-1 font-serif text-5xl leading-tight font-bold text-transparent">
            Forkeep
          </h1>
          <p className="font-serif text-sm text-gray-600">
            Create your profile and start matching
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <FormInput
                id="name"
                label="Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />

              <FormInput
                id="age"
                label="Age"
                type="number"
                required
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="18"
              />

              <FormInput
                id="email"
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <FormInput
                id="password"
                label="Password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <FormTextarea
                id="bio"
                label="Bio"
                required
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>

            <MotionButton
              type="submit"
              disabled={loading}
              gradientStyle="brand"
              className="w-full"
              size="lg"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </MotionButton>

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
        </CardContent>
      </Card>
    </div>
  );
}
