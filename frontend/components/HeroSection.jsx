'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <motion.section 
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
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
      </div>

      {/* 3D Voting Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Ballot Box */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-2xl"
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
          <i className="ri-inbox-line text-white text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
        </motion.div>

        {/* Floating Vote Checkmark */}
        <motion.div
          className="absolute top-1/3 right-1/5 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl flex items-center justify-center"
          animate={{
            x: [0, 15, 0],
            y: [0, -15, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(145deg, #4ade80, #16a34a)',
            boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
          <i className="ri-check-line text-white text-lg"></i>
        </motion.div>

        {/* Floating Security Shield */}
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-2xl flex items-center justify-center"
          animate={{
            y: [0, 25, 0],
            rotateX: [0, 180, 360],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(145deg, #a855f7, #9333ea)',
            boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-2 bg-gradient-to-br from-white/25 to-transparent rounded-md"></div>
          <i className="ri-shield-check-line text-white text-xl"></i>
        </motion.div>

        {/* Floating Quantum Particle */}
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

        {/* Floating Lock Icon */}
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-2xl flex items-center justify-center"
          animate={{
            rotate: [0, -15, 15, 0],
            scale: [1, 1.1, 1],
            y: [0, -10, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'linear-gradient(145deg, #6366f1, #4f46e5)',
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-md"></div>
          <i className="ri-lock-line text-white text-sm"></i>
        </motion.div>

        {/* Floating Document/Ballot */}
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              The Future of
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Secure Voting
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Experience quantum-powered election security with unprecedented transparency, 
              cryptographic protection, and tamper-proof voting systems.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-500 mb-8">
              <div className="flex items-center space-x-2">
                <i className="ri-shield-check-line text-green-500"></i>
                <span>Quantum Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-eye-line text-blue-500"></i>
                <span>Full Transparency</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-lock-line text-purple-500"></i>
                <span>Tamper-Proof</span>
              </div>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap">
                Start Voting
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300 whitespace-nowrap">
                Learn More
              </button>
            </motion.div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative w-full max-w-lg">
              <img 
                src="/hero-image.png"
                alt="Hero illustration showing people voting with quantum technology"
                className="w-full h-auto"
                loading="eager"
                draggable={false}
              />
              {/* Floating accent elements around the image */}
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <i className="ri-secure-payment-line text-white text-2xl"></i>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <i className="ri-verified-badge-line text-white text-lg"></i>
              </motion.div>

              <motion.div
                className="absolute top-1/2 -left-6 w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
