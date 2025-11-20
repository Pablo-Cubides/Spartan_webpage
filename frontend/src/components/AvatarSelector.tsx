'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { getTokenCookie, getApiUrl } from '@/lib/api';

const AVATAR_ICONS = [
  '👤', '👨', '👩', '🧑', '👶', '👴', '👵', '🦊', '🐱', '🐶'
];

interface AvatarSelectorProps {
  currentAvatar?: string;
  onAvatarChange: (avatarType: string, avatarUrl?: string) => void;
}

export default function AvatarSelector({ currentAvatar, onAvatarChange }: AvatarSelectorProps) {
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    setUploadedFile(null);
    setPreviewUrl('');
    onAvatarChange('icon', icon);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos JPG, PNG o GIF');
      return;
    }

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo debe ser menor a 2MB');
      return;
    }

    setError('');
    setUploadedFile(file);
    setSelectedIcon('');

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    setError('');
    try {
      // 1) Request presigned URL from serverless
      const presignRes = await fetch(`${getApiUrl()}/api/avatar/presign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTokenCookie()}`
        },
        body: JSON.stringify({ filename: uploadedFile.name, contentType: uploadedFile.type })
      });

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        setError(err.error || 'Error obteniendo URL firmada');
        setLoading(false);
        return;
      }

      const { url, key } = await presignRes.json();

      // 2) Upload file directly to presigned URL (PUT)
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': uploadedFile.type,
        },
        body: uploadedFile,
      });

      if (!putRes.ok) {
        setError('Error subiendo archivo a storage');
        setLoading(false);
        return;
      }

      // 3) Confirm upload with server to update DB/profile
      const confirmRes = await fetch(`${getApiUrl()}/api/v1/users/avatar/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTokenCookie()}`
        },
        body: JSON.stringify({ object_key: key })
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json().catch(() => ({}));
        setError(err.error || 'Error confirmando subida');
        setLoading(false);
        return;
      }

      const data = await confirmRes.json();
      onAvatarChange('uploaded', data.avatar_url);
      setError('');
    } catch (e) {
      setError((e as Error).message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/users/avatar/remove`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getTokenCookie()}`
        }
      });

      if (response.ok) {
        setSelectedIcon('');
        setUploadedFile(null);
        setPreviewUrl('');
        onAvatarChange('default', '');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al eliminar avatar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Seleccionar Avatar
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Avatar Actual */}
        {currentAvatar && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Avatar Actual</h3>
            <div className="flex items-center space-x-4">
              <Image
                src={currentAvatar || ''}
                alt="Avatar actual"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
                unoptimized
              />
              <button
                onClick={handleRemoveAvatar}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Eliminando...' : 'Eliminar Avatar'}
              </button>
            </div>
          </div>
        )}

        {/* Iconos Predefinidos */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Iconos Predefinidos</h3>
          <div className="grid grid-cols-5 gap-4">
            {AVATAR_ICONS.map((icon, index) => (
              <button
                key={index}
                onClick={() => handleIconSelect(icon)}
                className={`w-16 h-16 text-3xl rounded-full border-2 transition-all hover:scale-110 ${
                  selectedIcon === icon
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Subida de Archivo */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Imagen</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {!uploadedFile ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Seleccionar Archivo
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Formatos: JPG, PNG, GIF. Máximo 2MB
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <Image
                    src={previewUrl || ''}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover mx-auto"
                    unoptimized
                  />
                </div>
                <div className="space-x-2">
                  <button
                    onClick={handleUploadAvatar}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Subiendo...' : 'Usar Esta Imagen'}
                  </button>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setPreviewUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información */}
        <div className="p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Información sobre Avatares
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Puedes elegir entre 10 iconos predefinidos</li>
            <li>• O subir tu propia imagen (máximo 2MB)</li>
            <li>• Formatos soportados: JPG, PNG, GIF</li>
            <li>• La imagen se procesará automáticamente</li>
            <li>• Puedes cambiar tu avatar en cualquier momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 