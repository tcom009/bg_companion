import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation" 

export const dynamic = 'force-dynamic'

interface PropsI {
  children: React.ReactNode
}

export default async function withAuthentication({ children }: PropsI) {
  const supabase = createServerComponentClient({ cookies })
  const {data: {session }} = await supabase.auth.getSession()
  

  if (!session){
    redirect('/auth/login')
  }
  return (
    <>
    {children}
    </>
  )
}
