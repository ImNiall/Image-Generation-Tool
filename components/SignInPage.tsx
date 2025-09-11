import React, { useState } from 'react';
import { CarIcon, LockClosedIcon, UserCircleIcon, LoadingSpinner, GoogleIcon, ChevronLeftIcon } from './icons';

interface SignInPageProps {
  onLoginSuccess: () => void;
  onNavigateToLanding: () => void;
}

const RoadIllustration = () => (
    <svg className="absolute bottom-0 left-0 w-full h-auto" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="road-dashes" patternUnits="userSpaceOnUse" width="30" height="10">
                <path d="M0 4.5 H15" stroke="white" strokeWidth="1"/>
            </pattern>
        </defs>
        <path d="M-50,150 Q200,200 450,50" fill="none" stroke="#495057" strokeWidth="40"/>
        <path d="M-50,150 Q200,200 450,50" fill="none" stroke="url(#road-dashes)" strokeWidth="40"/>
        <path d="M200,250 V-50" fill="none" stroke="#495057" strokeWidth="40"/>
        <path d="M200,250 V-50" fill="none" stroke="url(#road-dashes)" strokeWidth="40"/>
        <circle cx="100" cy="100" r="10" fill="#F8F9FA"/>
        <path d="M96 90 L100 80 L104 90" fill="none" stroke="#212529" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


export const SignInPage: React.FC<SignInPageProps> = ({ onLoginSuccess, onNavigateToLanding }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock validation for email/password and social login
      if (email === 'test@example.com' && password === 'password') {
        onLoginSuccess();
      } else if (email && password) {
        setError('Invalid email or password.');
      } else {
        // If it's a social login click, just succeed
        onLoginSuccess();
      }
      setIsLoading(false);
    }, 1500);
  };
  
  const handleGoogleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    setEmail('social@login.com');
    setPassword('social');
    handleSignIn(new Event('submit') as unknown as React.FormEvent);
  };


  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 font-sans">
      {/* Branding Column */}
      <div className="relative hidden lg:flex flex-col items-start justify-between bg-brand-gray-900 text-white p-12">
        <button onClick={onNavigateToLanding} className="inline-flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-gray-900 focus:ring-brand-blue rounded-lg">
            <div className="bg-brand-blue p-2 rounded-lg">
                <CarIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">DriveDiagram</span>
        </button>
        <div className="relative z-10">
            <h1 className="text-4xl font-bold leading-tight">Welcome Back, Instructor</h1>
            <p className="mt-4 text-lg text-brand-gray-300 max-w-md">Sign in to access your diagram library and continue creating powerful, clear teaching aids for your students.</p>
        </div>
        <RoadIllustration />
        <div className="text-sm text-brand-gray-500 z-10">&copy; {new Date().getFullYear()} DriveDiagram</div>
      </div>
      
      {/* Form Column */}
      <div className="flex items-center justify-center p-6 sm:p-12 w-full bg-white">
        <div className="w-full max-w-md">
            <button onClick={onNavigateToLanding} className="lg:hidden inline-flex items-center gap-2 text-sm font-semibold text-brand-gray-700 hover:text-brand-blue mb-8">
                <ChevronLeftIcon className="w-5 h-5" />
                Back to Home
            </button>
          <h2 className="text-3xl font-bold text-brand-gray-900">Instructor Sign In</h2>
          <p className="text-brand-gray-700 mt-2">Welcome! Enter your details to access your dashboard.</p>

          <div className="mt-8 space-y-4">
            <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full inline-flex items-center justify-center gap-3 py-3 px-4 border border-brand-gray-300 rounded-lg text-brand-gray-700 font-semibold hover:bg-brand-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50">
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-brand-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-brand-gray-500">OR</span>
                </div>
            </div>

            <form onSubmit={handleSignIn} noValidate className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <UserCircleIcon className="w-5 h-5 text-brand-gray-500" />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-brand-gray-300 py-2.5 pl-10 pr-3 text-brand-gray-900 placeholder:text-brand-gray-500 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                    <div className="flex justify-between items-baseline">
                        <label htmlFor="password" className="block text-sm font-medium text-brand-gray-700 mb-1">
                            Password
                        </label>
                        <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">
                            Forgot password?
                        </a>
                    </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockClosedIcon className="w-5 h-5 text-brand-gray-500" />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-brand-gray-300 py-2.5 pl-10 pr-3 text-brand-gray-900 placeholder:text-brand-gray-500 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              
              {error && (
                <p className="text-sm text-red-600" role="alert">{error}</p>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center text-lg font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark transition-all duration-300 px-8 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-brand-gray-300 disabled:cursor-not-allowed"
                disabled={isLoading}
                >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="w-6 h-6 mr-3" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
            </button>
            </form>
          </div>
          <p className="mt-8 text-center text-sm text-brand-gray-700">
              Don't have an account?{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-brand-blue hover:text-brand-blue-dark">
                Sign up for a free instructor account
              </a>
          </p>
        </div>
      </div>
    </div>
  );
};