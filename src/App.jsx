import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Memorize from './components/Memorize';
import Plan from './components/Plan';
import Settings from './components/Settings';
import Login from './components/Login';
import { SessionToast } from './components/SessionToast';
import DataReset from './components/DataReset';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserData, updateUserData, logoutUser } from './services/database';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [showSessionToast, setShowSessionToast] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their data from Firestore
        const result = await getUserData(firebaseUser.uid);
        if (result.success) {
          setUser({ ...result.user, uid: firebaseUser.uid });
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowSessionToast(true);
    setTimeout(() => setShowSessionToast(false), 2500);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView('home');
  };

  const updateUserProgress = async (newData) => {
    if (!user || !user.uid) return;

    try {
      // Separate root-level properties from progress properties
      const rootProps = {};
      const progressProps = {};

      // Known root-level properties
      const rootLevelKeys = ['streak', 'lastActivityDate', 'joinedDate', 'settings'];

      Object.keys(newData).forEach(key => {
        if (rootLevelKeys.includes(key)) {
          rootProps[key] = newData[key];
        } else {
          progressProps[key] = newData[key];
        }
      });

      // Build updated user object
      const updates = {};
      if (Object.keys(rootProps).length > 0) {
        Object.assign(updates, rootProps);
      }
      if (Object.keys(progressProps).length > 0) {
        // Merge with existing progress
        updates.progress = { ...user.progress, ...progressProps };
      }

      // Update locally first for immediate feedback
      const updatedUser = {
        ...user,
        ...rootProps,
        progress: updates.progress || user.progress
      };
      setUser(updatedUser);

      // Update in Firebase
      await updateUserData(user.uid, updates);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      alert('Failed to save progress. Please check your connection.');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home setView={setCurrentView} user={user} onLogout={handleLogout} />;
      case 'memorize':
        return <Memorize user={user} updateUserProgress={updateUserProgress} setView={setCurrentView} />;
      case 'plan':
        return <Plan user={user} setView={setCurrentView} updateUserProgress={updateUserProgress} />;
      case 'settings':
        return <Settings setView={setCurrentView} user={user} updateUser={updateUserProgress} />;
      default:
        return <Home setView={setCurrentView} user={user} onLogout={handleLogout} />;
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)' }}>Al-Hafiz</h2>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <main style={{ paddingTop: '40px', minHeight: '100vh' }}>
        {renderView()}
      </main>
      <Navbar currentView={currentView} setView={setCurrentView} />
      <SessionToast show={showSessionToast} onClose={() => setShowSessionToast(false)} />
      <DataReset />
    </>
  );
}

export default App;
