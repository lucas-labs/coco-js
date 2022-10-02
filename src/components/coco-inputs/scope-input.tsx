import { Box, useFocus } from 'ink';
import React, { FC, useEffect } from 'react';
import { FocusKey } from '../../common/types/focus-keys.types';
import { i18n } from '../../common/i18n/i18n';
import TextInput from '../input/input';
import { InputProps } from './types.common';

export const ScopeInput: FC<InputProps> = ({
    display = false,
    focusable = true,
    onSelected,
    focusChanged,
    onValidChange
}) => {
    const { isFocused } = useFocus({
        autoFocus: false,
        id: FocusKey.scopeSelector,
        isActive: focusable,
    });
    
    useEffect(() => {
        focusChanged && focusChanged(isFocused);
    }, [isFocused]);

    const validChanged = (value: boolean) => {
        onValidChange && onValidChange(FocusKey.scopeSelector, value);
    }

    return (
        <Box width="100%" flexDirection='row' alignItems="flex-start" justifyContent="flex-start">
            <TextInput 
                title={i18n('scope')}
                label={`(${i18n('optional')})`}
                focused={isFocused} 
                display={display && focusable} 
                onSubmit={onSelected} 
                onValidChange={validChanged}
                validator={/^[a-z]*$/s} 
            />
        </Box>
    );
};
