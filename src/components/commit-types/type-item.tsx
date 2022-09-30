import { Box, Text } from 'ink';
import React, { FC } from 'react';

export interface TypeItemProps {
    name?: string;
    isFocused: boolean;
    isSelected: boolean;
    isSelecting: boolean;
    minWidth?: number;
}

export const TypeItem: FC<TypeItemProps> = ({
    name,
    isFocused,
    isSelected,
    isSelecting,
    minWidth = 8,
}) => {
    return (
        <Box
            minWidth={minWidth}
            borderStyle="single"
            borderColor={
                isSelected 
                    ? 'green' 
                    : isFocused
                        ? 'blue'
                        : !isSelecting
                            ? 'gray' 
                            : ''
            }
        >
            <Box alignSelf="flex-start">
                <Text
                    color={
                        isSelected 
                            ? 'green' 
                            : isFocused
                                ? 'blue'
                                : !isSelecting
                                    ? 'gray' 
                                    : ''    

                    }
                >{name}</Text>
            </Box>
        </Box>
    );
};
