import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import {
  getAllProvinces,
  getCitiesByProvince,
} from '../data/philippinesLocations';
import { MotionButton } from '@/components/MotionButton';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import FormSelect from '@/components/FormSelect';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CalendarIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SignupFormData {
  name: string;
  birthday: Date | undefined;
  age: string;
  province: string;
  city: string;
  gender: string;
  lookingFor: string;
  bio: string;
  email: string;
  password: string;
  photoUrl: string;
  photos: string[];
}

const TOTAL_STEPS = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function SignupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    birthday: undefined,
    age: '',
    province: '',
    city: '',
    gender: 'Other',
    lookingFor: 'Everyone',
    bio: '',
    email: '',
    password: '',
    photoUrl: '',
    photos: [],
  });

  const updateFormData = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const updateBirthday = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, birthday: date }));
    setError('');
  };

  const validateCurrentStep = (): boolean => {
    setError('');

    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          setError('Name is required');
          return false;
        }
        if (!formData.birthday) {
          setError('Birthday is required');
          return false;
        }
        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 18) {
          setError('You must be at least 18 years old');
          return false;
        }
        return true;

      case 2:
        return true;

      case 3:
        if (!formData.bio.trim()) {
          setError('Bio is required');
          return false;
        }
        if (formData.bio.trim().length < 10) {
          setError('Bio must be at least 10 characters');
          return false;
        }
        return true;

      case 4:
        if (!formData.photoUrl) {
          setError('Profile photo is required');
          return false;
        }
        return true;

      case 5:
        return true;

      case 6:
        if (!formData.email.trim()) {
          setError('Email is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setDirection('forward');
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        setError('Please enter a valid age (18-100)');
        setLoading(false);
        return;
      }

      if (!formData.photoUrl) {
        setError('Please upload a profile photo');
        setLoading(false);
        return;
      }

      await api.auth.signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        age: ageNum,
        gender: formData.gender,
        lookingFor: formData.lookingFor,
        bio: formData.bio,
        province: formData.province || undefined,
        city: formData.city || undefined,
        photoUrl: formData.photoUrl,
        photos: formData.photos.length > 0 ? formData.photos : undefined,
      });

      navigate('/discover');
    } catch (err: any) {
      console.error('Signup failed:', err);

      if (err.response?.status === 409) {
        setError('Email already in use. Please try a different email.');
      } else if (err.response?.status === 413) {
        setError('Images too large. Please use smaller photos.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(`Signup failed: ${err.message}`);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md backdrop-blur-xl">
        <Card className="space-y-8 rounded-3xl bg-white/80 p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-950/10">
          <CardHeader className="p-0">
            <div className="text-center">
              <Link to="/" className="block">
                <h1
                  className="cursor-pointer pb-1 text-5xl leading-tight font-bold text-gray-900 transition-colors duration-200 hover:text-pink-600"
                  style={{
                    fontFamily:
                      "'Noto Serif', Georgia, 'Times New Roman', serif",
                  }}
                >
                  Join Forkeep
                </h1>
              </Link>
              <p className="mt-3 text-sm text-gray-600">
                Step {currentStep} of {TOTAL_STEPS}
              </p>
              <Progress
                value={(currentStep / TOTAL_STEPS) * 100}
                className="mt-4 h-2"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-0">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{
                    opacity: 0,
                    x: direction === 'forward' ? 26 : -26,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: direction === 'forward' ? -26 : 26,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: [0.645, 0.045, 0.355, 1],
                  }}
                >
                  {currentStep === 1 && (
                    <StepOne
                      formData={formData}
                      updateFormData={updateFormData}
                      updateBirthday={updateBirthday}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepTwo
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  )}
                  {currentStep === 3 && (
                    <StepThree
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  )}
                  {currentStep === 4 && (
                    <StepFour
                      formData={formData}
                      setFormData={setFormData}
                      setError={setError}
                    />
                  )}
                  {currentStep === 5 && (
                    <StepFive
                      formData={formData}
                      setFormData={setFormData}
                      setError={setError}
                    />
                  )}
                  {currentStep === 6 && (
                    <StepSix
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
              {currentStep > 1 ? (
                <MotionButton
                  onClick={prevStep}
                  variant="outline"
                  className="font-semibold"
                >
                  Back
                </MotionButton>
              ) : (
                <div />
              )}

              {currentStep < TOTAL_STEPS ? (
                <MotionButton
                  onClick={nextStep}
                  gradientStyle="brand"
                  className="ml-auto"
                >
                  Next
                </MotionButton>
              ) : (
                <MotionButton
                  onClick={handleSubmit}
                  disabled={loading}
                  gradientStyle="brand"
                  className="ml-auto"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </MotionButton>
              )}
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/"
                className="font-medium text-pink-600 transition-colors duration-200 hover:text-pink-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StepProps {
  formData: SignupFormData;
  updateFormData: (field: keyof SignupFormData, value: string) => void;
  updateBirthday?: (date: Date | undefined) => void;
}

interface PhotoStepProps {
  formData: SignupFormData;
  setFormData: React.Dispatch<React.SetStateAction<SignupFormData>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

function StepOne({ formData, updateFormData, updateBirthday }: StepProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const provinces = getAllProvinces();
  const cities = formData.province
    ? getCitiesByProvince(formData.province)
    : [];

  const calculateAge = (birthday: Date): number => {
    const today = new Date();
    const age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    const dayDiff = today.getDate() - birthday.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return age - 1;
    }
    return age;
  };

  const handleBirthdaySelect = (date: Date | undefined) => {
    if (updateBirthday) {
      updateBirthday(date);
    }
    if (date) {
      const age = calculateAge(date);
      updateFormData('age', age.toString());
    }
    setIsCalendarOpen(false);
  };

  const getMaxBirthday = (): Date => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return maxDate;
  };

  const getDefaultMonth = (): Date => {
    return new Date(2000, 0, 1);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Let's start with the basics
        </h2>
      </div>

      <div className="space-y-4">
        <FormInput
          id="name"
          label="Name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Your name"
        />

        <div>
          <label htmlFor="birthday" className="mb-2 block text-sm font-medium text-gray-700">
            Birthday <span className="text-red-500">*</span>
          </label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                id="birthday"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-11 px-3 rounded-lg',
                  !formData.birthday && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birthday ? (
                  format(formData.birthday, 'PPP')
                ) : (
                  <span>Pick your birthday</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                defaultMonth={formData.birthday || getDefaultMonth()}
                selected={formData.birthday}
                onSelect={handleBirthdaySelect}
                disabled={{
                  after: getMaxBirthday(),
                  before: new Date(1900, 0, 1),
                }}
                captionLayout="dropdown"
                fromYear={1924}
                toYear={new Date().getFullYear()}
                className="rounded-lg border shadow-sm"
              />
            </PopoverContent>
          </Popover>
          {formData.birthday && (
            <p className="mt-1 text-sm text-gray-600">
              Age: {calculateAge(formData.birthday)} years old
            </p>
          )}
        </div>

        <FormSelect
          id="province"
          label={
            <>
              Province <span className="text-gray-400">(optional)</span>
            </>
          }
          value={formData.province}
          onValueChange={(value) => {
            updateFormData('province', value);
            updateFormData('city', '');
          }}
          options={provinces.map((province) => ({
            value: province,
            label: province,
          }))}
          placeholder="Select province..."
        />

        {formData.province && (
          <FormSelect
            id="city"
            label={
              <>
                City <span className="text-gray-400">(optional)</span>
              </>
            }
            value={formData.city}
            onValueChange={(value) => updateFormData('city', value)}
            options={cities.map((city) => ({ value: city, label: city }))}
            placeholder="Select city..."
          />
        )}
      </div>
    </div>
  );
}

function StepTwo({ formData, updateFormData }: StepProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const genderOptions = [
    { value: 'Male' },
    { value: 'Female' },
    { value: 'Non-binary' },
    { value: 'Other' },
  ];

  const preferenceOptions = [
    { value: 'Men' },
    { value: 'Women' },
    { value: 'Everyone' },
  ];

  const AnimatedButton = motion.create('button');

  const getColorClasses = (value: string, isSelected: boolean) => {
    if (!isSelected) {
      return 'bg-white/60 text-gray-700 ring-1 ring-zinc-950/10 hover:bg-white hover:ring-pink-500/30';
    }

    const colorMap: Record<string, string> = {
      Male: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_2px_8px_rgba(59,130,246,0.3),0_0_20px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/50',
      Men: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_2px_8px_rgba(59,130,246,0.3),0_0_20px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/50',
      Female:
        'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_0_0_1px_rgba(236,72,153,0.1),0_2px_8px_rgba(236,72,153,0.3),0_0_20px_rgba(236,72,153,0.15)] ring-2 ring-pink-500/50',
      Women:
        'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_0_0_1px_rgba(236,72,153,0.1),0_2px_8px_rgba(236,72,153,0.3),0_0_20px_rgba(236,72,153,0.15)] ring-2 ring-pink-500/50',
      'Non-binary':
        'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-[0_0_0_1px_rgba(168,85,247,0.1),0_2px_8px_rgba(168,85,247,0.3),0_0_20px_rgba(168,85,247,0.15)] ring-2 ring-purple-500/50',
      Other:
        'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-[0_0_0_1px_rgba(107,114,128,0.1),0_2px_8px_rgba(107,114,128,0.3),0_0_20px_rgba(107,114,128,0.15)] ring-2 ring-gray-500/50',
      Everyone:
        'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-[0_0_0_1px_rgba(147,51,234,0.1),0_2px_8px_rgba(147,51,234,0.3),0_0_20px_rgba(147,51,234,0.15)] ring-2 ring-purple-500/50',
    };

    return (
      colorMap[value] ||
      'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_0_0_1px_rgba(236,72,153,0.1),0_2px_8px_rgba(236,72,153,0.3),0_0_20px_rgba(236,72,153,0.15)] ring-2 ring-pink-500/50'
    );
  };

  const getIcon = (value: string) => {
    const icons = {
      Male: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="10" cy="14" r="6" />
          <line x1="14.5" y1="9.5" x2="20" y2="4" />
          <polyline points="16 4 20 4 20 8" />
        </svg>
      ),
      Female: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="8" r="6" />
          <line x1="12" y1="14" x2="12" y2="22" />
          <line x1="9" y1="19" x2="15" y2="19" />
        </svg>
      ),
      'Non-binary': (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="5.64" y1="5.64" x2="18.36" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="5.64" y2="18.36" />
        </svg>
      ),
      Other: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      Men: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="10" cy="14" r="6" />
          <line x1="14.5" y1="9.5" x2="20" y2="4" />
          <polyline points="16 4 20 4 20 8" />
        </svg>
      ),
      Women: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="8" r="6" />
          <line x1="12" y1="14" x2="12" y2="22" />
          <line x1="9" y1="19" x2="15" y2="19" />
        </svg>
      ),
      Everyone: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    };
    return icons[value as keyof typeof icons];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Tell us about yourself
        </h2>
      </div>

      <div>
        <div
          className="mb-3 text-sm font-medium text-gray-700"
          role="group"
          aria-label="Gender identity"
        >
          I identify as...
        </div>
        <div className="grid grid-cols-4 gap-3">
          {genderOptions.map((option) => (
            <div key={option.value} className="relative">
              <AnimatedButton
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateFormData('gender', option.value)}
                onMouseEnter={() => setHoveredButton(`gender-${option.value}`)}
                onMouseLeave={() => setHoveredButton(null)}
                className={`flex aspect-square w-full items-center justify-center rounded-lg transition-all duration-200 ${getColorClasses(
                  option.value,
                  formData.gender === option.value
                )}`}
              >
                {getIcon(option.value)}
              </AnimatedButton>
              {hoveredButton === `gender-${option.value}` && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg"
                >
                  {option.value}
                  <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div
          className="mb-3 text-sm font-medium text-gray-700"
          role="group"
          aria-label="Preference"
        >
          Interested in...
        </div>
        <div className="grid grid-cols-4 gap-3">
          {preferenceOptions.map((option) => (
            <div key={option.value} className="relative">
              <AnimatedButton
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateFormData('lookingFor', option.value)}
                onMouseEnter={() =>
                  setHoveredButton(`preference-${option.value}`)
                }
                onMouseLeave={() => setHoveredButton(null)}
                className={`flex aspect-square w-full items-center justify-center rounded-lg transition-all duration-200 ${getColorClasses(
                  option.value,
                  formData.lookingFor === option.value
                )}`}
              >
                {getIcon(option.value)}
              </AnimatedButton>
              {hoveredButton === `preference-${option.value}` && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg"
                >
                  {option.value}
                  <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepThree({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Share your story
        </h2>
      </div>

      <FormTextarea
        id="bio"
        label="Bio"
        required
        rows={5}
        value={formData.bio}
        onChange={(e) => updateFormData('bio', e.target.value)}
        placeholder="Tell us about yourself... What makes you unique? What are you passionate about?"
      />
    </div>
  );
}

function StepFour({ formData, setFormData, setError }: PhotoStepProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, photoUrl: base64String }));
        setUploading(false);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Add your photo
        </h2>
        <p className="text-center text-sm text-gray-600">
          This will be your main profile photo
        </p>
      </div>

      {formData.photoUrl && (
        <div className="flex justify-center">
          <img
            src={formData.photoUrl}
            alt="Profile preview"
            className="h-48 w-48 rounded-lg object-cover ring-1 ring-zinc-950/10"
          />
        </div>
      )}

      <label
        htmlFor="photo-upload"
        className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-white/60 p-6 text-center transition-all duration-200 hover:border-pink-400 hover:bg-pink-50/50"
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {uploading ? (
              <span className="font-medium text-pink-600">Uploading...</span>
            ) : (
              <>
                <span className="font-medium text-pink-600">
                  Click to upload
                </span>
                {' or drag and drop'}
              </>
            )}
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
        </div>
        <input
          id="photo-upload"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileUpload}
          className="sr-only"
          disabled={uploading}
        />
      </label>
    </div>
  );
}

function StepFive({ formData, setFormData, setError }: PhotoStepProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: string[] = [];
    let hasError = false;

    setUploading(true);
    setError('');

    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i];

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Please upload only JPEG, PNG, or WebP images');
        hasError = true;
        break;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('Each image must be less than 5MB');
        hasError = true;
        break;
      }

      try {
        const reader = new FileReader();
        const result = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        validFiles.push(result);
      } catch {
        setError('Failed to read one or more images');
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...validFiles].slice(0, 3),
      }));
    }

    setUploading(false);
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-center text-2xl font-semibold text-gray-800">
          Add more photos
        </h2>
        <p className="text-center text-sm text-gray-600">
          Upload 2-3 additional photos (optional)
        </p>
      </div>

      {formData.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {formData.photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={photo}
                alt={`Gallery ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-transform duration-200 hover:scale-110"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {formData.photos.length < 3 && (
        <label
          htmlFor="gallery-upload"
          className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-white/60 p-6 text-center transition-all duration-200 hover:border-pink-400 hover:bg-pink-50/50"
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-sm text-gray-600">
              {uploading ? (
                <span className="font-medium text-pink-600">Uploading...</span>
              ) : (
                <>
                  <span className="font-medium text-pink-600">Add photos</span>
                  {' ('}
                  {formData.photos.length}/3)
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">Select up to 3 images</p>
          </div>
          <input
            id="gallery-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileUpload}
            className="sr-only"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}

function StepSix({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Secure your account
        </h2>
      </div>

      <FormInput
        id="email"
        label="Email"
        type="email"
        required
        value={formData.email}
        onChange={(e) => updateFormData('email', e.target.value)}
        placeholder="you@example.com"
      />

      <div>
        <FormInput
          id="password"
          label="Password"
          type="password"
          required
          minLength={8}
          value={formData.password}
          onChange={(e) => updateFormData('password', e.target.value)}
          placeholder="••••••••"
        />
        <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
      </div>
    </div>
  );
}
