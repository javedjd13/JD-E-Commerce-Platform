'use client';

import {
  CreditCard,
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  MoreVertical,
  Package,
  PenLine,
  Plus,
  Trash2,
  UserRound
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ProfilePageSkeleton } from '@/components/common/loading-skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { UserAddress } from '@/types/user';

type ProfileTab = 'profile' | 'addresses' | 'pan' | 'wishlist';

const WishlistPanel = dynamic(
  () => import('@/features/wishlist/wishlist-panel').then((module) => module.WishlistPanel),
  {
    loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted" />
  }
);

const emptyAddress = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false
};

export function ProfileView() {
  const { user, isLoading, updateProfile, createAddress, updateAddress, deleteAddress, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('addresses');
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [message, setMessage] = useState('');

  const addresses = useMemo(() => user?.addresses || [], [user?.addresses]);

  if (isLoading) return <ProfilePageSkeleton />;
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded bg-card p-8 text-card-foreground shadow-sm ring-1 ring-border">
          <h1 className="text-2xl font-bold">Login to view profile</h1>
          <Link href="/login" className="mt-5 inline-flex h-11 items-center rounded bg-blue-600 px-6 font-semibold text-white">Login</Link>
        </div>
      </div>
    );
  }

  async function onProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const formData = new FormData(event.currentTarget);
    await updateProfile.mutateAsync({
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      profileImageUrl: String(formData.get('profileImageUrl') || ''),
      panNumber: String(formData.get('panNumber') || '')
    });
    setMessage('Profile information updated');
  }

  async function onAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const formData = new FormData(event.currentTarget);
    const input = {
      label: String(formData.get('label') || 'Home'),
      fullName: String(formData.get('fullName') || ''),
      phone: String(formData.get('phone') || ''),
      line1: String(formData.get('line1') || ''),
      line2: String(formData.get('line2') || ''),
      city: String(formData.get('city') || ''),
      state: String(formData.get('state') || ''),
      postalCode: String(formData.get('postalCode') || ''),
      country: String(formData.get('country') || 'India'),
      isDefault: formData.get('isDefault') === 'on'
    };

    if (editingAddress) {
      await updateAddress.mutateAsync({ addressId: editingAddress.id, input });
      setMessage('Address updated');
    } else {
      await createAddress.mutateAsync(input);
      setMessage('Address added');
    }

    setIsAddressFormOpen(false);
    setEditingAddress(null);
  }

  async function onDeleteAddress(addressId: number) {
    await deleteAddress.mutateAsync(addressId);
    setMessage('Address deleted');
  }

  function openNewAddressForm() {
    setEditingAddress(null);
    setIsAddressFormOpen(true);
    setActiveTab('addresses');
  }

  function openEditAddressForm(address: UserAddress) {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
    setActiveTab('addresses');
  }

  return (
    <div className="bg-background px-3 py-5 text-foreground sm:px-5">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[390px_1fr]">
        <aside className="space-y-4">
          <section className="rounded bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-secondary">
                <Image src={user.profileImageUrl || ''} alt={user.name} fill sizes="64px" className="object-cover" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hello,</p>
                <h1 className="text-xl font-bold text-card-foreground">{user.name}</h1>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded bg-card text-card-foreground shadow-sm ring-1 ring-border">
            <SidebarRow icon={<Package />} label="MY ORDERS" href="/orders" />
            <div className="border-t border-border py-4">
              <SidebarHeading icon={<UserRound />} label="ACCOUNT SETTINGS" />
              <SidebarButton label="Profile Information" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
              <SidebarButton label="Manage Addresses" active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} />
              <SidebarButton label="PAN Card Information" active={activeTab === 'pan'} onClick={() => setActiveTab('pan')} />
            </div>
            <div className="border-t border-border py-4">
              <SidebarHeading icon={<CreditCard />} label="PAYMENTS" />
              <SidebarInfo label="Gift Cards" value="₹0" />
              <SidebarInfo label="Saved UPI" />
              <SidebarInfo label="Saved Cards" />
            </div>
            <div className="border-t border-border py-4">
              <SidebarHeading icon={<Heart />} label="MY STUFF" />
              <SidebarButton label="My Wishlist" active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} />
            </div>
            <button
              className="flex w-full items-center gap-6 border-t border-border px-8 py-6 text-left text-lg font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => logout.mutate()}
              type="button"
            >
              <LogOut className="h-6 w-6 text-blue-600" />
              Logout
            </button>
          </section>

          <section className="rounded bg-card p-5 text-card-foreground shadow-sm ring-1 ring-border">
            <p className="font-semibold text-card-foreground">Frequently Visited:</p>
            <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
              <Link href="/orders">Track Order</Link>
              <Link href="/dashboard">Help Center</Link>
            </div>
          </section>
        </aside>

        <main className="min-h-[680px] rounded bg-card p-6 text-card-foreground shadow-sm ring-1 ring-border sm:p-10">
          {message ? <p className="mb-5 rounded bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60">{message}</p> : null}
          {activeTab === 'profile' ? (
            <ProfileInformationForm user={user} isSaving={updateProfile.isPending} onSubmit={onProfileSubmit} />
          ) : null}
          {activeTab === 'addresses' ? (
            <ManageAddresses
              addresses={addresses}
              editingAddress={editingAddress}
              isFormOpen={isAddressFormOpen}
              isSaving={createAddress.isPending || updateAddress.isPending}
              onAdd={openNewAddressForm}
              onCancel={() => {
                setIsAddressFormOpen(false);
                setEditingAddress(null);
              }}
              onDelete={onDeleteAddress}
              onEdit={openEditAddressForm}
              onSubmit={onAddressSubmit}
            />
          ) : null}
          {activeTab === 'pan' ? (
            <ProfileInformationForm user={user} isSaving={updateProfile.isPending} onSubmit={onProfileSubmit} focusPan />
          ) : null}
          {activeTab === 'wishlist' ? (
            <WishlistPanel />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function ProfileInformationForm({
  user,
  isSaving,
  onSubmit,
  focusPan = false
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  focusPan?: boolean;
}) {
  return (
    <form className="max-w-3xl space-y-6" onSubmit={onSubmit}>
      <div>
        <h2 className="text-2xl font-bold text-card-foreground">{focusPan ? 'PAN Card Information' : 'Profile Information'}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Update your contact information, profile image, and account details.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" name="name" defaultValue={user.name} required />
        <Field label="Email" name="email" type="email" defaultValue={user.email} required />
        <Field label="Mobile Number" name="phone" defaultValue={user.phone || ''} placeholder="Enter mobile number" />
        <Field label="PAN Number" name="panNumber" defaultValue={user.panNumber || ''} placeholder="ABCDE1234F" />
        <div className="sm:col-span-2">
          <Field label="Profile Image URL" name="profileImageUrl" defaultValue={user.profileImageUrl || ''} placeholder="https://..." />
        </div>
      </div>
      <Button disabled={isSaving} type="submit">{isSaving ? 'Saving' : 'Save Changes'}</Button>
    </form>
  );
}

function ManageAddresses({
  addresses,
  editingAddress,
  isFormOpen,
  isSaving,
  onAdd,
  onCancel,
  onDelete,
  onEdit,
  onSubmit
}: {
  addresses: UserAddress[];
  editingAddress: UserAddress | null;
  isFormOpen: boolean;
  isSaving: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onDelete: (addressId: number) => void;
  onEdit: (address: UserAddress) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const defaults = editingAddress || emptyAddress;

  return (
    <div>
      <h2 className="text-2xl font-bold text-card-foreground">Manage Addresses</h2>
      <button
        className="mt-7 flex h-16 w-full items-center gap-4 border border-border px-5 text-left font-semibold uppercase text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
        onClick={onAdd}
        type="button"
      >
        <Plus className="h-5 w-5" />
        Add a New Address
      </button>

      {isFormOpen ? (
        <form className="mt-6 space-y-4 border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/70 dark:bg-blue-950/20" key={editingAddress?.id || 'new'} onSubmit={onSubmit}>
          <h3 className="font-bold text-card-foreground">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address Type" name="label" defaultValue={defaults.label || 'Home'} required />
            <Field label="Full Name" name="fullName" defaultValue={defaults.fullName} required />
            <Field label="Mobile Number" name="phone" defaultValue={defaults.phone} required />
            <Field label="Pincode" name="postalCode" defaultValue={defaults.postalCode} required />
            <Field label="City" name="city" defaultValue={defaults.city} required />
            <Field label="State" name="state" defaultValue={defaults.state} required />
            <Field label="Country" name="country" defaultValue={defaults.country} required />
            <label className="flex items-center gap-2 pt-7 text-sm font-semibold text-muted-foreground">
              <input name="isDefault" type="checkbox" defaultChecked={defaults.isDefault} />
              Set as default address
            </label>
            <div className="sm:col-span-2">
              <Field label="Address Line 1" name="line1" defaultValue={defaults.line1} required />
            </div>
            <div className="sm:col-span-2">
              <Field label="Address Line 2" name="line2" defaultValue={defaults.line2 || ''} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button disabled={isSaving} type="submit">{isSaving ? 'Saving' : editingAddress ? 'Update Address' : 'Save Address'}</Button>
            <Button onClick={onCancel} type="button" variant="outline">Cancel</Button>
          </div>
        </form>
      ) : null}

      <div className="mt-9 space-y-5">
        {addresses.length ? addresses.map((address) => (
          <article className="border border-border bg-card p-6 text-card-foreground" key={address.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex bg-muted px-2 py-1 text-xs font-bold uppercase text-muted-foreground">{address.label || 'Home'}</span>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-bold text-card-foreground">
                  <span>{address.fullName}</span>
                  <span>{address.phone}</span>
                </div>
                <p className="mt-4 max-w-3xl leading-7 text-card-foreground">
                  {[address.line1, address.line2, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ')}
                </p>
                {address.isDefault ? <p className="mt-2 text-sm font-semibold text-emerald-700">Default address</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded p-2 text-muted-foreground transition hover:bg-muted hover:text-blue-600 dark:hover:text-blue-400" onClick={() => onEdit(address)} title="Edit address" type="button">
                  <PenLine className="h-5 w-5" />
                </button>
                <button className="rounded p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300" onClick={() => onDelete(address.id)} title="Delete address" type="button">
                  <Trash2 className="h-5 w-5" />
                </button>
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </article>
        )) : (
          <div className="border border-dashed border-border p-8 text-center">
            <MapPin className="mx-auto h-8 w-8 text-blue-600" />
            <p className="mt-3 font-semibold text-card-foreground">No saved addresses yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first delivery address to make checkout faster.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-muted-foreground">{label}</span>
      <Input name={name} type={type} defaultValue={defaultValue || ''} placeholder={placeholder} required={required} />
    </label>
  );
}

function SidebarHeading({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-6 px-8 py-3 text-lg font-bold text-muted-foreground">
      <span className="text-blue-600 [&_svg]:h-6 [&_svg]:w-6">{icon}</span>
      {label}
    </div>
  );
}

function SidebarButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`w-full px-24 py-4 text-left text-base transition ${
        active
          ? 'bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
          : 'text-card-foreground hover:bg-muted hover:text-foreground'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function SidebarInfo({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between px-24 py-4 text-base text-card-foreground">
      <span>{label}</span>
      {value ? <span className="font-bold text-emerald-700 dark:text-emerald-300">{value}</span> : null}
    </div>
  );
}

function SidebarRow({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <Link className="flex items-center justify-between px-8 py-7 text-lg font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground" href={href}>
      <span className="flex items-center gap-6">
        <span className="text-blue-600 [&_svg]:h-6 [&_svg]:w-6">{icon}</span>
        {label}
      </span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}
