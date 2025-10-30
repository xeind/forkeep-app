import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';
import {
  getAllProvinces,
  getCitiesByProvince,
} from '../data/philippinesLocations';
import { MotionButton } from '@/components/MotionButton';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import FormSelect from '@/components/FormSelect';
import { ProfileCardFront, ProfileCardBack } from '@/components/ProfileCard';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  bio: string;
  photoUrl: string;
  province?: string | null;
  city?: string | null;
  lookingFor: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    province: '',
    city: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.profile.getMe();
      setProfile(data.user);
      setFormData({
        name: data.user.name,
        age: data.user.age.toString(),
        bio: data.user.bio,
        province: data.user.province || '',
        city: data.user.city || '',
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        setError('Please enter a valid age (18-100)');
        setSaving(false);
        return;
      }

      await api.profile.updateMe({
        name: formData.name,
        age: ageNum,
        bio: formData.bio,
        province: formData.province || undefined,
        city: formData.city || undefined,
      });

      await fetchProfile();
      setEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  const handleCardClick = () => {
    if (!editing) {
      setIsFlipped(!isFlipped);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner color="#ec4899" size={48} />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <button
            onClick={() => navigate('/discover')}
            className="mt-4 text-pink-600 hover:text-pink-500"
          >
            Go to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <AnimatePresence mode="wait">
        {!editing ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative h-[600px] w-96">
              <motion.div
                onClick={handleCardClick}
                className="absolute inset-0 cursor-pointer"
                style={{
                  perspective: '1000px',
                }}
              >
                <motion.div
                  animate={{
                    rotateY: isFlipped ? 180 : 0,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.785, 0.135, 0.15, 0.86],
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0px)',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <ProfileCardFront user={profile} />
                  </div>

                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      position: 'absolute',
                      inset: 0,
                      transform: 'rotateY(180deg) translateZ(0px)',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <ProfileCardBack user={profile} />
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <div className="flex w-96 gap-3">
              <MotionButton
                onClick={() => {
                  setEditing(true);
                  setIsFlipped(false);
                }}
                gradientStyle="brand"
                className="flex-1"
                size="default"
              >
                Edit Profile
              </MotionButton>
              <MotionButton
                onClick={handleLogout}
                gradientStyle="brand"
                className="flex-1"
                size="default"
              >
                Logout
              </MotionButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto w-96"
          >
            <motion.div
              layout
              className="overflow-hidden rounded-3xl bg-white/80 p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-950/10 backdrop-blur-xl"
            >
              <h2 className="mb-6 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-center text-2xl font-bold text-transparent">
                Edit Profile
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200"
                  >
                    {error}
                  </motion.div>
                )}

                <FormInput
                  id="name"
                  label="Name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <FormInput
                  id="age"
                  label="Age"
                  type="number"
                  required
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
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
                    setFormData({ ...formData, province: value, city: '' });
                  }}
                  options={getAllProvinces().map((province) => ({
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, city: value })
                    }
                    options={getCitiesByProvince(formData.province).map(
                      (city) => ({
                        value: city,
                        label: city,
                      })
                    )}
                    placeholder="Select city..."
                  />
                )}

                <FormTextarea
                  id="bio"
                  label="Bio"
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />

                <div className="flex gap-3 pt-2">
                  <MotionButton
                    type="submit"
                    disabled={saving}
                    gradientStyle="brand"
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </MotionButton>
                  <MotionButton
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile.name,
                        age: profile.age.toString(),
                        bio: profile.bio,
                        province: profile.province || '',
                        city: profile.city || '',
                      });
                    }}
                    gradientStyle="brand"
                    className="flex-1"
                  >
                    Cancel
                  </MotionButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
