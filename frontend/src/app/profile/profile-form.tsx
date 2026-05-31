'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/use-auth';

export function ProfileForm() {
  const { user, updateProfile, logout } = useAuth();
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const formData = new FormData(event.currentTarget);
    await updateProfile.mutateAsync({
      name: String(formData.get('name')),
      email: String(formData.get('email'))
    });
    setMessage('Profile updated');
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input name="name" defaultValue={user?.name || ''} placeholder="Full name" required />
            <Input name="email" type="email" defaultValue={user?.email || ''} placeholder="Email" required />
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            <Button className="w-full" disabled={updateProfile.isPending}>{updateProfile.isPending ? 'Saving' : 'Save changes'}</Button>
          </form>
          <Button className="mt-3 w-full" variant="outline" onClick={() => logout()}>Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
