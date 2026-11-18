let admin = false;

function authAction() {
  if (admin) return logout();
  abrirModal('modal-login');
}

async function login() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  if (window.MODO_NUBE) {
    const { data, error } = await window.sb.auth.signInWithPassword({ email, password: pass });
    if (error) return alert('Error: ' + error.message);
    admin = !!data.session;
  } else {
    if (pass !== window.APP_CONFIG.ADMIN_PASSWORD) return alert('Contraseña incorrecta');
    admin = true;
    sessionStorage.setItem('admin', '1');
  }

  document.getElementById('login-pass').value = '';
  cerrarModal('modal-login');
  actualizarAuthUI();
  mostrarTab('ventas');
}

async function logout() {
  if (window.MODO_NUBE) await window.sb.auth.signOut();
  sessionStorage.removeItem('admin');
  admin = false;
  actualizarAuthUI();
  mostrarTab('tienda');
}

async function initAuth() {
  if (window.MODO_NUBE) {
    const { data } = await window.sb.auth.getSession();
    admin = !!data.session;
  } else {
    admin = sessionStorage.getItem('admin') === '1';
  }
  actualizarAuthUI();
}

function actualizarAuthUI() {
  const btn = document.getElementById('auth-btn');
  btn.textContent = admin ? 'Salir' : 'Ingresar';
  btn.className = admin
    ? 'px-3 py-2 rounded-lg bg-red-500 text-white font-bold'
    : 'px-3 py-2 rounded-lg btn-primary text-slate-900 font-bold';

  document.getElementById('login-hint').textContent = window.MODO_NUBE
    ? 'Ingresa con un usuario creado en Supabase (Authentication → Users).'
    : `Modo local. Contraseña: ${window.APP_CONFIG.ADMIN_PASSWORD}`;
}
