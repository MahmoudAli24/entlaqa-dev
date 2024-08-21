'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
 const supabase = createClient()

 try {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw error;
  if (!data.session) throw new Error("No session");

  return { errorMessage: null };
 } catch (error) {
  let errorMessage = "An error occurred";
  if (error instanceof Error) {
   errorMessage = error.message;
  }
  return { errorMessage };
 }
}


export async function signup(formData: FormData) {
 const supabase = createClient()

 const data = {
  email: formData.get('email') as string,
  password: formData.get('password') as string,
 }

 const { error } = await supabase.auth.signUp(data)

 if (error) {
  redirect('/error')
 }

 revalidatePath('/', 'layout')
 redirect('/')
}