'use client';

import { useState, useEffect } from 'react';

interface PrivacySettings {
  full_name_public: boolean;
  bio_public: boolean;
  location_public: boolean;
  gender_public: boolean;
  birth_date_public: boolean;
  website_public: boolean;
  social_media_public: boolean;
}

export default function PrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings>({
    full_name_public: true,
    bio_public: true,
    location_public: true,
    gender_public: false,
    birth_date_public: false,
    website_public: true,
    social_media_public: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/users/privacy/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.privacy_settings);
      }
    } catch {
      setError('Error loading privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/v1/users/privacy/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ privacy_settings: settings })
      });

      if (response.ok) {
        setSuccess('Privacy settings updated successfully');
      } else {
        const data = await response.json();
        setError(data.detail || 'Error updating privacy');
      }
    } catch {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ 
    enabled, 
    onToggle, 
    label, 
    description 
  }: { 
    enabled: boolean; 
    onToggle: () => void; 
    label: string; 
    description: string; 
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Privacy Settings
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="space-y-0">
          <ToggleSwitch
            enabled={settings.full_name_public}
            onToggle={() => handleToggle('full_name_public')}
            label="Full Name"
            description="Allow other users to see your full name"
          />

          <ToggleSwitch
            enabled={settings.bio_public}
            onToggle={() => handleToggle('bio_public')}
            label="Biography"
            description="Show your biography on your public profile"
          />

          <ToggleSwitch
            enabled={settings.location_public}
            onToggle={() => handleToggle('location_public')}
            label="Location"
            description="Show your location on your public profile"
          />

          <ToggleSwitch
            enabled={settings.gender_public}
            onToggle={() => handleToggle('gender_public')}
            label="Gender"
            description="Show your gender on your public profile"
          />

          <ToggleSwitch
            enabled={settings.birth_date_public}
            onToggle={() => handleToggle('birth_date_public')}
            label="Birth Date"
            description="Show your birth date on your public profile"
          />

          <ToggleSwitch
            enabled={settings.website_public}
            onToggle={() => handleToggle('website_public')}
            label="Website"
            description="Show your website on your public profile"
          />

          <ToggleSwitch
            enabled={settings.social_media_public}
            onToggle={() => handleToggle('social_media_public')}
            label="Social Media"
            description="Show your social media on your public profile"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Privacy Information
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Changes apply immediately</li>
            <li>• Only enabled fields will be visible on your public profile</li>
            <li>• You can change these settings at any time</li>
            <li>• Your information will always be secure and protected</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 