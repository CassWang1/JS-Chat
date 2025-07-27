"use strict";

const API = {
  SESSION: '/api/v1/session',
  CHAT: '/api/v1/chat',
  MESSAGES: '/api/v1/messages',
  DIRECT_MESSAGES: '/api/v1/direct-messages'
};

export class ChatModel {
  constructor() {
    // User state
    this.username = null;
    this.users = [];
    this.isLoggedIn = false;
    
    // Message state
    this.messages = [];
    this.directMessages = [];
    this.messageIds = new Set();
    this.dmIds = new Set();
    
    // UI state
    this.isLoading = true;
    this.isFetching = false;
    this.errorMessage = '';
    this.activeTab = 'public';
    this.selectedRecipient = '';
    
    // Polling state
    this.pollingInterval = null;
    this.lastPublicTimestamp = 0;
    this.lastDMTimestamp = 0;
    this.dataUpdateCallback = null;
  }

  setActiveTab(tab) {
    this.activeTab = tab;
  }

  setSelectedRecipient(username) {
    this.selectedRecipient = username;
  }

  async checkSession() {
    try {
      this.isLoading = true;
      const response = await fetch(API.SESSION);
      
      if (response.ok) {
        const data = await response.json();
        this.username = data.username;
        this.isLoggedIn = true;
        await this.fetchChatData();
      } else {
        this.isLoggedIn = false;
      }
      
      this.isLoading = false;
      return this.isLoggedIn;
    } catch (error) {
      this.handleError('Network error. Please try again.', error);
      this.isLoading = false;
      return false;
    }
  }

  async login(username) {
    try {
      this.isLoading = true;
      const response = await fetch(API.SESSION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        const data = await response.json();
        this.username = data.username;
        this.isLoggedIn = true;
        await this.fetchChatData();
      } else {
        const errorData = await response.json();
        let errorMessage = 'Login failed';
        
        if (response.status === 400) {
          errorMessage = 'Invalid username. Use only letters, numbers, and underscores.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied for this username.';
        }
        
        throw new Error(errorMessage);
      }
      
      this.isLoading = false;
      return this.isLoggedIn;
    } catch (error) {
      this.handleError(error.message || 'Login failed. Please try again.', error);
      this.isLoading = false;
      return false;
    }
  }

  async logout() {
    try {
      this.isLoading = true;
      const response = await fetch(API.SESSION, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.username = null;
        this.users = [];
        this.messages = [];
        this.directMessages = [];
        this.isLoggedIn = false;
        this.lastPublicTimestamp = 0;
        this.lastDMTimestamp = 0;
        this.stopPolling();
      } else {
        throw new Error('Logout failed');
      }
      
      this.isLoading = false;
      return true;
    } catch (error) {
      this.handleError('Logout failed. Please try again.', error);
      this.isLoading = false;
      return false;
    }
  }

  async fetchChatData() {
    if (this.isFetching) return false;
    this.isFetching = true;
    
    try {
      // Only request messages that are newer than what we already have
      const query = this.lastPublicTimestamp ? `?since=${this.lastPublicTimestamp}` : '';
      const response = await fetch(`${API.CHAT}${query}`);
      
      if (response.ok) {
        const data = await response.json();
        let stateChanged = false;
        
        if (JSON.stringify(this.users) !== JSON.stringify(data.users)) {
          this.users = data.users;
          stateChanged = true;
        }
        
        const publicMessages = data.messages.filter(msg => !msg.isDM);
        if (publicMessages.length > 0) {
          const newMessages = publicMessages.filter(msg => !this.messageIds.has(msg.id));
          if (newMessages.length > 0) {
            newMessages.forEach(msg => this.messageIds.add(msg.id));
            
            this.messages = [...this.messages, ...newMessages]
              .sort((a, b) => a.timestamp - b.timestamp);
            stateChanged = true;
          }
        } else if (!this.lastPublicTimestamp) {
          this.messages = publicMessages;
          this.messageIds = new Set(publicMessages.map(msg => msg.id));
          stateChanged = true;
        }
        
        this.lastPublicTimestamp = Math.max(
          data.timestamp,
          ...this.messages.map(msg => msg.timestamp)
        );
        
        if (this.isLoggedIn) {
          const dmChanged = await this.fetchDirectMessages();
          stateChanged = stateChanged || dmChanged;
        }
        
        if (this.dataUpdateCallback && stateChanged) {
          this.dataUpdateCallback();
        }
        
        this.errorMessage = '';
        return true;
      } else if (response.status === 401) {
        this.isLoggedIn = false;
        throw new Error('Please login to continue');
      } else {
        throw new Error('Failed to fetch chat data');
      }
    } catch (error) {
      this.handleError('Failed to fetch chat data. Please try again.', error);
      return false;
    } finally {
      this.isFetching = false;
    }
  }

  async fetchDirectMessages() {
    try {
      const query = this.lastDMTimestamp ? `?since=${this.lastDMTimestamp}` : '';
      const response = await fetch(`${API.DIRECT_MESSAGES}${query}`);
      
      if (response.ok) {
        const data = await response.json();
        let changed = false;
        
        if (data.messages.length > 0) {
          const newMessages = data.messages.filter(msg => !this.dmIds.has(msg.id));
          if (newMessages.length > 0) {
            newMessages.forEach(msg => this.dmIds.add(msg.id));

            this.directMessages = [...this.directMessages, ...newMessages]
              .sort((a, b) => a.timestamp - b.timestamp);
            changed = true;
          }
        } else if (!this.lastDMTimestamp) {
          this.directMessages = data.messages;
          this.dmIds = new Set(data.messages.map(msg => msg.id));
          changed = data.messages.length > 0;
        }

        this.lastDMTimestamp = Math.max(
          data.timestamp,
          ...this.directMessages.map(msg => msg.timestamp)
        );
        
        return changed;
      } else if (response.status === 401) {
        this.isLoggedIn = false;
        throw new Error('Please login to continue');
      } else {
        throw new Error('Failed to fetch direct messages');
      }
    } catch (error) {
      this.handleError('Failed to fetch direct messages. Please try again.', error);
      return false;
    }
  }

  async sendMessage(text) {
    try {
      const response = await fetch(API.MESSAGES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const message = await response.json();
        this.messages.push(message);
        return true;
      } else if (response.status === 400) {
        throw new Error('Empty message not allowed');
      } else if (response.status === 401) {
        this.isLoggedIn = false;
        throw new Error('Please login to continue');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      this.handleError('Failed to send message. Please try again.', error);
      return false;
    }
  }

  async sendDirectMessage(text, recipient) {
    try {
      if (!recipient) {
        throw new Error('Please select a recipient');
      }
      
      const response = await fetch(API.DIRECT_MESSAGES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, recipient })
      });

      if (response.ok) {
        const message = await response.json();
        if (!this.dmIds.has(message.id)) {
          this.dmIds.add(message.id);
          this.directMessages.push(message);
          this.directMessages.sort((a, b) => a.timestamp - b.timestamp);
        }
        return true;
      } else if (response.status === 400) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send direct message');
      } else if (response.status === 401) {
        this.isLoggedIn = false;
        throw new Error('Please login to continue');
      } else {
        throw new Error('Failed to send direct message');
      }
    } catch (error) {
      this.handleError(error.message || 'Failed to send direct message. Please try again.', error);
      return false;
    }
  }

  getDirectMessagesForRecipient(recipient) {
    if (!recipient) return [];
    
    return this.directMessages.filter(msg => 
      (msg.username === this.username && msg.recipient === recipient) || 
      (msg.username === recipient && msg.recipient === this.username)
    );
  }

  startPolling(callback) {
    this.dataUpdateCallback = callback;

    this.stopPolling();

    if (this.isLoggedIn) {
      this.fetchChatData();
    }
    
    // Set up new polling interval (every 5 seconds)
    this.pollingInterval = setInterval(async () => {
      if (this.isLoggedIn && !this.isFetching) {
        await this.fetchChatData();
      } else if (!this.isLoggedIn) {
        this.stopPolling();
      }
    }, 5000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.dataUpdateCallback = null;
      this.isFetching = false;
    }
  }

  handleError(userMessage, error) {
    this.errorMessage = userMessage;
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      this.errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    console.error('Error:', error);
  }
} 