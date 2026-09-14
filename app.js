import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6rnXLMDlvy0Eezc7MkdmP334EzPTKlGE",
  authDomain: "mistcash-9a71c.firebaseapp.com",
  projectId: "mistcash-9a71c",
  storageBucket: "mistcash-9a71c.firebasestorage.app",
  messagingSenderId: "819929785371",
  appId: "1:819929785371:web:396e322f83319016bb44be",
  measurementId: "G-FGBZZ1P9W6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const googleBtn = document.getElementById('google-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const path = window.location.pathname;
  const isLoginPage = path.includes("login.html");

  // تسجيل الدخول بـ Google
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, { points: 0, createdAt: new Date() });
        }

        window.location.href = "index.html";
      } catch (error) {
        alert("تنبيه خطأ: " + error.message);
      }
    });
  }

  // إنشاء حساب بالبريد
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), { points: 0, createdAt: new Date() });
        alert("تم إنشاء الحساب بنجاح!");
        window.location.href = "index.html";
      } catch (error) {
        alert("خطأ: " + error.message);
      }
    });
  }

  // تسجيل الدخول العادي
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "index.html";
      } catch (error) {
        alert("خطأ: " + error.message);
      }
    });
  }

  // تسجيل الخروج
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => { window.location.href = "login.html"; });
    });
  }

  // متابعة جلسة المستخدم
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (!isLoginPage) window.location.href = "login.html";
    } else {
      if (isLoginPage) {
        window.location.href = "index.html";
      } else {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        let currentPoints = userDoc.exists() ? (userDoc.data().points || 0) : 0;

        document.querySelectorAll('#user-points, #profile-points').forEach(el => el.textContent = currentPoints);

        const userEmailText = document.getElementById('user-email-text');
        if (userEmailText) userEmailText.textContent = user.email;
      }
    }
  });
});
