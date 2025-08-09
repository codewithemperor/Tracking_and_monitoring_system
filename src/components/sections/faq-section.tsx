'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I track my parcel?',
      answer: 'Simply enter your tracking ID in the tracking field on our homepage or navigate to the Track Parcel page. You\'ll receive real-time updates on your parcel\'s location and status.',
    },
    {
      question: 'What are your delivery timeframes?',
      answer: 'Delivery times vary based on the service type and distance. Express deliveries typically take 1-2 business days, while standard deliveries take 3-5 business days within Nigeria.',
    },
    {
      question: 'How can I register as a customer?',
      answer: 'Click on "Get Started" and sign up with your email address. You\'ll need to provide basic information such as your name, phone number, and address to create your account.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including bank transfers, debit cards, credit cards, and mobile payment solutions. Payment options are displayed during checkout.',
    },
    {
      question: 'Can I schedule a pickup for my parcel?',
      answer: 'Yes, registered customers can schedule pickups through their dashboard. Simply enter the pickup details, and our team will arrive at the specified time to collect your parcel.',
    },
    {
      question: 'What should I do if my parcel is delayed?',
      answer: 'If your parcel is delayed, first check the tracking information for updates. If there\'s no movement for more than 24 hours, contact our customer support team through your dashboard or call our helpline.',
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Yes, we offer international shipping to select countries. International delivery times and rates vary depending on the destination and package weight.',
    },
    {
      question: 'How can I become a NIPOST delivery partner?',
      answer: 'We\'re always looking for reliable delivery partners. Visit our "Become a Partner" page or contact our business development team to learn about partnership opportunities and requirements.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50" id='faq'>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="w-12 h-12 text-blue-600 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our services, tracking, and delivery process.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card-elegant cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-center justify-between p-6">
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0 ml-4">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
              
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-blue-100 mb-6">
              Our support team is here to help you with any additional questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@nipost.gov.ng"
                className="btn-primary inline-flex items-center justify-center"
              >
                Email Support
              </a>
              <a
                href="tel:+2348000000000"
                className="btn-secondary inline-flex items-center justify-center"
              >
                Call Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}