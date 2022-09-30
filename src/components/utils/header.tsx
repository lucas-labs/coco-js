import c from 'chalk';
import { Box, Text } from 'ink';
import React, { FC } from 'react';
import { Logo } from './logo';

export const Header: FC<{ type?: 'big' | 'small' }> = ({ type = 'big' }) => {
    const smallTitle = `coco > ${c.blue`conventional`} ${c.magenta`commits`}`;

    return (
        <Box
            width={'100%'}
            justifyContent="space-between"
            alignItems="center"
            marginBottom={type === 'big' ? 2 : 1}
            flexDirection={type === 'big' ? 'column' : 'row'}
        >
            <Logo display={type === 'big'} />

            <Box display={type === 'small' ? 'flex' : 'none'} flexDirection="column">
                <Text>{smallTitle}</Text>
            </Box>

            <Box>
                <Text>Press {c.bold`F2`} for help</Text>
            </Box>
        </Box>
    );
};
