/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import PropTypes from 'prop-types';
import ReactContentLoader from 'react-content-loader';
import * as jsxRuntime from 'react/jsx-runtime';
import * as ReactQuery from '@tanstack/react-query';
import * as Jotai from 'jotai';
import * as JotaiUtils from 'jotai/utils';
import * as ReactHookForm from 'react-hook-form';
import * as HookformResolvers from '@hookform/resolvers';
import * as HookformResolversYup from '@hookform/resolvers/yup';
import * as ReactBootstrap from 'react-bootstrap';
import * as ReactToastify from 'react-toastify';
import * as Wouter from 'wouter';
import * as Yup from 'yup';
import * as TerminalCore from '@frieren/terminal-core';
import loadingImage from '@src/assets/loading.png';

/**
 * Sets up UMD support by assigning global variables for various libraries.
 */
const setupUMDSupport = () => {
    window.Frieren = {
        React,
        ReactDOM,
        PropTypes,
        ReactContentLoader,
        jsxRuntime,
        ReactQuery,
        Jotai,
        JotaiUtils,
        ReactHookForm,
        HookformResolvers,
        HookformResolversYup,
        ReactBootstrap,
        ReactToastify,
        Wouter,
        Yup,
        TerminalCore,
        loadingImage,
    };
};

export default setupUMDSupport;
