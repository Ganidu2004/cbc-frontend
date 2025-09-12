import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email,setEmail] = useState("Your email")
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
    <div className="w-full h-screen bg-red-400 flex justify-center items-center">
      <div className="flex justify-center items-center flex-col w-[450px] h-[450px] bg-blue-400">
        <img src="/logo.jpg" className="rounded-full w-[100px] h-[100px]"/>
        <span>Email</span>


        <input className="bg-white" defaultValue={email} onChange={
            (e)=>{
              setEmail(e.target.value)
            }
          }/>
        <span>Password</span>
        <input type="password" className="bg-white" defaultValue={password} onChange={
          (e)=>{
            setPassword(e.target.value)
          }
        }/>


        <button onClick={login} className="bg-white">Login</button>
      </div>
    </div>
  );
}

