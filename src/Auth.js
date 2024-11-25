import React, { useState } from "react";
import { auth, database, googleProvider } from "./firebase";
import "./Auth.css";

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUpWithEmail = async () => {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      const user = result.user;

      await database.ref(`users/${user.uid}`).set({
        email: user.email,
      });

      onLogin(user);
    } catch (error) {
      alert(error.message);
    }
  };

  const signInWithEmail = async () => {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      onLogin(result.user);
    } catch (error) {
      alert(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      const user = result.user;

      const userRef = database.ref(`users/${user.uid}`);
      const snapshot = await userRef.once("value");

      if (!snapshot.exists()) {
        await userRef.set({
          email: user.email,
        });
      }

      onLogin(user);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>CSCI-380 Inventory Management Software</h2>
        <p>Sign in or create an account to manage your inventory.</p>
        <button className="google-btn" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
        <div className="divider">OR</div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <div className="auth-buttons">
          <button className="auth-btn" onClick={signUpWithEmail}>
            Sign Up
          </button>
          <button className="auth-btn" onClick={signInWithEmail}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;