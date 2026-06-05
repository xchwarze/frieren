/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtomValue } from 'jotai';
import { useLocationProperty, navigate } from 'wouter/use-browser-location';

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
    return [location, hashNavigate];
};

/**
 * Tells wouter how to render the `href` of <Link> anchors. Without this, wouter
 * falls back to the identity transform and renders bare paths (e.g. "/wireless"),
 * so "open in new tab" loads a hashless URL the SPA can't route. Prepending '#'
 * keeps generated hrefs hash-based (e.g. "#/wireless").
 */
useHashLocation.hrefs = (href) => "#" + href;

export default useHashLocation;
