'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer 
      className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200/50 py-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="ri-shake-hands-line text-white text-lg"></i>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QuantumVote
            </span>
          </motion.div>

          <div className="text-center md:text-left">
            <p className="text-gray-600 mb-2">
              © 2025 QuantumVote. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start">
              <i className="ri-flashlight-line mr-2 text-purple-500"></i>
              Powered by quantum randomness for ultimate security
            </p>
          </div>

          <motion.div 
            className="flex items-center space-x-4 text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-green-600 font-medium">
              Quantum Network Active
            </span>
          </motion.div>
        </div>

        <motion.div 
          className="mt-8 pt-6 border-t border-gray-200 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            QuantumVote utilizes advanced quantum cryptography and blockchain technology 
            to ensure the highest levels of election security and voter privacy. 
            Every vote is protected by quantum encryption protocols.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
