'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'E-commerce Business Owner',
      content: 'NIPOST has transformed how I handle my business deliveries. The real-time tracking and reliable service have helped me grow my customer base significantly.',
      rating: 5,
      image: '/api/placeholder/60/60',
    },
    {
      name: 'Ahmed Ibrahim',
      role: 'Freelance Developer',
      content: 'As someone who ships equipment regularly, I appreciate the secure packaging and timely deliveries. NIPOST never disappoints!',
      rating: 5,
      image: '/api/placeholder/60/60',
    },
    {
      name: 'Chioma Okafor',
      role: 'Small Business Owner',
      content: 'The customer support is exceptional, and the delivery times are always accurate. I\'ve been using NIPOST for over 3 years now.',
      rating: 5,
      image: '/api/placeholder/60/60',
    },
    {
      name: 'Tunde Adekunle',
      role: 'Corporate Client',
      content: 'Our company relies on NIPOST for all our document deliveries. The professional service and attention to detail is outstanding.',
      rating: 5,
      image: '/api/placeholder/60/60',
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id='testimonies'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <Quote className="w-12 h-12 text-blue-600 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              What Our Customers Say
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers across Nigeria.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="card-elegant p-6 h-full flex flex-col">
                {/* Rating */}
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Content */}
                <p className="text-gray-600 mb-6 flex-1 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-900 font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="flex justify-center mb-2">
                {renderStars(5)}
              </div>
              <p className="text-blue-100">Customer Rating</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <p className="text-blue-100">On-time Delivery</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">Customer Support</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}