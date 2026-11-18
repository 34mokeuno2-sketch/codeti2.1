let carrito = [];
let ventaPendiente = null;

function agregarAlCarrito(id) {
  const p = productos.find(x => x.id === id);
  if (!p || p.stock <= 0) return;
  const item = carrito.find(x => x.id === id);
  if (item) {
    if (item.cant < p.stock) item.cant++;
    else return alert('No hay más stock.');
  } else {
    carrito.push({ id, cant: 1 });
  }
  renderCarrito();
}

function cambiarCant(id, d) {
  const item = carrito.find(x => x.id === id);
  const p = productos.find(x => x.id === id);
  if (!item || !p) return;
  const nueva = item.cant + d;
  if (nueva <= 0) carrito = carrito.filter(x => x.id !== id);
  else if (nueva > p.stock) return alert('No hay más stock.');
  else item.cant = nueva;
  renderCarrito();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(x => x.id !== id);
  renderCarrito();
}

function totalCarrito() {
  return carrito.reduce((s, i) => {
    const p = productos.find(x => x.id === i.id);
    return s + (p ? p.precioVenta * i.cant : 0);
  }, 0);
}

function renderCarrito() {
  document.getElementById('cart-count').textContent = carrito.reduce((s,i) => s + i.cant, 0);
  const cont = document.getElementById('cart-items');
  if (!carrito.length) {
    cont.innerHTML = '<p class="text-slate-500 text-sm">Carrito vacío</p>';
  } else {
    cont.innerHTML = carrito.map(i => {
      const p = productos.find(x => x.id === i.id);
      if (!p) return '';
      return `<div class="flex items-center justify-between border-b py-2 text-sm">
        <div><b>${esc(p.nombre)}</b><br><span class="text-xs text-slate-500">${money(p.precioVenta)} c/u</span></div>
        <div class="flex items-center gap-2">
          <button onclick="cambiarCant('${i.id}',-1)" class="w-7 h-7 rounded bg-slate-200">−</button>
          <span>${i.cant}</span>
          <button onclick="cambiarCant('${i.id}',1)" class="w-7 h-7 rounded bg-slate-200">+</button>
          <button onclick="quitarDelCarrito('${i.id}')" class="text-red-500 ml-2">✕</button>
        </div>
      </div>`;
    }).join('');
  }
  document.getElementById('cart-total').textContent = money(totalCarrito());
}

function abrirPago() {
  if (!carrito.length) return alert('El carrito está vacío.');
  const total  = totalCarrito();
  const codigo = 'VTA-' + Date.now().toString(36).toUpperCase().slice(-6);
  ventaPendiente = {
    codigo, total,
    items: carrito.map(i => {
      const p = productos.find(x => x.id === i.id);
      return { id: p.id, nombre: p.nombre, precio: p.precioVenta, cant: i.cant };
    })
  };
  document.getElementById('pago-codigo').textContent = codigo;
  document.getElementById('pago-monto').textContent  = money(total);

  const qrImg = document.getElementById('pago-qr');
  if (siteConfig.qr_url) {
    qrImg.src = siteConfig.qr_url;
  } else {
    const data = encodeURIComponent(`PAGO|${codigo}|S/${total.toFixed(2)}|${siteConfig.titulo}`);
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${data}`;
  }

  cerrarModal('modal-carrito');
  abrirModal('modal-pago');
}

async function confirmarPago() {
  if (!ventaPendiente) return;
  try {
    await registrarVenta(ventaPendiente);
    carrito = [];
    ventaPendiente = null;
    cerrarModal('modal-pago');
    renderCarrito();
    await cargarProductos();
    renderProductos();
    alert('✅ Pago registrado y venta guardada.');
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  }
}
