window.sb = null;
window.MODO_NUBE = false;

(function () {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;
  if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.MODO_NUBE = true;
  }
})();
