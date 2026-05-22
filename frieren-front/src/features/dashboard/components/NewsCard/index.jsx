/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Table } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import useNews from '@src/features/dashboard/hooks/useNews.js';

/**
 * Displays news fetched from a remote JSON endpoint.
 *
 * @return {ReactElement} The NewsCard component.
 */
const NewsCard = () => {
    const query = useNews();
    const { data, isSuccess } = query;

    return (
        <PanelCard
            title={'News'}
            subtitle={'Latest updates from the Frieren project.'}
            query={query}
        >
            {isSuccess && data.news?.length > 0 && (
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
        </PanelCard>
    );
};

export default NewsCard;
