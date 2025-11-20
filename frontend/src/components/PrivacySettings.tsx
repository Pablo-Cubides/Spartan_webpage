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
      setError('Error al cargar configuración de privacidad');
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
        setSuccess('Configuración de privacidad actualizada correctamente');
      } else {
        const data = await response.json();
        setError(data.detail || 'Error al actualizar privacidad');
      }
    } catch {
      setError('Error de conexión');
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
          <p className="mt-2 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Configuración de Privacidad
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
            label="Nombre Completo"
            description="Permitir que otros usuarios vean tu nombre completo"
          />

          <ToggleSwitch
            enabled={settings.bio_public}
            onToggle={() => handleToggle('bio_public')}
            label="Biografía"
            description="Mostrar tu biografía en tu perfil público"
          />

          <ToggleSwitch
            enabled={settings.location_public}
            onToggle={() => handleToggle('location_public')}
            label="Ubicación"
            description="Mostrar tu ubicación en tu perfil público"
          />

          <ToggleSwitch
            enabled={settings.gender_public}
            onToggle={() => handleToggle('gender_public')}
            label="Género"
            description="Mostrar tu género en tu perfil público"
          />

          <ToggleSwitch
            enabled={settings.birth_date_public}
            onToggle={() => handleToggle('birth_date_public')}
            label="Fecha de Nacimiento"
            description="Mostrar tu fecha de nacimiento en tu perfil público"
          />

          <ToggleSwitch
            enabled={settings.website_public}
            onToggle={() => handleToggle('website_public')}
            label="Sitio Web"
            description="Mostrar tu sitio web en tu perfil público"
          />

          <ToggleSwitch
            enabled={settings.social_media_public}
            onToggle={() => handleToggle('social_media_public')}
            label="Redes Sociales"
            description="Mostrar tus redes sociales en tu perfil público"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Información sobre Privacidad
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Los cambios se aplican inmediatamente</li>
            <li>• Solo los campos habilitados serán visibles en tu perfil público</li>
            <li>• Puedes cambiar esta configuración en cualquier momento</li>
            <li>• Tu información siempre será segura y protegida</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 