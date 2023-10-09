import { auth } from "@/utils/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";

export default function SignIn() {
    const provider = new GoogleAuthProvider();
    const [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            if (auth.currentUser) setLoggedIn(true)
        }, 1000)
    },[])

    const click = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                const newUser = result.user;
                setLoggedIn(true)
            }).catch((error) => {
                const errorCode = error.code;
                console.error(errorCode)
                const errorMessage = error.message;
                const email = error.email;
                const credential = GoogleAuthProvider.credentialFromError(error);
            });
    }

    const logout = () => {
        auth.signOut().then(() => {
            setLoggedIn(false)
        }).catch((error) => {
            console.error(error)
        });
    }

    return (
        <div style={{position:'absolute', bottom:'1em', right:'1em'}}>
            { auth.currentUser ? (
                <button onClick={logout}>Sign Out</button>
            ) : (
                <button onClick={click}>Sign In With Google</button>
            )} 
        </div>
    )
}