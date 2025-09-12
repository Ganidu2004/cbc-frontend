import { createClient } from "@supabase/supabase-js"

const key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprd2xocWJpYWtudmZ6bXNuZGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzE4NjksImV4cCI6MjA3MzE0Nzg2OX0.7x6ZvXfculArsSwF5m8PCD01nColZYqP_7gVFx-_gCU`

const url = "https://zkwlhqbiaknvfzmsndar.supabase.co"

export default function uploadMediaToSupabase(file){
    return new Promise((resolve,reject)=>{
        if(file == null){
            reject("File Not Added")
        }
        let fileName = file.name
        const extension = fileName.split(".")[fileName.split(".").length-1]

        //supabase conection
        const supabase = createClient(url, key)

        //Get the uniqe name for file.name 
        const timeStamp = new Date().getTime()

        //set the uniqe name pluse (.) and extension 
        fileName = timeStamp+"."+extension

        supabase.storage.from("images").upload(fileName, file, {
            cacheControl : "3600",
            upsert : false
        }).then(()=>{
            // give the url from supabase
            const publicUrl = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl
            resolve(publicUrl)
        }).catch((err)=>{
            reject(err)
        })
    })
}
                     