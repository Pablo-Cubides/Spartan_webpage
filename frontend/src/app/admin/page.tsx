'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth, signInWithGoogle, signOut } from '@/lib/firebase';

interface UserProfile {
  id: number;
  uid: string;
  email: string;
  name: string;
  alias: string;
  credits: number;
  avatar_url?: string;
  created_at: string;
}

interface Purchase {
  id: number;
  user_id: number;
  package_id: number;
  amount_paid: number;
  credits_received: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  is_active: boolean;
}

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'purchases' | 'packages'>('users');
  const [loadingData, setLoadingData] = useState(false);

  // Verificar si el usuario es admin
  const isAdmin = user?.email === 'admin@spartan.com' || user?.email?.endsWith('@spartan.com');

  useEffect(() => {
    if (!(user && isAdmin)) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const token = await user?.getIdToken();

        // Fetch users
        const usersResponse = await fetch('/api/v1/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }

        // Fetch purchases
        const purchasesResponse = await fetch('/api/v1/admin/purchases', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (purchasesResponse.ok) {
          const purchasesData = await purchasesResponse.json();
          setPurchases(purchasesData);
        }

        // Fetch packages
        const packagesResponse = await fetch('/api/v1/credits/packages');
        if (packagesResponse.ok) {
          const packagesData = await packagesResponse.json();
          setPackages(packagesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    void fetchData();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
            <p className="text-gray-600 mb-6">Inicia sesión para acceder al panel de administración</p>
            <button
              onClick={signInWithGoogle}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar sesión con Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6">No tienes permisos para acceder al panel de administración</p>
            <button
              onClick={signOut}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={signOut}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Usuarios ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'purchases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Compras ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'packages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Paquetes ({packages.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            {activeTab === 'users' && (
              <div className="px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Usuarios Registrados</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alias
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Créditos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.avatar_url && (
                                <Image
                                  className="h-10 w-10 rounded-full mr-3"
                                  src={user.avatar_url || ''}
                                  alt={user.name}
                                  width={40}
                                  height={40}
                                  unoptimized
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            @{user.alias}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.credits}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'purchases' && (
              <div className="px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Historial de Compras</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paquete
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{purchase.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.user_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.credits_received} créditos
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${purchase.amount_paid}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              purchase.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : purchase.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {purchase.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'packages' && (
              <div className="px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Paquetes de Créditos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{pkg.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          pkg.is_active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pkg.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Créditos:</span>
                          <span className="font-medium">{pkg.credits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Precio:</span>
                          <span className="font-medium">${pkg.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 