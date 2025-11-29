import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { UserProfile, SoulProfile, ReadingLog, AIPreferences } from '../types';

// =========================================================================
// 1. SETUP INSTRUCTIONS:
//    Go to https://console.firebase.google.com/
//    Create a project -> Add Web App -> Copy the "firebaseConfig" object.
//    Paste the values below.
//    ENABLE FIRESTORE DATABASE in the console (Start in Test Mode).
// =========================================================================

const firebaseConfig = {
  // PASTE YOUR KEYS HERE
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if valid keys are provided
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

let auth: any;
let db: any;
let provider: any;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
  } catch (e) {
    console.error("Firebase Initialization Error:", e);
  }
} else {
  console.warn("⚠️ ARCANUM: No Firebase Keys detected. Running in MOCK MODE using LocalStorage.");
}

// --- MOCK CONSTANTS ---
const MOCK_USER_ID = "mock-traveler-001";
const STORAGE_PREFIX = "arcanum_mock_";

// --- AUTH SERVICES ---

export const signInWithGoogle = async (): Promise<UserProfile> => {
  if (isConfigured && auth) {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      let profile: UserProfile = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Anonymous Traveler',
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || undefined,
        age: 25,
      };

      if (userSnap.exists()) {
        const data = userSnap.data();
        profile = {
          ...profile,
          age: data.age || 25,
          soulProfile: data.soulProfile,
          preferences: data.preferences,
        };
        profile.history = await getUserHistory(firebaseUser.uid);
      } else {
        await setDoc(userDocRef, {
          email: profile.email,
          name: profile.name,
          createdAt: Date.now()
        }, { merge: true });
      }

      return profile;
    } catch (error) {
      console.error("Firebase Login Error:", error);
      throw error;
    }
  } else {
    // MOCK LOGIN
    return new Promise((resolve) => {
        setTimeout(async () => {
            localStorage.setItem(`${STORAGE_PREFIX}session`, 'true');
            
            // Load existing mock profile if any
            const existingData = localStorage.getItem(`${STORAGE_PREFIX}user_${MOCK_USER_ID}`);
            let profile: UserProfile = {
                id: MOCK_USER_ID,
                name: 'Mystic Traveler',
                email: 'traveler@arcanum.local',
                age: 28,
            };

            if (existingData) {
                profile = { ...profile, ...JSON.parse(existingData) };
                profile.history = await getUserHistory(MOCK_USER_ID);
            }

            resolve(profile);
        }, 800);
    });
  }
};

export const signOutUser = async (): Promise<void> => {
  if (isConfigured && auth) {
    await signOut(auth);
  } else {
    localStorage.removeItem(`${STORAGE_PREFIX}session`);
  }
};

// --- DATA SERVICES ---

export const saveSoulProfile = async (userId: string, soulProfile: SoulProfile) => {
    if (isConfigured && db) {
        try {
            const userRef = doc(db, "users", userId);
            await setDoc(userRef, { soulProfile }, { merge: true });
        } catch (e) {
            console.error("Firestore save error:", e);
        }
    } else {
        // MOCK SAVE
        const key = `${STORAGE_PREFIX}user_${userId}`;
        const current = JSON.parse(localStorage.getItem(key) || '{}');
        localStorage.setItem(key, JSON.stringify({ ...current, soulProfile }));
    }
};

export const saveUserPreferences = async (userId: string, preferences: AIPreferences) => {
    if (isConfigured && db) {
        try {
            const userRef = doc(db, "users", userId);
            await setDoc(userRef, { preferences }, { merge: true });
        } catch (e) {
            console.error("Firestore save error:", e);
        }
    } else {
        // MOCK SAVE
        const key = `${STORAGE_PREFIX}user_${userId}`;
        const current = JSON.parse(localStorage.getItem(key) || '{}');
        localStorage.setItem(key, JSON.stringify({ ...current, preferences }));
    }
};

export const saveReadingToHistory = async (userId: string, readingLog: ReadingLog) => {
    if (isConfigured && db) {
        try {
            const readingRef = doc(collection(db, "users", userId, "readings"));
            const logWithId = { ...readingLog, id: readingRef.id };
            await setDoc(readingRef, logWithId);
        } catch (e) {
            console.error("Firestore history error:", e);
        }
    } else {
        // MOCK SAVE HISTORY
        const key = `${STORAGE_PREFIX}history_${userId}`;
        const current: ReadingLog[] = JSON.parse(localStorage.getItem(key) || '[]');
        const newLog = { ...readingLog, id: `mock-reading-${Date.now()}` };
        // Prepend
        localStorage.setItem(key, JSON.stringify([newLog, ...current]));
    }
};

export const getUserHistory = async (userId: string): Promise<ReadingLog[]> => {
    if (isConfigured && db) {
        try {
            const q = query(collection(db, "users", userId, "readings"), orderBy("date", "desc"), limit(5));
            const querySnapshot = await getDocs(q);
            const history: ReadingLog[] = [];
            querySnapshot.forEach((doc) => {
                history.push(doc.data() as ReadingLog);
            });
            return history;
        } catch (e) {
            console.error("Firestore fetch error:", e);
            return [];
        }
    } else {
        // MOCK FETCH HISTORY
        const key = `${STORAGE_PREFIX}history_${userId}`;
        const current: ReadingLog[] = JSON.parse(localStorage.getItem(key) || '[]');
        return current.slice(0, 5);
    }
}

// --- LISTENER ---

export const onAuthStateChangedListener = (callback: (user: UserProfile | null) => void) => {
  if (isConfigured && auth) {
    return auth.onAuthStateChanged(async (firebaseUser: any) => {
        if (firebaseUser) {
            const basicProfile = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Anonymous',
                email: firebaseUser.email || '',
                avatarUrl: firebaseUser.photoURL || undefined,
            };
            try {
                const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    callback({
                        ...basicProfile,
                        soulProfile: data.soulProfile,
                        preferences: data.preferences,
                        age: data.age
                    });
                    return;
                }
            } catch(e) { console.log(e); }
            callback(basicProfile);
        } else {
            callback(null);
        }
    });
  } else {
    // MOCK LISTENER
    const checkSession = async () => {
        const hasSession = localStorage.getItem(`${STORAGE_PREFIX}session`);
        if (hasSession) {
            // Retrieve data
            const existingData = localStorage.getItem(`${STORAGE_PREFIX}user_${MOCK_USER_ID}`);
            let profile: UserProfile = {
                id: MOCK_USER_ID,
                name: 'Mystic Traveler',
                email: 'traveler@arcanum.local',
                age: 28,
            };
            if (existingData) {
                const parsed = JSON.parse(existingData);
                profile = { ...profile, ...parsed };
                // Fetch history only if needed, usually managed in App.tsx via getUserHistory
            }
            callback(profile);
        } else {
            callback(null);
        }
    };
    checkSession();
    return () => {}; // Unsubscribe
  }
};
