/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

/**
 * Returns a new array of modules sorted by name, ascending.
 *
 * @param {Array} modules - Modules to sort (not mutated).
 * @return {Array} A new array ordered by module name.
 */
const sortModulesByName = (modules) =>
    [...modules].sort((firstModule, secondModule) => firstModule.name.localeCompare(secondModule.name));

export default sortModulesByName;
