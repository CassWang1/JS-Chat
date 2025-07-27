"use strict";

import { ChatModel } from './model.js';
import { ChatView } from './view.js';
import { ChatController } from './controller.js';

const app = () => {
  const model = new ChatModel();
  const view = new ChatView();
  const controller = new ChatController(model, view);

  controller.init();
};

document.addEventListener('DOMContentLoaded', app); 