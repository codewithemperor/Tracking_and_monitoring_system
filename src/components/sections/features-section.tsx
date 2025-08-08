'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Users, Clock, Smartphone } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your parcels are protected with advanced security measures and real-time monitoring.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience rapid delivery times with our optimized logistics network.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Globe,
      title: 'Nationwide Coverage',
      description: 'Reach every corner of Nigeria with our extensive delivery network.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our round-the-clock customer support.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your parcels in real-time with live updates and notifications.',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Manage your deliveries on the go with our responsive mobile interface.',
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose NIPOST?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We combine cutting-edge technology with reliable service to deliver the best logistics experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="card-elegant p-8 h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}