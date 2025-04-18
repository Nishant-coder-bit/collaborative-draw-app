"use client"

import { sign } from "crypto";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthPage({isSignin}:{
    isSignin: boolean
}) {
    const router = useRouter();
    const session = useSession();
    console.log("session",session);
    return (
        <>
          {session.status=='authenticated'  && <div>  <button onClick={()=>signOut()}>Logout</button></div>}
          {session.status==='unauthenticated' && <div>  <button onClick={()=>{
            signIn();
            // console.log(res);
        }}>Login with email</button></div>}
        </>
    )
}