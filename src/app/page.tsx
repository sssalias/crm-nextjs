import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('crm_token')?.value

  if (token) {
    try {
      verifyToken(token)
      redirect('/dashboard')
    } catch {
      redirect('/login')
    }
  } else {
    redirect('/login')
  }
}
