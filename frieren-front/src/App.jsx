/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai'
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';

import './assets/styles.css';
import './assets/feather.css';
import { queryClient } from '@src/services/queryClient';
import RouterProvider from '@src/navigation/RouterProvider';
import ThemeVariantApplier from '@src/components/ThemeVariantApplier';

/**
 * Renders the entire application with the necessary providers and components.
 *
 * @return {ReactElement} The rendered application
 */
const App = () => (
    <QueryClientProvider client={queryClient}>
        <Provider>
            <ThemeVariantApplier />
            <RouterProvider />
            <ToastContainer />
        </Provider>
    </QueryClientProvider>
);

export default App;
