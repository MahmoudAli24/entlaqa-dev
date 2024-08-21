'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { createClient } from '@/utils/supabase/client'
import useSWR from 'swr'

interface User {
 id: number
 name: string
 email: string
 department: string
 group: string
}

export default function HomeModule() {
 const supabase = createClient()

 // Fetching data with SWR
 const fetcher = async () => {
  const { data, error } = await supabase.from('users').select()
  if (error) throw error
  return data
 }

 const { data: users, error, mutate } = useSWR<User[]>('users', fetcher)

 const [sortColumn, setSortColumn] = useState<keyof User>('name');
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
 const [isAddUserOpen, setIsAddUserOpen] = useState(false);
 const [isEditUserOpen, setIsEditUserOpen] = useState(false);
 const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
  name: '', email: '', department: '', group: ''
 });
 const [editingUser, setEditingUser] = useState<User | null>(null);

 if (error) return <div>Error loading users</div>
 if (!users) return <div>Loading...</div>

 const handleSort = (column: keyof User) => {
  if (column === sortColumn) {
   setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
  } else {
   setSortColumn(column)
   setSortDirection('asc')
  }
 }

 const sortedUsers = [...users].sort((a, b) => {
  if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
  if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
  return 0
 })

 const handleDelete = async (id: number) => {
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (!error) mutate() // Re-fetch users after deletion
 }

 const handleEdit = (user: User) => {
  setEditingUser(user)
  setIsEditUserOpen(true)
 }

 const handleEditUserData = async () => {
  if (editingUser) {
   const { data, error } = await supabase
    .from('users')
    .update({
     name: editingUser.name,
     email: editingUser.email,
     department: editingUser.department,
     group: editingUser.group
    })
    .eq('id', editingUser.id);

   if (!error) {
    mutate(); // Re-fetch users after editing
    setIsEditUserOpen(false);
   } else {
    console.error("Error updating user:", error.message);
   }
  }
 };


 const handleAddUser = async () => {
  const { error } = await supabase.from('users').insert(newUser)
  if (!error) {
   mutate() // Re-fetch users after adding a new user
   setIsAddUserOpen(false)
  }
 }

 return (
  <div className="container mx-auto p-4">
   <h1 className="text-2xl font-bold mb-4">User Management</h1>
   <div className="mb-4">
    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
     <DialogTrigger asChild>
      <Button>Add User</Button>
     </DialogTrigger>
     <DialogContent>
      <DialogHeader>
       <DialogTitle>Add New User</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
         Name
        </Label>
        <Input
         id="name"
         value={newUser.name}
         onChange={(e) => setNewUser({
          ...newUser, name:
           e.target.value
         })}
         className="col-span-3"
        />
       </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">
         Email
        </Label>
        <Input
         id="email"
         type="email"
         value={newUser.email}
         onChange={(e) => setNewUser({
          ...newUser, email:
           e.target.value
         })}
         className="col-span-3"
        />
       </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="department" className="text-right">
         Department
        </Label>
        <Input
         id="department"
         value={newUser.department}
         onChange={(e) => setNewUser({
          ...newUser, department:
           e.target.value
         })}
         className="col-span-3"
        />
       </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="group" className="text-right">
         Group
        </Label>
        <Input
         id="group"
         value={newUser.group}
         onChange={(e) => setNewUser({
          ...newUser, group:
           e.target.value
         })}
         className="col-span-3"
        />
       </div>
      </div>
      <Button onClick={handleAddUser}>Add User</Button>
     </DialogContent>
    </Dialog>
   </div>
   <Table>
    <TableHeader>
     <TableRow>
      {['name', 'email', 'department', 'group'].map((column) => (
       <TableHead key={column} className="cursor-pointer" onClick={() =>
        handleSort(column as keyof User)}>
        <div className="flex items-center">
         {column.charAt(0).toUpperCase() + column.slice(1)}
         {sortColumn === column && (
          sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4
w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
         )}
        </div>
       </TableHead>
      ))}
      <TableHead>Actions</TableHead>
     </TableRow>
    </TableHeader>
    <TableBody>
     {sortedUsers.map((user) => (
      <TableRow key={user.id}>
       <TableCell>{user.name}</TableCell>
       <TableCell>{user.email}</TableCell>
       <TableCell>{user.department}</TableCell>
       <TableCell>{user.group}</TableCell>
       <TableCell>
        <div className="flex space-x-2">
         <Button variant="outline" size="icon" onClick={() =>
          handleEdit(user)}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit user</span>
         </Button>
         <Button variant="outline" size="icon" onClick={() =>
          handleDelete(user.id)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete user</span>
         </Button>
        </div>
       </TableCell>
      </TableRow>
     ))}
    </TableBody>
   </Table>

   {/* Edit User Dialog */}
   <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
    <DialogContent>
     <DialogHeader>
      <DialogTitle>Edit User</DialogTitle>
     </DialogHeader>
     {editingUser && (
      <div className="grid gap-4 py-4">
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-name" className="text-right">
         Name
        </Label>
        <Input
         id="edit-name"
         value={editingUser.name}
         onChange={(e) => setEditingUser({
          ...editingUser, name:
           e.target.value
         })}
         className="col-span-3"
        />
       </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-email" className="text-right">
         Email
        </Label>
        <Input
         id="edit-email"
         type="email"
         value={editingUser.email}
         onChange={(e) => setEditingUser({
          ...editingUser, email:
           e.target.value
         })}
         className="col-span-3"
        />
       </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-department" className="text-right">
         Department
        </Label>
        <Input
         id="edit-department"
         value={editingUser.department}
         onChange={(e) => setEditingUser({
          ...editingUser, department:
           e.target.value
         })}
         className="col-span-3"
        />
       </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-group" className="text-right">
         Group
        </Label>
        <Input
         id="edit-group"
         value={editingUser.group}
         onChange={(e) => setEditingUser({
          ...editingUser, group:
           e.target.value
         })}
         className="col-span-3"
        />
       </div>
      </div>
     )}
     <Button onClick={handleEditUserData}>Save Changes</Button>
    </DialogContent>
   </Dialog>
  </div>
 )
}
