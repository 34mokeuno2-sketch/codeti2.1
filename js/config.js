// ============================================================
// CONFIGURACIÓN PRINCIPAL
// ============================================================
// OPCIÓN A (rápida, sin nube): deja SUPABASE_URL y SUPABASE_ANON_KEY VACÍOS.
//   La app usará localStorage. Contraseña admin: ADMIN_PASSWORD.
//
// OPCIÓN B (nube real, con login): llena los datos de tu proyecto Supabase.
//   Las claves las obtienes en Supabase → Project Settings → API.
// ============================================================

window.APP_CONFIG = {
  SUPABASE_URL: '',       // ej: 'https://abcxyz.supabase.co'
  SUPABASE_ANON_KEY: '',  // ej: 'eyJhbGciOi...'
  ADMIN_PASSWORD: 'admin123'  // solo se usa en modo local (sin Supabase)
};
