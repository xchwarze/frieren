import * as React from 'react';

// from https://github.com/welldone-software/why-did-you-render/issues/243
if (import.meta.env.DEV) {
    const { default: wdyr } = await import('@welldone-software/why-did-you-render');

    wdyr(React, {
        trackHooks: true,
        trackAllPureComponents: true,
    });
}
