// استدعاء مكتبات Firebase عبر CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyB6rnXLMDlvy0Eezc7MkdmP334EzPTKlGE",
  authDomain: "mistcash-9a71c.firebaseapp.com",
  projectId: "mistcash-9a71c",
  storageBucket: "mistcash-9a71c.firebasestorage.app",
  messagingSenderId: "819929785371",
  appId: "1:819929785371:web:396e322f83319016bb44be",
  measurementId: "G-FGBZZ1P9W6"
};

// تهيئة الخدمة
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// تحديث عرض النقاط في الصفحة
function updateUI(points) {
    const pointsElements = document.querySelectorAll('#user-points');
    pointsElements.forEach(el => {
        el.textContent = points || 0;
    });
}

// تحميل نقاط المستخدم
async function loadUserData(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            updateUI(userSnap.data().points);
        } else {
            // إنشاء مستخدم جديد بنقاط أولية 0
            await setDoc(userRef, { points: 0, createdAt: new Date() });
            updateUI(0);
        }
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

// متابعة حالة تسجيل الدخول
auth.onAuthStateChanged(user => {
    if (user) {
        loadUserData(user.uid);
    } else {
        updateUI(0);
    }
});