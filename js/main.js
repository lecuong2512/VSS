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

function showToast(message) {
  const toast = document.getElementById('errorToast');
  if (!toast) return;

  if (message) {
    const msgEl = toast.querySelector('.toast-message');
    if (msgEl) msgEl.textContent = message;
  }

  toast.classList.remove('hidden');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    hideToast();
  }, 5000);
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
function initFormValidations() {
  const loginForm = document.getElementById('loginForm');
  const accountInput = document.getElementById('accountInput');
  const passwordInput = document.getElementById('passwordInput');
  const accountGroup = document.getElementById('accountGroup');
  const passwordGroup = document.getElementById('passwordGroup');

  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideToast();

    let hasError = false;

    // Validate Account
    if (!accountInput.value.trim()) {
      accountGroup.classList.add('error');
      hasError = true;
    } else {
      accountGroup.classList.remove('error');
    }

    // Validate Password
    if (!passwordInput.value.trim()) {
      passwordGroup.classList.add('error');
      hasError = true;
    } else {
      passwordGroup.classList.remove('error');
    }

    // If validation fails -> State: "chưa điền thông tin"
    if (hasError) {
      return;
    }

    // Simulate Authentication Logic
    const username = accountInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    // Check for special Demo triggers
    if (username === 'newuser' || username === 'firsttime' || password === 'newuser') {
      // Trigger First Time Change Password View -> State: "Đổi mật khẩu lần đầu"
      switchView('view-first-time');
      return;
    }

    if ((username === 'admin' && password === '123456') || (username === 'minhnn@gmail.com' && password === '123456')) {
      // Successful login
      alert('🎉 Đăng nhập thành công vào VSS Chat Platform!');
      return;
    }

    // Default failure for any other credentials -> State: "Sai thông tin"
    showToast('Bạn đã nhập sai tài khoản hoặc mật khẩu');
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
