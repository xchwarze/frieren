import Tabs from 'react-bootstrap/Tabs';
import PropTypes from 'prop-types';

import useActiveTab from '@src/hooks/useActiveTab.js';

/**
 * Generates panel tabs with the active tab controlled by the useActiveTab hook.
 *
 * @param {String} id - The unique identifier for the panel tabs.
 * @param {String} defaultTab - The default tab to be active.
 * @param {ReactNode} children - The tabs to be rendered within the panel.
 * @return {ReactNode} The panel tabs component.
 */
const PanelTabs = ({ id, defaultTab, children }) => {
    const { activeTab, setActiveTab } = useActiveTab(id, defaultTab);

    return (
        <div>
            <Tabs activeKey={activeTab} onSelect={setActiveTab} fill={true}>
                {children}
            </Tabs>
        </div>
    );
};

PanelTabs.propTypes = {
    id: PropTypes.string.isRequired,
    defaultTab: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
}

export default PanelTabs;
