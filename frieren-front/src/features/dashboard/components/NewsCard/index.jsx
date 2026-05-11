/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Alert, Table } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import Button from '@src/components/Button';
import useNews from '@src/features/dashboard/hooks/useNews.js';

/**
 * Displays news and latest version info fetched from a remote JSON endpoint, loaded on demand.
 *
 * @return {ReactElement} The NewsCard component.
 */
const NewsCard = () => {
    const query = useNews({ enabled: false });
    const { data, isSuccess, isFetching, refetch } = query;

    return (
        <PanelCard
            title={'News'}
            subtitle={'Latest updates from the Frieren project.'}
            query={query}
            isFetching={false}
        >
            <>
                {!isSuccess && (
                    <div className={'text-center'}>
                        <Button
                            label={'Get News'}
                            icon={'rss'}
                            onClick={refetch}
                            loading={isFetching}
                        />
                    </div>
                )}

                {isSuccess && !isFetching && (
                    <>
                        {data.lastVersion && (
                            <Alert variant={'info'} className={'mb-3'}>
                                <strong>Latest version: {data.lastVersion.version}</strong>
                                {data.lastVersion.comment && (
                                    <span> — {data.lastVersion.comment}</span>
                                )}
                            </Alert>
                        )}

                        {data.news?.length > 0 && (
                            <Table striped hover responsive>
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.news.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.date}</td>
                                        <td>{item.title}</td>
                                        <td>{item.description}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )}
            </>
        </PanelCard>
    );
};

export default NewsCard;
