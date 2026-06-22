import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ShieldAlert, User, CheckCircle2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AdminLoginProps {
  language: Language;
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLogin({ language, onLoginSuccess, onCancel }: AdminLoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please ensure both passwords are identical.');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Save customized user details in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          fullName: fullName.trim() || 'Showroom Administrator',
          createdAt: new Date().toISOString(),
          role: 'Admin'
        });

        setSuccessMessage('Account registered successfully! Redirecting to secure session...');
        setTimeout(() => {
          onLoginSuccess();
        }, 1200);
      } catch (err: any) {
        console.error("Firebase registration error:", err);
        if (err.code === 'auth/email-already-in-use') {
          setError('This email address is already in use by another administrator.');
        } else if (err.code === 'auth/invalid-email') {
          setError('The email address format is invalid.');
        } else if (err.code === 'auth/weak-password') {
          setError('The password is too weak. Please use at least 6 characters.');
        } else {
          setError(err.message || 'An error occurred during registration.');
        }
        setIsLoading(false);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onLoginSuccess();
      } catch (err: any) {
        console.error("Firebase login error:", err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Invalid administrator email address or secure password key.');
        } else if (err.code === 'auth/invalid-email') {
          setError('The email address format is invalid.');
        } else {
          setError(err.message || 'Authentication failed. Please verify your credentials.');
        }
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-55/70 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden" id="admin-login-screen">
      {/* Decorative Natural Stone abstract backdrop */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] bg-amber-200 rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 right-10 h-[400px] w-[400px] bg-stone-600 rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-2xl border border-stone-200/90 shadow-xl z-20 transition-all duration-300" id="login-container-card">
        {/* Top Header Log */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-stone-950 text-amber-500 font-serif text-lg italic tracking-wider font-black shadow rotate-12 mb-4">
            R
          </div>
          <h2 className="text-2xl font-serif font-black text-stone-950 uppercase tracking-tight">
            {isRegister ? 'Register Administrator' : TRANSLATIONS[language].consoleLogin}
          </h2>
          <p className="mt-1 text-xs text-stone-500 font-medium">
            RP Tiles Luxury Stone & Vitrified Depot System
          </p>
        </div>

        {/* Sliding Tab Control */}
        <div className="relative bg-stone-100 p-1 rounded-xl flex" id="auth-tab-switch">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
              setSuccessMessage('');
            }}
            className={`w-1/2 py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-550 hover:text-stone-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
              setSuccessMessage('');
            }}
            className={`w-1/2 py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-550 hover:text-stone-950'
            }`}
          >
            Register
          </button>
        </div>

        {/* Credentials hints/badge for user friendliness in sign-in mode */}
        {!isRegister && (
          <div className="bg-stone-50 border border-stone-200/65 p-3 rounded-xl text-[11px] leading-relaxed text-stone-700 font-sans shadow-3xs">
            <div className="flex items-center space-x-1.5 font-bold mb-1 text-stone-900">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Registered administrator accounts or demo credentials can log in:</span>
            </div>
            <div>Email: <span className="font-mono font-bold select-all bg-white px-1 py-0.5 rounded border border-stone-150">test@admin.com</span></div>
            <div className="mt-0.5">Password: <span className="font-mono font-bold select-all bg-white px-1 py-0.5 rounded border border-stone-150">Test@123</span></div>
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit} id="login-form">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg flex items-start space-x-2 text-xs font-medium animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-start space-x-2 text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Full Name for Registration */}
            {isRegister && (
              <div>
                <label htmlFor="reg-name" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-name"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-stone-250 bg-white text-xs font-semibold placeholder-stone-405 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {TRANSLATIONS[language].emailLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rptiles.com"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-stone-250 bg-white text-xs font-mono font-semibold placeholder-stone-405 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="security-key" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {TRANSLATIONS[language].passLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="security-key"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (minimum 6 characters)"
                  className="w-full h-10 pl-9 pr-10 rounded-lg border border-stone-250 bg-white text-xs font-mono font-semibold placeholder-stone-405 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field for Registration */}
            {isRegister && (
              <div>
                <label htmlFor="confirm-security-key" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirm-security-key"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify secure password"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-stone-250 bg-white text-xs font-mono font-semibold placeholder-stone-405 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 disabled:bg-stone-600 disabled:cursor-not-allowed uppercase tracking-wider"
              id="btn-submit-credentials"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
                  <span>{isRegister ? 'Creating Account...' : 'Authenticating Session...'}</span>
                </>
              ) : (
                <span>{isRegister ? 'Create Administrator Account' : TRANSLATIONS[language].establishSession}</span>
              )}
            </button>

            {/* Cancel button */}
            <button
              type="button"
              onClick={onCancel}
              className="w-full h-10 border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-750 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              id="btn-back-to-showroom"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{TRANSLATIONS[language].backToShowroom}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
