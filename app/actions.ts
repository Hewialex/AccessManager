
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function switchUser(userId: string) {
    cookies().set('x-user-id', userId);
    redirect('/'); // Redirect to refresh the page/context
}
