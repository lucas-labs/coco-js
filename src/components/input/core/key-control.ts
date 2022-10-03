import { paste } from '@lucas-labs/copy-paste';
import stripAnsi from 'strip-ansi';
import { Key } from '../../../common/hooks/use-input';

export interface InputEvent {
    input: string;
    key: Key;
}

export type StatePair<T> = [T, (value: T) => void];

export function shouldIngnore({ key, input }: InputEvent) {
    return (key.ctrl && input === 'c') || key.tab || (key.shift && key.tab);
}

export function carriageReturn({ key, input }: InputEvent) {
    return (key.meta && input === '[24~c') || input === '\r';
}

export function handleUpArrow(
    cursor: number,
    value: string,
    setCursor: (cursor: number) => void
) {
    const currentLineBeforeCursor = value.substring(0, cursor).split('\n').pop() || '';
    const beforeCursorLength = currentLineBeforeCursor.length;
    const prevLineLength = (
        value
            .substring(0, cursor - currentLineBeforeCursor.length - 1)
            .split('\n')
            .pop() || ''
    ).length;

    // find the previous line index (last \n in value)
    let prevLineIndex = value.lastIndexOf('\n', cursor - 1);

    // if current line is longer than previous line, prevLineIndex stays the same
    // if current line is shorter than previous line, prevLineIndex is
    // prevLineIndex - (prevLineLength - currentLineLength)
    prevLineIndex =
        beforeCursorLength >= prevLineLength
            ? prevLineIndex
            : prevLineIndex - (prevLineLength - beforeCursorLength);

    if (prevLineIndex >= 0) {
        setCursor(prevLineIndex);
    }
}

export function handleDownArrow(
    cursor: number,
    value: string,
    setCursor: (cursor: number) => void
) {
    const beforeCursorLength = (value.substring(0, cursor).split('\n').pop() || '')
        .length;

    // get the entire next line
    const charsInNextLineToCursor = (
        value
            .substring(
                value.indexOf('\n', cursor) + 1,
                value.indexOf('\n', cursor) + 1 + beforeCursorLength
            )
            .split('\n')[0] || ''
    ).length;

    // find the next line start
    let nextLineIndex = value.indexOf('\n', cursor);

    if (nextLineIndex >= 0) {
        setCursor(nextLineIndex + 1 + charsInNextLineToCursor);
    }
}

export function handleHome(
    cursor: number,
    value: string,
    setCursor: (cursor: number) => void
) {
    // go to beginning of line
    const prevLineIndex = value.lastIndexOf('\n', cursor - 1) + 1;

    if (cursor !== prevLineIndex) {
        setCursor(prevLineIndex >= 0 ? prevLineIndex : 0);
    }
}

export function handleEnd(
    cursor: number,
    value: string,
    setCursor: (cursor: number) => void
) {
    // find the next line index from the cursor
    const nextLineIndex = value.indexOf('\n', cursor);

    if (cursor !== nextLineIndex) {
        setCursor(nextLineIndex >= 0 ? nextLineIndex : value.length);
    }
}

export interface HandleInputResponse {
    result: 'submit' | 'done';
}

export function handleInput(
    e: InputEvent,
    validator: RegExp,
    [value, setValue]: StatePair<string>,
    [cursor, setCursor]: StatePair<number>
): HandleInputResponse {
    // if pasting (ctrl + v)
    if (e.key.ctrl && e.input === 'v') {
        e.input = paste();
    }

    if (shouldIngnore(e)) {
        return { result: 'done' };
    }

    if (carriageReturn(e)) {
        e.input = '\n';
    }

    if (e.key.return && !e.key.shift && !e.key.alt) {
        return {
            result: 'submit',
        };
    }

    if (e.key.leftArrow) {
        setCursor(Math.max(0, cursor - 1));
    } else if (e.key.rightArrow) {
        setCursor(cursor + 1 > value.length + 1 ? value.length + 1 : cursor + 1);
    } else if (e.key.upArrow) {
        handleUpArrow(cursor, value, setCursor);
    } else if (e.key.downArrow) {
        handleDownArrow(cursor, value, setCursor);
    } else if (e.key.backspace) {
        setValue(value.substring(0, cursor - 1) + value.substring(cursor));
        setCursor(Math.max(0, cursor - 1));
    } else if (e.key.delete) {
        setValue(value.substring(0, cursor) + value.substring(cursor + 1));
    } else if (e.key.home && e.key.meta) {
        handleHome(cursor, value, setCursor);
    } else if (e.key.end && e.key.meta) {
        handleEnd(cursor, value, setCursor);
    } else if (e.key.escape) {
        // do nothing
    } else if (e.input) {
        // any other input
        e.input = e.input?.replace('\r\n', '\n');
        const ansiStripped = stripAnsi(e.input);
        const nextValue = value.slice(0, cursor) + ansiStripped + value.slice(cursor);

        if (validator.test(ansiStripped) && validator.test(nextValue)) {
            setValue(nextValue);
            setCursor(cursor + ansiStripped.length);
        }
    }

    return {
        result: 'done',
    };
}
