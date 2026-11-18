let productos = [];
let editandoId = null;

function seedProductos() {
  return [
    { id:'p1', nombre:'Laptop Gamer', desc:'Core i7 · 16GB RAM · SSD 1TB',
      img:'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
      precioCompra:3500, precioVenta:4299, stock:5 },
    { id:'p2', nombre:'Audífonos HyperX', desc:'Inalámbricos · 7.1 · 30h',
      img:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      precioCompra:250, precioVenta:349, stock:12 },
    { id:'p3', nombre:'Teclado Mecánico', desc:'RGB · Switches azules',
      img:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      precioCompra:120, precioVenta:189, stock:20 }
  ];
}

async function cargarProductos() {
  if (window.MODO_NUBE) {
    const { data, error } = await window.sb.from('productos').select('*').order('creado_en', { ascending: false });
    if (error) { console.error(error); productos = []; return; }
    productos = (data || []).map(p => ({
      id: p.id, nombre: p.nombre, desc: p.descripcion || '',
      img: p.imagen || '', precioCompra: Number(p.precio_compra) || 0,
      precioVenta: Number(p.precio_venta) || 0, stock: p.stock || 0
    }));
  } else {
    productos = JSON.parse(localStorage.getItem('productos') || 'null') || seedProductos();
    localStorage.setItem('productos', JSON.stringify(productos));
  }
}

async function guardarProductoEnDB(prod) {
  if (window.MODO_NUBE) {
    const { error } = await window.sb.from('productos').upsert({
      id: prod.id, nombre: prod.nombre, descripcion: prod.desc,
      imagen: prod.img, precio_compra: prod.precioCompra,
      precio_venta: prod.precioVenta, stock: prod.stock
    });
    if (error) throw error;
  } else {
    const idx = productos.findIndex(p => p.id === prod.id);
    if (idx >= 0) productos[idx] = prod;
    else productos.push(prod);
    localStorage.setItem('productos', JSON.stringify(productos));
  }
}

async function borrarProductoEnDB(id) {
  if (window.MODO_NUBE) {
    const { error } = await window.sb.from('productos').delete().eq('id', id);
    if (error) throw error;
  } else {
    productos = productos.filter(p => p.id !== id);
    localStorage.setItem('productos', JSON.stringify(productos));
  }
}

function renderProductos() {
  const grid = document.getElementById('product-grid');
  if (!productos.length) {
    grid.innerHTML = '<p class="text-slate-500">No hay productos. Agrégalos en Configuración.</p>';
    return;
  }
  grid.innerHTML = productos.map(p => `
    <div class="bg-white rounded-2xl shadow overflow-hidden flex flex-col">
      <img src="${esc(p.img)}" alt="${esc(p.nombre)}" class="h-40 w-full object-cover"
           onerror="this.src='https://via.placeholder.com/400x300?text=Sin+imagen'">
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="font-bold">${esc(p.nombre)}</h3>
          <p class="text-xs text-slate-500">${esc(p.desc)}</p>
          <p class="text-xs mt-1 ${p.stock > 0 ? 'text-emerald-600' : 'text-red-500'}">
            ${p.stock > 0 ? 'Stock: ' + p.stock : 'Agotado'}
          </p>
        </div>
        <div class="flex items-center justify-between mt-3">
          <span class="font-black text-lg">${money(p.precioVenta)}</span>
          <button onclick="agregarAlCarrito('${p.id}')" ${p.stock <= 0 ? 'disabled' : ''}
                  class="btn-primary disabled:bg-slate-300 text-white font-bold px-3 py-2 rounded-lg">Agregar</button>
        </div>
      </div>
    </div>`).join('');
}

function guardarProductoForm() {
  const nombre = document.getElementById('f-nombre').value.trim();
  const desc   = document.getElementById('f-desc').value.trim();
  const img    = document.getElementById('f-img').value.trim() || 'https://via.placeholder.com/400x300?text=Producto';
  const compra = parseFloat(document.getElementById('f-compra').value) || 0;
  const venta  = parseFloat(document.getElementById('f-venta').value) || 0;
  const stock  = parseInt(document.getElementById('f-stock').value) || 0;

  if (!nombre) return alert('Escribe el nombre del producto.');
  if (venta <= 0) return alert('El precio de venta debe ser mayor a 0.');

  const id = editandoId || ('p' + Date.now());
  const prod = { id, nombre, desc, img, precioCompra: compra, precioVenta: venta, stock };

  guardarProductoEnDB(prod).then(async () => {
    await cargarProductos();
    renderProductos();
    renderConfigLista();
    limpiarFormulario();
    alert('✅ Producto guardado.');
  }).catch(err => alert('Error: ' + err.message));
}

function editarProducto(id) {
  const p = productos.find(x => x.id === id);
  if (!p) return;
  editandoId = id;
  document.getElementById('form-titulo').textContent = '✏️ Editando: ' + p.nombre;
  document.getElementById('f-nombre').value = p.nombre;
  document.getElementById('f-desc').value = p.desc;
  document.getElementById('f-img').value = p.img;
  document.getElementById('f-compra').value = p.precioCompra;
  document.getElementById('f-venta').value = p.precioVenta;
  document.getElementById('f-stock').value = p.stock;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function borrarProducto(id) {
  if (!confirm('¿Borrar este producto?')) return;
  borrarProductoEnDB(id).then(async () => {
    await cargarProductos();
    renderProductos();
    renderConfigLista();
  }).catch(err => alert('Error: ' + err.message));
}

function limpiarFormulario() {
  editandoId = null;
  document.getElementById('form-titulo').textContent = '➕ Agregar producto';
  ['f-nombre','f-desc','f-img','f-compra','f-venta','f-stock'].forEach(id => document.getElementById(id).value = '');
}

function renderConfigLista() {
  const cont = document.getElementById('config-lista');
  if (!productos.length) {
    cont.innerHTML = '<p class="text-slate-500">No hay productos aún.</p>';
    return;
  }
  cont.innerHTML = productos.map(p => `
    <div class="flex items-center gap-3 bg-white p-2 rounded-lg mb-2 shadow-sm">
      <img src="${esc(p.img)}" class="w-10 h-10 rounded object-cover"
           onerror="this.src='https://via.placeholder.com/80?text=?'">
      <div class="flex-1 min-w-0">
        <b class="text-sm block truncate">${esc(p.nombre)}</b>
        <span class="text-xs text-slate-500">Costo ${money(p.precioCompra)} · Venta ${money(p.precioVenta)} · Stock ${p.stock}</span>
      </div>
      <button onclick="editarProducto('${p.id}')" class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Editar</button>
      <button onclick="borrarProducto('${p.id}')" class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Borrar</button>
    </div>`).join('');
}
