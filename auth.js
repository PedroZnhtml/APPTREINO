/**
 * IronPulse Auth & Cloud Vault System
 * Autenticação Multi-inquilino com Sincronização em Nuvem em Tempo Real
 */

(function () {
  'use strict';

  const VAULT_KEY = 'ironpulse_accounts_vault_v1';
  const SESSION_KEY = 'ironpulse_current_session_v1';

  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_ironpulse_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  class AuthManager {
    constructor() {
      this.vault = this.loadVault();
      this.currentUserId = localStorage.getItem(SESSION_KEY) || null;
    }

    loadVault() {
      try {
        const raw = localStorage.getItem(VAULT_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Erro ao ler cofre local:', e);
        return [];
      }
    }

    saveVault() {
      try {
        localStorage.setItem(VAULT_KEY, JSON.stringify(this.vault));
      } catch (e) {
        console.error('Erro ao salvar cofre local:', e);
      }
    }

    async register(name, email, password, weight = 70, height = 175, goal = 'Hipertrofia') {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // Checa se usuário já existe no banco em nuvem
      if (window.CloudDB && window.CloudDB.isConnected()) {
        const cloudExisting = await window.CloudDB.fetchUser(cleanEmail);
        if (cloudExisting) {
          throw new Error('Já existe uma conta em nuvem cadastrada com este e-mail.');
        }
      }

      // Checa se existe localmente
      const existsLocal = this.vault.some(u => u.email === cleanEmail);
      if (existsLocal) {
        throw new Error('Já existe uma conta cadastrada com este e-mail neste aparelho.');
      }

      const passwordHash = await hashPassword(password);
      const userId = 'usr_' + Date.now();

      const targetProtein = Math.round(weight * 2.0);
      const targetFat = Math.round(weight * 0.8);
      const targetCarbs = Math.round(weight * 3.5);
      const targetKcal = Math.round((targetProtein * 4) + (targetCarbs * 4) + (targetFat * 9));

      const newUser = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        passwordHash: passwordHash,
        weight: Number(weight),
        height: Number(height),
        goal: goal,
        targetKcal: targetKcal,
        targetProtein: targetProtein,
        targetCarbs: targetCarbs,
        targetFat: targetFat,
        water: 0,
        activeRoutineId: null,
        routines: [], // ZERADO
        meals: [],    // ZERADO
        workoutLogs: {},
        createdAt: new Date().toISOString()
      };

      // Salva no cofre local
      this.vault.push(newUser);
      this.saveVault();
      this.setSession(userId);

      // Salva no banco de dados em nuvem
      if (window.CloudDB && window.CloudDB.isConnected()) {
        window.CloudDB.saveUser(newUser).catch(err => {
          console.warn('Erro ao sincronizar novo usuário com a nuvem:', err);
        });
      }

      return newUser;
    }

    async login(emailOrUser, password) {
      const clean = emailOrUser.trim().toLowerCase();
      const inputHash = await hashPassword(password);

      // 1. Tenta buscar no banco de dados em nuvem primeiro (para permitir login de qualquer navegador diferente!)
      if (window.CloudDB && window.CloudDB.isConnected()) {
        try {
          const cloudUser = await window.CloudDB.fetchUser(clean);
          if (cloudUser) {
            if (cloudUser.passwordHash !== inputHash) {
              throw new Error('Senha incorreta para esta conta na nuvem.');
            }

            // Usuário autenticado na nuvem com sucesso! Salva/atualiza no cofre local
            const localIdx = this.vault.findIndex(u => u.id === cloudUser.id || u.email === cloudUser.email);
            if (localIdx >= 0) {
              this.vault[localIdx] = cloudUser;
            } else {
              this.vault.push(cloudUser);
            }
            this.saveVault();
            this.setSession(cloudUser.id);
            return cloudUser;
          }
        } catch (e) {
          if (e.message && e.message.includes('Senha incorreta')) throw e;
          console.warn('Erro ao consultar nuvem no login, verificando cofre local:', e);
        }
      }

      // 2. Fallback: Verifica no cofre local deste dispositivo
      const localUser = this.vault.find(u => u.email === clean || u.name.toLowerCase() === clean);
      if (!localUser) {
        if (window.CloudDB && window.CloudDB.isConnected()) {
          throw new Error('Conta não encontrada no banco em nuvem nem neste navegador.');
        } else {
          throw new Error('Conta não encontrada neste navegador. Se você criou em outro aparelho, conecte o Banco em Nuvem abaixo.');
        }
      }

      if (localUser.passwordHash !== inputHash) {
        throw new Error('Senha incorreta. Tente novamente.');
      }

      this.setSession(localUser.id);
      return localUser;
    }

    setSession(userId) {
      this.currentUserId = userId;
      localStorage.setItem(SESSION_KEY, userId);
    }

    logout() {
      this.currentUserId = null;
      localStorage.removeItem(SESSION_KEY);
    }

    getCurrentUser() {
      if (!this.currentUserId) return null;
      return this.vault.find(u => u.id === this.currentUserId) || null;
    }

    saveCurrentUser(updatedUserData) {
      const idx = this.vault.findIndex(u => u.id === updatedUserData.id);
      if (idx >= 0) {
        this.vault[idx] = updatedUserData;
        this.saveVault();

        // Envia atualização em tempo real para a nuvem
        if (window.CloudDB && window.CloudDB.isConnected()) {
          window.CloudDB.saveUser(updatedUserData).catch(err => {
            console.warn('Erro ao sincronizar atualização com a nuvem:', err);
          });
        }
      }
    }

    getExistingAccountsList() {
      return this.vault.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        goal: u.goal
      }));
    }
  }

  window.IronAuth = new AuthManager();
})();
