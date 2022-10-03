import c from 'chalk';
import { Box, Text, useFocus } from 'ink';
import React, { FC, useEffect, useState } from 'react';
import stringWidth from 'string-width';
import { useInput } from '../../common/hooks/use-input';
import { i18n } from '../../common/i18n/i18n';
import { FocusKey } from '../../common/types/focus-keys.types';
import { createLines } from '../input/core/display-control';

export interface ConfirmProps {
    focusChanged?: (focus: boolean) => void;
    onCommitConfirmed?: () => void;
    onCanceled?: () => void;
    type?: string;
    scope?: string;
    summary?: string;
    body?: string;
    footer?: string;
    breaking?: boolean;
    gitmoji?: string;
    marginX?: number;
    marginY?: number;
    bg?: string;
    fg?: string;
}

export const ConfirmCommit: FC<ConfirmProps> = ({
    focusChanged,
    onCommitConfirmed,
    onCanceled,
    type,
    scope,
    summary,
    body,
    footer,
    gitmoji,
    breaking,
    marginX = 2,
    marginY = 1,
    bg: inputBg = '#ffffff',
    fg: inputFg = '#000000',
}) => {
    const [lines, setLines] = useState<string[]>([]);
    const [marginLines, setMarginLines] = useState<string[]>([]);
    const [confirm, setConfirm] = useState(true);

    const { isFocused } = useFocus({
        autoFocus: false,
        id: FocusKey.confirmSelector,
    });

    const getMaxLineWidth = (str: string) => {
        const splited = str.split('\n');

        return splited.reduce((acc, curr) => {
            const width = stringWidth(curr) + marginX * 2;
            return width > acc ? width : acc;
        }, 0);
    };

    const getLines = (val: string, columns: number, bg = inputBg, fg = inputFg) => {
        return createLines(val, columns, false, bg, fg, undefined, marginX);
    };

    useInput(
        (input, key) => {
            if (key.rightArrow) confirm && setConfirm(false);
            if (key.leftArrow) !confirm && setConfirm(true);
            if (input?.toLowerCase() === 'n') confirm && setConfirm(false);
            if (input?.toLowerCase() === 'y') !confirm && setConfirm(true);

            if (key.space) setConfirm(!confirm);
            if (key.return) {
                if (confirm) onCommitConfirmed?.();
                else onCanceled?.();
            }
        },
        { isActive: isFocused }
    );

    useEffect(() => {
        focusChanged && focusChanged(isFocused);
    }, [isFocused]);

    useEffect(() => {
        const headerMsg = `${c.bold.hex('#8cc265')(type || '')}${
            scope ? `(${c.italic.bold.hex('#125acc')(scope)})` : ''
        }${breaking ? '!' : ''}:${gitmoji ? ` ${gitmoji}` : ''} ${c.hex('#6a2eab')(summary || '')}`;

        const bodyMsg: string[] = body
            ? body.split('\n').map((line) => c.hex('#f24e50')(line))
            : [];

        const footerMsg: string[] = footer
            ? footer.split('\n').map((line) => c.hex('#db279f')(line))
            : [];

        const maxWidth = getMaxLineWidth(
            [headerMsg, ...bodyMsg, ...footerMsg].join('\n')
        );

        const formatted = getLines(
            `${headerMsg}${bodyMsg.length > 0 ? `\n\n${bodyMsg.join('\n')}` : ''}${
                footerMsg.length > 0 ? `\n\n${footerMsg.join('\n')}` : ''
            }`,
            maxWidth
        );
        const yMargins = getLines('\n'.repeat(marginY - 1), maxWidth);
        setMarginLines(yMargins);
        setLines(formatted);
    }, [type, scope, summary, body, footer, breaking, gitmoji]);

    return (
        <Box width="100%" flexDirection="column">
            <Box flexDirection="column" alignItems="center" justifyContent="center">
                {marginLines.map((line, i) => (
                    <Text key={'conf-mt-' + i}>{line}</Text>
                ))}

                <Text>{lines.join('\n')}</Text>

                {marginLines.map((line, i) => (
                    <Text key={'conf-mb-' + i}>{line}</Text>
                ))}
            </Box>

            <Box
                marginTop={2}
                alignItems="center"
                flexDirection="column"
                justifyContent="center"
            >
                <Text>{i18n('Do you wish to continue and execute the commit?')}</Text>

                <Box marginTop={1}>
                    <Text>
                        {c[confirm ? 'bold' : 'reset'][confirm ? 'greenBright' : 'reset'](
                            i18n('Yes')
                        )}
                    </Text>
                    <Text>{c.dim('    /    ')}</Text>
                    <Text>
                        {c[!confirm ? 'bold' : 'reset'][!confirm ? 'redBright' : 'reset'](
                            i18n('No')
                        )}
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};
