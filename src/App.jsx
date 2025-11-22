import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Memorize from './components/Memorize';
import Plan from './components/Plan';
import Login from './components/Login';
import { SessionToast } from './components/SessionToast';
import DataReset from './components/DataReset';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [showSessionToast, setShowSessionToast] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('quran_app_current_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        // Sync with the users database to get the latest data
        const users = JSON.parse(localStorage.getItem('quran_app_users') || '{}');
        const dbUser = users[parsedUser.username];

        // If user exists in database, use that (it might have more recent data)
        if (dbUser) {

          // Migrate old users: Add memorized field if missing
          if (!dbUser.progress.memorized) {
            dbUser.progress.memorized = {};
            users[parsedUser.username] = dbUser;
            localStorage.setItem('quran_app_users', JSON.stringify(users));
          }

          // Update current session with latest data from database
          localStorage.setItem('quran_app_current_user', JSON.stringify(dbUser));
          return dbUser;
        }

        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading user session:', error);
      localStorage.removeItem('quran_app_current_user');
      return null;
    }
  });

  // Ensure session stays in sync
  useEffect(() => {
    if (user) {
      try {
        // Keep current session updated
        localStorage.setItem('quran_app_current_user', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving user session:', error);
      }
    }
  }, [user]);

  const handleLogin = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('quran_app_current_user', JSON.stringify(userData));

      // Also ensure it's in the users database
      const users = JSON.parse(localStorage.getItem('quran_app_users') || '{}');
      users[userData.username] = userData;
      localStorage.setItem('quran_app_users', JSON.stringify(users));

      // Show confirmation toast
      setShowSessionToast(true);
      setTimeout(() => setShowSessionToast(false), 2500);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error saving login. Please check browser storage permissions.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('quran_app_current_user');
    setCurrentView('home');
  };

  const updateUserProgress = (newData) => {
    if (!user) return;

    try {
      // Separate root-level properties from progress properties
      const rootProps = {};
      const progressProps = {};

      // Known root-level properties
      const rootLevelKeys = ['streak', 'lastActivityDate', 'joinedDate'];

      Object.keys(newData).forEach(key => {
        if (rootLevelKeys.includes(key)) {
          rootProps[key] = newData[key];
        } else {
          progressProps[key] = newData[key];
        }
      });

      // Build updated user with both types of properties
      const updatedUser = {
        ...user,
        ...rootProps,  // Update root properties
        progress: { ...user.progress, ...progressProps }  // Update nested progress
      };

      setUser(updatedUser);

      // Immediately save to localStorage (don't wait for useEffect)
      try {
        localStorage.setItem('quran_app_current_user', JSON.stringify(updatedUser));

        const users = JSON.parse(localStorage.getItem('quran_app_users') || '{}');
        users[user.username] = updatedUser;
        localStorage.setItem('quran_app_users', JSON.stringify(users));

        // Verify save worked
        const verifyUser = localStorage.getItem('quran_app_current_user');
        if (!verifyUser) {
          console.error('⚠️ Warning: Data may not have persisted!');
        }
      } catch (storageError) {
        console.error('❌ localStorage save failed:', storageError);
        alert('Warning: Your progress may not be saved. Check if localStorage is enabled.');
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home setView={setCurrentView} user={user} onLogout={handleLogout} />;
      case 'memorize':
        return <Memorize user={user} updateUserProgress={updateUserProgress} />;
      case 'plan':
        return <Plan user={user} setView={setCurrentView} updateUserProgress={updateUserProgress} />;
      default:
        return <Home setView={setCurrentView} user={user} onLogout={handleLogout} />;
    }
  };

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
