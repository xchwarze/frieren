/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Modal, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

import MascotImage from '@src/assets/mascot.webp';

const appVersion = import.meta.env.VITE_APP_VERSION || 'dev';
const buildId = import.meta.env.VITE_BUILD_ID || 'dev';

/**
 * Modal displaying application info, version, and credits.
 *
 * @param {Boolean} show - Whether the modal is visible.
 * @param {Function} onHide - Callback to close the modal.
 * @returns {ReactElement} The about modal component.
 */
const AboutModal = ({ show, onHide }) => (
    <Modal show={show} onHide={onHide} centered size={'lg'}>
        <Modal.Header closeButton>
            <Modal.Title>About Frieren</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>
                Frieren is a micro-framework designed for use in routers and Single Board Computers (SBCs).
                Built to be lightweight, efficient, and easily integrable into various projects,
                it now includes a comprehensive management panel crafted with an optimized React stack,
                enhancing its performance and modularity.
            </p>
            <div className={'text-center my-4'}>
                <img src={MascotImage} alt={'Mascot'} className={'about-image'} />
            </div>
            <ListGroup variant={'flush'}>
                <ListGroup.Item><strong>Version:</strong> {appVersion}</ListGroup.Item>
                <ListGroup.Item><strong>Build ID:</strong> {buildId}</ListGroup.Item>
            </ListGroup>
        </Modal.Body>
        <Modal.Footer className={'justify-content-center'}>
            <small className={'text-muted'}>
                For more information and contributions, visit our
                &nbsp;<a href={'https://github.com/xchwarze/frieren'} target={'_blank'} rel={'noopener noreferrer'}>GitHub</a>.
                The artist who created the image is <a href={'https://twitter.com/yohira_works'} target={'_blank'} rel={'noopener noreferrer'}>@yohira_works</a>.
            </small>
        </Modal.Footer>
    </Modal>
);

AboutModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default AboutModal;
