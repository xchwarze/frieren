/** TODO this dont work yet */
import TabPane from 'react-bootstrap/TabPane';
import PropTypes from 'prop-types';

import ConditionalTabContent from '@src/components/Tabs/ConditionalTabContent';
import TabTitle from '@src/components/Tabs/TabTitle';

/**
 * Renders the content of a tab with the active tab state controlled by the useActiveTab hook.
 *
 * @param {String} id - The ID of the tab.
 * @param {String} eventKey - The event key of the tab.
 * @param {String} title - The title of the tab.
 * @param {String} icon - The icon of the tab.
 * @param {ReactNode} children - The content of the tab.
 * @return {ReactElement} The rendered tab content.
 */
const TabContent = ({ id, eventKey, title, icon, children }) => (
    <TabPane eventKey={eventKey} title={<TabTitle title={title} icon={icon} />}>
        <ConditionalTabContent id={id} eventKey={eventKey}>
            {children}
        </ConditionalTabContent>
    </TabPane>
);

TabContent.propTypes = {
    id: PropTypes.string.isRequired,
    eventKey: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
}

export default TabContent;
