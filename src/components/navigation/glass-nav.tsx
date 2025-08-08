'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, User, LogOut } from 'lucide-react';

interface GlassNavProps {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  } | null;
}

export default function GlassNav({ user }: GlassNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login
    router.push('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin-dashboard';
      case 'STAFF':
        return '/staff-dashboard';
      default:
        return '/dashboard';
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Track Parcel', href: '/track' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-dark py-2' : 'glass py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-white">NIPOST</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href={getDashboardLink()}>
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-blue-900">
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout} className="btn-primary">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/user/login">
                <Button className="btn-primary">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black/90 backdrop-blur-lg border-white/10">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-blue-900 font-bold text-lg">N</span>
                    </div>
                    <span className="text-xl font-bold text-white">NIPOST</span>
                  </Link>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex-1 space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block text-white/80 hover:text-white transition-colors duration-200 font-medium py-2"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* Mobile CTA */}
                <div className="space-y-4 pt-8 border-t border-white/10">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <User className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-white/60 text-sm">{user.role}</p>
                        </div>
                      </div>
                      <Link href={getDashboardLink()} className="block">
                        <Button variant="outline" className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-blue-900">
                          Dashboard
                        </Button>
                      </Link>
                      <Button onClick={handleLogout} className="w-full btn-primary">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link href="/user/login" className="block">
                      <Button className="w-full btn-primary">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}