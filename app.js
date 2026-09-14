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

// حفظ كود الإحالة من الرابط
const urlParams = new URLSearchParams(window.location.search);
const referrerUid = urlParams.get('ref');
if (referrerUid) {
  localStorage.setItem('lootplay_referrer', referrerUid);
}

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const googleBtn = document.getElementById('google-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const copyRefBtn = document.getElementById('copy-ref-btn');
  const path = window.location.pathname;
  const isLoginPage = path.includes("login.html");

  // عند الضغط على زر Google
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // التحقق وإنشاء ملف للمستخدم إذا كان جديداً
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, { points: 0, createdAt: new Date() });

          const savedReferrer = localStorage.getItem('lootplay_referrer');
          if (savedReferrer && savedReferrer !== user.uid) {
            try {
              const refUserRef = doc(db, "users", savedReferrer);
              await updateDoc(refUserRef, { points: increment(100) });
              localStorage.removeItem('lootplay_referrer');
            } catch (err) {}
          }
        }

        window.location.href = "index.html";
      } catch (error) {
        alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
      }
    });
  }

  // نسخ رابط الإحالة
  if (copyRefBtn) {
    copyRefBtn.addEventListener('click', () => {
      const refInput = document.getElementById('ref-link');
      if (refInput && refInput.value) {
        navigator.clipboard.writeText(refInput.value);
        alert("تم نسخ رابط الدعوة بنجاح!");
      }
    });
  }

  // إنشاء حساب عادي بالبريد
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await setDoc(doc(db, "users", userCredential.user.uid), { points: 0, createdAt: new Date() });

        const savedReferrer = localStorage.getItem('lootplay_referrer');
        if (savedReferrer && savedReferrer !== userCredential.user.uid) {
          try {
            const refUserRef = doc(db, "users", savedReferrer);
            await updateDoc(refUserRef, { points: increment(100) });
            localStorage.removeItem('lootplay_referrer');
          } catch(err) {}
        }

        alert("تم إنشاء الحساب بنجاح!");
        window.location.href = "index.html";
      } catch (error) {
        alert("خطأ: " + error.message);
      }
    });
  }

  // تسجيل الدخول العادي بالبريد
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

  // متابعة حالة الحساب والتوجيه
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

        const refInput = document.getElementById('ref-link');
        if (refInput) {
          refInput.value = `${window.location.origin}/login.html?ref=${user.uid}`;
        }

        const cpaIframe = document.getElementById('cpa-wall');
        if (cpaIframe) {
          cpaIframe.src = `https://www.appstorevault.mobi/wall/Fja8DpRW?subid=${user.uid}`;
        }

        setupWheel(user.uid, userRef);
      }
    }
  });
});

// إعداد عجلة الحظ
function setupWheel(uid, userRef) {
  const canvas = document.getElementById('wheel-canvas');
  const spinBtn = document.getElementById('spin-btn');
  if (!canvas || !spinBtn) return;

  const ctx = canvas.getContext('2d');
  const rewards = [10, 20, 50, 5, 100, 15];
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];
  const numSlices = rewards.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  let startAngle = 0;
  let isSpinning = false;

  function drawWheel() {
    for (let i = 0; i < numSlices; i++) {
      const angle = startAngle + i * sliceAngle;
      ctx.beginPath();
      ctx.fillStyle = colors[i];
      ctx.moveTo(150, 150);
      ctx.arc(150, 150, 150, angle, angle + sliceAngle);
      ctx.lineTo(150, 150);
      ctx.fill();

      ctx.save();
      ctx.translate(150, 150);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(`+${rewards[i]}`, 130, 6);
      ctx.restore();
    }
  }

  drawWheel();

  spinBtn.addEventListener('click', async () => {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;

    const winningIndex = Math.floor(Math.random() * numSlices);
    const prize = rewards[winningIndex];
    const degrees = 360 * 5 + (numSlices - winningIndex - 0.5) * (360 / numSlices);
    
    let currentDegree = 0;
    const interval = setInterval(async () => {
      currentDegree += 10;
      startAngle = (currentDegree * Math.PI) / 180;
      drawWheel();

      if (currentDegree >= degrees) {
        clearInterval(interval);
        isSpinning = false;
        spinBtn.disabled = false;

        await updateDoc(userRef, { points: increment(prize) });
        alert(`مبروك! ربحت ${prize} نقطة تم إضافتها لحسابك!`);

        const updatedDoc = await getDoc(userRef);
        const newPoints = updatedDoc.data().points;
        document.querySelectorAll('#user-points, #profile-points').forEach(el => el.textContent = newPoints);
      }
    }, 15);
  });
}
