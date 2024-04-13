import { atom, useAtom } from 'jotai';

const atomCache = {};

/**
 * Creates a tab atom if it doesn't already exist in the cache.
 *
 * @param {any} id - The identifier of the tab atom.
 * @param {any} defaultValue - The default value for the tab atom.
 * @return {any} The tab atom corresponding to the provided id.
 */
export const createTabAtom = (id, defaultValue) => {
    if (!atomCache[id]) {
        atomCache[id] = atom(defaultValue);
    }

    return atomCache[id];
};

/**
 * Creates a custom hook that manages the active tab state for a given ID and default value.
 *
 * @param {String} id - The ID of the tab.
 * @param {String} defaultValue - The default value for the active tab.
 * @return {Object} An object containing the activeTab state and setActiveTab function.
 */
const useActiveTab = (id, defaultValue) => {
    const activeTabAtom = createTabAtom(id, defaultValue);
    const [activeTab, setActiveTab] = useAtom(activeTabAtom);

    return { activeTab, setActiveTab };
};

export default useActiveTab;
