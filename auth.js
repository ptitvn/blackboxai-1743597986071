// Form validation and authentication logic
document.addEventListener('DOMContentLoaded', function() {
    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateRegisterForm()) {
                // Save user data to localStorage
                const user = {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                };
                localStorage.setItem('user', JSON.stringify(user));
                
                // Redirect to login page
                window.location.href = 'login.html';
            }
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateLoginForm()) {
                // Redirect to home page
                window.location.href = 'home.html';
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear session and redirect to login
            localStorage.removeItem('loggedIn');
            window.location.href = 'login.html';
        });
    }
});

function validateRegisterForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    let isValid = true;

    // Reset error messages
    document.getElementById('emailError').classList.add('hidden');
    document.getElementById('passwordError').classList.add('hidden');
    document.getElementById('confirmPasswordError').classList.add('hidden');

    // Email validation
    if (!email) {
        document.getElementById('emailError').textContent = 'Email không được để trống';
        document.getElementById('emailError').classList.remove('hidden');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('emailError').textContent = 'Email không đúng định dạng';
        document.getElementById('emailError').classList.remove('hidden');
        isValid = false;
    }

    // Password validation
    if (!password) {
        document.getElementById('passwordError').textContent = 'Mật khẩu không được để trống';
        document.getElementById('passwordError').classList.remove('hidden');
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
        document.getElementById('passwordError').classList.remove('hidden');
        isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Xác nhận mật khẩu không được để trống';
        document.getElementById('confirmPasswordError').classList.remove('hidden');
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Mật khẩu xác nhận không khớp';
        document.getElementById('confirmPasswordError').classList.remove('hidden');
        isValid = false;
    }

    return isValid;
}

function validateLoginForm() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    let isValid = true;

    // Reset error messages
    document.getElementById('loginEmailError').classList.add('hidden');
    document.getElementById('loginPasswordError').classList.add('hidden');

    // Get stored user data
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // Email validation
    if (!email) {
        document.getElementById('loginEmailError').textContent = 'Email không được để trống';
        document.getElementById('loginEmailError').classList.remove('hidden');
        isValid = false;
    } else if (!storedUser || email !== storedUser.email) {
        document.getElementById('loginEmailError').textContent = 'Email không tồn tại';
        document.getElementById('loginEmailError').classList.remove('hidden');
        isValid = false;
    }

    // Password validation
    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Mật khẩu không được để trống';
        document.getElementById('loginPasswordError').classList.remove('hidden');
        isValid = false;
    } else if (storedUser && password !== storedUser.password) {
        document.getElementById('loginPasswordError').textContent = 'Mật khẩu không đúng';
        document.getElementById('loginPasswordError').classList.remove('hidden');
        isValid = false;
    }

    if (isValid) {
        // Set logged in status
        localStorage.setItem('loggedIn', 'true');
    }

    return isValid;
}

// Check if user is logged in when accessing home page
if (window.location.pathname.includes('home.html')) {
    if (!localStorage.getItem('loggedIn')) {
        window.location.href = 'login.html';
    }
}