import c, { ForegroundColor } from 'chalk';
import { Box, Text, useFocus } from 'ink';
import React, { FC, useEffect, useState } from 'react';
import { useInput } from '../../common/hooks/use-input';
import { i18n } from '../../common/i18n/i18n';
import { FocusKey } from '../../common/types/focus-keys.types';
import { Br } from '../utils/br';

export type ValidFormat = typeof ForegroundColor;

export interface SwitchProps {
    focusChanged?: (focus: boolean) => void;
    onSelected?: (value: boolean) => void;
    onChange?: (value: boolean) => void;
    readonly focusKey: FocusKey;
    bgOn?: string;
    bgOff?: string;
    bgButton?: string;
    colorFocused?: ValidFormat | 'reset';
    title?: string;
    onLabel?: string;
    offLabel?: string;
}

const getBoxOfWhitespaces = (width: number, height: number) => {
    const lines = [];
    for (let i = 0; i < height; i++) {
        lines.push(' '.repeat(width));
    }
    return lines;
}

export const Switch: FC<SwitchProps> = ({
    focusChanged,
    onSelected,
    onChange,
    focusKey,
    bgOn = '#00c980',
    bgOff = '#414054',
    bgButton = '#ffffff',
    colorFocused = 'reset',
    title: rawTitle = i18n('Does this commit introduces a breaking change?'),
    onLabel = i18n('Yes'),
    offLabel = i18n('No'),
}) => {
    const [isOn, setIsOn] = useState(false);
    const [title, setTitle] = useState<string>('');
    const [left, setLeft] = useState<string[]>([]);
    const [right, setRight] = useState<string[]>([]);

    const { isFocused } = useFocus({
        autoFocus: false,
        id: focusKey,
    });

    useEffect(() => {
        setLeft(getBoxOfWhitespaces(7, 2));
        setRight(getBoxOfWhitespaces(7, 2));
    }, []);

    useEffect(() => {
        // set title
        setTitle(
            `${rawTitle} (${isOn ? c.bold.green(onLabel) : c.bold.dim(offLabel)})`
        )
    }, [isOn, rawTitle, title]);

    useEffect(() => {
        onChange && onChange(isOn);
    }, [isOn]);

    useInput((input, key) => {
        // toggle
        if(key.space) setIsOn(!isOn);
        if(key.rightArrow) !isOn && setIsOn(true);
        if(key.leftArrow) isOn && setIsOn(false);
        if(input?.toLowerCase() === 'y') !isOn && setIsOn(true);
        if(input?.toLowerCase() === 'n') isOn && setIsOn(false);

        if(key.return) {
            onSelected && onSelected(isOn);
        }
    }, { isActive: isFocused }); 

    useEffect(() => {
        focusChanged && focusChanged(isFocused);
    }, [isFocused]);

    return (
        <Box flexDirection='column' alignItems='center'>
            <Text>{ isFocused ? c[colorFocused](title) : title }</Text>
            <Br/>
            <Box width="100%" justifyContent='center'>
                <Box flexDirection='column' alignItems='center'>
                    {left.map((line, index) => 
                        <Text key={index}>
                            {c.bgHex(isOn ? bgOn : bgButton)(line)}
                        </Text>
                    )}
                </Box>
                <Box flexDirection='column' alignItems='center'>
                    {right.map((line, index) => 
                        <Text key={index}>
                            {c.bgHex(isOn ? bgButton : bgOff)(line)}
                        </Text>
                    )}
                </Box>
            </Box>
        </Box>
    );
};
