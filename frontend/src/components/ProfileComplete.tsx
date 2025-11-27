'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileData {
  alias: string;
  full_name: string;
  bio: string;
  location: 'Colombia' | 'Spain' | 'Other';
  gender: 'Male' | 'Female' | 'Other';
  birth_date: string;
  website: string;
  social_media: {
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

export default function ProfileComplete() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    alias: '',
    full_name: '',
    bio: '',
    location: 'Colombia',
    gender: 'Male',
    birth_date: '',
    website: '',
    social_media: {
      instagram: '',
      twitter: '',
      linkedin: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/users/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        router.push('/profile');
      } else {
        const data = await response.json();
        setError(data.detail || 'Error completing profile');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Complete Your Profile
          </h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alias */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique Alias *
              </label>
              <input
                type="text"
                value={profile.alias}
                onChange={(e) => setProfile({...profile, alias: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-unique-alias"
                required
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Full Name"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biography
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value as 'Colombia' | 'Spain' | 'Other'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Colombia">Colombia</option>
                <option value="Spain">Spain</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({...profile, gender: e.target.value as 'Male' | 'Female' | 'Other'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth Date
              </label>
              <input
                type="date"
                value={profile.birth_date}
                onChange={(e) => setProfile({...profile, birth_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-site.com"
              />
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  value={profile.social_media.instagram}
                  onChange={(e) => setProfile({
                    ...profile, 
                    social_media: {...profile.social_media, instagram: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@your-username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  value={profile.social_media.twitter}
                  onChange={(e) => setProfile({
                    ...profile, 
                    social_media: {...profile.social_media, twitter: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@your-username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={profile.social_media.linkedin}
                  onChange={(e) => setProfile({
                    ...profile, 
                    social_media: {...profile.social_media, linkedin: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your-username"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Completing...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 