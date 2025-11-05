import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import uploadMediaToSupabase from "../utils/mediaUpload";


export default function SignupPage() {

  const navigate = useNavigate()

  const [fName,setFname] = useState("")
  const [lName,setLname] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [comPassword,setComPassword] = useState("")
  const [type,setType] = useState("customer")
  const [file,setFile] = useState(null)

  async function handleSignup(){

    if(password !== comPassword){
      toast.error("Passwords do not match")
      return
    }

    if(!file){
      toast.error("Please select profile picture")
      return
    }

    const imageUrl = await uploadMediaToSupabase(file)

    const newUser = {
      firstName : fName,
      lastName  : lName,
      email     : email,
      password  : password,
      type      : type,
      profilePic: imageUrl
    }

    await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/register", newUser).then(
      (res)=>{
        console.log(res.data)
      }
    )
    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-teal-400 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h1>

        <div className="space-y-4">

          <input type="text" placeholder="First Name" value={fName} onChange={(e)=>setFname(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <input type="text" placeholder="Last Name" value={lName} onChange={(e)=>setLname(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <input type="password" placeholder="Confirm Password" value={comPassword} onChange={(e)=>setComPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <select value={type} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e)=>setType(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>

          <input type="file" onChange={(e)=>setFile(e.target.files[0])}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />

        </div>

        <button onClick={handleSignup} className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
          Sign Up
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}
            className="text-blue-500 hover:underline cursor-pointer">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
