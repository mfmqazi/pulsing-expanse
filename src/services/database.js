// Database Service - Handles all Firebase Firestore operations
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';

// Register new user
export const registerUser = async (username, password, firstName, lastName) => {
    try {
        // Create email from username (since Firebase requires email)
        const email = `${username}@alhafiz.local`;

        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        const userData = {
            username,
            firstName,
            lastName,
            uid: user.uid,
            email,
            joinedDate: new Date().toISOString(),
            streak: 0,
            lastActivityDate: null,
            progress: {
                surah: 1,
                verseIndex: 0,
                percent: 0,
                memorized: {},
                surahName: 'Surah Al-Fatiha'
            },
            settings: {
                targetDuration: 1,
                reciterId: 7,
                translationId: 85
            }
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        return { success: true, user: userData };
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'auth/email-already-in-use') {
            return { success: false, error: 'Username already exists' };
        }
        return { success: false, error: error.message };
    }
};

// Login user
export const loginUser = async (username, password) => {
    try {
        const email = `${username}@alhafiz.local`;

        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
            return { success: true, user: { ...userDoc.data(), uid: user.uid } };
        } else {
            return { success: false, error: 'User data not found' };
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            return { success: false, error: 'Invalid username or password' };
        }
        return { success: false, error: error.message };
    }
};

// Logout user
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
};

// Update user progress
export const updateUserData = async (uid, updates) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, updates);
        return { success: true };
    } catch (error) {
        console.error('Update error:', error);
        return { success: false, error: error.message };
    }
};

// Get user data
export const getUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { success: true, user: userDoc.data() };
        }
        return { success: false, error: 'User not found' };
    } catch (error) {
        console.error('Get user error:', error);
        return { success: false, error: error.message };
    }
};
