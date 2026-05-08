// src/features/auth/authService.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getIdTokenResult } from "firebase/auth";
import { auth } from "../../firebase/firebase.config"; // your firebase setup

// Register user
const register = async (userData: { email: string; password: string }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
  const user = userCredential.user;

  // Get custom claims (like 'role')
  const tokenResult = await getIdTokenResult(user);
  const role = tokenResult.claims.role;

  localStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email, role }));

  return { uid: user.uid, email: user.email, role };
};

// Login user
const login = async (userData: { email: string; password: string }) => {
  const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
  const user = userCredential.user;

  const tokenResult = await getIdTokenResult(user);
  const role = tokenResult.claims.role;

  localStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email, role }));

  return { uid: user.uid, email: user.email, role };
};

// Logout user
const logout = async () => {
  await signOut(auth);
  localStorage.removeItem("user");
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
