/**
 * IronPulse Auth & User Vault System
 * Sistema de Contas, Senhas com Criptografia SHA-256 e Armazenamento Multi-inquilino
 */

(function () {
  'use strict';

  const VAULT_KEY = 'ironpulse_accounts_vault_v1';
  const SESSION_KEY = 'ironpulse_current_session_v1';

  // Criptografia SHA-256 via Web Crypto API nativa do navegador
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
        console.error('Erro ao ler cofre de contas:', e);
        return [];
      }
    }

    saveVault() {
      try {
        localStorage.setItem(VAULT_KEY, JSON.stringify(this.vault));
      } catch (e) {
        console.error('Erro ao salvar cofre de contas:', e);
      }
    }

    async register(name, email, password, weight = 70, height = 175, goal = 'Hipertrofia') {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // Checa se usuário já existe
      const exists = this.vault.some(u => u.email === cleanEmail);
      if (exists) {
        throw new Error('Já existe uma conta cadastrada com este e-mail ou usuário.');
      }

      const passwordHash = await hashPassword(password);
      const userId = 'usr_' + Date.now();

      // Dieta e Metas calculadas pelo peso inicial
      const targetProtein = Math.round(weight * 2.0); // 2g/kg
      const targetFat = Math.round(weight * 0.8);     // 0.8g/kg
      const targetCarbs = Math.round(weight * 3.5);   // 3.5g/kg
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
        routines: [], // TOTALMENTE ZERADO CONFORME PEDIDO
        meals: [],    // TOTALMENTE ZERADO CONFORME PEDIDO
        workoutLogs: {},
        createdAt: new Date().toISOString()
      };

      this.vault.push(newUser);
      this.saveVault();
      this.setSession(userId);
      return newUser;
    }

    async login(emailOrUser, password) {
      const clean = emailOrUser.trim().toLowerCase();
      const user = this.vault.find(u => u.email === clean || u.name.toLowerCase() === clean);

      if (!user) {
        throw new Error('Conta não encontrada. Verifique o usuário/e-mail ou crie uma nova conta.');
      }

      const inputHash = await hashPassword(password);
      if (user.passwordHash !== inputHash) {
        throw new Error('Senha incorreta. Tente novamente.');
      }

      this.setSession(user.id);
      return user;
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
