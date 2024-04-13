/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtomValue } from 'jotai';
import { useLocationProperty, navigate } from 'wouter/use-location';

import authAtom from '@src/atoms/authAtom.js';

/**
 * Returns the hash location of the current window URL, or '/dashboard' if there is no hash.
 *
 * @return {String} The hash location or '/dashboard'.
 */
const hashLocation = () => window.location.hash.replace(/^#/, '') || '/dashboard';

/**
 * Returns the current hash location and a function to navigate to a new hash location.
 *
 * @return {Array} An array containing the current hash location and a function to navigate to a new hash location.
 */
const useHashLocation = () => {
    const authStatus = useAtomValue(authAtom);
    const realLocation = useLocationProperty(hashLocation);

    const location = authStatus ? realLocation : '/login';
    const hashNavigate = (to) => navigate("#" + to);
    //console.log({ authStatus, location })

    return [location, hashNavigate];
};

export default useHashLocation;
