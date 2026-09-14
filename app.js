import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  
  // معرفة اسم الصفحة الحالية
  const path = window.location.pathname;
  const isLoginPage = path.endsWith("login.html");

  // إنعاش إنشاء حساب
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await setDoc(doc(db, "users", userCredential.user.uid), { points: 0, createdAt: new Date() });
        alert("تم إنشاء الحساب بنجاح!");
        window.location.href = "index.html";
      } catch (error) {
        alert("خطأ: " + error.message);
      }
    });
  }

  // إنعاش تسجيل الدخول
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

  // خروج
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      });
    });
  }

  // فحص حارس الدخول
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (!isLoginPage) {
        window.location.href = "login.html";
      }
    } else {
      if (isLoginPage) {
        window.location.href = "index.html";
      } else {
        // إظهار الصفحة بعد التأكد من تسجيل الدخول
        const mainBody = document.getElementById('main-body');
        if (mainBody) mainBody.style.display = 'block';

        // جلب البيانات
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const points = userDoc.exists() ? (userDoc.data().points || 0) : 0;

        document.querySelectorAll('#user-points, #profile-points').forEach(el => el.textContent = points);

        const userEmailText = document.getElementById('user-email-text');
        if (userEmailText) userEmailText.textContent = user.email;

        const refInput = document.getElementById('ref-link');
        if (refInput) {
          refInput.value = `${window.location.origin}/login.html?ref=${user.uid}`;
        }

        const cpaIframe = document.getElementById('cpa-wall');
        if (cpaIframe) {
          cpaIframe.src = `https://www.appstorevault.mobi/wall/Fja8DpRW?subid=${user.uid}`;
        }
      }
    }
  });
});
