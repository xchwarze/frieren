/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
// why-did-you-render loader
import './helpers/wdyrSetup.js';

import React from 'react'
import ReactDOM from 'react-dom/client'

import setupUMDSupport from './helpers/umdSupport.js';
import App from './App.jsx'

// for UMD module support
setupUMDSupport();

// React setup
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
