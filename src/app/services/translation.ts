import { Injectable, signal } from '@angular/core';

export type Language = 'vi' | 'en';

const dictionaries = {
  vi: {
    'login.title': 'Đăng nhập vào tài khoản của bạn',
    'login.subtitle': 'Tiết kiệm thời gian tư vấn và chăm sóc khách hàng',
    'login.system_name': 'Hệ thống quản lý chat đa nền tảng',
    'login.account': 'Tài khoản',
    'login.password': 'Mật khẩu',
    'login.remember': 'Lưu mật khẩu',
    'login.forgot': 'Quên mật khẩu?',
    'login.submit': 'Đăng nhập',
    'login.no_account': 'Bạn chưa có tài khoản?',
    'login.register': 'Đăng ký',
    'login.lang_vi': 'Tiếng Việt',
    'login.lang_en': 'Tiếng Anh',
    'login.err_account': 'Bạn chưa nhập email hoặc tài khoản',
    'login.err_password': 'Bạn chưa nhập mật khẩu',
    'login.err_format': '❌ Sai định dạng! (Bạn còn {{remain}} lần thử trước khi bị khóa)',
    'login.err_wrong': '❌ Sai email/tài khoản hoặc mật khẩu! (Bạn còn {{remain}} lần thử trước khi bị khóa)',
    'login.err_locked': '⚠️ Bạn đã đăng nhập sai quá số lần! Tài khoản tạm thời bị khóa.',
    'login.err_locked_click': '⚠️ Tài khoản đang bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau!',
    'login.btn_locked': 'Tạm khóa ({{remainSec}}s)',
    
    // Forgot Password & First Time
    'forgot.back': 'Quay lại',
    'forgot.title': 'Quên mật khẩu',
    'forgot.step1_title': 'Bạn đã quên mật khẩu?',
    'forgot.step1_desc': 'Đừng lo lắng, hãy nhập tài khoản hoặc email của bạn ở dưới để tìm kiếm tài khoản của bạn',
    'forgot.step1_placeholder': 'Nhập tài khoản/email',
    'forgot.next': 'Tiếp tục',
    'forgot.step2_title': 'Kiểm tra mail',
    'forgot.step2_desc': 'Chúng tôi đã gửi cho bạn mã xác nhận. Vui lòng kiểm tra mã trong email của bạn.',
    'forgot.step2_placeholder': 'Nhập mã',
    'forgot.resend': 'Gửi lại mã',
    'forgot.step3_title': 'Tạo mật khẩu mới',
    'forgot.step3_desc': 'Mật khẩu mới của bạn phải khác với mật khẩu cũ đã được sử dụng.',
    'forgot.new_pass': 'Mật khẩu mới',
    'forgot.confirm_pass': 'Nhập lại mật khẩu mới',
    'forgot.confirm': 'Xác nhận',
    'first_time.title': 'Đổi mật khẩu',
    'first_time.step_title': 'Đăng nhập lần đầu',
    'first_time.desc': 'Đây là lần đầu tiên đăng nhập của bạn, bước đầu tiên bạn cần đổi mật khẩu để đảm bảo tính bảo mật cho tài khoản',
    
    'users.title': 'Danh sách người dùng',
    'users.add': 'Thêm người dùng',
    'users.email': 'Email',
    'users.first_name': 'Tên',
    'users.last_name': 'Họ',
    'users.avatar': 'Ảnh đại diện (URL)',
    'users.actions': 'Thao tác',
    'users.edit': 'Sửa',
    'users.delete': 'Xóa',
    'users.confirm_delete': 'Bạn có chắc muốn xóa người dùng này?',
    'users.save': 'Lưu',
    'users.cancel': 'Hủy',
    'users.logout': 'Đăng xuất',
    'users.empty': 'Chưa có người dùng nào',
    'users.search': 'Tìm kiếm...',
    'users.edit_user': 'Sửa thông tin',
    'users.add_user': 'Thêm người dùng mới'
  },
  en: {
    'login.title': 'Log in to your account',
    'login.subtitle': 'Save time on customer care and consulting',
    'login.system_name': 'Cross-platform chat management system',
    'login.account': 'Account',
    'login.password': 'Password',
    'login.remember': 'Remember password',
    'login.forgot': 'Forgot password?',
    'login.submit': 'Log in',
    'login.no_account': 'Don\'t have an account?',
    'login.register': 'Register',
    'login.lang_vi': 'Vietnamese',
    'login.lang_en': 'English',
    'login.err_account': 'You have not entered an email or account',
    'login.err_password': 'You have not entered a password',
    'login.err_format': '❌ Invalid format! (You have {{remain}} tries left before being locked)',
    'login.err_wrong': '❌ Incorrect email/account or password! (You have {{remain}} tries left before being locked)',
    'login.err_locked': '⚠️ You have entered incorrectly too many times! Account temporarily locked.',
    'login.err_locked_click': '⚠️ Account is temporarily locked due to multiple failed attempts. Please try again later!',
    'login.btn_locked': 'Locked ({{remainSec}}s)',

    'forgot.back': 'Back',
    'forgot.title': 'Forgot Password',
    'forgot.step1_title': 'Forgot your password?',
    'forgot.step1_desc': 'Don\'t worry, enter your account or email below to find your account',
    'forgot.step1_placeholder': 'Enter account/email',
    'forgot.next': 'Continue',
    'forgot.step2_title': 'Check your email',
    'forgot.step2_desc': 'We have sent you a verification code. Please check your email.',
    'forgot.step2_placeholder': 'Enter code',
    'forgot.resend': 'Resend code',
    'forgot.step3_title': 'Create new password',
    'forgot.step3_desc': 'Your new password must be different from previous used passwords.',
    'forgot.new_pass': 'New password',
    'forgot.confirm_pass': 'Confirm new password',
    'forgot.confirm': 'Confirm',
    'first_time.title': 'Change Password',
    'first_time.step_title': 'First time login',
    'first_time.desc': 'This is your first login. You need to change your password to secure your account.',

    'users.title': 'User List',
    'users.add': 'Add User',
    'users.email': 'Email',
    'users.first_name': 'First Name',
    'users.last_name': 'Last Name',
    'users.avatar': 'Avatar (URL)',
    'users.actions': 'Actions',
    'users.edit': 'Edit',
    'users.delete': 'Delete',
    'users.confirm_delete': 'Are you sure you want to delete this user?',
    'users.save': 'Save',
    'users.cancel': 'Cancel',
    'users.logout': 'Logout',
    'users.empty': 'No users found',
    'users.search': 'Search...',
    'users.edit_user': 'Edit user',
    'users.add_user': 'Add new user'
  }
};

@Injectable({
  providedIn: 'root'
})
export class Translation {
  currentLang = signal<Language>('vi');

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }

  translate(key: string): string {
    const lang = this.currentLang();
    // @ts-ignore
    return dictionaries[lang][key] || key;
  }
}
