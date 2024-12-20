'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/student', label: 'Dashboard' },
    { href: '/student/courses', label: 'Courses' },
    { href: '/student/schedule', label: 'Schedule' },
    { href: '/student/grades', label: 'Grades' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/student" className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-blue-600">JDU</span>
                  <span className="hidden md:inline-block text-lg font-semibold text-gray-900">John Doe University</span>
                </Link>
              </div>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } h-16 inline-flex items-center px-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 