import LoginForm from "./LoginForm"
//import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/core/lib/createServerComponentClient";  
export default async function LoginPage(){
    const supabase = createServerComponentClient()
    const {
        data: { session },
      } = await supabase.auth.getSession();
    if (session){
        redirect('/sell')
    }
    return <div><LoginForm/></div>
}