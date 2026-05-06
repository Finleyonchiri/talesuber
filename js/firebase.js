// TalesUber Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  onValue,
  update,
  query,
  orderByChild
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrxW0FVnGkGk9TpjHiKiL-Go11SpvBNLg",
  authDomain: "ubber-8fdf4.firebaseapp.com",
  projectId: "ubber-8fdf4",
  storageBucket: "ubber-8fdf4.firebasestorage.app",
  messagingSenderId: "742783812140",
  appId: "1:742783812140:web:a7395495c351f07b3ac789",
  measurementId: "G-JMJ5SQ1CJ4",
  databaseURL: "https://ubber-8fdf4-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

// ─── Auth Functions ───────────────────────────────────────────────────────────

export async function registerUser({ email, password, fullName, phone, idNumber, location }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  await set(ref(db, `users/${uid}`), {
    fullName,
    phone,
    idNumber,
    location,
    email,
    createdAt: Date.now(),
    firstRideDiscount: true
  });
  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
  window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// ─── User Data Functions ──────────────────────────────────────────────────────

export async function getUserData(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

export async function updateUserData(uid, data) {
  await update(ref(db, `users/${uid}`), data);
}

// ─── Booking Functions ────────────────────────────────────────────────────────

export async function createBooking(uid, bookingData) {
  const bookingRef = push(ref(db, `bookings/${uid}`));
  const booking = {
    ...bookingData,
    status: "pending",
    createdAt: Date.now(),
    bookingId: bookingRef.key
  };
  await set(bookingRef, booking);

  // Simulate status progression
  setTimeout(() => updateBookingStatus(uid, bookingRef.key, "confirmed"), 8000);
  setTimeout(() => updateBookingStatus(uid, bookingRef.key, "in-transit"), 20000);

  return bookingRef.key;
}

export async function updateBookingStatus(uid, bookingId, status) {
  await update(ref(db, `bookings/${uid}/${bookingId}`), { status, updatedAt: Date.now() });
}

export function listenToBookings(uid, callback) {
  const bookingsRef = ref(db, `bookings/${uid}`);
  return onValue(bookingsRef, (snap) => {
    const data = snap.val();
    if (data) {
      const arr = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      arr.sort((a, b) => b.createdAt - a.createdAt);
      callback(arr);
    } else {
      callback([]);
    }
  });
}

export async function getBookings(uid) {
  const snap = await get(ref(db, `bookings/${uid}`));
  if (!snap.exists()) return [];
  const data = snap.val();
  return Object.entries(data)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export { auth, db };
