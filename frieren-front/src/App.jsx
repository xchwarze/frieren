/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai'
import 'bootstrap/dist/css/bootstrap.css';

import './assets/styles.css';
import './assets/feather.css';
import { queryClient } from '@src/services/queryClient';
import RouterProvider from '@src/navigation/RouterProvider';
import ThemeVariantApplier from '@src/components/ThemeVariantApplier';
import ToastProvider from '@src/components/ToastProvider/index';

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
            <ToastProvider />
        </Provider>
    </QueryClientProvider>
);

export default App;
