/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import useNews from '@src/features/dashboard/hooks/useNews.js';

/**
 * Displays news fetched from a remote JSON endpoint.
 *
 * @return {ReactElement} The NewsCard component.
 */
const NewsCard = () => {
    const { data, isSuccess, isLoading, isFetching, refetch } = useNews();

    const renderContent = () => {
        if (isLoading) {
            return (
                <SkeletonTable
                    headers={['Date', 'Title', 'Description']}
                    widths={[80, 120, 200]}
                    rows={3}
                />
            );
        }

        if (isSuccess) {
            const news = data.news ?? [];

            return (
                <PanelTable>
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    {news.length === 0 && (
                        <tr>
                            <td colSpan={3}>No news found.</td>
                        </tr>
                    )}
                    {news.map((item) => (
                        <tr key={`${item.date}-${item.title}`}>
                            <td>{item.date}</td>
                            <td>{item.title}</td>
                            <td dangerouslySetInnerHTML={{ __html: item.description }} />
                        </tr>
                    ))}
                    </tbody>
                </PanelTable>
            );
        }

        return null;
    };

    return (
        <PanelCard
            title={'News'}
            subtitle={'Latest updates from the Frieren project.'}
            isFetching={isFetching}
            refetch={refetch}
        >
            {renderContent()}
        </PanelCard>
    );
};

export default NewsCard;
