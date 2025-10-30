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
                layout
                className="absolute h-[600px] w-96 overflow-hidden rounded-3xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-950/10"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between">
                    <h2 className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent">
                      {profile.name}
                    </h2>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile.age}
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>

                  {(profile.city || profile.province) && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-pink-50 to-purple-50 px-3 py-1.5">
                      <svg
                        className="h-3.5 w-3.5 text-pink-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">
                        {profile.city && profile.province
                          ? `${profile.city}, ${profile.province}`
                          : profile.city || profile.province}
                      </span>
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 rounded-xl bg-linear-to-r from-gray-50 to-gray-100 px-4 py-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Gender:
                      </span>
                      <span className="text-sm text-gray-900">
                        {profile.gender}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-linear-to-r from-gray-50 to-gray-100 px-4 py-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Looking for:
                      </span>
                      <span className="text-sm text-gray-900">
                        {profile.lookingFor}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex w-96 gap-3">
              <MotionButton
                onClick={() => setEditing(true)}
                gradientStyle="brand"
                className="flex-1"
              >
                Edit Profile
              </MotionButton>
              <MotionButton
                onClick={handleLogout}
                variant="secondary"
                className="flex-1"
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
                    variant="secondary"
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
