import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  phone?: string;
  role?: string;
  status?: string;
  dob?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = 'https://reqres.in/api/users';
  private headers = new HttpHeaders({
    'x-api-key': 'free_user_3HDSrhHLgslI8xzCZfmbfqV2IDG'
  });
  
  users = signal<User[]>([]);

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any>(`${this.baseUrl}?per_page=12`, { headers: this.headers }).subscribe({
      next: (response) => {
        const mappedUsers = response.data.map((u: any) => ({
          id: String(u.id),
          email: u.email,
          first_name: u.first_name,
          last_name: u.last_name,
          avatar: u.avatar,
          phone: u.phone || '0987654321', // Use real data if persisted, else mock
          role: u.role || 'staff',       // Use real data if persisted, else mock
          status: u.status || 'active',  // Use real data if persisted, else mock
          dob: u.dob || '1990-01-01'     // Use real data if persisted, else mock
        }));
        this.users.set(mappedUsers);
      },
      error: (err) => console.error('Error fetching users from Reqres', err)
    });
  }

  getUsers() {
    return this.users();
  }

  addUser(user: Omit<User, 'id'>) {
    // Optimistic update for mock API
    const tempId = Date.now().toString();
    const newUser: User = { ...user, id: tempId };
    this.users.update(users => [newUser, ...users]);

    this.http.post<any>(this.baseUrl, user, { headers: this.headers }).subscribe({
      next: (response) => {
        // Update the temp ID with the real one from API if needed
        this.users.update(users => users.map(u => u.id === tempId ? { ...u, id: String(response.id) } : u));
      },
      error: (err) => console.error('Error adding user', err)
    });
  }

  updateUser(id: string, updated: Omit<User, 'id'>) {
    // Optimistic update
    this.users.update(users => users.map(u => u.id === id ? { ...updated, id } : u));

    this.http.put<any>(`${this.baseUrl}/${id}`, updated, { headers: this.headers }).subscribe({
      next: () => {},
      error: (err) => console.error('Error updating user', err)
    });
  }

  deleteUser(id: string) {
    // Optimistic update
    this.users.update(users => users.filter(u => u.id !== id));

    this.http.delete(`${this.baseUrl}/${id}`, { headers: this.headers, responseType: 'text' }).subscribe({
      next: () => {},
      error: (err) => console.error('Error deleting user', err)
    });
  }
}
