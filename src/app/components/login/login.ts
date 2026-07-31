import { Component, inject, ChangeDetectorRef, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Translation, Language } from '../../services/translation';

type ViewType = 'login' | 'forgot-email' | 'forgot-code' | 'forgot-newpass' | 'first-time';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public t = inject(Translation);

  private cdr = inject(ChangeDetectorRef);

  currentView: ViewType = 'login';
  showPassword = false;
  isLocked = false;
  failedAttempts = 0;
  lockUntil = 0;
  remainSec = 0;
  lockoutInterval: any = null;
  isLangMenuOpen = false;
  
  toastMessage = '';
  toastType: 'error' | 'warning' | 'success' = 'error';

  toastTimeout: any = null;

  // Forms
  loginForm = this.fb.group({
    account: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  forgotEmailForm = this.fb.group({
    email: ['', [Validators.required]]
  });

  forgotCodeForm = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(6)]]
  });

  forgotNewPassForm = this.fb.group({
    newPass: ['', [Validators.required]],
    confirmPass: ['', [Validators.required]]
  });

  firstTimeForm = this.fb.group({
    newPass: ['', [Validators.required]],
    confirmPass: ['', [Validators.required]]
  });

  @HostListener('document:click')
  clickout() {
    this.isLangMenuOpen = false;
  }

  ngOnInit() {
    this.checkLockout();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleLangMenu(event: Event) {
    event.stopPropagation();
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  setLang(lang: Language) {
    this.t.setLanguage(lang);
    this.isLangMenuOpen = false;
  }

  switchView(view: ViewType) {
    this.currentView = view;
    this.toastMessage = '';
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  showToast(msg: string, type: 'error' | 'warning' | 'success' = 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 1000);
  }

  checkLockout() {
    const lockUntil = parseInt(localStorage.getItem('vss_login_lock_until') || '0', 10);
    const now = Date.now();
    
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
      this.lockoutInterval = null;
    }

    if (lockUntil && now < lockUntil) {
      this.isLocked = true;
      this.remainSec = Math.ceil((lockUntil - now) / 1000);
      this.loginForm.disable();
      
      this.lockoutInterval = setInterval(() => {
        const currentNow = Date.now();
        if (currentNow < lockUntil) {
          this.remainSec = Math.ceil((lockUntil - currentNow) / 1000);
          this.cdr.detectChanges();
        } else {
          this.checkLockout();
        }
      }, 1000);
    } else {
      this.isLocked = false;
      this.remainSec = 0;
      this.loginForm.enable();
      localStorage.removeItem('vss_login_lock_until');
      localStorage.setItem('vss_login_failed_attempts', '0');
      this.cdr.detectChanges();
    }
  }



  // Submit main login
  onSubmit() {
    if (this.isLocked) {
      this.showToast(this.t.translate('login.err_locked_click'), 'warning');
      return;
    }

    if (this.loginForm.invalid) {
      this.handleFailure(true);
      return;
    }

    const { account, password } = this.loginForm.value;
    
    // Check first time or new user triggers from old logic
    if (account?.toLowerCase() === 'firsttime' || password === 'newuser') {
      this.switchView('first-time');
      return;
    }
    
    // Mock valid credentials
    if ((account === 'admin@gmail.com' && password === 'Admin@123!') || (account === 'minhnn@gmail.com' && password === 'Minhnn@123!')) {
      localStorage.removeItem('vss_login_failed_attempts');
      localStorage.setItem('vss_current_user', JSON.stringify({ email: account }));
      this.router.navigate(['/users']);
    } else {
      this.handleFailure(false);
    }
  }

  handleFailure(isFormatError: boolean) {
    this.failedAttempts = parseInt(localStorage.getItem('vss_login_failed_attempts') || '0', 10) + 1;
    localStorage.setItem('vss_login_failed_attempts', this.failedAttempts.toString());
    
    if (this.failedAttempts >= 5) {
      const lockDuration = 30 * 1000;
      this.lockUntil = Date.now() + lockDuration;
      localStorage.setItem('vss_login_lock_until', this.lockUntil.toString());
      this.showToast(this.t.translate('login.err_locked'), 'warning');
      this.checkLockout();
    } else {
      const remain = 5 - this.failedAttempts;
      const key = isFormatError ? 'login.err_format' : 'login.err_wrong';
      const msg = this.t.translate(key).replace('{{remain}}', remain.toString());
      this.showToast(msg, 'error');
    }
  }

  // Forgot password flow
  onForgotEmailSubmit() {
    if (this.forgotEmailForm.valid) this.switchView('forgot-code');
  }

  onForgotCodeSubmit() {
    if (this.forgotCodeForm.valid) this.switchView('forgot-newpass');
  }

  onForgotNewPassSubmit() {
    if (this.forgotNewPassForm.valid) {
      alert('Đổi mật khẩu thành công!');
      this.switchView('login');
    }
  }

  resendCode() {
    alert('Đã gửi lại mã xác nhận vào email!');
  }

  onFirstTimeSubmit() {
    if (this.firstTimeForm.valid) {
      alert('Cập nhật mật khẩu lần đầu thành công!');
      this.switchView('login');
    }
  }
}
