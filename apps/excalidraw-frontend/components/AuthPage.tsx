"use client"

export function AuthPage({isSignin}:{
    isSignin: boolean
}) {
    return (
        <>
          <div className="w-screen h-screen flex justify-center items-center">
            <div className="p-6 m-2 bg-white rounded">
                <div className="p-2">
                    <input type="text" placeholder="Email"></input>
                </div>
                <div className="p-2">
                </div>

                <div className="pt-2">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={()=>{
                        alert("Clicked");
                    }}>
                        {isSignin ? "Sign In" : "Sign Up"}
                        </button>
                </div>

            </div>

          </div>
        </>
    )
}