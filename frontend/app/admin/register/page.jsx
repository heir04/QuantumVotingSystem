'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const AdminRegister = () => {
  const { register } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    contactPerson: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Organization name validation
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    // Contact person validation
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate step 1 fields
      const step1Errors = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!formData.email) {
        step1Errors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        step1Errors.email = 'Please enter a valid email address';
      }

      if (!formData.organizationName.trim()) {
        step1Errors.organizationName = 'Organization name is required';
      }

      if (!formData.contactPerson.trim()) {
        step1Errors.contactPerson = 'Contact person is required';
      }

      if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors);
        return;
      }

      setStep(2);
      return;
    }
    
    // Step 2 - Final validation and submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.organizationName,
        formData.contactPerson
      );

      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } else {
        setErrors({ 
          general: result.message 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
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
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -50,
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

  // Floating admin icons
  const floatingIcons = Array.from({ length: 6 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute text-purple-200 opacity-10"
      initial={{ x: 0, y: 0, rotate: 0 }}
      animate={{
        x: [0, 80, -60, 0],
        y: [0, -90, 60, 0],
        rotate: [0, 360],
        scale: [1, 1.4, 0.8, 1],
      }}
      transition={{
        duration: 8 + i * 1.2,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        left: `${20 + i * 15}%`,
        top: `${20 + i * 12}%`,
        fontSize: `${1.2 + (i % 2) * 0.4}rem`
      }}
    >
      <i className={`ri-${['admin-line', 'settings-3-line', 'shield-check-line'][i % 3]}`}></i>
    </motion.div>
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
        {floatingIcons}
        <motion.div
          className="absolute top-24 left-24 w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: 'linear-gradient(145deg, #a855f7, #4f46e5)',
            boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-4 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
          <i className="ri-user-add-line text-white text-3xl"></i>
        </motion.div>
        
        <motion.div
          className="absolute bottom-24 right-24 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full shadow-2xl flex items-center justify-center"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: 'linear-gradient(145deg, #60a5fa, #9333ea)',
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-4 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
          <i className="ri-admin-line text-white text-3xl"></i>
        </motion.div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <motion.div 
              variants={itemVariants}
              className="px-8 pt-8 pb-6 text-center"
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  background: 'linear-gradient(145deg, #9333ea, #3b82f6)',
                  boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                <i className="ri-user-add-line text-2xl text-white"></i>
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Registration
              </h1>
              <p className="text-gray-600 text-sm">
                Create your admin account to manage voting sessions
              </p>
              
              {/* Progress indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {[1, 2].map((stepNum) => (
                  <motion.div
                    key={stepNum}
                    className={`w-8 h-2 rounded-full ${
                      stepNum <= step ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: stepNum === step ? 1.2 : 1,
                      backgroundColor: stepNum <= step ? '#9333ea' : '#e5e7eb'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <motion.form 
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="px-8 pb-8 space-y-6"
            >
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
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
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                          placeholder="admin@organization.com"
                          required
                          animate={{
                            scale: focusedField === 'email' ? 1.02 : 1,
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-purple-400 opacity-0 pointer-events-none"
                          animate={{
                            opacity: focusedField === 'email' ? 1 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        <i className="ri-mail-line absolute right-3 top-3 text-gray-400"></i>
                      </div>
                      {errors.email && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Organization Name Field */}
                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
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
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                          placeholder="Your organization name"
                          required
                          animate={{
                            scale: focusedField === 'organization' ? 1.02 : 1,
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-purple-400 opacity-0 pointer-events-none"
                          animate={{
                            opacity: focusedField === 'organization' ? 1 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        <i className="ri-building-line absolute right-3 top-3 text-gray-400"></i>
                      </div>
                      {errors.organizationName && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.organizationName}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Contact Person Field */}
                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        Contact Person
                      </label>
                      <div className="relative">
                        <motion.input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('contactPerson')}
                          onBlur={() => setFocusedField('')}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                          placeholder="Contact person name"
                          required
                          animate={{
                            scale: focusedField === 'contactPerson' ? 1.02 : 1,
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-purple-400 opacity-0 pointer-events-none"
                          animate={{
                            opacity: focusedField === 'contactPerson' ? 1 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        <i className="ri-user-line absolute right-3 top-3 text-gray-400"></i>
                      </div>
                      {errors.contactPerson && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.contactPerson}
                        </motion.p>
                      )}
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
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
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                          placeholder="Create a strong password"
                          required
                          animate={{
                            scale: focusedField === 'password' ? 1.02 : 1,
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-purple-400 opacity-0 pointer-events-none"
                          animate={{
                            opacity: focusedField === 'password' ? 1 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <motion.input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField('')}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                          placeholder="Confirm your password"
                          required
                          animate={{
                            scale: focusedField === 'confirmPassword' ? 1.02 : 1,
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-purple-400 opacity-0 pointer-events-none"
                          animate={{
                            opacity: focusedField === 'confirmPassword' ? 1 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <i className={showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Password Requirements */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
                    >
                      <p className="text-gray-700 text-sm font-medium mb-2">Password Requirements:</p>
                      <ul className="text-gray-600 text-xs space-y-1">
                        <li className="flex items-center">
                          <i className="ri-check-line text-green-400 mr-2"></i>
                          At least 8 characters long
                        </li>
                        <li className="flex items-center">
                          <i className="ri-check-line text-green-400 mr-2"></i>
                          Contains uppercase and lowercase letters
                        </li>
                        <li className="flex items-center">
                          <i className="ri-check-line text-green-400 mr-2"></i>
                          Contains at least one number
                        </li>
                      </ul>
                    </motion.div>

                    {/* General Error Message */}
                    {errors.general && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                      >
                        <p className="text-red-400 text-sm font-medium flex items-center">
                          <i className="ri-error-warning-line mr-2"></i>
                          {errors.general}
                        </p>
                      </motion.div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
                      >
                        <p className="text-green-400 text-sm font-medium flex items-center">
                          <i className="ri-check-line mr-2"></i>
                          {successMessage}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex space-x-3">
                {step === 2 && (
                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <i className="ri-arrow-left-line mr-2"></i>
                    Back
                  </motion.button>
                )}
                
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isLoading}
                  className="flex-1 relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span className="ml-2">Creating Account...</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <i className={`${step === 1 ? 'ri-arrow-right-line' : 'ri-user-add-line'} mr-2`}></i>
                        {step === 1 ? 'Continue' : 'Create Account'}
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
              </div>

              {/* Login Link */}
              <motion.div 
                variants={itemVariants}
                className="text-center pt-4"
              >
                <p className="text-gray-600 text-sm">
                  Already have an admin account?{' '}
                  <motion.a
                    href="/admin/login"
                    className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in here
                  </motion.a>
                </p>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRegister;
