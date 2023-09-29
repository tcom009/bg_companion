import getRecommendations from "@/core/lib/getRecommendations"; 
import { NextResponse } from "next/server";
export  async function POST(request:Request){
    const body = await request.json();
    const {embedding, minyear} = body;
    const recommendations = await getRecommendations(embedding, minyear);
    return NextResponse.json(recommendations);
}
