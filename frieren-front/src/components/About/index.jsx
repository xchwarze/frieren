import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import MascotImage from '@src/assets/mascot.webp';

const About = () => {
    const appVersion = import.meta.env.VITE_APP_VERSION || 'dev';
    const buildId = import.meta.env.VITE_BUILD_ID || 'dev';

    return (
        <Row className={'justify-content-md-center my-5'}>
            <Col md={8}>
                <Card>
                    <Card.Header as={'h5'}>About Frieren</Card.Header>
                    <Card.Body>
                        <Card.Title>The Micro-Framework for security gadgets</Card.Title>
                        <Card.Text>
                            <Col lg={9}>
                                Frieren is a micro-framework designed for use in routers and Single Board Computers (SBCs).
                                Built to be lightweight, efficient, and easily integrable into various projects,
                                it now includes a comprehensive management panel crafted with an optimized React stack,
                                enhancing its performance and modularity.
                            </Col>
                        </Card.Text>
                        <div className={'text-center my-5'}>
                            <img src={MascotImage} alt={'Mascot'} className={'about-image'} />
                        </div>
                        <ListGroup className={'list-group-flush'}>
                            <ListGroup.Item><strong>Version:</strong> {appVersion}</ListGroup.Item>
                            <ListGroup.Item><strong>Build ID:</strong> {buildId}</ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                    <Card.Footer>
                        <small className={'text-muted'}>
                            For more information and contributions, visit
                            &nbsp;<a href={'https://github.com/xchwarze/frieren'} target={'_blank'} rel={'noopener noreferrer'}>our GitHub</a>.
                            The artist who created the image is <a href={'https://twitter.com/yohira_works'} target={'_blank'} rel={'noopener noreferrer'}>@yohira_works</a>.
                        </small>
                    </Card.Footer>
                </Card>
            </Col>
        </Row>
    );
};

export default About;
