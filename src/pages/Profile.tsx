import { useState, useEffect, useMemo, type FormEvent } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import AnimatedCheckbox from '@/components/AnimatedCheckbox';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  birthday?: string | null;
  showBirthday?: boolean;
  gender: string;
  bio: string;
  photoUrl: string;
  photos?: string[];
  province?: string | null;
  city?: string | null;
  lookingFor: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editingPhotos, setEditingPhotos] = useState(false);
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
    birthday: null as Date | null,
    showBirthday: false,
  });
  const [photoData, setPhotoData] = useState({
    photoUrl: '',
    photos: [] as string[],
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
        age: data.user.age?.toString() || '',
        bio: data.user.bio,
        province: data.user.province || '',
        city: data.user.city || '',
        birthday: data.user.birthday ? new Date(data.user.birthday) : null,
        showBirthday: data.user.showBirthday ?? false,
      });
      setPhotoData({
        photoUrl: data.user.photoUrl,
        photos: data.user.photos || [],
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (
    file: File,
    isMainPhoto: boolean,
    index?: number
  ) => {
    setUploadingPhoto(true);
    setError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const photoUrl = reader.result as string;

        if (isMainPhoto) {
          setPhotoData((prev) => ({ ...prev, photoUrl }));
          await api.profile.updateMe({ photoUrl });
          setProfile((prev) => (prev ? { ...prev, photoUrl } : null));
        } else if (index !== undefined) {
          setPhotoData((prev) => {
            const newPhotos = [...prev.photos];
            newPhotos[index] = photoUrl;
            return { ...prev, photos: newPhotos };
          });

          const newPhotos = [...photoData.photos];
          newPhotos[index] = photoUrl;
          await api.profile.updateMe({ photos: newPhotos });
          setProfile((prev) => (prev ? { ...prev, photos: newPhotos } : null));
        }
      } catch (err) {
        console.error('Failed to upload photo:', err);
        setError('Failed to upload photo');
      } finally {
        setUploadingPhoto(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setUploadingPhoto(false);
    };

    reader.readAsDataURL(file);
  };

  const handlePhotoDelete = async (index: number) => {
    try {
      const newPhotos = photoData.photos.filter((_, i) => i !== index);
      setPhotoData((prev) => ({ ...prev, photos: newPhotos }));
      await api.profile.updateMe({ photos: newPhotos });
      setProfile((prev) => (prev ? { ...prev, photos: newPhotos } : null));
    } catch (err) {
      console.error('Failed to delete photo:', err);
      setError('Failed to delete photo');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let ageNum: number | undefined;

      if (formData.birthday) {
        const today = new Date();
        const birthDate = new Date(formData.birthday);
        ageNum = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          ageNum--;
        }

        if (ageNum < 18) {
          setError('You must be at least 18 years old');
          setSaving(false);
          return;
        }
      } else if (formData.age) {
        ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
          setError('Please enter a valid age (18-100)');
          setSaving(false);
          return;
        }
      }

      await api.profile.updateMe({
        name: formData.name,
        age: ageNum,
        bio: formData.bio,
        province: formData.province || undefined,
        city: formData.city || undefined,
        birthday: formData.birthday ? formData.birthday.toISOString() : null,
        showBirthday: formData.showBirthday,
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

  const handleCardClick = () => {
    if (!editing) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleShowBirthdayToggle = async (checked: boolean) => {
    const previousValue = formData.showBirthday;

    setFormData((prev) => ({ ...prev, showBirthday: checked }));
    setProfile((prev) => (prev ? { ...prev, showBirthday: checked } : null));

    try {
      await api.profile.updateMe({
        showBirthday: checked,
      });
    } catch (err) {
      console.error('Failed to update birthday visibility:', err);
      setFormData((prev) => ({ ...prev, showBirthday: previousValue }));
      setProfile((prev) =>
        prev ? { ...prev, showBirthday: previousValue } : null
      );
    }
  };

  const previewProfile = useMemo(
    () =>
      profile
        ? {
            ...profile,
            birthday: profile.showBirthday ? profile.birthday : null,
          }
        : profile,
    [profile]
  );

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

  if (!profile || !previewProfile) {
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
        {!editing && !editingPhotos ? (
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
                    <ProfileCardFront user={previewProfile} />
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
                    <ProfileCardBack user={previewProfile} />
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <div className="flex w-96 justify-end gap-3">
              <MotionButton
                onClick={() => {
                  setEditingPhotos(true);
                  setIsFlipped(false);
                }}
                gradientStyle="brand"
                size="default"
              >
                Edit Photos
              </MotionButton>
              <MotionButton
                onClick={() => {
                  setEditing(true);
                  setIsFlipped(false);
                }}
                gradientStyle="brand"
                size="default"
              >
                Edit Profile
              </MotionButton>
            </div>
          </motion.div>
        ) : editingPhotos ? (
          <motion.div
            key="photos"
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
                Edit Photos
              </h2>

              <div className="space-y-6">
                {uploadingPhoto && (
                  <div className="rounded-lg bg-pink-50 p-3 text-center text-sm text-pink-600 ring-1 ring-pink-200">
                    Uploading photo...
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Main Photo
                    </label>
                    <div className="relative mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file, true);
                        }}
                        className="hidden"
                        id="main-photo-upload"
                      />
                      <label
                        htmlFor="main-photo-upload"
                        className="group relative block aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200 transition-all hover:ring-2 hover:ring-pink-400"
                      >
                        <img
                          src={photoData.photoUrl}
                          alt="Main photo"
                          className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="rounded-full bg-white/90 p-3">
                            <svg
                              className="h-6 w-6 text-gray-700"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Additional Photos (3)
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(file, false, index);
                            }}
                            className="hidden"
                            id={`photo-upload-${index}`}
                          />
                          <label
                            htmlFor={`photo-upload-${index}`}
                            className="group relative block aspect-[3/4] cursor-pointer overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200 transition-all hover:ring-2 hover:ring-pink-400"
                          >
                            {photoData.photos[index] ? (
                              <>
                                <img
                                  src={photoData.photos[index]}
                                  alt={`Photo ${index + 1}`}
                                  className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePhotoDelete(index);
                                    }}
                                    className="rounded-full bg-red-500/90 p-2 transition-colors hover:bg-red-600"
                                  >
                                    <svg
                                      className="h-5 w-5 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-400 transition-colors group-hover:text-pink-500">
                                <svg
                                  className="h-8 w-8"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-2">
                  <MotionButton
                    type="button"
                    onClick={() => setEditingPhotos(false)}
                    gradientStyle="brand"
                    className="flex-1"
                  >
                    Done
                  </MotionButton>
                </div>
              </div>
            </motion.div>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Birthday <span className="text-gray-400">(optional)</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm transition-all hover:border-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
                      >
                        <span
                          className={
                            formData.birthday
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }
                        >
                          {formData.birthday
                            ? formData.birthday.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Select your birthday'}
                        </span>
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.birthday || undefined}
                        onSelect={(date) =>
                          setFormData({ ...formData, birthday: date || null })
                        }
                        disabled={(date) => {
                          const today = new Date();
                          const eighteenYearsAgo = new Date(
                            today.getFullYear() - 18,
                            today.getMonth(),
                            today.getDate()
                          );
                          return (
                            date > eighteenYearsAgo ||
                            date < new Date(1900, 0, 1)
                          );
                        }}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1940}
                        toYear={new Date().getFullYear() - 18}
                      />
                    </PopoverContent>
                  </Popover>
                  {formData.birthday && (
                    <p className="text-xs text-gray-500">
                      Age:{' '}
                      {(() => {
                        const today = new Date();
                        const birthDate = new Date(formData.birthday);
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff =
                          today.getMonth() - birthDate.getMonth();
                        if (
                          monthDiff < 0 ||
                          (monthDiff === 0 &&
                            today.getDate() < birthDate.getDate())
                        ) {
                          age--;
                        }
                        return age;
                      })()}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 p-4">
                  <div className="flex-1">
                    <label
                      htmlFor="showBirthday"
                      className="text-sm font-medium text-gray-700"
                    >
                      Show my birthday on profile
                    </label>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Others will {formData.showBirthday ? 'see' : 'not see'}{' '}
                      your birthday
                    </p>
                  </div>
                  <AnimatedCheckbox
                    checked={formData.showBirthday}
                    onChange={handleShowBirthdayToggle}
                  />
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

                <div className="flex justify-between gap-3 pt-2">
                  <MotionButton
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile.name,
                        age: profile.age?.toString() || '',
                        bio: profile.bio,
                        province: profile.province || '',
                        city: profile.city || '',
                        birthday: profile.birthday
                          ? new Date(profile.birthday)
                          : null,
                        showBirthday: profile.showBirthday ?? false,
                      });
                    }}
                    gradientStyle="brand"
                    className="flex-1"
                  >
                    Cancel
                  </MotionButton>
                  <MotionButton
                    type="submit"
                    disabled={saving}
                    gradientStyle="brand"
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
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
