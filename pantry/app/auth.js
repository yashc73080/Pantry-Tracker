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

  const handleSignUp = async (email, password) => {
    try {
      await signUp(email, password);
      console.log('Signed up successfully!');
      alert('Signed up successfully!');
      handleClose(); // Close the modal after successful sign-up
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('An account already exists with this email.');
      } else if (error.code === 'auth/weak-password') {
        alert('Password should be at least 6 characters');
      } else {
        console.error('Error signing up:', error);
      }
    }
  };

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      handleClose()
    } catch (error) {
      handleError(error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setError('');
    } catch (error) {
      handleError(error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      setError('Error signing out');
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
