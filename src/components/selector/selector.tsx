import { Box, useFocus } from 'ink';
import React, { FC, useEffect, useState } from 'react';
import { useInput } from '../../common/hooks/use-input';
import { FocusKey } from '../../common/types/focus-keys.types';
import { OptionItem } from './item';

export interface SelectorProps {
    options: string[];
    focusKey: FocusKey;
    onSelected: (type: string) => void;
    focusChanged?: (focused: boolean) => void;
    chunkSize?: number;
    
}

function splitArrayIntoChunksOfLen(arr: string[], len: number) {
    const chunks = [];
    let i = 0;
    const n = arr.length;
    while (i < n) {
        chunks.push(arr.slice(i, (i += len)));
    }
    return chunks;
}

export const Selector: FC<SelectorProps> = ({
    options: types,
    focusKey,
    onSelected,
    focusChanged,
    chunkSize = 5,
}) => {
    const [focused, setFocused] = useState<number>(0);
    const [selected, setSelected] = useState<number>(-1);
    const [longestType, setLongestType] = useState<number>(0);
    const [splitedTypes, setSplitedTypes] = useState<string[][]>([]);

    const { isFocused } = useFocus({
        autoFocus: true,
        id: focusKey,
    });

    useEffect(() => {
        const longer = types.reduce((acc, curr) => {
            return curr.length > acc ? curr.length : acc;
        }, 0);

        const splited = splitArrayIntoChunksOfLen(types, chunkSize);

        setLongestType(longer);
        setSplitedTypes(splited);
    }, [types]);

    useEffect(() => {
        focusChanged && focusChanged(isFocused);
    }, [isFocused]);

    useInput(
        (_, key) => {
            if (key.leftArrow) {
                setFocused((prev) => {
                    if (prev === 0) {
                        return types.length - 1;
                    }
                    return prev - 1;
                });
            }

            if (key.rightArrow) {
                setFocused((prev) => {
                    if (prev === types.length - 1) {
                        return 0;
                    }
                    return prev + 1;
                });
            }

            if (key.return || key.tab) {
                setSelected(focused);
                onSelected(types[focused]!);
            }
        },
        { isActive: isFocused }
    );

    return (
        <Box flexDirection="column" alignItems="center">
            {splitedTypes.map((chunk, cIndex) => (
                <Box key={cIndex} flexDirection="row">
                    {chunk.map((type, index) => {
                        return (
                            <OptionItem
                                key={cIndex * chunkSize + index}
                                isSelected={cIndex * chunkSize + index === selected}
                                isFocused={cIndex * chunkSize + index === focused}
                                isSelecting={isFocused}
                                minWidth={longestType + 2}
                                name={type}
                            />
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
};
