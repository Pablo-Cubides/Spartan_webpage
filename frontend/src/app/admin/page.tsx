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

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  author: {
    name: string;
    email: string;
  };
}

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'purchases' | 'packages' | 'blog'>('users');
  const [loadingData, setLoadingData] = useState(false);
  
  // Blog Form State
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [postFormError, setPostFormError] = useState<string | null>(null);

  // Verificar si el usuario es admin (basado en role en BD, no en email)
  const isAdmin = user && user.uid ? (
    // La verificación real ocurre en el servidor en /api/v1/admin/users
    // The client only attempts to load data; the server will reject if not admin
    true // Permitir intento; servidor validará
  ) : false;

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

        // Fetch blog posts
        const postsResponse = await fetch('/api/admin/blog', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData.posts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    void fetchData();
  }, [user, isAdmin]);

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostFormError(null);
    
    try {
      const token = await user?.getIdToken();
      const url = currentPost.id 
        ? `/api/admin/blog/${currentPost.id}` 
        : '/api/admin/blog';
      
      const method = currentPost.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentPost),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error saving post');
      }

      // Refresh posts
      const postsResponse = await fetch('/api/admin/blog', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.posts);
      }

      setIsEditingPost(false);
      setCurrentPost({});
    } catch (error: unknown) {
      setPostFormError(error instanceof Error ? error.message : 'Error saving post');
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = await user?.getIdToken();
      await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Administration Panel</h1>
            <p className="text-gray-600 mb-6">Sign in to access the administration panel</p>
            <button
              onClick={signInWithGoogle}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign in with Google
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
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You do not have permissions to access the administration panel</p>
            <button
              onClick={signOut}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign out
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
            <h1 className="text-2xl font-bold text-gray-900">Administration Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={signOut}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign out
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
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'purchases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Purchases ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'packages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Packages ({packages.length})
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blog'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Blog ({posts.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            {activeTab === 'users' && (
              <div className="px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Registered Users</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alias
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration
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
                <h2 className="text-lg font-medium text-gray-900 mb-4">Purchase History</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Package
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
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
                            {purchase.credits_received} credits
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
                <h2 className="text-lg font-medium text-gray-900 mb-4">Credit Packages</h2>
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
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Credits:</span>
                          <span className="font-medium">{pkg.credits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">${pkg.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Blog Management</h2>
                  <button
                    onClick={() => {
                      setCurrentPost({ is_published: false });
                      setIsEditingPost(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    New Post
                  </button>
                </div>

                {isEditingPost ? (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-4">{currentPost.id ? 'Edit Post' : 'New Post'}</h3>
                    {postFormError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {postFormError}
                      </div>
                    )}
                    <form onSubmit={handleSavePost} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={currentPost.title || ''}
                          onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                        <input
                          type="text"
                          value={currentPost.slug || ''}
                          onChange={e => setCurrentPost({...currentPost, slug: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                        <textarea
                          value={currentPost.excerpt || ''}
                          onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Content</label>
                        <textarea
                          value={currentPost.content || ''}
                          onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          rows={10}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cover Image (URL)</label>
                        <input
                          type="url"
                          value={currentPost.cover_image || ''}
                          onChange={e => setCurrentPost({...currentPost, cover_image: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Publication Date</label>
                          <input
                            type="datetime-local"
                            value={currentPost.published_at ? new Date(currentPost.published_at).toISOString().slice(0, 16) : ''}
                            onChange={e => setCurrentPost({...currentPost, published_at: new Date(e.target.value).toISOString()})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          />
                          <p className="text-xs text-gray-500 mt-1">Si se deja vacío, no se programará.</p>
                        </div>
                        <div className="flex items-center pt-6">
                          <input
                            type="checkbox"
                            checked={currentPost.is_published || false}
                            onChange={e => setCurrentPost({...currentPost, is_published: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            Published
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsEditingPost(false)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publication</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {posts.map((post) => (
                          <tr key={post.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{post.title}</div>
                              <div className="text-sm text-gray-500">{post.slug}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                post.is_published 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {post.is_published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {post.published_at ? new Date(post.published_at).toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {post.author?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setCurrentPost(post);
                                  setIsEditingPost(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}