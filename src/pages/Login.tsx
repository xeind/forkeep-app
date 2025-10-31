import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { MotionButton } from '@/components/MotionButton';
import FormInput from '@/components/FormInput';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <Card className="w-full max-w-md rounded-3xl border-0 bg-white/80 dark:bg-gray-800/80 p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-950/10 dark:ring-white/10 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <Link to="/" className="block">
            <h1
              className="cursor-pointer pb-1 text-5xl leading-tight font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 hover:text-pink-600"
              style={{
                fontFamily: "'Noto Serif', Georgia, 'Times New Roman', serif",
              }}
            >
              Forkeep
            </h1>
          </Link>
          <p className="font-serif text-sm text-gray-600 dark:text-gray-300">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
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

            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-pink-600 dark:text-pink-400 transition-colors duration-200 hover:text-pink-700 dark:hover:text-pink-300 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              Quick Test Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Alex', email: 'alex@forkeep.app' },
                { name: 'Ben', email: 'ben@forkeep.app' },
                { name: 'Ava', email: 'ava@forkeep.app' },
                { name: 'Chloe', email: 'chloe@forkeep.app' },
                { name: 'David', email: 'david@forkeep.app' },
              ].map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('password123');
                  }}
                  className="rounded-lg bg-gray-100 dark:bg-gray-700/60 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {account.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
