import React, { useEffect, useState } from "react";
import app from "../config/firebase.js";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    // app.auth().onAuthStateChanged(setCurrentUser);
    app.auth().onAuthStateChanged(async user => {
      console.log(user);
      if (user) {
        const db = app.firestore();
        const ref = db.collection("customers").doc(user.uid)

        await ref.get().then(async (doc) => {
          if (doc.exists) {
            // console.log("Document data:", doc.data());
            // console.log({ ...doc.data(), id: doc.id })
            const userData = { ...doc.data(), uid: doc.id, email: user.email, admin: true }
            console.log(userData)
            setCurrentUser(userData)
          } else {
            // doc.data() will be undefined in this case
            console.log("No user data saved yet", user);

            var isAdmin = false
            //Check if user is admin
            // await app.auth().currentUser.getIdTokenResult()
            //   .then((idTokenResult) => {
            //     if (!!idTokenResult.claims.admin) {
            //       // Show admin UI.
            //       console.log('is admin')
            //       isAdmin = true

            //     }
            //   })

            if (user.email == 'shannonajclarke@gmail.com' || user.email == 'karen.broome@health.gov.bb') {
              isAdmin = true
            }

            setCurrentUser({ uid: user.uid, email: user.email, name: user.displayName, admin: isAdmin, token: user.refreshToken })
          }
        }).catch(function (error) {
          console.log("Error getting document:", error);
        });
      } else {
        setCurrentUser(user)
      }



    });
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
