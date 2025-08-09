'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Use Auth Context
  const { login, register } = useAuth();

  // Get API base URL from environment or default
  const API_BASE_URL = 'http://localhost:5205/api' || process.env.NEXT_PUBLIC_API_URL;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleLogin = async (loginData) => {
    try {
      // Use AuthContext login function
      const result = await login(loginData.email, loginData.password);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        // AuthContext handles redirection automatically
        return { success: true };
      } else {
        return { 
          success: false, 
          message: result.message || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  };

  const handleRegister = async (registerData) => {
    try {
      // Use AuthContext register function (Note: AuthContext expects 4 parameters)
      const result = await register(
        registerData.email, 
        registerData.password, 
        registerData.organizationName,
        registerData.organizationName // Using organizationName as contactPerson for now
      );
      
      if (result.success) {
        setSuccess(result.message);
        setIsLogin(true);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: result.message 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    if (!isLogin && !formData.organizationName) {
      setError('Organization name is required for registration');
      setIsLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await handleLogin(formData);
      } else {
        result = await handleRegister(formData);
      }

      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const floatingParticles = Array.from({ length: 6 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-blue-200 rounded-full opacity-20"
      initial={{ x: 0, y: 0 }}
      animate={{
        x: [0, 100, -50, 0],
        y: [0, -100, 50, 0],
        scale: [1, 1.5, 0.8, 1],
      }}
      transition={{
        duration: 8 + i * 2,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        left: `${20 + i * 15}%`,
        top: `${30 + i * 10}%`,
      }}
    />
  ));

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements - Similar to Homepage */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main background floating elements */}
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-blue-100/40 to-purple-100/40 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* 3D Admin Elements */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-2xl flex items-center justify-center"
          animate={{
            y: [0, -20, 0],
            rotateY: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(145deg, #60a5fa, #3b82f6)',
            boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-md"></div>
          <div className="text-white text-2xl">👨‍💼</div>
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-1/5 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-2xl flex items-center justify-center"
          animate={{
            x: [0, 15, 0],
            y: [0, -15, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(145deg, #a855f7, #9333ea)',
            boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
          <div className="text-white text-lg">⚙️</div>
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 left-1/4 w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-2xl flex items-center justify-center"
          animate={{
            y: [0, 25, 0],
            rotateX: [0, 180, 360],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(145deg, #6366f1, #4f46e5)',
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-2 bg-gradient-to-br from-white/25 to-transparent rounded-md"></div>
          <div className="text-white text-xl">🛡️</div>
        </motion.div>

        <motion.div
          className="absolute top-2/3 right-1/4 w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-2xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(145deg, #22d3ee, #0891b2)',
            boxShadow: '0 20px 40px -12px rgba(34, 211, 238, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
          }}
        >
          <div className="absolute inset-1 bg-gradient-to-br from-white/40 to-transparent rounded-full"></div>
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 right-1/6 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-2xl flex items-center justify-center"
          animate={{
            rotate: [0, -15, 15, 0],
            scale: [1, 1.1, 1],
            y: [0, -10, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(145deg, #4ade80, #16a34a)',
            boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-md"></div>
          <div className="text-white text-sm">🔒</div>
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/12 w-12 h-16 bg-gradient-to-br from-orange-300 to-orange-500 rounded-md shadow-2xl"
          animate={{
            x: [0, 20, 0],
            rotateZ: [0, 10, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(145deg, #fdba74, #f97316)',
            boxShadow: '0 25px 50px -12px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-1 bg-gradient-to-br from-white/25 to-transparent rounded-sm"></div>
          <div className="absolute top-2 left-1 right-1 h-1 bg-white/40 rounded-full"></div>
          <div className="absolute top-4 left-1 w-3/4 h-0.5 bg-white/30 rounded-full"></div>
          <div className="absolute top-6 left-1 w-1/2 h-0.5 bg-white/30 rounded-full"></div>
        </motion.div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md"
          >
            <motion.div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <motion.div 
                variants={itemVariants}
                className="px-8 pt-8 pb-6 text-center"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    background: 'linear-gradient(145deg, #3b82f6, #9333ea)',
                    boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                  <div className="text-2xl text-white">👨‍💼</div>
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Admin Portal' : 'Join as Admin'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {isLogin ? 'Welcome back! Please sign in to your account' : 'Create your admin account to get started'}
                </p>
              </motion.div>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <div className="flex items-center">
                      <div className="text-red-600 text-lg mr-2">⚠️</div>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mx-8 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <div className="flex items-center">
                      <div className="text-green-600 text-lg mr-2">✅</div>
                      <p className="text-green-700 text-sm">{success}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <motion.form 
                variants={itemVariants}
                onSubmit={handleSubmit}
                className="px-8 pb-8 space-y-6"
              >
                {/* Email Field */}
                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <motion.input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      placeholder="admin@example.com"
                      required
                      animate={{
                        scale: focusedField === 'email' ? 1.02 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-blue-500 opacity-0 pointer-events-none"
                      animate={{
                        opacity: focusedField === 'email' ? 1 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <div className="absolute right-3 top-3 text-gray-500">📧</div>
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <motion.input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      placeholder="Enter your password"
                      required
                      animate={{
                        scale: focusedField === 'password' ? 1.02 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-blue-500 opacity-0 pointer-events-none"
                      animate={{
                        opacity: focusedField === 'password' ? 1 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </motion.div>

                {/* Organization Name Field (Registration only) */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        Organization Name
                      </label>
                      <div className="relative">
                        <motion.input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('organization')}
                          onBlur={() => setFocusedField('')}
                          className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                          placeholder="Your organization name"
                          required={!isLogin}
                          animate={{
                            scale: focusedField === 'organization' ? 1.02 : 1,
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-blue-500 opacity-0 pointer-events-none"
                          animate={{
                            opacity: focusedField === 'organization' ? 1 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        <div className="absolute right-3 top-3 text-gray-500">🏢</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span className="ml-2">Processing...</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <div className="mr-2">{isLogin ? '🔐' : '👤'}</div>
                        {isLogin ? 'Sign In' : 'Create Account'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {/* Button shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>

                {/* Toggle Auth Mode */}
                <motion.div 
                  variants={itemVariants}
                  className="text-center pt-4"
                >
                  <p className="text-gray-600 text-sm">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <motion.button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setSuccess('');
                        setFormData({ email: '', password: '', organizationName: '' });
                      }}
                      className="text-blue-600 hover:text-purple-600 font-semibold transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLogin ? 'Sign up here' : 'Sign in here'}
                    </motion.button>
                  </p>
                </motion.div>
              </motion.form>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminAuth;