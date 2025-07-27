"use strict";

export class ChatView {
  constructor() {
    // Main containers
    this.loadingContainer = document.getElementById('loading-container');
    this.loginView = document.getElementById('login-view');
    this.chatView = document.getElementById('chat-view');
    
    // Login elements
    this.loginForm = document.getElementById('login-form');
    this.usernameInput = document.getElementById('username-input');
    this.loginError = document.getElementById('login-error');
    
    // Chat tabs
    this.publicTab = document.getElementById('public-tab');
    this.dmTab = document.getElementById('dm-tab');
    this.publicChatPanel = document.getElementById('public-chat-panel');
    this.dmChatPanel = document.getElementById('dm-chat-panel');
    
    // Public chat elements
    this.usersLoading = document.getElementById('users-loading');
    this.usersList = document.getElementById('users-list');
    this.messagesLoading = document.getElementById('messages-loading');
    this.messagesList = document.getElementById('messages-list');
    this.messageForm = document.getElementById('message-form');
    this.messageInput = document.getElementById('message-input');
    this.messageError = document.getElementById('message-error');
    
    // DM elements
    this.dmMessagesLoading = document.getElementById('dm-messages-loading');
    this.dmMessagesList = document.getElementById('dm-messages-list');
    this.dmRecipientSelect = document.getElementById('dm-recipient');
    this.dmForm = document.getElementById('dm-form');
    this.dmInput = document.getElementById('dm-input');
    this.dmError = document.getElementById('dm-error');
    
    // Header elements
    this.userProfile = document.getElementById('user-profile');
    this.avatarInitial = document.getElementById('avatar-initial');
    this.headerUsername = document.getElementById('header-username');
    this.headerLogoutButton = document.getElementById('header-logout-button');
    
    // Global tooltips
    this.globalTooltips = document.getElementById('global-tooltips');
    
    // User state
    this.currentUser = null;
    
    // User color mapping
    this.userColors = new Map();
    this.colorClasses = [
      'user-color-1', 'user-color-2', 'user-color-3', 'user-color-4',
      'user-color-5', 'user-color-6', 'user-color-7', 'user-color-8'
    ];

    this.initTooltips();
  }

  initTooltips() {
    document.addEventListener('mouseover', this.handleTooltipHover.bind(this));
    document.addEventListener('mouseout', this.handleTooltipHover.bind(this));
  }
  
  handleTooltipHover(event) {
    const tooltipElement = event.target.closest('.tooltip');
    if (!tooltipElement) return;
    
    const tooltipContent = tooltipElement.getAttribute('data-tooltip');
    if (!tooltipContent) return;
    
    if (event.type === 'mouseover') {
      this.showTooltip(tooltipElement, tooltipContent);
    } else if (event.type === 'mouseout') {
      this.hideTooltip();
    }
  }
  
  showTooltip(element, content) {
    this.globalTooltips.innerHTML = '';
    
    const tooltip = document.createElement('div');
    tooltip.className = 'global-tooltip-text';
    tooltip.textContent = content;

    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
    tooltip.style.top = `${rect.top - 10}px`;
    
    this.globalTooltips.appendChild(tooltip);

    setTimeout(() => {
      tooltip.classList.add('visible');
    }, 10);
  }

  hideTooltip() {
    const tooltips = this.globalTooltips.querySelectorAll('.global-tooltip-text');
    tooltips.forEach(tooltip => {
      tooltip.classList.remove('visible');
      setTimeout(() => {
        if (tooltip.parentNode === this.globalTooltips) {
          this.globalTooltips.removeChild(tooltip);
        }
      }, 300);
    });
  }

  getUserColorClass(username) {
    if (!this.userColors.has(username)) {
      const colorIndex = this.userColors.size % this.colorClasses.length;
      this.userColors.set(username, this.colorClasses[colorIndex]);
    }
    return this.userColors.get(username);
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  showLoading() {
    this.hideAllViews();
    this.loadingContainer.classList.remove('hidden');
  }

  showLoginView() {
    this.hideAllViews();
    this.loginView.classList.remove('hidden');
    this.usernameInput.focus();
    this.userProfile.classList.add('hidden');
  }

  showChatView() {
    this.hideAllViews();
    this.chatView.classList.remove('hidden');
    this.messageInput.focus();
  }

  hideAllViews() {
    this.loadingContainer.classList.add('hidden');
    this.loginView.classList.add('hidden');
    this.chatView.classList.add('hidden');
  }

  switchToPublicChat() {
    this.publicTab.classList.add('active');
    this.dmTab.classList.remove('active');
    this.publicChatPanel.classList.remove('hidden');
    this.dmChatPanel.classList.add('hidden');
    this.messageInput.focus();
  }

  switchToDMChat() {
    this.dmTab.classList.add('active');
    this.publicTab.classList.remove('active');
    this.dmChatPanel.classList.remove('hidden');
    this.publicChatPanel.classList.add('hidden');
    this.dmInput.focus();
  }

  showUsersLoading() {
    this.usersLoading.classList.remove('hidden');
    this.usersList.classList.add('hidden');
  }

  hideUsersLoading() {
    this.usersLoading.classList.add('hidden');
    this.usersList.classList.remove('hidden');
  }

  showMessagesLoading() {
    this.messagesLoading.classList.remove('hidden');
    this.messagesList.classList.add('hidden');
  }

  hideMessagesLoading() {
    this.messagesLoading.classList.add('hidden');
    this.messagesList.classList.remove('hidden');
  }

  showDMMessagesLoading() {
    this.dmMessagesLoading.classList.remove('hidden');
    this.dmMessagesList.classList.add('hidden');
  }

  hideDMMessagesLoading() {
    this.dmMessagesLoading.classList.add('hidden');
    this.dmMessagesList.classList.remove('hidden');
  }

  showLoginError(message) {
    this.loginError.textContent = message;
    this.loginError.classList.remove('hidden');

    setTimeout(() => {
      this.hideLoginError();
    }, 8000);
  }

  hideLoginError() {
    this.loginError.classList.add('hidden');
    this.loginError.textContent = '';
  }

  // Display error message in chat form
  showMessageError(message) {
    this.messageError.textContent = message;
    this.messageError.classList.remove('hidden');
    
    setTimeout(() => {
      this.hideMessageError();
    }, 5000);
  }

  hideMessageError() {
    this.messageError.classList.add('hidden');
    this.messageError.textContent = '';
  }

  showDMError(message) {
    this.dmError.textContent = message;
    this.dmError.classList.remove('hidden');
    
    setTimeout(() => {
      this.hideDMError();
    }, 5000);
  }

  hideDMError() {
    this.dmError.classList.add('hidden');
    this.dmError.textContent = '';
  }

  renderMessages(messages, currentUser = this.currentUser) {
    const scrollPos = this.messagesList.scrollTop;
    const scrolledToBottom = this.messagesList.scrollHeight - this.messagesList.clientHeight <= this.messagesList.scrollTop + 50;

    const isUserChange = currentUser && this.currentUser !== currentUser;
    if (isUserChange) {
      this.messagesList.innerHTML = '';
    }

    if (currentUser) {
      this.currentUser = currentUser;
    }

    const existingEmpty = this.messagesList.querySelector('.empty-message');
    if (existingEmpty) {
      this.messagesList.removeChild(existingEmpty);
    }

    if (!messages || messages.length === 0) {
      if (!this.messagesList.children.length) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No messages yet. Be the first to say hello!';
        emptyMessage.className = 'empty-message';
        this.messagesList.appendChild(emptyMessage);
      }
      return;
    }

    const currentMessages = Array.from(this.messagesList.children);
    const existingIds = new Set(
      Array.from(currentMessages)
        .filter(el => el.classList.contains('message-item'))
        .map(el => el.dataset.messageId)
    );
    
    let hasNewMessages = false;

    messages.forEach(message => {
      if (existingIds.has(String(message.id))) return;
      
      hasNewMessages = true;
      
      const messageItem = document.createElement('div');
      const isSelf = this.currentUser && message.username === this.currentUser;
      messageItem.className = `message-item ${this.getUserColorClass(message.username)} ${isSelf ? 'self' : ''}`;
      messageItem.dataset.messageId = message.id;
      
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = message.username.charAt(0).toUpperCase();
      avatar.style.backgroundColor = `var(--${this.getUserColorClass(message.username)})`;
  
      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      
      const messageHeader = document.createElement('div');
      messageHeader.className = 'message-header';
      
      const usernameSpan = document.createElement('span');
      usernameSpan.className = 'message-username';
      usernameSpan.textContent = message.username;
      
      const timeSpan = document.createElement('span');
      timeSpan.className = 'message-time';
      timeSpan.textContent = this.formatDate(message.timestamp);
      
      const messageBubble = document.createElement('div');
      messageBubble.className = 'message-bubble';
      
      const messageText = document.createElement('p');
      messageText.className = 'message-text';
      messageText.textContent = message.text;
      
      messageHeader.appendChild(usernameSpan);
      messageHeader.appendChild(timeSpan);
      
      messageBubble.appendChild(messageText);
      messageContent.appendChild(messageHeader);
      messageContent.appendChild(messageBubble);
      
      messageItem.appendChild(avatar);
      messageItem.appendChild(messageContent);
      
      this.messagesList.appendChild(messageItem);
    });
    
    // Auto-scroll logic:
    // 1. If user was already near bottom, scroll to bottom
    // 2. If new messages arrived and we sent them, scroll to bottom
    // 3. Otherwise maintain current scroll position
    if (scrolledToBottom || (hasNewMessages && messages[messages.length - 1]?.username === this.currentUser)) {
      requestAnimationFrame(() => {
        this.messagesList.scrollTop = this.messagesList.scrollHeight;
      });
    } else if (!hasNewMessages) {
      this.messagesList.scrollTop = scrollPos;
    }
  }

  renderDMMessages(messages, currentUser, selectedRecipient) {
    const scrollPos = this.dmMessagesList.scrollTop;
    const scrolledToBottom = this.dmMessagesList.scrollHeight - this.dmMessagesList.clientHeight <= this.dmMessagesList.scrollTop + 5;
    
    this.dmMessagesList.innerHTML = '';
    
    if (messages.length === 0) {
      let emptyMessage;
      
      if (selectedRecipient === currentUser) {
        emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        
        const noteTitle = document.createElement('p');
        noteTitle.textContent = 'Personal Notes';
        noteTitle.style.fontWeight = 'bold';
        noteTitle.style.marginBottom = '0.5rem';
        
        const noteDesc = document.createElement('p');
        noteDesc.textContent = 'This is your private space. Messages sent here are only visible to you.';
        
        emptyMessage.appendChild(noteTitle);
        emptyMessage.appendChild(noteDesc);
      } else if (!selectedRecipient) {
        emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Select a recipient to start a conversation.';
        emptyMessage.className = 'empty-message';
      } else {
        emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No messages yet. Start a conversation!';
        emptyMessage.className = 'empty-message';
      }
      
      this.dmMessagesList.appendChild(emptyMessage);
      return;
    }

    messages.forEach(message => {
      const messageItem = document.createElement('div');
      const isSelf = message.username === currentUser;
      
      if (message.username === currentUser && message.recipient === currentUser) {
        messageItem.className = `message-item note-message ${this.getUserColorClass(message.username)} ${isSelf ? 'self' : ''}`;
      } else {
        messageItem.className = `message-item dm-message ${this.getUserColorClass(message.username)} ${isSelf ? 'self' : ''}`;
      }
      
      messageItem.dataset.messageId = message.id;

      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = message.username.charAt(0).toUpperCase();
      avatar.style.backgroundColor = `var(--${this.getUserColorClass(message.username)})`;

      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      
      const messageHeader = document.createElement('div');
      messageHeader.className = 'message-header';
      
      const usernameSpan = document.createElement('span');
      usernameSpan.className = 'message-username dm-username';
      usernameSpan.textContent = message.username;
      
      const timeSpan = document.createElement('span');
      timeSpan.className = 'message-time';
      timeSpan.textContent = this.formatDate(message.timestamp);
      
      const messageBubble = document.createElement('div');
      messageBubble.className = 'message-bubble';
      
      const messageText = document.createElement('p');
      messageText.className = 'message-text';
      messageText.textContent = message.text;
      
      messageHeader.appendChild(usernameSpan);
      
      // Add badge for DMs (except for notes to self)
      if (!(message.username === currentUser && message.recipient === currentUser)) {
        const dmBadge = document.createElement('span');
        dmBadge.className = 'dm-badge';
        dmBadge.textContent = message.username === currentUser ? 
          `To: ${message.recipient}` : 
          'From';
          
        usernameSpan.appendChild(dmBadge);
      } else {
        // Add note indicator for self-messages
        const noteBadge = document.createElement('span');
        noteBadge.className = 'dm-badge';
        noteBadge.style.backgroundColor = '#fbc02d';
        noteBadge.textContent = 'Note';
        
        usernameSpan.appendChild(noteBadge);
      }
      
      messageHeader.appendChild(timeSpan);
      
      messageBubble.appendChild(messageText);
      messageContent.appendChild(messageHeader);
      messageContent.appendChild(messageBubble);
      
      messageItem.appendChild(avatar);
      messageItem.appendChild(messageContent);
      
      this.dmMessagesList.appendChild(messageItem);
    });
    
    // Maintain scroll position or scroll to bottom if we were at the bottom before
    if (scrolledToBottom) {
      this.dmMessagesList.scrollTop = this.dmMessagesList.scrollHeight;
    } else {
      this.dmMessagesList.scrollTop = scrollPos;
    }
  }

  updateDMRecipients(users, currentUser, selectedRecipient) {
    while (this.dmRecipientSelect.options.length > 1) {
      this.dmRecipientSelect.remove(1);
    }
    
    // First add the current user (for notes)
    const selfOption = document.createElement('option');
    selfOption.value = currentUser;
    selfOption.textContent = `${currentUser} (Personal Notes)`;
    this.dmRecipientSelect.appendChild(selfOption);
    
    // Then add other online users
    users
      .filter(username => username !== currentUser)
      .forEach(username => {
        const option = document.createElement('option');
        option.value = username;
        option.textContent = username;
        this.dmRecipientSelect.appendChild(option);
      });
    
    if (selectedRecipient) {
      this.dmRecipientSelect.value = selectedRecipient;
    } else {
      this.dmRecipientSelect.selectedIndex = 0;
    }
    
    this.updateDMPlaceholder(selectedRecipient === currentUser);
  }
  
  updateDMPlaceholder(isNote) {
    if (isNote) {
      this.dmInput.placeholder = "Write a personal note to yourself...";
      this.dmForm.querySelector('.btn-send').textContent = "Save Note";
    } else {
      this.dmInput.placeholder = "Type your direct message here...";
      this.dmForm.querySelector('.btn-send').textContent = "Send";
    }
  }

  renderUsers(users, currentUser, onUserClick) {
    this.usersList.innerHTML = '';
    
    if (users.length === 0) {
      const emptyUsers = document.createElement('li');
      emptyUsers.textContent = 'No users online';
      emptyUsers.className = 'empty-users';
      this.usersList.appendChild(emptyUsers);
      return;
    }
    
    users.forEach(username => {
      const userItem = document.createElement('li');
      userItem.className = `user-item ${this.getUserColorClass(username)}`;
      userItem.textContent = username;
      
      if (username === currentUser) {
        userItem.classList.add('current-user');
        userItem.textContent += ' (you)';
      }
      
      userItem.addEventListener('click', () => {
        onUserClick(username);
      });
      
      this.usersList.appendChild(userItem);
    });
  }

  clearInputs() {
    this.usernameInput.value = '';
    this.messageInput.value = '';
    this.dmInput.value = '';
  }
  
  clearMessageInput() {
    this.messageInput.value = '';
  }

  clearDMInput() {
    this.dmInput.value = '';
  }

  bindLoginSubmit(handler) {
    this.loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const username = this.usernameInput.value.trim();
      handler(username);
    });
  }

  bindMessageSubmit(handler) {
    this.messageForm.addEventListener('submit', event => {
      event.preventDefault();
      const message = this.messageInput.value.trim();
      handler(message);
    });
  }

  bindDMSubmit(handler) {
    this.dmForm.addEventListener('submit', event => {
      event.preventDefault();
      const message = this.dmInput.value.trim();
      const recipient = this.dmRecipientSelect.value;
      handler(message, recipient);
    });
  }

  bindDMRecipientChange(handler) {
    this.dmRecipientSelect.addEventListener('change', event => {
      const recipient = event.target.value;
      this.updateDMPlaceholder(recipient === this.dmRecipientSelect.options[1]?.value);
      handler(recipient);
    });
  }

  bindTabSwitch(publicHandler, dmHandler) {
    this.publicTab.addEventListener('click', () => {
      publicHandler();
    });
    
    this.dmTab.addEventListener('click', () => {
      dmHandler();
    });
  }

  bindLogout(handler) {
    this.headerLogoutButton.addEventListener('click', () => {
      handler();
    });
  }

  updateUserProfile(username) {
    this.currentUser = username;
    if (username) {
      this.userProfile.classList.remove('hidden');
      this.headerUsername.textContent = username;
      this.avatarInitial.textContent = username.charAt(0).toUpperCase();
    } else {
      this.userProfile.classList.add('hidden');
    }
  }
} 