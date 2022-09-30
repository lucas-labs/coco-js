import c, { Modifiers } from 'chalk';
import { Box, Text } from 'ink';
import React, { FC, useEffect, useState } from 'react';

export interface LogoProps {
    animate?: boolean;
    display?: boolean;
    frameRate?: number;
}

export const Logo: FC<LogoProps> = ({
    animate = false,
    display = true,
    frameRate = 300,
}) => {
    const [mod1, setMod1] = useState<typeof Modifiers>('reset');
    const [mod2, setMod2] = useState<typeof Modifiers>('reset');

    const bigTitle = [
        `${c[mod1].blue`╔══ ╔═╗`} ${c[mod2].magenta`╔══ ╔═╗`}`,
        `${c[mod1].blue`╚══ ╚═╝`} ${c[mod2].magenta`╚══ ╚═╝`}`,
    ];

    useEffect(() => {
        if (animate) {
            setMod1('dim');
            setMod2('reset');
        }
    }, [animate]);

    useEffect(() => {
        if (animate && display) {
            const interval = setInterval(() => {
                setMod1(mod1 === 'reset' ? 'dim' : 'reset');
                setMod2(mod2 === 'reset' ? 'dim' : 'reset');
            }, frameRate);

            return () => clearInterval(interval);
        }
    }, [mod1, mod2, display, frameRate]);

    return (
        <Box display={display ? 'flex' : 'none'} flexDirection="column">
            {bigTitle.map((line, index) => (
                <Text key={index}>{line}</Text>
            ))}
        </Box>
    );
};
