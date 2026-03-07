import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Sign Up ---
async function registerUser(email, password, name, role) {
    try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Display Name in Auth profile
        await updateProfile(user, { displayName: name });

        // 3. Send email verification
        await sendEmailVerification(user);

        // 4. Sign out immediately — user must verify before logging in
        await signOut(auth);

        // 5. Temporarily save name & role in sessionStorage so we can
        //    create the Firestore doc on their FIRST verified login.
        //    (No Firestore write here — avoids wasted storage for unverified accounts)
        sessionStorage.setItem('pendingUserName', name);
        sessionStorage.setItem('pendingUserRole', role);

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

        // 🔒 Email verification check
        if (!user.emailVerified) {
            await signOut(auth); // Sign them back out immediately
            return {
                success: false,
                error: "Please verify your email before logging in. Check your inbox for the verification link."
            };
        }

        // Fetch or CREATE Firestore profile
        let role = 'student'; // Default
        if (db) {
            try {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    // Profile already exists — just read the role
                    role = userDoc.data().role;
                } else {
                    // First verified login — create the Firestore doc now
                    const name = sessionStorage.getItem('pendingUserName') || user.displayName || 'User';
                    role = sessionStorage.getItem('pendingUserRole') || 'student';

                    await setDoc(userRef, {
                        uid: user.uid,
                        name: name,
                        email: user.email,
                        role: role,
                        emailVerified: true,
                        createdAt: new Date().toISOString()
                    });

                    // Clean up temporary storage
                    sessionStorage.removeItem('pendingUserName');
                    sessionStorage.removeItem('pendingUserRole');
                }
            } catch (e) {
                console.warn("Could not fetch/create user profile in Firestore:", e.message);
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
