// contexts/AuthContext.js
"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get API base URL from environment or default
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5205/api';

  // Decode JWT token to get user info
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.jti || payload.sub,
        email: payload.sub,
        role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        exp: payload.exp
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };
  
  // Login function for organizations/admins
const login = async (email, password) => {
  try {
    // Construct the full URL - if API_BASE_URL is relative, use it as is
    const url = API_BASE_URL.startsWith('/') ? `${API_BASE_URL}/Auth/Login` : `${API_BASE_URL}/Auth/Login`;
    const payload = { email, password };
    
    console.log('🚀 Making login request to:', url);
    console.log('📦 Request payload:', { email, password: '***' });
    console.log('🔧 API_BASE_URL:', API_BASE_URL);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response is JSON (including problem+json)
    const contentType = response.headers.get('content-type');
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('application/problem+json'))) {
      console.error('❌ Response is not JSON:', contentType);
      const textResponse = await response.text();
      console.error('❌ Text response:', textResponse);
      throw new Error('Server returned non-JSON response');
    }
    
    const data = await response.json();
    console.log('📄 Response data:', data);

    if (response.ok && data.token) {
      localStorage.setItem('auth-token', data.token);
      const userInfo = decodeToken(data.token);
      
      if (userInfo) {
        setUser(userInfo);
        router.push('/admin/dashboard');
        return { success: true, user: userInfo };
      }
    }
    
    // Handle problem+json error responses
    if (contentType && contentType.includes('application/problem+json')) {
      
      let errorMessage = data.detail || data.title || data.message || 'Login failed';
      
      if (data.errors && typeof data.errors === 'object') {
        
        // Convert validation errors to a readable message
        const errorMessages = [];
        for (const [field, messages] of Object.entries(data.errors)) {
          if (Array.isArray(messages)) {
            errorMessages.push(`${field}: ${messages.join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${messages}`);
          }
        }
        
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('\n');
        }
      }
      
      return { success: false, message: errorMessage };
    }
    
    return { success: false, message: data.message || 'Login failed' };
  } catch (error) {
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { success: false, message: 'Cannot connect to server. Please check if the backend is running.' };
    }
    
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Register function for organizations
const register = async (email, password, organizationName, contactPerson) => {
  try {
    const url = `${API_BASE_URL}/Organization/Register`;
    const payload = {
      name: organizationName,
      email,
      password,
      contactPerson
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    // Check if response is JSON (including problem+json)
    const contentType = response.headers.get('content-type');
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('application/problem+json'))) {
      const textResponse = await response.text();
      throw new Error('Server returned non-JSON response', textResponse);
    }

    const data = await response.json();
    console.log('📄 Register response data:', data);

    if (response.ok && data.status) {
      return { success: true, message: data.message || 'Registration successful! Please login with your credentials.' };
    } else {
      // Handle problem+json error responses
      if (contentType && contentType.includes('application/problem+json')) {
        
        let errorMessage = data.detail || data.title || data.message || 'Registration failed';
        
        if (data.errors && typeof data.errors === 'object') {
          
          // Convert validation errors to a readable message
          const errorMessages = [];
          for (const [field, messages] of Object.entries(data.errors)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          }
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('\n');
          }
        }
        
        return { success: false, message: errorMessage };
      }
      
      return { 
        success: false, 
        message: data.message || 'Registration failed. Please try again.' 
      };
    }
  } catch (error) {
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { success: false, message: 'Cannot connect to server. Please check if the backend is running.' };
    }
    
    return { 
      success: false, 
      message: 'Network error. Please check your connection and try again.' 
    };
  }
};

  // Login function for voters
  const voterLogin = async (voterId, accessPin) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/LoginVoter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          voterId: voterId,
          accessPin: accessPin 
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('voterId', voterId); // Store voterId separately for voter-specific operations
        const userInfo = decodeToken(data.token);
        
        if (userInfo) {
          // Add voterId to user info for voter context
          const voterUserInfo = {
            ...userInfo,
            voterId: voterId
          };
          setUser(voterUserInfo);
          
          // Redirect to voter dashboard
          router.push('/voter/dashboard');
          
          return { success: true, user: voterUserInfo };
        }
      }
      
      return { success: false, message: data.message || 'Login failed. Please check your credentials.' };
    } catch (error) {
      console.error('Voter login error:', error);
      return { success: false, message: 'Network error. Please check your connection and try again.' };
    }
  };

  // Register function for organizations
//   const register = async (email, password, organizationName, contactPerson) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/Organization/Register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: organizationName,
//           email,
//           password,
//           contactPerson
//         })
//       });

//       const data = await response.json();

//       if (response.ok && data.status) {
//         return { success: true, message: data.message || 'Registration successful! Please login with your credentials.' };
//       } else {
//         return { 
//           success: false, 
//           message: data.message || 'Registration failed. Please try again.' 
//         };
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       return { 
//         success: false, 
//         message: 'Network error. Please check your connection and try again.' 
//       };
//     }
//   };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      
      // Call backend logout endpoint if token exists
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/Auth/Logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          // If backend logout fails, still proceed with local logout
          console.warn('Backend logout failed:', error);
        }
      }
    } catch (error) {
      console.warn('Error during logout process:', error);
    } finally {
      // Always clear local storage and user state
      localStorage.removeItem('auth-token');
      localStorage.removeItem('voterId'); // Also remove voterId for voters
      setUser(null);
      router.push('/');
    }
  };

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('auth-token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      logout();
      throw new Error('Token expired. Please login again.');
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      // Construct the full URL - if API_BASE_URL is relative, use it as is
      const url = API_BASE_URL.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, requestOptions);
      
      // If unauthorized, logout user
      if (response.status === 401) {
        logout();
        throw new Error('Unauthorized. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // Get user token for external use
  const getToken = () => {
    return localStorage.getItem('auth-token');
  };

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token');
      
      if (token && !isTokenExpired(token)) {
        const userInfo = decodeToken(token);
        if (userInfo) {
          // If it's a voter, also get their voterId from localStorage
          if (userInfo.role?.toLowerCase() === 'voter') {
            const voterId = localStorage.getItem('voterId');
            if (voterId) {
              userInfo.voterId = voterId;
            }
          }
          setUser(userInfo);
        } else {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('voterId');
        }
      } else if (token) {
        // Token expired
        localStorage.removeItem('auth-token');
        localStorage.removeItem('voterId');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const value = {
    user,
    login,
    voterLogin,
    register,
    logout,
    makeAuthenticatedRequest,
    getToken,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protected routes
export const withAuth = (WrappedComponent, allowedRoles = []) => {
  return function AuthenticatedComponent(props) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push('/login');
          return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role.toLowerCase())) {
          router.push('/voter/login');
          return;
        }
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role.toLowerCase())) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};