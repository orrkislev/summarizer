import { auth } from "@/utils/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Button = styled.button`
    background-color: #4285F4;
    color: white;
    padding: 0.5em 1em;
    border-radius: 0.5em;
    border: none;
    cursor: pointer;
    font-size: 1em;
    font-weight: bold;
    outline: none;
    &:hover {
        background-color: #357AE8;
    }
`


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
        <div style={{position:'fixed', bottom:'1em', right:'1em'}}>
            { auth.currentUser ? (
                <Button onClick={logout}>Sign Out</Button>
            ) : (
                <Button onClick={click}>Sign In With Google</Button>
            )} 
        </div>
    )
}