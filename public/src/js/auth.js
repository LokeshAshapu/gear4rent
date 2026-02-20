import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Sign Up ---
async function registerUser(email, password, name, role) {
    try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Display Name
        await updateProfile(user, { displayName: name });

        // 3. Store User Role in Firestore
        if (db) {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: role,
                createdAt: new Date().toISOString()
            });
        }

        return { success: true, user };
    } catch (error) {
        console.error("Registration Error:", error);
        return { success: false, error: error.message };
    }
}

// --- Login ---
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch Role
        let role = 'student'; // Default
        if (db) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                role = userDoc.data().role;
            }
        }

        return { success: true, user, role };
    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, error: error.message };
    }
}

// --- Logout ---
async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
        return { success: true };
    } catch (error) {
        console.error("Logout Error:", error);
        return { success: false, error: error.message };
    }
}

// --- Auth Observer (for guarding pages) ---
function monitorAuthState(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            let role = 'student';
            if (db) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) role = userDoc.data().role;
                } catch (e) {
                    console.warn("Could not fetch user role, defaulting to student");
                }
            }
            callback(user, role);
        } else {
            callback(null, null);
        }
    });
}

export { registerUser, loginUser, logoutUser, monitorAuthState };
