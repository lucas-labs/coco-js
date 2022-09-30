import { Config, ConventionalCommitType } from '../types/coco.types';

/** default commit types if no types config is provided */
export const defaultTypes: ConventionalCommitType[] = [
    {
        desc: 'Introduces a new feature',
        name: 'feat',
        emoji: '✨',
    },
    {
        desc: 'Fixes a bug',
        name: 'fix',
        emoji: '🚑️',
    },
    {
        desc: "Other changes that don't modify src or test files",
        name: 'chore',
        emoji: '🧹',
    },
    {
        desc: 'Documentation only changes',
        name: 'docs',
        emoji: '📝',
    },
    {
        desc: 'Code cosmetic changes (formatting, indentation, etc.)',
        name: 'style',
        emoji: '💄',
    },
    {
        desc: 'A change that refactors code without adding or removing features',
        name: 'refactor',
        emoji: '🔨',
    },
    {
        desc: 'A code change that improves performance',
        name: 'perf',
        emoji: '🐎',
    },
    {
        desc: 'A change that only adds or updates tests',
        name: 'test',
        emoji: '🧪',
    },
    {
        desc: 'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
        name: 'ci',
        emoji: '🔄',
    },
    {
        desc: 'Reverts a previous commit',
        name: 'revert',
        emoji: '🔙',
    },
    {
        desc: 'Releases a new version',
        name: 'release',
        emoji: '🔖',
    },
    {
        desc: 'Work in progress',
        name: 'wip',
        emoji: '🚧',
    },
    {
        desc: 'A change that updates or adds translations (internationalization)',
        name: 'i18n',
        emoji: '🌐',
    },
];

/**
 * ___Default `coco` configuration___
 *
 * We'll merge this config with the user
 * provided config
 */
export const defaultConfig: Config = {
    types: defaultTypes,
    useEmoji: false,
    scopes: [],
};

/** Get type by its name by searching in a list of types */
export const getCommitType = (types: ConventionalCommitType[], name: string) => {
    return types.find((type) => type.name === name);
};
