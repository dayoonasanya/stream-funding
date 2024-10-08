"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db } from "@/config/firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { collection, onSnapshot, query } from "firebase/firestore";
import { auth } from "../config/firebase";
import { useRouter } from "next-intl/client";
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState(true);
  const [usersInfo, setUsersInfo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let usersArr = [];
      QuerySnapshot.forEach((doc) => {
        usersArr.push({ ...doc.data(), id: doc.id });
      });
      setUsersInfo(usersArr);
    });
    return () => (usersInfo === null ? unsubscribe() : "");
  }, []);
  useEffect(() => {
    const q = query(collection(db, "projects"));
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let projectsArr = [];
      QuerySnapshot.forEach((doc) => {
        projectsArr.push({ ...doc.data(), id: doc.id });
      });
      setProjects(projectsArr);
    });
    return () => (projects === null ? unsubscribe() : "");
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          contributions: [],
          projects: [],
          bio: user.bio,
          country: user.country,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const googleLogIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(async (result) => {
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      
      const user = result.user;
      function isEmailMatching(email) {
        return email === user.email;
      }
      const isEmailFound = usersInfo.some((userInfo) =>
        isEmailMatching(userInfo.email)
      );

      if (!isEmailFound) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          bio: "",
          userImg: user.photoURL,

          email: user.email,
          timeStamp: serverTimestamp(),
          country: "",
        });
        router.push("/account");
      } else {
        router.push("/profile");
      }
    });
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading,
        googleLogIn,
        projects,
        setLoading,
      }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
