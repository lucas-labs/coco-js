import c from 'chalk';
import { Box, Text } from 'ink';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import React, { FC } from 'react';
import { i18n } from '../../common/i18n/i18n';
import { rightPad } from '../../common/utils/pad';

export const Help: FC = () => {
    const [cols] = useStdoutDimensions();

    const help = new Map<string, Map<string, string[]>>([
        [
            i18n`Help`,
            new Map<string, string[]>([
                [i18n`Close this help`, [`esc`]],
                [i18n`Toggle this help`, [`F2`]],
            ]),
        ],
        [
            i18n`General`,
            new Map<string, string[]>([
                [i18n`Exit`, [`ctrl+c`]],
                [i18n`Go to the next step`, [`tab`, `ctrl+🠆`]],
                [i18n`Go back to the previous step`, [`ctrl+🠄`]],
            ]),
        ],
        [
            i18n`Inputs`,
            new Map<string, string[]>([
                [i18n`Submit/select current input/option`, [`enter`]],
                [
                    i18n`New line / carriage return`,
                    [
                        `shift+enter`,
                        `alt+enter`,
                        `ctrl+enter ${c.dim(`(${i18n`depends on the console`})`)}`,
                    ],
                ],
            ]),
        ],
        [
            i18n`Switches`,
            new Map<string, string[]>([
                [i18n`Toggle switch option`, [`space`]],
                [i18n`Submit/select current input/option`, [`enter`]],
                [i18n`Set switch to true`, [`Y`]],
                [i18n`Set switch to false`, [`N`]],
            ]),
        ],
    ]);

    const pad = (str: string | string[]) => {
        if (Array.isArray(str)) {
            str = str.join(', ');
        }

        return (
            str +
            ' ' +
            c.dim(rightPad('', Math.max(0, Math.floor(cols / 2 - str.length - 3)), '.'))
        );
    };

    return (
        <Box flexDirection="column" height={'100%'} justifyContent="center">
            {Array.from(help.entries()).map(([title, map]) => (
                <Box key={title} flexDirection="column" marginBottom={1}>
                    <Text>{c.blue.bold(title)}</Text>

                    {Array.from(map.entries()).map(([key, values]) => (
                        <Box key={key} flexDirection="row">
                            <Box width={'50%'}>
                                <Text>{pad(key)}</Text>
                            </Box>

                            <Box width={'50%'}>
                                <Text>
                                    {c.dim`: ` +
                                        c.white(
                                            `${values.join(` ${c.dim(i18n('or'))} `)}`
                                        )}
                                </Text>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
};
