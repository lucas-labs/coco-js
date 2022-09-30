import { FocusKey } from '../../common/types/focus-keys.types';
import { ValidatedValue } from '../../common/types/coco.types';

export function canGoBack(step: FocusKey) {
    return step !== FocusKey.typeSelector;
}

export function canContinue(
    step: FocusKey,
    type?: string,
    scope?: ValidatedValue,
    summary?: ValidatedValue,
    body?: ValidatedValue,
    footer?: ValidatedValue
) {
    switch (step) {
        case FocusKey.typeSelector:
            return type !== undefined;
        case FocusKey.scopeSelector:
            return scope && scope.isValid;
        case FocusKey.summarySelector:
            return summary && summary.isValid;
        case FocusKey.bodySelector:
            return body && body.isValid;
        case FocusKey.footerSelector:
            return footer && footer.isValid;
        case FocusKey.breakingSelector:
            return true;
        default:
            return false;
    }
}
