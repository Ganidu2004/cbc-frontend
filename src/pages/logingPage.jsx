import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email,setEmail] = useState()
  const [password,setPassword] = useState()
  function login(){
    axios.post(import.meta.env.VITE_BACKEND_URL+"/api/users/login",{
      email : email,
      password : password
    }).then(
      (res)=>{
        if(res.data.user == null){
          toast.error(res.data.message)
          return
        }

        toast.success("Login Success")

        localStorage.setItem("token",res.data.token)

        if(res.data.user.type == "admin"){
          window.location.href = "/admin"
        }else{
          window.location.href = "/"
        }
      }
    )
  }
  return (
    <div className="w-full h-screen bg-gradient-to-r from-blue-400 to-teal-400 flex justify-center items-center">
      <div className="lg:w-1/3 2xl:w-1/4 p-10 bg-white">
        <div className="space-y-3">
          <h1 className="text-center text-3xl font-bold py-5">Welcome To <span className="text-blue-500">HGCK</span></h1>
          <h1 className="text-xl font-semibold">Sign In</h1>
          <form className="flex flex-col space-y-3">
            <input className="outline-0 px-5 py-3 bg-gray-100" placeholder="Enter Your Email" defaultValue={email} onChange={
                (e)=>{
                  setEmail(e.target.value)
                }
              }/>
            <input type="password" className="outline-0 px-5 py-3 bg-gray-100" placeholder="Enter Your Password" defaultValue={password} onChange={
              (e)=>{
                setPassword(e.target.value)
              }
            }/>
            <div className="flex justify-center items-center">
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="cursor-pointer" name=""/>
                <p className="text-sm">Remember Me</p>
              </div>
            </div>
            <button onClick={login} className="cursor-pointer p-2 bg-blue-500 text-xl text-white font-bold rounded-md drop-shado-md hover:bg-blue-400">Login</button>
            <p className="text-center text-sm pb-5 border-b"><span className="font-bold">Terms&Conditions</span> and <span className="font-bold">Privacy</span></p>
          </form>
          <div className="space-y-3">
            <p className="text-center">OR SINGN IN</p>
            <button className="w-full p-2 bg-white border drop-shadow-md rounded-md space-x-3 flex items-center justify-center cursor-pointer hover:bg-blue-200">
              <FcGoogle className="text-2xl" /><span>Sign In With Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

