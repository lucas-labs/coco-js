export enum FocusKey {
    typeSelector = 'type',
    scopeSelector = 'scop',
    summarySelector = 'summ',
    bodySelector = 'body',
    footerSelector = 'foot',
    breakingSelector = 'brkn',
    confirmSelector = 'cnfrm',
    reviewSelector = 'rvw',
}

export type Stage =
    | 'help'
    | 'type_setup'
    | 'scope_setup'
    | 'message_setup'
    | 'breaking'
    | 'confirm'
    | 'review';

export const stageFromFocused = (focused: FocusKey): Stage => {
    switch (focused) {
        case FocusKey.typeSelector:
            return 'type_setup';
        case FocusKey.scopeSelector:
            return 'scope_setup';
        case FocusKey.summarySelector:
        case FocusKey.bodySelector:
        case FocusKey.footerSelector:
            return 'message_setup';
        case FocusKey.breakingSelector:
            return 'breaking';
        case FocusKey.confirmSelector:
            return 'confirm';
        case FocusKey.reviewSelector:
            return 'review';
        default:
            return 'confirm';
    }
};
