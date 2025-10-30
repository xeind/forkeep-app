import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import PhotocardPreview from '../components/PhotocardPreview';
import {
  getAllProvinces,
  getCitiesByProvince,
} from '../data/philippinesLocations';
import { MotionButton } from '@/components/MotionButton';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import FormSelect from '@/components/FormSelect';

interface SignupFormData {
  name: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
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

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
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
      <motion.div
        layout
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md space-y-8 rounded-3xl bg-white/80 p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-950/20 backdrop-blur-xl"
      >
        <div className="text-center">
          <h1 className="bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text pb-1 text-5xl leading-tight font-bold text-transparent">
            Join Forkeep
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {currentStep === 1 && (
              <StepOne formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <StepTwo formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 3 && (
              <StepThree formData={formData} updateFormData={updateFormData} />
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
              <StepSix formData={formData} updateFormData={updateFormData} />
            )}
          </motion.div>
        </AnimatePresence>

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
              className="ml-auto bg-linear-to-r from-pink-500 to-purple-500 shadow-[0_10px_30px_-5px_rgba(236,72,153,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(236,72,153,0.5)]"
            >
              Next
            </MotionButton>
          ) : (
            <MotionButton
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto bg-linear-to-r from-pink-500 to-purple-500 shadow-[0_10px_30px_-5px_rgba(236,72,153,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(236,72,153,0.5)]"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </MotionButton>
          )}
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/"
            className="font-medium text-pink-600 transition-colors duration-200 hover:text-pink-500"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

interface StepProps {
  formData: SignupFormData;
  updateFormData: (field: keyof SignupFormData, value: string) => void;
}

interface PhotoStepProps {
  formData: SignupFormData;
  setFormData: React.Dispatch<React.SetStateAction<SignupFormData>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

function StepOne({ formData, updateFormData }: StepProps) {
  const provinces = getAllProvinces();
  const cities = formData.province
    ? getCitiesByProvince(formData.province)
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Let's start with the basics
        </h2>
      </div>

      <FormInput
        id="name"
        label="Name"
        type="text"
        required
        value={formData.name}
        onChange={(e) => updateFormData('name', e.target.value)}
        placeholder="Your name"
      />

      <FormInput
        id="age"
        label="Age"
        type="number"
        required
        min="18"
        max="100"
        value={formData.age}
        onChange={(e) => updateFormData('age', e.target.value)}
        placeholder="18"
      />

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
  );
}

function StepTwo({ formData, updateFormData }: StepProps) {
  const genderOptions = [
    { value: 'Male', icon: '♂️' },
    { value: 'Female', icon: '♀️' },
    { value: 'Non-binary', icon: '⚧️' },
    { value: 'Other', icon: '✨' },
  ];

  const preferenceOptions = [
    { value: 'Men', icon: '♂️' },
    { value: 'Women', icon: '♀️' },
    { value: 'Everyone', icon: '🌈' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Tell us about yourself
        </h2>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          I identify as...
        </label>
        <div className="grid grid-cols-4 gap-3">
          {genderOptions.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateFormData('gender', option.value)}
              title={option.value}
              className={`relative flex aspect-square items-center justify-center rounded-lg transition-all duration-200 ${
                formData.gender === option.value
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg ring-2 ring-pink-500/50'
                  : 'bg-white/60 ring-1 ring-zinc-950/10 hover:bg-white hover:ring-pink-500/30'
              }`}
            >
              <span className="text-4xl">{option.icon}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Interested in...
        </label>
        <div className="grid grid-cols-3 gap-3">
          {preferenceOptions.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateFormData('lookingFor', option.value)}
              title={option.value}
              className={`relative flex aspect-square items-center justify-center rounded-lg transition-all duration-200 ${
                formData.lookingFor === option.value
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg ring-2 ring-pink-500/50'
                  : 'bg-white/60 ring-1 ring-zinc-950/10 hover:bg-white hover:ring-pink-500/30'
              }`}
            >
              <span className="text-4xl">{option.icon}</span>
            </motion.button>
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
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-center text-2xl font-semibold text-gray-800">
          Add your photo
        </h2>
        <p className="text-center text-sm text-gray-600">
          This will be your main profile photo
        </p>
      </div>

      <PhotocardPreview
        photoUrl={formData.photoUrl}
        name={formData.name}
        age={formData.age}
        province={formData.province}
        city={formData.city}
      />

      <div>
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

    for (let i = 0; i < Math.min(files.length, 4); i++) {
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
        photos: [...prev.photos, ...validFiles].slice(0, 4),
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
          Upload 2-4 additional photos (optional)
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

      {formData.photos.length < 4 && (
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
                  {formData.photos.length}/4)
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">Select up to 4 images</p>
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
