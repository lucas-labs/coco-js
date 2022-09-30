import c from 'chalk';
import { Box, Text } from 'ink';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import leftPad from 'just-left-pad';
import type { FC } from 'react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import stripAnsi from 'strip-ansi';
import { useInput } from '../../common/hooks/use-input';
import { ValidatedValue } from '../../common/types/coco.types';
import { createLines } from './core/display-control';
import { handleInput } from './core/key-control';

interface Props {
    onChange?: (value: ValidatedValue) => void;
    onSubmit?: (value: ValidatedValue) => void;
    onValidChange?: (valid: boolean) => void;
    blink?: boolean;
    marginX?: number;
    marginY?: number;
    validator?: RegExp;
    focused?: boolean;
    title?: string;
    label?: string;
    display?: boolean;
    bg?: string;
    fg?: string;
    titleBg?: string;
    titleFg?: string;
    labelFg?: string;
}

const TextInput: FC<Props> = ({
    onChange,
    onSubmit,
    onValidChange,
    blink,
    marginX = 2,
    marginY = 1,
    validator = /.*/s,
    focused = false,
    display = true,
    title,
    label = '',
    bg: inputBg = '#050f21',
    fg: inputFg = '#ffffff',
    titleBg = '#125acc',
    titleFg = '#ffffff',
    labelFg = '#000000',
}) => {
    const [columns] = useStdoutDimensions();
    const [value, setValue] = useState('');
    const [lines, setLines] = useState<string[]>([]);
    const [marginLines, setMarginLines] = useState<string[]>([]);
    const [titleLines, setTitleLine] = useState<string[]>([]);
    const [cursor, setCursor] = useState(0);
    const [valid, setValid] = useState<boolean>();

    let cursorToggling = true;

    // #region functions

    const getLines = (val?: string, bg = inputBg, fg = inputFg) => {
        return createLines(
            val !== undefined ? val : value,
            columns,
            focused,
            bg,
            fg,
            val !== undefined ? undefined : cursorToggling ? cursor : undefined,
            val !== undefined ? undefined : marginX
        );
    };

    const blinkingCursor = () => {
        return setInterval(() => {
            cursorToggling = !cursorToggling;
            setLines(getLines());
        }, 500);
    };

    const validate = () => {
        const ansiStripped = stripAnsi(value);
        const result = validator.test(ansiStripped);
        setValid(result);
        return result;
    };
    // #endregion

    // #region effects

    // title setting
    useEffect(() => {
        if (!focused) return;
        setMarginLines(getLines('\n'.repeat(marginY - 1)));
        if (title && title.trim()) {
            const titleText = `${c.bold(leftPad(title, title.length + marginX))}${
                label ? ` ${c.italic.hex(labelFg)(label)}` : ''
            }`;

            setTitleLine(getLines(titleText, titleBg, titleFg));
        }
    }, [focused]);

    // Validation and change notification
    useEffect(() => {
        const isValid = validate();
        onChange && onChange({ value, isValid });
    }, [value]);

    // Validation notification
    useEffect(() => {
        if (valid === undefined) return;

        onValidChange && onValidChange(valid);
    }, [valid]);

    // validate initial state at startup
    useEffect(() => {
        validate();
    }, []);

    // Blinking effect
    useEffect(() => {
        setLines(getLines());
        if (!focused) return;

        if (blink) {
            const intervalId = blinkingCursor();
            return () => clearInterval(intervalId); //This is important
        }

        return () => {};
    }, [value, cursor, focused]);

    useInput(
        (input, key) => {
            const result = handleInput(
                { input, key },
                validator,
                [value, setValue],
                [cursor, setCursor]
            );

            if (result.result === 'submit') {
                if (valid) {
                    onSubmit && onSubmit({ value, isValid: valid });
                }
            }
        },
        { isActive: focused }
    );

    // #endregion

    return (
        <Box flexDirection="column" display={display ? 'flex' : 'none'}>
            {titleLines.map((line, i) => (
                <Text key={i}>{line}</Text>
            ))}
            {marginLines.map((line, i) => (
                <Text key={'mt-' + i}>{line}</Text>
            ))}
            {lines.map((line, i) => (
                <Text key={'line-' + i}>{line}</Text>
            ))}
            {marginLines.map((line, i) => (
                <Text key={'mb-' + i}>{line}</Text>
            ))}
        </Box>
    );
};

export default TextInput;
