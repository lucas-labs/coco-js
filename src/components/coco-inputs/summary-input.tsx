import { Box, useFocus } from 'ink';
import React, { FC, useEffect } from 'react';
import { FocusKey } from '../../common/types/focus-keys.types';
import { i18n } from '../../common/i18n/i18n';
import TextInput from '../input/input';
import { InputProps } from './types.common';

export const SummaryInput: FC<InputProps> = ({
    display = false,
    onSelected,
    focusChanged,
    onValidChange
}) => {
    const { isFocused } = useFocus({
        autoFocus: false,
        id: FocusKey.summarySelector,
    });

    useEffect(() => {
        focusChanged && focusChanged(isFocused);
    }, [isFocused]);

    const validChanged = (value: boolean) => {
        onValidChange && onValidChange(FocusKey.summarySelector, value);
    }

    return (
        <Box width="100%" flexDirection='row' alignItems="flex-start" justifyContent="flex-start">
            <TextInput 
                title={i18n('summary')}
                label={`* ${i18n('required')}`}
                titleBg='#6a2eab'
                focused={isFocused} 
                display={display}
                onSubmit={onSelected}
                onValidChange={validChanged}
                validator={/^.{1,50}$/} />
        </Box>
    );
};
