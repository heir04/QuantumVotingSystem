'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTASection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      y: -8,
      scale: 1.02,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Portal
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access your secure voting environment through our specialized portals designed for administrators and voters.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Portal Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Link href="/admin/login" className="block group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-blue-300 group-hover:shadow-xl group-hover:shadow-blue-500/10 cursor-pointer">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6 mx-auto group-hover:bg-blue-600 transition-colors">
                  <i className="ri-admin-line text-white text-2xl"></i>
                </div>
                
                <h3 className="text-2xl font-bold text-blue-900 mb-4 text-center">
                  Admin Portal
                </h3>
                
                <p className="text-blue-700 text-center mb-6 leading-relaxed">
                  Manage elections, configure voting parameters, monitor security protocols, 
                  and oversee the entire quantum voting infrastructure.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-blue-600 text-sm">
                    <i className="ri-check-line mr-3 text-blue-500"></i>
                    <span>Election Management Dashboard</span>
                  </div>
                  <div className="flex items-center text-blue-600 text-sm">
                    <i className="ri-check-line mr-3 text-blue-500"></i>
                    <span>Real-time Security Monitoring</span>
                  </div>
                  <div className="flex items-center text-blue-600 text-sm">
                    <i className="ri-check-line mr-3 text-blue-500"></i>
                    <span>Quantum Protocol Configuration</span>
                  </div>
                </div>

                <div className="bg-blue-500 text-white px-6 py-3 rounded-xl text-center font-semibold whitespace-nowrap group-hover:bg-blue-600 transition-colors">
                  Access Admin Portal
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Voter Portal Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link href="/voter/login" className="block group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-green-300 group-hover:shadow-xl group-hover:shadow-green-500/10 cursor-pointer">
                <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-6 mx-auto group-hover:bg-green-600 transition-colors">
                  <i className="ri-vote-line text-white text-2xl"></i>
                </div>
                
                <h3 className="text-2xl font-bold text-green-900 mb-4 text-center">
                  Voter Portal
                </h3>
                
                <p className="text-green-700 text-center mb-6 leading-relaxed">
                  Cast your secure vote with quantum encryption, verify your ballot, 
                  and track election results in real-time with complete transparency.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-green-600 text-sm">
                    <i className="ri-check-line mr-3 text-green-500"></i>
                    <span>Quantum-Encrypted Voting</span>
                  </div>
                  <div className="flex items-center text-green-600 text-sm">
                    <i className="ri-check-line mr-3 text-green-500"></i>
                    <span>Ballot Verification System</span>
                  </div>
                  <div className="flex items-center text-green-600 text-sm">
                    <i className="ri-check-line mr-3 text-green-500"></i>
                    <span>Live Results Tracking</span>
                  </div>
                </div>

                <div className="bg-green-500 text-white px-6 py-3 rounded-xl text-center font-semibold whitespace-nowrap group-hover:bg-green-600 transition-colors">
                  Access Voter Portal
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
