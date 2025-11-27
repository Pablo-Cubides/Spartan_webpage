'use client';

import { useState, useEffect } from 'react';
import { getTokenCookie } from '@/lib/api';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description?: string;
}

export default function BuyCredits() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/credits/packages');
        if (res.ok) {
          const data = await res.json();
          setPackages(data.packages || []);
        } else {
          setError('Error al cargar los paquetes');
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        setError('Error de conexión al cargar paquetes');
      } finally {
        setFetching(false);
      }
    };
    fetchPackages();
  }, []);

  const handleBuyCredits = async (pkg: CreditPackage) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/credits/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTokenCookie()}`
        },
        body: JSON.stringify({ package_id: pkg.id })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Redirigir a MercadoPago
        const preference = data.preference;
        const paymentUrl = preference?.init_point || preference?.sandbox_init_point;
        
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          setError('No se pudo obtener la URL de pago');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al procesar la compra');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-center py-8">Cargando paquetes...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Comprar Créditos
        </h1>
        <p className="text-gray-600">
          Selecciona un paquete de créditos para continuar
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-lg shadow-lg p-6 border-2 transition-all cursor-pointer ${
              selectedPackage?.id === pkg.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {pkg.credits.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-4">créditos</div>
              
              <div className="text-2xl font-bold text-gray-900 mb-2">
                ${pkg.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mb-6">COP</div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyCredits(pkg);
                }}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Procesando...' : 'Comprar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información Importante
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Los créditos se acreditan automáticamente después del pago</li>
          <li>• Puedes usar los créditos para comprar productos en la plataforma</li>
          <li>• Los pagos se procesan de forma segura a través de MercadoPago</li>
          <li>• Si tienes problemas, contacta a soporte</li>
        </ul>
      </div>
    </div>
  );
} 