import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const body = await request.json();
    const {password, email} = body;
    const supabase = createServerComponentClient({ cookies });
    const response = await supabase.auth.signInWithPassword({
        email,
        password
    })
    return NextResponse.json(response);
    
}