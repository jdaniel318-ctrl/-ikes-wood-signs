/* Dark Sky 8.8.17 Admiral Commission — shared browser-safe Supabase transport.
   This module accepts publishable keys only. It never accepts or stores a
   service-role key, password, or cross-vessel authority assertion. */
;(() => {
  'use strict';

  const DEFAULT_EXPIRY_SECONDS = 3600;
  const EXPIRY_SKEW_MS = 30_000;

  const cleanEmail = value => String(value || '').trim().toLowerCase();
  const parseJson = async response => {
    try { return await response.json(); } catch (_) { return null; }
  };
  const apiError = (problem, fallback) => {
    const message = problem?.message || problem?.msg || problem?.error_description || problem?.hint || fallback;
    return new Error(String(message || fallback).replaceAll('_', ' '));
  };
  const safeSessionRead = key => {
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (_) { return null; }
  };
  const safeSessionWrite = (key, value) => {
    try { sessionStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; }
  };
  const safeSessionRemove = key => {
    try { sessionStorage.removeItem(key); } catch (_) {}
  };

  function create(options = {}) {
    const url = String(options.url || '').replace(/\/$/, '');
    const publishableKey = String(options.publishableKey || options.key || '');
    const sessionKey = String(options.sessionKey || 'darkSkySupabaseSessionV1');
    const build = String(options.build || '8.8.17.5');

    if (!url || !publishableKey) throw new Error('Supabase publishable client configuration is incomplete.');

    const headers = (token = '', json = true) => {
      const value = { apikey: publishableKey };
      if (token) value.Authorization = `Bearer ${token}`;
      if (json) value['Content-Type'] = 'application/json';
      return value;
    };

    const readSession = () => safeSessionRead(sessionKey);
    const saveSession = data => {
      if (!data?.access_token) return null;
      const session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || '',
        expires_at: Date.now() + Math.max(60, Number(data.expires_in || DEFAULT_EXPIRY_SECONDS)) * 1000,
        user: data.user || null,
        flow_type: data.flow_type || '',
        build
      };
      if (!safeSessionWrite(sessionKey, session)) throw new Error('The secure browser session could not be retained.');
      return session;
    };
    const clearSession = () => safeSessionRemove(sessionKey);

    async function request(path, init = {}, fallback = 'Supabase refused the request.') {
      const response = await fetch(`${url}${path}`, { cache: 'no-store', ...init });
      const body = await parseJson(response);
      if (!response.ok) throw apiError(body, fallback);
      return body;
    }
    async function refreshSession(session = readSession()) {
      if (!session?.refresh_token) return null;
      try {
        const data = await request('/auth/v1/token?grant_type=refresh_token', {
          method: 'POST', headers: headers(), body: JSON.stringify({ refresh_token: session.refresh_token })
        }, 'The secure session expired. Sign in again.');
        return saveSession(data);
      } catch (_) {
        clearSession();
        return null;
      }
    }
    async function currentSession() {
      let session = readSession();
      if (session?.access_token && Number(session.expires_at) > Date.now() + EXPIRY_SKEW_MS) return session;
      if (session?.refresh_token) session = await refreshSession(session);
      return session?.access_token ? session : null;
    }
    async function signInWithPassword(email, password) {
      const normalized = cleanEmail(email);
      if (!normalized || !password) throw new Error('Enter the account email and password.');
      const data = await request('/auth/v1/token?grant_type=password', {
        method: 'POST', headers: headers(), body: JSON.stringify({ email: normalized, password: String(password) })
      }, 'Email or password did not match.');
      return saveSession(data);
    }
    async function user(session = null) {
      session = session || await currentSession();
      if (!session?.access_token) return null;
      try {
        const value = await request('/auth/v1/user', {
          headers: { ...headers(session.access_token), Accept: 'application/json' }
        }, 'The signed-in identity could not be verified.');
        session.user = value;
        safeSessionWrite(sessionKey, session);
        return value;
      } catch (_) {
        clearSession();
        return null;
      }
    }
    async function signOut() {
      const session = readSession();
      try {
        if (session?.access_token) await fetch(`${url}/auth/v1/logout`, {
          method: 'POST', headers: headers(session.access_token, false), cache: 'no-store'
        });
      } finally {
        clearSession();
      }
    }
    async function rpc(name, body = {}, fallback = 'Fleet Core refused the request.') {
      const session = await currentSession();
      if (!session?.access_token) throw new Error('Authenticate the required Supabase account first.');
      return request(`/rest/v1/rpc/${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: { ...headers(session.access_token), Accept: 'application/json' },
        body: JSON.stringify(body)
      }, fallback);
    }

    return Object.freeze({
      url, publishableKey, sessionKey, build, headers, readSession, saveSession,
      clearSession, refreshSession, currentSession, signInWithPassword, user,
      signOut, request, rpc
    });
  }

  window.DarkSkySupabase = Object.freeze({ create, cleanEmail });
})();
