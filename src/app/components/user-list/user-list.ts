import { Component, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Translation, Language } from '../../services/translation';
import { UserService, User } from '../../services/user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserList {
  public t = inject(Translation);
  public userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  users = this.userService.users;
  
  isModalOpen = false;
  editingId: string | null = null;
  userForm: FormGroup;

  searchQuery = '';
  activeCardMenuId: string | null = null;
  isProfileMenuOpen = false;
  isLangMenuOpen = false;
  activeFilter = 'all';
  viewMode: 'grid' | 'table' = 'grid';

  filteredUsers = computed(() => {
    const q = this.searchQuery.toLowerCase();
    let res = this.users();
    if (this.activeFilter === 'admin') {
      res = res.filter(u => u.email.includes('admin') || u.role === 'admin');
    } else if (this.activeFilter === 'staff') {
      res = res.filter(u => !u.email.includes('admin') && u.role !== 'admin');
    }
    
    if (q) {
      res = res.filter(u => 
        u.email.toLowerCase().includes(q) || 
        u.first_name.toLowerCase().includes(q) || 
        u.last_name.toLowerCase().includes(q)
      );
    }
    return res;
  });

  userNameDisplay = 'Admin';
  userAvatarLetter = 'A';

  constructor() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      avatar: ['https://i.pravatar.cc/150'],
      phone: [''],
      role: ['staff', Validators.required],
      status: ['active', Validators.required],
      dob: ['']
    });

    const userStr = localStorage.getItem('vss_current_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email) {
          const prefix = u.email.split('@')[0];
          this.userNameDisplay = prefix;
          this.userAvatarLetter = prefix.charAt(0).toUpperCase();
        }
      } catch (e) {}
    }
  }

  @HostListener('document:click')
  clickout() {
    if (this.activeCardMenuId) {
      this.activeCardMenuId = null;
    }
    if (this.isProfileMenuOpen) {
      this.isProfileMenuOpen = false;
    }
    if (this.isLangMenuOpen) {
      this.isLangMenuOpen = false;
    }
  }

  toggleCardMenu(event: Event, id: string) {
    event.stopPropagation();
    if (this.activeCardMenuId === id) {
      this.activeCardMenuId = null;
    } else {
      this.activeCardMenuId = id;
    }
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleLangMenu(event: Event) {
    event.stopPropagation();
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  setFilter(f: string) {
    this.activeFilter = f;
  }

  setViewMode(mode: 'grid' | 'table') {
    this.viewMode = mode;
  }

  setLang(lang: Language) {
    this.t.setLanguage(lang);
    this.isLangMenuOpen = false;
  }

  logout() {
    if (confirm(this.t.translate('users.logout') + '?')) {
      localStorage.removeItem('vss_current_user');
      this.router.navigate(['/login']);
    }
  }

  updateSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  openAddModal() {
    this.activeCardMenuId = null;
    this.editingId = null;
    this.userForm.reset({ 
      email: '', 
      first_name: '', 
      last_name: '', 
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      phone: '',
      role: 'staff',
      status: 'active',
      dob: ''
    });
    this.isModalOpen = true;
  }

  openEditModal(user: User) {
    this.activeCardMenuId = null;
    this.editingId = user.id;
    this.userForm.patchValue({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      phone: user.phone || '',
      role: user.role || 'staff',
      status: user.status || 'active',
      dob: user.dob || ''
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingId = null;
  }

  saveUser() {
    if (this.userForm.invalid) return;

    if (this.editingId) {
      this.userService.updateUser(this.editingId, this.userForm.value as any);
    } else {
      this.userService.addUser(this.userForm.value as any);
    }
    this.closeModal();
  }

  deleteUser(id: string) {
    this.activeCardMenuId = null;
    if (confirm(this.t.translate('users.confirm_delete'))) {
      this.userService.deleteUser(id);
    }
  }
}
