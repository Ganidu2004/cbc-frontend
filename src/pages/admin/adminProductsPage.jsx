import axios from "axios"

export default function AdminProduct(){

    axios.get("http://localhost:5000/api/product").then((res)=>{
        console.log(res)
    })

    return(
        <div>
            <h1>Admin Product Page</h1>
        </div>
    )
}