//import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/core/lib/createServerComponentClient";
interface PropsI {
  children: React.ReactNode;
}

export default async function AuthWrapper({ children }: PropsI) {
  const supabase = createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }else if(session){
    return <>{children}</>;
  }
}
