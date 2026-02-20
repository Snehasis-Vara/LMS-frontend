'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UpdateProfileDto } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Trash2, Loader2 } from 'lucide-react';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateProfileDto>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
      setPreview(null);
    }
  }, [user, open]);

  const avatarUrl = user?.profileImage
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.profileImage}`
    : undefined;

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpg|jpeg|png)$/)) {
      toast.error('Only JPG/PNG images allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      await api.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshUser();
      toast.success('Profile photo updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      await api.delete('/users/profile/photo');
      await refreshUser();
      setPreview(null);
      toast.success('Profile photo removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Remove failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      toast.error('Invalid email format');
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error('Phone must be 10-15 digits');
      return;
    }

    if (formData.name && (formData.name.length < 2 || formData.name.length > 50)) {
      toast.error('Name must be 2-50 characters');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/users/profile', formData);
      await refreshUser();
      toast.success('Profile updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !uploading) {
      setPreview(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={preview || avatarUrl} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              {(avatarUrl || preview) && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            JPG/PNG, max 5MB. Click camera to upload.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading || uploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
