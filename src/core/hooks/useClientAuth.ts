import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react"; 

export  function useClientAuth() {
  const supabase = createClientComponentClient();
  const [session, setSession] = useState(false);
  useEffect (() =>{
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || session === null) {
        setSession(false);
      }
      else{
        setSession(true);
      }
    });
  },[supabase.auth])

  
  return session;
}
