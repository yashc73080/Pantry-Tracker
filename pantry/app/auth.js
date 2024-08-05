import { useState, useEffect, useCallback } from 'react';
import { auth, googleProvider } from '@/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  const handleError = useCallback((error) => {
    if (error.code === 'auth/email-already-in-use') {
      setError('An account already exists with this email.');
    } else if (error.code === 'auth/weak-password') {
      setError('Password should be at least 6 characters.');
    } else if (error.code === 'auth/invalid-email') {
      setError('Invalid email.');
    } else {
      setError('An error occurred during authentication.');
      console.error('Error:', error);
    }
  }, []);

  const handleSignUp = useCallback(async (email, password, onClose) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError('');
      if (onClose) onClose(); // Close the modal
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const handleLogin = useCallback(async (email, password, onClose) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      if (onClose) onClose(); // Close the modal
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const handleGoogleSignIn = useCallback(async (onClose) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // The signed-in user info.
      const user = result.user;
      setUser(user);
      setError('');
      if (onClose) onClose(); // Close the modal
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError('An error occurred during Google Sign-In. Please try again.');
      }
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      setError(''); // Clear any existing errors
      return true; // Indicate successful logout
    } catch (error) {
      setError('Error signing out');
      console.error('Logout error:', error);
      return false; // Indicate failed logout
    }
  }, []);

  return {
    user,
    error,
    handleSignUp,
    handleLogin,
    handleGoogleSignIn,
    handleLogout,
    setError,
  };
};

export default useAuth;