import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, UserPlus, Edit, Trash2, Shield } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  role: 'admin' | 'security_analyst' | 'employee';
  security_clearance_level: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    department: '',
    role: 'employee' as const,
    security_clearance_level: 1
  });
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      setLoading(true);
      
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: newUser.full_name
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update the profile with additional details
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: newUser.full_name,
            department: newUser.department,
            role: newUser.role,
            security_clearance_level: newUser.security_clearance_level
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setIsAddUserOpen(false);
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        department: '',
        role: 'employee',
        security_clearance_level: 1
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: selectedUser.full_name,
          department: selectedUser.department,
          role: selectedUser.role,
          security_clearance_level: selectedUser.security_clearance_level
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditUserOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Note: This will only delete the profile. The auth user will remain.
      // In a production app, you'd need an admin API to delete auth users.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User profile deleted successfully",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'security_analyst': return 'default';
      default: return 'secondary';
    }
  };

  const getClearanceBadgeVariant = (level: number) => {
    if (level >= 4) return 'destructive';
    if (level >= 3) return 'default';
    return 'secondary';
  };

  if (loading && users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts, roles, and security clearance levels
            </CardDescription>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specified role and clearance level
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Secure password"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    placeholder="IT Security"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="security_analyst">Security Analyst</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="clearance">Security Clearance Level</Label>
                  <Select 
                    value={newUser.security_clearance_level.toString()} 
                    onValueChange={(value) => setNewUser({...newUser, security_clearance_level: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 - Basic</SelectItem>
                      <SelectItem value="2">Level 2 - Confidential</SelectItem>
                      <SelectItem value="3">Level 3 - Secret</SelectItem>
                      <SelectItem value="4">Level 4 - Top Secret</SelectItem>
                      <SelectItem value="5">Level 5 - Ultra Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} disabled={loading}>
                    Create User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <Alert>
            <AlertDescription>
              No users found. Create your first user to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Clearance</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getClearanceBadgeVariant(user.security_clearance_level)}>
                      Level {user.security_clearance_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_login_at 
                      ? new Date(user.last_login_at).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditUserOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information, role, and security clearance
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_full_name">Full Name</Label>
                  <Input
                    id="edit_full_name"
                    value={selectedUser.full_name || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_department">Department</Label>
                  <Input
                    id="edit_department"
                    value={selectedUser.department || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, department: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_role">Role</Label>
                  <Select 
                    value={selectedUser.role} 
                    onValueChange={(value: any) => setSelectedUser({...selectedUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="security_analyst">Security Analyst</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_clearance">Security Clearance Level</Label>
                  <Select 
                    value={selectedUser.security_clearance_level.toString()} 
                    onValueChange={(value) => setSelectedUser({
                      ...selectedUser, 
                      security_clearance_level: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 - Basic</SelectItem>
                      <SelectItem value="2">Level 2 - Confidential</SelectItem>
                      <SelectItem value="3">Level 3 - Secret</SelectItem>
                      <SelectItem value="4">Level 4 - Top Secret</SelectItem>
                      <SelectItem value="5">Level 5 - Ultra Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditUser} disabled={loading}>
                    Update User
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;