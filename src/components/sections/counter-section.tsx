'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, MapPin, Users, Award, Clock } from 'lucide-react';

interface CounterItem {
  icon: any;
  label: string;
  targetValue: number;
  suffix: string;
  duration: number;
}

export default function CounterSection() {
  const [counters, setCounters] = useState<{[key: string]: number}>({});

  const counterItems: CounterItem[] = [
    { icon: Package, label: 'Parcels Delivered', targetValue: 2500000, suffix: '+', duration: 2000 },
    { icon: Truck, label: 'Delivery Vehicles', targetValue: 15000, suffix: '+', duration: 1500 },
    { icon: MapPin, label: 'Service Locations', targetValue: 774, suffix: '+', duration: 1000 },
    { icon: Users, label: 'Happy Customers', targetValue: 1000000, suffix: '+', duration: 1800 },
    { icon: Award, label: 'Awards Won', targetValue: 50, suffix: '+', duration: 800 },
    { icon: Clock, label: 'Years Experience', targetValue: 150, suffix: '+', duration: 1200 },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            counterItems.forEach((item) => {
              animateCounter(item.label, item.targetValue, item.duration);
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('counter-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const animateCounter = (label: string, targetValue: number, duration: number) => {
    const startTime = Date.now();
    const startValue = 0;

    const updateCounter = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
      
      setCounters(prev => ({
        ...prev,
        [label]: currentValue
      }));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    updateCounter();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <section id="counter-section" className="py-20 bg-gradient-to-r from-blue-900 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Trusted by millions across Nigeria for reliable and efficient delivery services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {counterItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 group-hover:bg-white/20 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-10 h-10 text-blue-900" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 counter">
                  {formatNumber(counters[item.label] || 0)}
                  <span className="text-yellow-400">{item.suffix}</span>
                </div>
                <p className="text-blue-100 font-medium text-lg">
                  {item.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}