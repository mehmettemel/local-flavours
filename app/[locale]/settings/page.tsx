'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, profile, updateProfile, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [collectionVoteNotifications, setCollectionVoteNotifications] =
    useState(true);
  const [newFollowerNotifications, setNewFollowerNotifications] =
    useState(true);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    console.log('🔍 Settings page - loading:', loading, 'user:', !!user, 'profile:', !!profile);
    if (!loading && !user) {
      console.log('⚠️ Not authenticated, redirecting to login...');
      router.push('/?auth=login');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  useEffect(() => {
    async function loadPreferences() {
      if (!user) return;

      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setEmailNotifications(data.email_notifications);
        setCollectionVoteNotifications(data.collection_vote_notifications);
        setNewFollowerNotifications(data.new_follower_notifications);
      }
    }

    loadPreferences();
  }, [user]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If no user after loading, they'll be redirected by useEffect
  if (!user || !profile) {
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await updateProfile({ username });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setSaving(false);
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreferencesLoading(true);

    const { error } = await supabase
      .from('user_preferences')
      .update({
        email_notifications: emailNotifications,
        collection_vote_notifications: collectionVoteNotifications,
        new_follower_notifications: newFollowerNotifications,
      })
      .eq('user_id', user.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setPreferencesLoading(false);
  };

  return (
    <div className="container max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Settings
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Manage your account settings and preferences
        </p>
      </div>

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          Settings updated successfully!
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={saving}
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-neutral-100 dark:bg-neutral-800"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Contact support to change your email address
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Collections
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {profile.collections_count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Followers
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {profile.followers_count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Following
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {profile.following_count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Trust Score
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {profile.trust_score || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePreferencesUpdate} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Receive email notifications
                </p>
              </div>
              <input
                id="email-notifications"
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="collection-votes">Collection Votes</Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Get notified when someone votes on your collection
                </p>
              </div>
              <input
                id="collection-votes"
                type="checkbox"
                checked={collectionVoteNotifications}
                onChange={(e) =>
                  setCollectionVoteNotifications(e.target.checked)
                }
                className="h-4 w-4"
                disabled={!emailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-followers">New Followers</Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Get notified when someone follows you
                </p>
              </div>
              <input
                id="new-followers"
                type="checkbox"
                checked={newFollowerNotifications}
                onChange={(e) => setNewFollowerNotifications(e.target.checked)}
                className="h-4 w-4"
                disabled={!emailNotifications}
              />
            </div>

            <Button type="submit" disabled={preferencesLoading}>
              {preferencesLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to delete your account? This action cannot be undone.'
                )
              ) {
                // Implement account deletion
                alert('Account deletion is not yet implemented');
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
