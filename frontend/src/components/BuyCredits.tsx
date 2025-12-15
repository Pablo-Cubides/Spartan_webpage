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

type PaymentMethod = 'mercadopago' | 'stripe';

export default function BuyCredits() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // USD conversion rate (approximate)
  const COP_TO_USD = 4000;

  const formatUSD = (copAmount: number) => {
    return (copAmount / COP_TO_USD).toFixed(2);
  };

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
        setError('Error de conexión al cargar los paquetes');
      } finally {
        setFetching(false);
      }
    };
    fetchPackages();
  }, []);

  const handleBuyCredits = async (pkg: CreditPackage) => {
    setLoading(true);
    setError('');

    const baseUrl = window.location.origin;
    const backUrls = {
      success: `${baseUrl}/credits?status=success`,
      failure: `${baseUrl}/credits?status=failure`,
      cancel: `${baseUrl}/credits?status=cancelled`,
    };

    try {
      if (paymentMethod === 'stripe') {
        // Stripe payment
        const response = await fetch('/api/credits/buy-stripe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getTokenCookie()}`
          },
          body: JSON.stringify({
            package_id: pkg.id,
            back_urls: {
              success: backUrls.success,
              cancel: backUrls.cancel,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          } else {
            setError('No se pudo obtener la URL de pago de Stripe');
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Error al procesar la compra con Stripe');
        }
      } else {
        // MercadoPago payment
        const response = await fetch('/api/credits/buy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getTokenCookie()}`
          },
          body: JSON.stringify({
            package_id: pkg.id,
            back_urls: {
              success: backUrls.success,
              failure: backUrls.failure,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
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

      {/* Payment Method Selector */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Método de Pago
        </h3>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setPaymentMethod('mercadopago')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'mercadopago'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="w-10 h-10 bg-[#009ee3] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">MP</span>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">MercadoPago</div>
              <div className="text-sm text-gray-500">Pago en COP 🇨🇴</div>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'stripe'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="w-10 h-10 bg-[#635bff] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Stripe</div>
              <div className="text-sm text-gray-500">Pago en USD 🌎</div>
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-lg shadow-lg p-6 border-2 transition-all cursor-pointer ${
              selectedPackage?.id === pkg.id
                ? paymentMethod === 'stripe' ? 'border-purple-500 bg-purple-50' : 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                {pkg.name}
              </div>
              <div className="text-4xl font-bold text-amber-500 mb-2">
                {pkg.credits.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-4">créditos</div>
              
              {paymentMethod === 'stripe' ? (
                <>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ${formatUSD(pkg.price)} USD
                  </div>
                  <div className="text-sm text-gray-500 mb-6">
                    (~${pkg.price.toLocaleString()} COP)
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ${pkg.price.toLocaleString()} COP
                  </div>
                  <div className="text-sm text-gray-500 mb-6">
                    (~${formatUSD(pkg.price)} USD)
                  </div>
                </>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyCredits(pkg);
                }}
                disabled={loading}
                className={`w-full text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 transition-colors font-semibold ${
                  paymentMethod === 'stripe'
                    ? 'bg-[#635bff] hover:bg-[#4f46e5] focus:ring-purple-500'
                    : 'bg-[#009ee3] hover:bg-[#0081c8] focus:ring-blue-500'
                }`}
              >
                {loading ? 'Procesando...' : paymentMethod === 'stripe' ? 'Pagar con Stripe' : 'Pagar con MercadoPago'}
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
          <li>• Puedes usar créditos en todas las herramientas de Spartan Club</li>
          <li>• <strong>MercadoPago:</strong> Ideal para pagos en Colombia (COP)</li>
          <li>• <strong>Stripe:</strong> Ideal para pagos internacionales (USD, tarjetas de cualquier país)</li>
          <li>• Si tienes problemas, contacta con soporte</li>
        </ul>
      </div>
    </div>
  );
}
 