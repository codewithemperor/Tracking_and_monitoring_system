'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Package, Truck, MapPin } from 'lucide-react';

export default function HeroSection() {
  const [trackingId, setTrackingId] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTrack = () => {
    if (trackingId.trim()) {
      window.location.href = `/track/${trackingId}`;
    }
  };

  const stats = [
    { icon: Package, label: 'Parcels Delivered', value: '2.5M+', suffix: '' },
    { icon: Truck, label: 'Delivery Vehicles', value: '15K', suffix: '+' },
    { icon: MapPin, label: 'Service Locations', value: '774', suffix: '+' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full mb-8"
          >
            <span className="text-yellow-400 font-medium">🚚 Nigeria's Leading Postal Service</span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Fast & Reliable
            <span className="text-yellow-400 block">Parcel Delivery</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Track your parcels in real-time, manage deliveries efficiently, and experience seamless logistics with NIPOST's advanced tracking system.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/login">
              <Button size="lg" className="btn-primary text-lg px-8 py-4 group">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/track">
              <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-4">
                Track a Parcel
              </Button>
            </Link>
          </motion.div>

          {/* Tracking Widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-white text-lg font-semibold mb-4">Quick Track</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
              <Button onClick={handleTrack} className="btn-primary px-6">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.2, duration: 0.6 }}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
                <span className="text-yellow-400">{stat.suffix}</span>
              </div>
              <p className="text-white/80 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full"
      />
      <motion.div
        animate={{ y: [20, -20, 20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 w-16 h-16 bg-blue-400/20 backdrop-blur-sm border border-blue-400/30 rounded-full"
      />
    </section>
  );
}