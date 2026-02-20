'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = preview || (user.profileImage
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.profileImage}`
    : undefined);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile data
      await api.patch('/users/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
      });

      // Upload photo if selected
      if (photoFile) {
        const photoFormData = new FormData();
        photoFormData.append('photo', photoFile);
        await api.post('/users/profile/photo', photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await refreshUser();
      toast.success('Profile updated successfully!');
      router.push('/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      <Card>
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-indigo-600 text-white text-4xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="photo-upload" className="absolute bottom-0 right-0 rounded-full cursor-pointer">
                <Button size="icon" variant="secondary" type="button" asChild>
                  <span>
                    <Camera className="h-4 w-4" />
                  </span>
                </Button>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <CardTitle className="text-2xl">Update Your Profile</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter phone number"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile')}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
