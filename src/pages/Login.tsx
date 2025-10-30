import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { MotionButton } from '@/components/MotionButton';
import FormInput from '@/components/FormInput';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [buttonState, setButtonState] = useState<
    'idle' | 'loading' | 'success'
  >('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setButtonState('loading');

    try {
      await api.auth.login(email, password);
      setButtonState('success');
      setTimeout(() => {
        navigate('/discover');
      }, 800);
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login failed:', err);
      setButtonState('idle');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md rounded-3xl border-0 bg-white/80 p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-950/10 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <Link to="/" className="block">
            <h1
              className="cursor-pointer pb-1 text-5xl leading-tight font-bold text-gray-900 transition-colors duration-200 hover:text-pink-600"
              style={{
                fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif",
              }}
            >
              Forkeep
            </h1>
          </Link>
          <p className="font-serif text-sm text-gray-600">
            Connections worth keeping
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <MotionButton
                type="submit"
                gradientStyle="brand"
                buttonState={buttonState}
                loadingText="Signing In..."
                successText="Welcome!"
                className="w-full text-center"
                style={{
                  fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif",
                }}
                size="lg"
              >
                Sign In
              </MotionButton>
            </div>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-pink-600 transition-colors duration-200 hover:text-pink-700 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>

          {!import.meta.env.PROD && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Test: ben@forkeep.app / password123
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
