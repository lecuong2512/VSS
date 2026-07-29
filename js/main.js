// ==========================================
// MAIN JAVASCRIPT LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initFloatingLabels();
  initPasswordToggles();
  initViewTransitions();
  initFormValidations();
  initForgotFlow();
  initPaginationDots();
});

// ------------------------------------------
// 1. FLOATING LABELS HANDLING
// ------------------------------------------
function initFloatingLabels() {
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    const wrapper = input.closest('.input-wrapper');
    if (!wrapper) return;

    // Check initial state
    if (input.value.trim() !== '') {
      wrapper.classList.add('has-value');
    }

    // Input events
    input.addEventListener('input', () => {
      if (input.value.trim() !== '') {
        wrapper.classList.add('has-value');
      } else {
        wrapper.classList.remove('has-value');
      }
      // Remove error state when user types
      const formGroup = input.closest('.form-group');
      if (formGroup && formGroup.classList.contains('error')) {
        formGroup.classList.remove('error');
      }
    });

    input.addEventListener('focus', () => {
      const formGroup = input.closest('.form-group');
      if (formGroup && formGroup.classList.contains('error')) {
        formGroup.classList.remove('error');
      }
    });
  });
}

// ------------------------------------------
// 2. PASSWORD VISIBILITY TOGGLE
// ------------------------------------------
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const eyeSlash = btn.querySelector('.icon-eye-slash');
      const eye = btn.querySelector('.icon-eye');

      if (input.type === 'password') {
        input.type = 'text';
        if (eyeSlash) eyeSlash.classList.add('hidden');
        if (eye) eye.classList.remove('hidden');
      } else {
        input.type = 'password';
        if (eyeSlash) eyeSlash.classList.remove('hidden');
        if (eye) eye.classList.add('hidden');
      }
    });
  });
}

// ------------------------------------------
// 3. VIEW TRANSITIONS & SWITCHING
// ------------------------------------------
function switchView(targetViewId) {
  const views = document.querySelectorAll('.view-pane');
  views.forEach(v => {
    v.classList.remove('active');
  });

  const targetView = document.getElementById(targetViewId);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Hide toast when switching views
  hideToast();
}

function initViewTransitions() {
  // Back buttons
  const backButtons = document.querySelectorAll('.btn-back');
  backButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const goto = btn.getAttribute('data-goto');
      if (goto) switchView(goto);
    });
  });

  // Forgot password link
  const forgotLink = document.getElementById('linkToForgot');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('view-forgot-email');
    });
  }
}

// ------------------------------------------
// 4. TOAST NOTIFICATION HANDLING
// ------------------------------------------
let toastTimeout = null;

function showToast(message, type = 'error') {
  const toast = document.getElementById('errorToast');
  if (!toast) return;

  // Set style based on type (error, success, warning)
  toast.classList.remove('error-toast', 'success-toast', 'warning-toast');
  toast.classList.add(`${type}-toast`);

  const iconEl = toast.querySelector('.toast-icon');
  if (iconEl) {
    if (type === 'success') {
      iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" fill="#10b981" stroke="none"></circle><path d="M8 12l3 3 5-5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
    } else if (type === 'warning') {
      iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="none"></circle><path d="M12 8v4m0 4h.01" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"></path></svg>`;
    } else {
      iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" fill="#e60012" stroke="none"></circle><path d="M15 9l-6 6M9 9l6 6" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"></path></svg>`;
    }
  }

  if (message) {
    const msgEl = toast.querySelector('.toast-message');
    if (msgEl) msgEl.textContent = message;
  }

  toast.classList.remove('hidden');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    hideToast();
  }, type === 'warning' ? 6000 : 4000);
}

function hideToast() {
  const toast = document.getElementById('errorToast');
  if (toast && !toast.classList.contains('hidden')) {
    toast.classList.add('hidden');
  }
  if (toastTimeout) clearTimeout(toastTimeout);
}

// ------------------------------------------
// 5. LOGIN FORM VALIDATION & SIMULATION
// ------------------------------------------
let lockoutInterval = null;

function initFormValidations() {
  const loginForm = document.getElementById('loginForm');
  const accountInput = document.getElementById('accountInput');
  const passwordInput = document.getElementById('passwordInput');
  const accountGroup = document.getElementById('accountGroup');
  const passwordGroup = document.getElementById('passwordGroup');
  const accountError = document.getElementById('accountError');
  const passwordError = document.getElementById('passwordError');

  if (!loginForm) return;

  const submitBtn = loginForm.querySelector('.btn-submit');

  // Helper to check and enforce 5 failed attempts lockout
  function checkLockoutState() {
    const lockUntil = parseInt(localStorage.getItem('vss_login_lock_until') || '0', 10);
    const now = Date.now();

    if (lockUntil && now < lockUntil) {
      const remainSec = Math.ceil((lockUntil - now) / 1000);
      accountInput.disabled = true;
      passwordInput.disabled = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-disabled');
        submitBtn.textContent = `Tạm khóa (${remainSec}s)`;
      }

      if (!lockoutInterval) {
        lockoutInterval = setInterval(() => {
          checkLockoutState();
        }, 1000);
      }
      return true;
    } else if (lockUntil && now >= lockUntil) {
      // Lockout expired -> unlock
      localStorage.removeItem('vss_login_lock_until');
      localStorage.setItem('vss_login_failed_attempts', '0');
      if (lockoutInterval) {
        clearInterval(lockoutInterval);
        lockoutInterval = null;
      }
      accountInput.disabled = false;
      passwordInput.disabled = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-disabled');
        submitBtn.textContent = 'Đăng nhập';
      }
    }
    return false;
  }

  // Check lockout on page load
  checkLockoutState();

  // Clear errors when typing
  accountInput.addEventListener('input', () => {
    accountGroup.classList.remove('error');
  });
  passwordInput.addEventListener('input', () => {
    passwordGroup.classList.remove('error');
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideToast();

    // Check if currently locked out
    if (checkLockoutState()) {
      showToast('⚠️ Tài khoản đang bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau!', 'warning');
      return;
    }

    let hasError = false;
    const rawAccount = accountInput.value.trim();
    const rawPassword = passwordInput.value.trim();

    // 1. Validate Account / Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawAccount) {
      if (accountError) accountError.textContent = 'Bạn chưa nhập tài khoản';
      accountGroup.classList.add('error');
      hasError = true;
    } else if (!emailRegex.test(rawAccount)) {
      if (accountError) accountError.textContent = 'Tài khoản phải đúng định dạng email (vd: user@example.com)';
      accountGroup.classList.add('error');
      hasError = true;
    } else {
      accountGroup.classList.remove('error');
    }

    // 2. Validate Password Format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!rawPassword) {
      if (passwordError) passwordError.textContent = 'Bạn chưa nhập mật khẩu';
      passwordGroup.classList.add('error');
      hasError = true;
    } else if (!passwordRegex.test(rawPassword)) {
      if (passwordError) passwordError.textContent = 'Mật khẩu phải từ 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt';
      passwordGroup.classList.add('error');
      hasError = true;
    } else {
      passwordGroup.classList.remove('error');
    }

    // If format is invalid, show inline errors without reloading
    if (hasError) {
      return;
    }

    // 3. Simulate Authentication Logic
    const username = rawAccount.toLowerCase();
    const password = rawPassword;

    // Check for special Demo triggers
    if (username === 'newuser' || username === 'firsttime' || password === 'newuser') {
      switchView('view-first-time');
      return;
    }

    // Check valid credentials
    if ((username === 'admin@gmail.com' && password === 'Admin@123!') || (username === 'minhnn@gmail.com' && password === 'Minhnn@123!')) {
      // Successful login -> reset failed attempts and redirect to dashboard
      localStorage.removeItem('vss_login_failed_attempts');
      localStorage.removeItem('vss_login_lock_until');
      localStorage.setItem('vss_current_user', JSON.stringify({
        username: username,
        displayName: 'Lê Việt Cường',
        email: username === 'admin' ? 'cuonglv@vss.gov.vn' : 'cuonglv@gmail.com'
      }));

      window.location.href = 'danh-sach-doi-tac.html';
      return;
    }

    // 4. Handle Failed Login & Limit Attempts (5 times)
    let failedAttempts = parseInt(localStorage.getItem('vss_login_failed_attempts') || '0', 10) + 1;
    localStorage.setItem('vss_login_failed_attempts', failedAttempts.toString());

    accountGroup.classList.add('error');
    passwordGroup.classList.add('error');

    if (failedAttempts >= 5) {
      const lockDuration = 30 * 1000; // 30 seconds lockout
      const lockUntil = Date.now() + lockDuration;
      localStorage.setItem('vss_login_lock_until', lockUntil.toString());
      showToast('⚠️ Bạn đã đăng nhập sai 5 lần liên tiếp! Tài khoản tạm thời bị khóa trong 30 giây.', 'warning');
      checkLockoutState();
    } else {
      const remain = 5 - failedAttempts;
      showToast(`❌ Sai email/tài khoản hoặc mật khẩu! (Bạn còn ${remain} lần thử trước khi bị khóa)`, 'error');
    }
  });
}

// ------------------------------------------
// 6. FORGOT PASSWORD & FIRST TIME FLOW
// ------------------------------------------
function initForgotFlow() {
  // Step 1: Email Input
  const emailInput = document.getElementById('forgotEmailInput');
  const btnEmailNext = document.getElementById('btnForgotEmailNext');
  const emailForm = document.getElementById('forgotEmailForm');

  if (emailInput && btnEmailNext) {
    emailInput.addEventListener('input', () => {
      if (emailInput.value.trim() !== '') {
        btnEmailNext.disabled = false;
        btnEmailNext.classList.remove('btn-disabled');
      } else {
        btnEmailNext.disabled = true;
        btnEmailNext.classList.add('btn-disabled');
      }
    });

    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!btnEmailNext.disabled) {
        switchView('view-forgot-code');
      }
    });
  }

  // Step 2: Verification Code
  const codeInput = document.getElementById('verificationCodeInput');
  const btnCodeNext = document.getElementById('btnForgotCodeNext');
  const codeForm = document.getElementById('forgotCodeForm');
  const btnResend = document.getElementById('btnResendCode');

  if (codeInput && btnCodeNext) {
    codeInput.addEventListener('input', () => {
      if (codeInput.value.trim() !== '') {
        btnCodeNext.disabled = false;
        btnCodeNext.classList.remove('btn-disabled');
      } else {
        btnCodeNext.disabled = true;
        btnCodeNext.classList.add('btn-disabled');
      }
    });

    codeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!btnCodeNext.disabled) {
        switchView('view-forgot-newpass');
      }
    });
  }

  if (btnResend) {
    btnResend.addEventListener('click', () => {
      alert('📩 Đã gửi lại mã xác nhận vào email của bạn!');
    });
  }

  // Step 3: New Password Confirm
  const newPassForm = document.getElementById('forgotNewPassForm');
  if (newPassForm) {
    newPassForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('✨ Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      switchView('view-login');
    });
  }

  // Step 4: First Time Change Password
  const firstTimeForm = document.getElementById('firstTimePassForm');
  if (firstTimeForm) {
    firstTimeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('✅ Cập nhật mật khẩu lần đầu thành công! Chào mừng bạn đến với VSS Chat Platform.');
      switchView('view-login');
    });
  }
}

// ------------------------------------------
// 7. BANNER PAGINATION DOTS ANIMATION
// ------------------------------------------
function initPaginationDots() {
  const dots = document.querySelectorAll('.pagination-dots .dot');
  if (dots.length < 2) return;

  let activeIndex = 0;
  setInterval(() => {
    dots.forEach(d => d.classList.remove('active'));
    activeIndex = (activeIndex + 1) % dots.length;
    dots[activeIndex].classList.add('active');
  }, 4000);
}
