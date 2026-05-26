/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import PropTypes from 'prop-types';
import * as jsxRuntime from 'react/jsx-runtime';
import * as ReactQuery from '@tanstack/react-query';
import * as Jotai from 'jotai';
import * as JotaiUtils from 'jotai/utils';
import * as ReactHookForm from 'react-hook-form';
import * as HookformResolvers from '@hookform/resolvers';
import * as HookformResolversYup from '@hookform/resolvers/yup';
import * as ReactBootstrap from 'react-bootstrap';
import * as ReactContentLoader from 'react-content-loader';
import * as ReactToastify from 'react-toastify';
import * as Wouter from 'wouter';
import * as Yup from 'yup';

/**
 * Sets up UMD support by assigning global variables for various libraries.
 */
const setupUMDSupport = () => {
    window.Frieren = {
        React,
        ReactDOM,
        PropTypes,
        jsxRuntime,
        ReactQuery,
        Jotai,
        JotaiUtils,
        ReactHookForm,
        HookformResolvers,
        HookformResolversYup,
        ReactBootstrap,
        ReactContentLoader,
        ReactToastify,
        Wouter,
        Yup,
    };
};

export default setupUMDSupport;
