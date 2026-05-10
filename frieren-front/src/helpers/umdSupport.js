/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
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
import * as ReactToastify from 'react-toastify';
import * as ReactBootstrap from 'react-bootstrap';
import * as Wouter from 'wouter';
import * as Yup from 'yup';

/**
 * Sets up UMD support by assigning global variables for various libraries.
 */
const setupUMDSupport = () => {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.PropTypes = PropTypes;
    window.jsxRuntime = jsxRuntime;
    window.ReactQuery = ReactQuery;
    window.Jotai = Jotai;
    window.JotaiUtils = JotaiUtils;
    window.ReactHookForm = ReactHookForm;
    window.HookformResolvers = HookformResolvers;
    window.HookformResolversYup = HookformResolversYup;
    window.ReactBootstrap = ReactBootstrap;
    window.ReactToastify = ReactToastify;
    window.Wouter = Wouter;
    window.Yup = Yup;
};

export default setupUMDSupport;
