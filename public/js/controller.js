"use strict";

export class ChatController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    
    this.view.bindLoginSubmit(this.handleLogin.bind(this));
    this.view.bindMessageSubmit(this.handleSendMessage.bind(this));
    this.view.bindDMSubmit(this.handleSendDM.bind(this));
    this.view.bindDMRecipientChange(this.handleRecipientChange.bind(this));
    this.view.bindTabSwitch(
      this.handleSwitchToPublic.bind(this),
      this.handleSwitchToDM.bind(this)
    );
    this.view.bindLogout(this.handleLogout.bind(this));
  }


  async init() {
    this.view.showLoading();

    const isLoggedIn = await this.model.checkSession();
    
    if (isLoggedIn) {
      this.renderChatData();
      this.view.showChatView();
      this.view.updateUserProfile(this.model.username);
      this.model.startPolling(this.handleDataUpdate.bind(this));
    } else {
      this.view.showLoginView();
    }
  }


  handleDataUpdate() {
    // Update both user list and messages regardless of active tab
    this.renderUsers();
    
    if (this.model.activeTab === 'public') {
      this.renderMessages();
    } else {
      this.renderDMMessages();
    }
  }


  async handleLogin(username) {
    this.view.hideLoginError();
    
    if (!username) {
      this.view.showLoginError('Username cannot be empty');
      return;
    }
    
    try {
      this.view.showLoading();
      
      const success = await this.model.login(username);
      
      if (success) {
        // Set self as the initial recipient for personal notes
        this.model.setSelectedRecipient(this.model.username);
        
        this.view.updateUserProfile(this.model.username);
        
        this.view.showChatView();
        this.view.showMessagesLoading();
        
        // Reload page to ensure proper message alignment
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        this.view.showLoginView();
        this.view.showLoginError(this.model.errorMessage);
      }
    } catch (error) {

      this.view.showLoginView();
      this.view.showLoginError('An unexpected error occurred');
    }
  }


  async handleSendMessage(text) {
    this.view.hideMessageError();
    
    if (!text) {
      this.view.showMessageError('Message cannot be empty');
      return;
    }
    
    try {
      const success = await this.model.sendMessage(text);
      
      if (success) {
        this.view.clearMessageInput();
        this.renderMessages();
      } else if (this.model.isLoggedIn) {
        this.view.showMessageError(this.model.errorMessage);
      } else {
        this.view.showLoginView();
        this.view.showLoginError('Your session has expired. Please login again.');
      }
    } catch (error) {
      this.view.showMessageError('An unexpected error occurred');
    }
  }

  
  async handleSendDM(text, recipient) {
    this.view.hideDMError();
    
    if (!text) {
      this.view.showDMError('Message cannot be empty');
      return;
    }
    
    if (!recipient) {
      this.view.showDMError('Please select a recipient');
      return;
    }
    
    try {
      const success = await this.model.sendDirectMessage(text, recipient);
      
      if (success) {
        this.view.clearDMInput();
        this.renderDMMessages();
      } else if (this.model.isLoggedIn) {
        this.view.showDMError(this.model.errorMessage);
      } else {
        this.view.showLoginView();
        this.view.showLoginError('Your session has expired. Please login again.');
      }
    } catch (error) {
      this.view.showDMError('An unexpected error occurred');
    }
  }

  handleRecipientChange(recipient) {
    // Reset messages display when switching between recipients
    this.model.setSelectedRecipient(recipient);
    this.renderDMMessages();
  }

  handleSwitchToPublic() {
    this.model.setActiveTab('public');
    this.view.switchToPublicChat();
    this.renderMessages();
  }


  handleSwitchToDM() {
    this.model.setActiveTab('dm');
    this.view.switchToDMChat();
    
    if (!this.model.selectedRecipient && this.model.username) {
      this.model.setSelectedRecipient(this.model.username);
    }
    
    this.view.updateDMRecipients(this.model.users, this.model.username, this.model.selectedRecipient);
    this.renderDMMessages();
  }

  handleUserClick(username) {
    this.model.setSelectedRecipient(username);
    this.handleSwitchToDM();
  }

  async handleLogout() {
    try {
      this.view.showLoading();

      const success = await this.model.logout();
      
      if (success) {
        this.model.stopPolling();
        this.username = null;
        this.selectedRecipient = null;
        this.view.clearInputs();
        this.view.updateUserProfile(null);
        this.view.showLoginView();
      } else {
        this.view.showChatView();
        this.view.showMessageError(this.model.errorMessage);
      }
    } catch (error) {
      this.view.showChatView();
      this.view.showMessageError('Logout failed. Please try again.');
    }
  }

  renderChatData() {
    this.renderMessages();
    this.renderUsers();
    this.view.updateDMRecipients(this.model.users, this.model.username, this.model.selectedRecipient);
    this.renderDMMessages(false);
  }

  
  renderMessages(showLoading = true) {
    if (showLoading) {
      this.view.showMessagesLoading();
    }
    
    this.view.renderMessages(this.model.messages, this.model.username);
    
    this.view.hideMessagesLoading();
  }

  renderDMMessages(showLoading = true) {
    if (showLoading) {
      this.view.showDMMessagesLoading();
    }
    
    const filteredMessages = this.model.getDirectMessagesForRecipient(this.model.selectedRecipient);
    
    this.view.renderDMMessages(filteredMessages, this.model.username, this.model.selectedRecipient);
    
    this.view.hideDMMessagesLoading();
  }

  renderUsers() {
    this.view.showUsersLoading();

    this.view.renderUsers(this.model.users, this.model.username, this.handleUserClick.bind(this));

    this.view.hideUsersLoading();
  }
} 