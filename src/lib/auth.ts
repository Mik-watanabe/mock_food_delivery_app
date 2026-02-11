import "server-only";
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";


export async function requireUser() {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect("/login");
    }

    return user;  
}