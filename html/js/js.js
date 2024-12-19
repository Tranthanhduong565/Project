const backgrounds = [
  "./img/1.jpeg",
  "./img/2.jpeg",
  "./img/3.jpeg"
];

function changeBackground() {
  const body = document.querySelector('body');
  const randomIndex = Math.floor(Math.random() * backgrounds.length);
  body.style.setProperty('background-image', `url(${backgrounds[randomIndex]})`);
}

setInterval(changeBackground, 10000);

async function login() {
  const username = document.getElementById('user').value;
  const password = document.getElementById('pass').value;
  const rememberMe = document.getElementById('remember').checked;

  try {
    const response = await fetch('data.json');
    const users = await response.json();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      alert('Đăng nhập thành công!');
      if (rememberMe) {
        localStorage.setItem('savedUser', JSON.stringify({ username, password }));
      } else {
        localStorage.removeItem('savedUser');
      }
      document.getElementById('user').value = '';
      document.getElementById('pass').value = '';
      setTimeout(() => {
        window.location.href = "./dashboard.html";
      }, 500);
    } else {
      alert('Sai tài khoản hoặc mật khẩu!');
    }
  } catch (error) {
    console.error('Lỗi khi tải file JSON:', error);
  }
}
function loadSavedUser() {
  const savedUser = localStorage.getItem('savedUser');
  if (savedUser) {
    const { username, password } = JSON.parse(savedUser);
    document.getElementById('user').value = username;
    document.getElementById('pass').value = password;
    document.getElementById('remember').checked = true;
    login();
  }
}
function togglePasswordVisibility() {
  const passwordField = document.getElementById('pass');
  const toggleIcon = document.getElementById('show-password');
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    toggleIcon.classList.replace('bx-lock-alt', 'bx-lock-open-alt');
  } else {
    passwordField.type = 'password';
    toggleIcon.classList.replace('bx-lock-open-alt', 'bx-lock-alt');
  }
}
window.onload = function () {
  loadSavedUser(); 
  changeBackground();
  const toggleIcon = document.getElementById('show-password');
  toggleIcon.addEventListener('click', togglePasswordVisibility);
};
