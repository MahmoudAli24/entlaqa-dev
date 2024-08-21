'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { login } from '@/actions/actions'
import { log } from 'console'
export default function LoginModule() {
 const [error, setError] = useState<string | null>(null)
 const [isPending, startTransition] = useTransition();
 const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
   setError(null)
   console.log("formData =>", formData.get("email"));
   
    startTransition(async () => {
      try {
        const { errorMessage } = await login(formData);
        if (errorMessage) {
          setError(errorMessage);
        } else {
          router.push("/");
        }
      } catch (error) {       
       if (error instanceof Error) {
        setError(error.message);
       } else {
        setError("An unexpected error occurred");
       }
      }
    })
  }
 return (
  <div className="flex items-center justify-center min-h-screen w-full bg-gray-100">
   <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl
shadow-md">
    <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
    <form action={handleSubmit} className="space-y-4">
     <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
       id="email"
       type="email"
       name='email'
       placeholder="Enter your email"
       required
      />
     </div>
     <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input
       id="password"
       type="password"
       name='password'
       placeholder="Enter your password"
       required
      />
     </div>
     <Button
      type="submit"
      className="w-full"
      disabled={isPending}
     >
      {isPending ? (
       <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Logging in...
       </>
      ) : (
       'Login'
      )}
     </Button>
    </form>
    {error && (
     <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
     </Alert>
    )}
   </div>
  </div>
 )
}