import { FocusKey } from '../../common/types/focus-keys.types';
import { ValidatedValue } from "../../common/types/coco.types";

export interface InputProps {
    display: boolean;
    focusable?: boolean;
    onSelected?: (val: ValidatedValue) => void;
    focusChanged?: (focus: boolean) => void;
    onValidChange?: (key: FocusKey, valid: boolean) => void;
}
