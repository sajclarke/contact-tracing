import React, { useEffect, useState } from "react";
import app from "../config/firebase.js";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    app.auth().onAuthStateChanged(setCurrentUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser
      }}
    >
      {typeof currentUser === 'undefined' ? null : children}
    </AuthContext.Provider>
  );
};
