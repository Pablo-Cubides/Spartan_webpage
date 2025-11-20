'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileData {
  alias: string;
  full_name: string;
  bio: string;
  location: 'Colombia' | 'España' | 'Otro';
  gender: 'Masculino' | 'Femenino' | 'Otro';
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
    gender: 'Masculino',
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
        setError(data.detail || 'Error al completar perfil');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Completa tu Perfil
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
                Alias Único *
              </label>
              <input
                type="text"
                value={profile.alias}
                onChange={(e) => setProfile({...profile, alias: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu-alias-unico"
                required
              />
            </div>

            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu Nombre Completo"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cuéntanos sobre ti..."
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <select
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value as 'Colombia' | 'España' | 'Otro'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Colombia">Colombia</option>
                <option value="España">España</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género *
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({...profile, gender: e.target.value as 'Masculino' | 'Femenino' | 'Otro'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={profile.birth_date}
                onChange={(e) => setProfile({...profile, birth_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sitio Web */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://tu-sitio.com"
              />
            </div>

            {/* Redes Sociales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Redes Sociales</h3>
              
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
                  placeholder="@tu-usuario"
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
                  placeholder="@tu-usuario"
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
                  placeholder="tu-usuario"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Completando...' : 'Completar Perfil'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 