async function registrarVenta(venta) {
  if (window.MODO_NUBE) {
    const { error } = await window.sb.from('ventas').insert({
      codigo: venta.codigo, total: venta.total, items: venta.items
    });
    if (error) throw error;
  } else {
    const lista = JSON.parse(localStorage.getItem('ventas') || '[]');
    lista.push({ ...venta, fecha: new Date().toISOString() });
    localStorage.setItem('ventas', JSON.stringify(lista));
  }
  // Descontar stock
  for (const it of venta.items) {
    const p = productos.find(x => x.id === it.id);
    if (p) {
      p.stock = Math.max(0, p.stock - it.cant);
      await guardarProductoEnDB(p);
    }
  }
}

async function listarVentas() {
  if (window.MODO_NUBE) {
    const { data } = await window.sb.from('ventas').select('*').order('fecha', { ascending: false });
    return data || [];
  }
  return JSON.parse(localStorage.getItem('ventas') || '[]').reverse();
}

async function renderVentas() {
  const ventas = await listarVentas();
  const totalVendido = ventas.reduce((s, v) => s + Number(v.total), 0);
  const ganancia = ventas.reduce((s, v) => s + (v.items || []).reduce((s2, it) => {
    const p = productos.find(x => x.id === it.id);
    return s2 + (it.precio - (p ? p.precioCompra : 0)) * it.cant;
  }, 0), 0);

  document.getElementById('ventas-resumen').innerHTML = `
    <div class="bg-white p-4 rounded-xl shadow"><p class="text-xs text-slate-500">Ventas</p><p class="text-2xl font-black">${ventas.length}</p></div>
    <div class="bg-white p-4 rounded-xl shadow"><p class="text-xs text-slate-500">Total vendido</p><p class="text-2xl font-black text-cyan-600">${money(totalVendido)}</p></div>
    <div class="bg-white p-4 rounded-xl shadow"><p class="text-xs text-slate-500">Ganancia estimada</p><p class="text-2xl font-black text-emerald-600">${money(ganancia)}</p></div>`;

  const lista = document.getElementById('ventas-lista');
  if (!ventas.length) { lista.innerHTML = '<p class="text-slate-500">Sin ventas aún.</p>'; return; }
  lista.innerHTML = ventas.map(v => `
    <div class="bg-white p-4 rounded-xl shadow mb-2">
      <div class="flex justify-between flex-wrap gap-1">
        <b>${esc(v.codigo)}</b>
        <span class="text-xs text-slate-500">${new Date(v.fecha).toLocaleString('es-PE')}</span>
      </div>
      <ul class="text-sm text-slate-600 mt-1">
        ${(v.items || []).map(it => `<li>${it.cant} × ${esc(it.nombre)} — ${money(it.precio * it.cant)}</li>`).join('')}
      </ul>
      <div class="text-right font-black mt-1">Total: ${money(v.total)}</div>
    </div>`).join('');
}
