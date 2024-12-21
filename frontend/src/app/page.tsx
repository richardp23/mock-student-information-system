'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STUDENT_MAP: { [key: string]: number } = {
  'john.smith23@my.johndoe.edu': 1,
  'jane.doe23@my.johndoe.edu': 2,
  'bob.johnson23@my.johndoe.edu': 3,
  'alice.brown23@my.johndoe.edu': 4,
  'charlie.wilson23@my.johndoe.edu': 5,
  'diana.miller23@my.johndoe.edu': 6,
  'eva.garcia23@my.johndoe.edu': 7,
  'frank.lee23@my.johndoe.edu': 8,
  'grace.wang23@my.johndoe.edu': 9,
  'henry.kim23@my.johndoe.edu': 10
};

const Logo = () => (
  <div className="text-center mb-6">
    <div className="text-4xl font-bold text-blue-600 tracking-tight">JDU</div>
    <div className="text-lg text-gray-600 font-semibold mt-1">John Doe University</div>
    <div className="text-sm text-gray-500 italic">Est. 2024</div>
  </div>
);

const DemoBanner = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white text-center py-2 text-sm">
    Demo Mode: See <a href="https://github.com/richardp23/mock-student-information-system" className="text-blue-300 hover:text-blue-200 underline">GitHub README</a> for more information.
  </div>
);

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentId = STUDENT_MAP[email];
    if (studentId) {
      localStorage.setItem('studentId', studentId.toString());
      router.push('/student');
    } else {
      setError('Invalid student email address');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <Logo />
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Student Information System
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your student email"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
      <DemoBanner />
    </main>
  );
}
