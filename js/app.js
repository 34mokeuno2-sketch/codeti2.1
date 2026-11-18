function money(n) { return 'S/ ' + Number(n || 0).toFixed(2); }

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function abrirModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function cerrarModal(id) { document.getElementById(id).classList.add('hidden'); }

function mostrarTab(nombre) {
  if ((nombre === 'ventas' || nombre === 'config') && !admin) {
    alert('Inicia sesión como administrador.');
    abrirModal('modal-login');
    return;
  }
  ['tienda','ventas','config'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('hidden', t !== nombre);
  });
  if (nombre === 'ventas') renderVentas();
  if (nombre === 'config') renderConfigLista();
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarConfigSite();
  await cargarProductos();
  await initAuth();

  renderProductos();
  renderCarrito();
});
