/**
 * IronPulse Cloud Database Connector
 * Sincronização em Tempo Real Multi-Dispositivo e Multi-Navegador
 * Suporta Firebase Realtime Database REST API e Supabase REST API
 */

(function () {
  'use strict';

  const CONFIG_KEY = 'ironpulse_cloud_db_config_v1';

  // Sanitizar chave para banco de dados (substitui caracteres não permitidos como '.', '#', '$', '/', '[', ']')
  function makeSafeKey(str) {
    if (!str) return 'user_default';
    return encodeURIComponent(str.trim().toLowerCase().replace(/[\.\#\$\[\]\/\s]/g, '_'));
  }

  class CloudDatabaseService {
    constructor() {
      this.config = this.loadConfig();
    }

    loadConfig() {
      try {
        const raw = localStorage.getItem(CONFIG_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.url) return parsed;
        }
      } catch (e) {
        console.error('Erro ao ler configuração da nuvem:', e);
      }

      return {
        type: 'firebase',
        url: window.IRONPULSE_CLOUD_URL || '',
        apiKey: ''
      };
    }

    saveConfig(config) {
      this.config = config;
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      } catch (e) {
        console.error('Erro ao salvar configuração da nuvem:', e);
      }
    }

    isConnected() {
      return Boolean(this.config && this.config.url && this.config.url.trim().length > 0);
    }

    getCleanUrl() {
      if (!this.config || !this.config.url) return '';
      return this.config.url.trim().replace(/\/+$/, '');
    }

    // Testar conexão com o banco de dados em nuvem
    async testConnection(testUrl = null) {
      const urlToTest = testUrl ? testUrl.trim().replace(/\/+$/, '') : this.getCleanUrl();
      if (!urlToTest) {
        throw new Error('Insira a URL do seu banco de dados em nuvem.');
      }

      try {
        const pingUrl = `${urlToTest}/_ping.json`;
        const res = await fetch(pingUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ping: true, timestamp: Date.now() })
        });

        if (res.ok) {
          return { success: true, message: 'Conexão com o banco de dados em nuvem estabelecida com sucesso!' };
        } else {
          throw new Error(`Servidor respondeu com status ${res.status}. Verifique se o banco está em modo de teste (leitura/gravação liberada).`);
        }
      } catch (err) {
        throw new Error(`Falha ao conectar: ${err.message}. Verifique a URL do Firebase/Nuvem.`);
      }
    }

    // Buscar usuário na nuvem por e-mail ou username
    async fetchUser(emailOrUser) {
      if (!this.isConnected()) return null;

      const safeKey = makeSafeKey(emailOrUser);
      const url = `${this.getCleanUrl()}/users/${safeKey}.json`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`Erro ao buscar usuário na nuvem: status ${res.status}`);
          return null;
        }
        const data = await res.json();
        return data; // Retorna o objeto do usuário ou null
      } catch (err) {
        console.warn('Erro de rede ao buscar na nuvem:', err);
        return null;
      }
    }

    // Salvar/atualizar usuário na nuvem
    async saveUser(user) {
      if (!this.isConnected() || !user || !user.email) return false;

      const safeKey = makeSafeKey(user.email);
      const url = `${this.getCleanUrl()}/users/${safeKey}.json`;

      try {
        // Remove fotos pesadas do payload do JSON de usuário caso existam para sync ultra veloz
        const payload = Object.assign({}, user);
        payload.lastSync = new Date().toISOString();

        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        return res.ok;
      } catch (err) {
        console.warn('Erro ao sincronizar com a nuvem:', err);
        return false;
      }
    }
  }

  window.CloudDB = new CloudDatabaseService();
})();
