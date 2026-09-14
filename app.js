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
  const authForms = document.getElementById('auth-forms');
  const userInfo = document.getElementById('user-info');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  // إنشاء حساب
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await setDoc(doc(db, "users", userCredential.user.uid), { points: 0, createdAt: new Date() });
        alert("تم إنشاء الحساب بنجاح! تم إرسال رسالة تأكيد إلى بريدك.");
      } catch (error) {
        alert("خطأ: " + error.message);
      }
    });
  }

  // تسجيل دخول
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("تم تسجيل الدخول بنجاح!");
      } catch (error) {
        alert("خطأ: " + error.message);
      }
    });
  }

  // خروج
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => signOut(auth));
  }

  // مراقبة حالة المستخدم وترتيب البيانات
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (authForms) authForms.style.display = 'none';
      if (userInfo) userInfo.style.display = 'block';

      const userEmailText = document.getElementById('user-email-text');
      if (userEmailText) userEmailText.textContent = user.email;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const points = userDoc.exists() ? (userDoc.data().points || 0) : 0;

      // تحديث النقاط في كافة المواضع
      document.querySelectorAll('#user-points, #profile-points').forEach(el => el.textContent = points);

      // توليد رابط الإحالة الخاص بالمستخدم
      const refInput = document.getElementById('ref-link');
      if (refInput) {
        refInput.value = `${window.location.origin}/index.html?ref=${user.uid}`;
      }

      // إسناد UID لجدار العروض CPALead
      const cpaIframe = document.getElementById('cpa-wall');
      if (cpaIframe) {
        cpaIframe.src = `https://www.appstorevault.mobi/wall/Fja8DpRW?subid=${user.uid}`;
      }
    } else {
      if (authForms) authForms.style.display = 'block';
      if (userInfo) userInfo.style.display = 'none';
      const refInput = document.getElementById('ref-link');
      if (refInput) refInput.value = "يرجى تسجيل الدخول أولاً للحصول على رابطك";
    }
  });
});
