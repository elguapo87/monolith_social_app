"use client"

import Image from "next/image"
import { assets } from "../../public/assets"
import { useClerk, useUser, UserButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {

  const { openSignIn } = useClerk();
  const { user } = useUser();

  const router = useRouter();


  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Image
        src={assets.bgImage}
        alt="Backgorund"
        className="absolute top-0 left-0 -z-1 w-full h-full object-cover"
      />

      {/* LEFT SIDE: BRANDING */}
      <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40">
        <Image
          src={assets.monolith_logo}
          width={120}
          height={40}
          alt="Logo"
          className="h-10  object-contain"
        />

        <div>
          <h1 className="text-3xl md:text-6xl md:pb-2 font-bold bg-linear-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">More then just friends truly connect</h1>
          <p className="text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md">connect with global community on monolith.</p>
        </div>

        <span className="md:h-10"></span>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <SignIn />
      </div>
    </div>
  )
}

export default Login

