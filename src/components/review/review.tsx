
import { Box, Text, useApp, useFocus } from 'ink';
import React, { FC, useEffect, useState } from 'react';
import { FocusKey } from '../../common/types/focus-keys.types';
import c from 'chalk';
import { i18n } from '../../common/i18n/i18n';
import { useInput } from '../../common/hooks/use-input';
import { CommitResult } from '../../common/git/commands/commit';
import { getCommit, GitLog } from '../../common/git/commands/get-commit';
import { Br } from '../utils/br';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import { Logo } from '../utils/logo';

export interface ConfirmProps {
    result?: CommitResult;
    err?: Error | string;
    focusChanged?: (focus: boolean) => void;
}

export const ReviewCommit: FC<ConfirmProps> = ({
    result,
    err,
    focusChanged
}) => {
    const { exit } = useApp();
    const [commit, setCommit] = useState<GitLog>();
    const [waiting, setWaiting] = useState<boolean>(true);
    const [columns] = useStdoutDimensions();

    const { isFocused } = useFocus({
        autoFocus: false,
        id: FocusKey.reviewSelector
    });

    useEffect(() => {
        if(result && result.status === 'ok' && result.hash) {
            getCommit('.', result.hash)
                .then((com) => {
                    setCommit(com);
                })
                .catch(e => err = e);
        }
    }, [result]);

    useEffect(() => {
        if(commit || err) {
            setWaiting(false);
        }
    }, [commit, err]);

    useEffect(() => {
        focusChanged && focusChanged(isFocused);
    }, [isFocused]);

    useInput(() => exit(), {
        isActive: isFocused
    });

    return (
        <Box 
            width="100%" 
            flexDirection='column'
            height={ waiting ? '100%' : 'auto' }
            justifyContent={ waiting ? 'center' : 'flex-start' }
        >
            <Box
                alignItems="center"
                flexDirection="column"
                justifyContent="center"
                display={waiting ? 'flex' : 'none'}
            >
                <Logo display={waiting && isFocused} animate frameRate={300} />
                <Text dimColor>{i18n('committing')}</Text>
            </Box>

            <Box
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="flex-start"
                display={err ? 'flex' : 'none'}
            >
                <Text color="red">{`${i18n `Oops, something went wrong`} 😢`}</Text>
                <Box marginTop={1}>
                    <Text color="red">{err instanceof Error ? err.message : err}</Text>
                </Box>
            </Box>

            <Box
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="flex-start"
                display={commit && !err ? 'flex' : 'none'}
            >
                <Box marginBottom={1}>
                    <Text color={'white'} bold>{`${i18n `Done! This is your commit`} 🍻`}</Text>
                </Box>

                <Text>{c.yellow `${c.bold `commit`} ${commit?.hash || result?.hash}`}</Text>
                <Text>{c.bold `Author`} {commit?.author}</Text>
                <Text>{c.bold `Date`}   {commit?.date}</Text>
                
                <Br/>

                <Text color={'magenta'}>{commit?.subject}</Text>
                
                <Box flexDirection='column' marginTop={1} display={commit?.body && commit.body.length > 0 ? 'flex' : 'none'}>
                    {
                        commit?.body?.map((line, i) => (
                            <Text key={i}>{line === '' ? ' ' : line}</Text>
                        ))
                    }
                </Box>
            </Box>

            <Box
                marginY={2}
                alignItems="center"
                flexDirection="column"
                justifyContent="center"
                display={waiting ? 'none' : 'flex'}
            >
                <Text>{c.dim('─'.repeat(Math.floor(columns/2)))}</Text>
            </Box>

            <Box
                alignItems="center"
                flexDirection="column"
                justifyContent="center"
                display={waiting ? 'none' : 'flex'}
            >
                <Text>{i18n('Press any key to exit...')}</Text>
            </Box>
        </Box>
    );
};
