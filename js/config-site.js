let siteConfig = {};

const DEFAULT_CONFIG = {
  titulo: 'Mi Tienda',
  subtitulo: 'Compra fácil y rápido',
  telefono: '956 123 456',
  qr_url: '',
  color_primario: '#0ea5e9'
};

async function cargarConfigSite() {
  if (window.MODO_NUBE) {
    const { data } = await window.sb.from('config_sitio').select('*');
    const map = {};
    (data || []).forEach(r => map[r.clave] = r.valor);
    siteConfig = { ...DEFAULT_CONFIG, ...map };
  } else {
    siteConfig = { ...DEFAULT_CONFIG, ...(JSON.parse(localStorage.getItem('site_config') || '{}')) };
  }
  aplicarConfigSite();
}

async function guardarConfigSite() {
  const nuevo = {
    titulo: document.getElementById('c-titulo').value.trim() || 'Mi Tienda',
    subtitulo: document.getElementById('c-sub').value.trim(),
    telefono: document.getElementById('c-tel').value.trim(),
    qr_url: document.getElementById('c-qr').value.trim(),
    color_primario: document.getElementById('c-color').value
  };
  siteConfig = { ...siteConfig, ...nuevo };

  if (window.MODO_NUBE) {
    for (const [clave, valor] of Object.entries(nuevo)) {
      await window.sb.from('config_sitio').upsert({ clave, valor });
    }
  } else {
    localStorage.setItem('site_config', JSON.stringify(siteConfig));
  }
  aplicarConfigSite();
  alert('✅ Cambios guardados.');
}

function aplicarConfigSite() {
  document.documentElement.style.setProperty('--brand', siteConfig.color_primario || '#0ea5e9');
  document.getElementById('site-title').textContent = siteConfig.titulo;
  document.getElementById('hero-title').textContent = siteConfig.titulo;
  document.getElementById('hero-sub').textContent   = siteConfig.subtitulo;
  document.getElementById('hero-tel').textContent   = siteConfig.telefono;
  document.getElementById('c-titulo').value = siteConfig.titulo;
  document.getElementById('c-sub').value    = siteConfig.subtitulo;
  document.getElementById('c-tel').value    = siteConfig.telefono;
  document.getElementById('c-qr').value     = siteConfig.qr_url || '';
  document.getElementById('c-color').value  = siteConfig.color_primario || '#0ea5e9';
}
