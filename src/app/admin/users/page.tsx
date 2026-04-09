'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Pencil,
  Trash2,
  Mail,
  Plus,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  addresses?: {
    title: string;
    fullName: string;
    phone: string;
    country: string;
    city: string;
    district: string;
    address: string;
    zipCode: string;
    isPrimary: boolean;
  }[];
}

export default function AdminUsersPage() {
  const { status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor' | 'user'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    password: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    verificationCode: ''
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadUsers();
  }, [status, router]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          ...item,
          role: item.role as 'admin' | 'editor' | 'user',
          status: item.isActive ? 'active' : 'inactive'
        }));
        setUsers(mappedData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: ''
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.status === 'active',
          password: formData.password
        }),
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user._id === editingUser._id
            ? {
              ...user,
              ...formData,
              status: formData.status as 'active' | 'inactive',
              role: formData.role as 'admin' | 'editor' | 'user'
            }
            : user
        ));
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isActive: formData.status === 'active'
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([{
          ...newUser.data,
          status: newUser.data.isActive ? 'active' : 'inactive',
          role: newUser.data.role as 'admin' | 'editor' | 'user'
        }, ...users]);
        setIsAddUserOpen(false);
        toast.success('User created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!passwordModalUser) return;

    try {
      const response = await fetch('/api/admin/users/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: passwordModalUser._id }),
      });

      if (response.ok) {
        toast.success('Verification code sent to user email');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Failed to send verification code');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!passwordData.verificationCode) {
      toast.error('Please enter the verification code sent to the user');
      return;
    }

    try {
      const response = await fetch('/api/admin/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordModalUser._id,
          newPassword: passwordData.newPassword,
          isAdmin: true,
          verificationCode: passwordData.verificationCode
        }),
      });

      if (response.ok) {
        setPasswordModalUser(null);
        setPasswordData({ newPassword: '', confirmPassword: '', verificationCode: '' });
        toast.success('Password updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    const confirmed = await confirm({
      title: 'Are you sure?',
      description: "You won't be able to revert this!",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });



  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts</p>
        </div>
        <Button
          onClick={() => {
            setFormData({ name: '', email: '', role: 'user', status: 'active', password: '' });
            setIsAddUserOpen(true);
          }}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New User</span>
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-select pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === 'all'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === 'admin'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Admin ({users.filter(u => u.role === 'admin').length})
            </button>
            <button
              onClick={() => setRoleFilter('editor')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === 'editor'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Editor ({users.filter(u => u.role === 'editor').length})
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === 'user'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              User ({users.filter(u => u.role === 'user').length})
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors truncate">
                      {user.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                      ? 'bg-indigo-100 text-indigo-700'
                      : user.role === 'editor'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-muted text-foreground'
                      }`}>
                      {user.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      onClick={() => handleEdit(user)}
                      className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    {user.role !== 'admin' && (
                      <Button
                        type="button"
                        onClick={() => handleDelete(user._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'No users registered yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent className="max-w-md rounded-xl bg-card p-6 shadow-xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-foreground mb-1">Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-1">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-1">Role</Label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-1">Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Saved Addresses Section */}
              {editingUser.addresses && editingUser.addresses.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    Saved Addresses ({editingUser.addresses.length})
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {editingUser.addresses.map((addr, idx) => (
                      <div key={idx} className="bg-muted/50 p-3 rounded-lg border border-border text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground">{addr.title}</span>
                          {addr.isPrimary && (
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-md font-medium">Primary</span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs space-y-0.5">
                          <div>{addr.fullName} • {addr.phone}</div>
                          <div>{addr.address}</div>
                          <div>{addr.district}, {addr.city} / {addr.country}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <DialogFooter className="flex flex-row gap-2 justify-end pt-4 sm:space-x-0">
                <Button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog
        open={isAddUserOpen}
        onOpenChange={(open) => {
          if (!open) setIsAddUserOpen(false);
        }}
      >
        <DialogContent className="max-w-md rounded-xl bg-card p-6 shadow-xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-foreground mb-1">Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-foreground mb-1">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-foreground mb-1">Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-foreground mb-1">Role</Label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter className="flex flex-row gap-2 justify-end pt-4 sm:space-x-0">
              <Button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog
        open={!!passwordModalUser}
        onOpenChange={(open) => {
          if (!open) setPasswordModalUser(null);
        }}
      >
        <DialogContent className="max-w-md rounded-xl bg-card p-6 shadow-xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Change Password</DialogTitle>
          </DialogHeader>
          {passwordModalUser && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Changing password for <span className="font-medium text-foreground">{passwordModalUser.name}</span>
              </p>
              <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700 mb-2">
                  This process requires email verification.
                </p>
                <Button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="h-auto p-0 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  Send Verification Code to {passwordModalUser.email}
                </Button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-1">Verification Code</Label>
                  <Input
                    type="text"
                    value={passwordData.verificationCode}
                    onChange={(e) => setPasswordData({ ...passwordData, verificationCode: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter 6-digit code"
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-1">New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-1">Confirm Password</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={6}
                  />
                </div>
                <DialogFooter className="flex flex-row gap-2 justify-end pt-4 sm:space-x-0">
                  <Button
                    type="button"
                    onClick={() => setPasswordModalUser(null)}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    Update Password
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
