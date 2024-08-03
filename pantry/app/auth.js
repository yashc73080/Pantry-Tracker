import { useState, useEffect } from 'react';
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

  const handleSignUp = async (email, password, onClose) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError('');
      if (onClose) onClose(); // Close the modal
    } catch (error) {
      handleError(error);
    }
  };

  const handleLogin = async (email, password, onClose) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      if (onClose) onClose(); // Close the modal
    } catch (error) {
      handleError(error);
    }
  };

  const handleGoogleSignIn = () => async (onClose) => {
    try {
      await signInWithPopup(auth, googleProvider);
      setError('');
      if (onClose) onClose(); // Close the modal
    } catch (error) {
      handleError(error);
    }
  };

  const handleLogout = async () => {
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
  };

  const handleError = (error) => {
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
  };

  return {
    user,
    error,
    handleSignUp,
    handleLogin,
    handleGoogleSignIn,
    handleLogout,
    setError, // Exporting setError to manually reset errors in the consuming component if needed
  };
};

export default useAuth;