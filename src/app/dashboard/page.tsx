import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation';
import { ButtonSignout } from './_components/button-signout';

export default async function Dashboard() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        redirect('/')
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1>Dashboard</h1>
            <h3>Usuário: {session.user.email}</h3>
            <ButtonSignout />
        </div>
    );
}