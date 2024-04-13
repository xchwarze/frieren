import Nav from 'react-bootstrap/Nav';
import NavItem from 'react-bootstrap/NavItem';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Link, useLocation } from 'wouter';
import { useAtom } from 'jotai'

import useModulesList from '@src/hooks/useModulesList';
import Icon from '@src/components/Icon';
import ModuleIcon from '@src/components/ModuleIcon';
import sidebarStatusAtom from '@src/atoms/sidebarStatusAtom';

/**
 * Renders the webapp sidebar component.
 *
 * @return {ReactElement} The sidebar component.
 */
const Sidebar = () => {
    const [sidebarStatus, setSidebarStatus] = useAtom(sidebarStatusAtom)
    const [location] = useLocation();
    const { data } = useModulesList();
    const modules = data?.sidebar ?? [];

    return (
        <Nav id={'sidebar'} className={`flex-column sidebar bg-dark py-2 ${sidebarStatus ? 'active' : ''}`}>
            {modules.map(({ name, title, icon }, index) => {
                const href = `/${name}`;

                return (
                    <OverlayTrigger
                        key={index}
                        delay={555}
                        show={sidebarStatus ? undefined : false}
                        placement={'right'}
                        overlay={
                            <Tooltip>{title}</Tooltip>
                        }
                    >
                        <NavItem>
                            <Link to={href} className={`nav-link ${href.includes(location) ? 'active' : ''}`}>
                                <ModuleIcon name={icon} module={name} />
                                <span>{title}</span>
                            </Link>
                        </NavItem>
                    </OverlayTrigger>
                );
            })}

            <NavItem className={'btn-toggle-sidebar'}>
                <Nav.Link onClick={() => setSidebarStatus(!sidebarStatus)}>
                    <Icon name={`${sidebarStatus ? 'chevron-right' : 'chevron-left'}`}/>
                    <span>Close</span>
                </Nav.Link>
            </NavItem>
        </Nav>
    );
};

export default Sidebar;
