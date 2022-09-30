import c from 'chalk';
import { Box, Text, useFocusManager } from 'ink';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import React, { FC, useEffect, useState } from 'react';
import { getCommitType } from '../common/config/coco.config';
import { useInput } from '../common/hooks/use-input';
import { i18n } from '../common/i18n/i18n';
import { Config, ConventionalCommitType, ValidatedValue } from '../common/types/coco.types';
import { TypeSelector } from '../components/commit-types/type-selector';
import { BodyInput } from '../components/coco-inputs/body-input';
import { FooterInput } from '../components/coco-inputs/footer-input';
import { ScopeInput } from '../components/coco-inputs/scope-input';
import { SummaryInput } from '../components/coco-inputs/summary-input';
import { ConfirmCommit } from '../components/confirm/confirm-commit';
import { Switch } from '../components/input/switch';
import { Br } from '../components/utils/br';
import { canContinue, canGoBack } from './core/orchestration';
import { Header } from '../components/utils/header';
import { Help } from '../components/utils/help';
import { commit, CommitResult } from '../common/git/commands/commit';
import { ReviewCommit } from '../components/review/review';
import { FocusKey, Stage, stageFromFocused } from '../common/types/focus-keys.types';

export interface CocoAppProps {
    cfg: Config;
}

export const CocoApp: FC<CocoAppProps> = ({ cfg }) => {
    const [,rows] = useStdoutDimensions();
    const [typeDesc, setTypeDesc] = useState<ConventionalCommitType>();
    const [type, setType] = useState<string>();
    const [scope, setScope] = useState<ValidatedValue>({ value: '', isValid: false});
    const [summary, setSummary] = useState<ValidatedValue>({ value: '', isValid: false});
    const [body, setBody] = useState<ValidatedValue>({ value: '', isValid: false});
    const [footer, setFooter] = useState<ValidatedValue>({ value: '', isValid: false});
    const [breaking, setBreaking] = useState<boolean>(false);
    const [step, setStep] = useState<FocusKey>(FocusKey.typeSelector);
    const [stage, setStage] = useState<Stage>('type_setup');
    const [prevStage, setPrevStage] = useState<Stage>();
    const [commitResult, setCommitResult] = useState<CommitResult>();
    const [commitError, setCommitError] = useState<string | Error>();
    const { focus, disableFocus, focusPrevious, focusNext } = useFocusManager();
    const sanitize = (str: string) => str.replace(/^\s+|\s+$/g, '');
    const types = cfg.types.map((type) => type.name);

    useEffect(() => {
        disableFocus();
    }, []);

    useEffect(() => {
        const newStage = stageFromFocused(step);
        setStage(newStage);
    }, [step]);

    useEffect(() => {
        if(type) {
            const desc = getCommitType(cfg.types, type);
            desc && setTypeDesc(desc); 
        }
    }, [type]);

    useInput((input, key) => {
        if(key.f2) {
            if(stage === 'help') {
                setStage(prevStage);
            } else {
                setPrevStage(stage);
                setStage('help');
            }
        }

        if(key.escape) {
            if(stage === 'help') {
                setStage(prevStage);
            }

            focus(step);
            return;
        }

        if (key.ctrl && input === 'c') {
            process.exit(0);
        }

        if(key.previous) {
            canGoBack(step) && focusPrevious();
        }

        if(key.next || key.tab) {
            if(canContinue(step, type, scope, summary, body, footer)) {
                focusNext();
            }
        }
    }, {isActive: stage !== 'review'});

    const onTypeSelected = (update: string) => {
        setType(update);
        focus(FocusKey.scopeSelector);
    };

    const onScopeSelected = (update: ValidatedValue) => {
        setScope({value: sanitize(update.value), isValid: update.isValid});
        focus(FocusKey.summarySelector);
    };

    const onSummarySelected = (update: ValidatedValue) => {
        setSummary({value: sanitize(update.value), isValid: update.isValid});
        focus(FocusKey.bodySelector);
    };

    const onBodySelected = (update: ValidatedValue) => {
        setBody({value: sanitize(update.value), isValid: update.isValid});
        focus(FocusKey.footerSelector);
    };

    const onFooterSelected = (update: ValidatedValue) => {
        setFooter({value: sanitize(update.value), isValid: update.isValid});
        focus(FocusKey.breakingSelector);
    };

    const onBreakingSelected = (v: boolean) => {
        setBreaking(v);
        focus(FocusKey.confirmSelector);
    };

    const onStepFocus = ((v: boolean, step: FocusKey) => {
        v && setStep(step)
    });

    const compiled = () => `${type}${scope.value ? `(${scope.value})` : ''}: ${summary.value}${body.value ? `\n\n${body.value}` : ''}${footer.value ? `\n\n${footer.value}` : ''}`;

    const onCommitConfirmed = () => {
        focus(FocusKey.reviewSelector);

        commit('.', compiled())
            .then((out) => {
                setCommitResult(out);
            })
            .catch((err) => {
                setCommitError(err);
            });
    };

    const onCanceled = () => {
        focus(FocusKey.typeSelector);
    };

    return (
        <Box minHeight={rows-1} flexDirection="column">
            <Box flexDirection="column" alignItems='center' display={stage === 'help' || stage === 'review' ? 'none' : 'flex'}>
                <Header type={stage === 'type_setup' ? 'big' : 'small'}/>
            </Box>

            <Box flexDirection="column" display={stage === 'help' ? 'flex' : 'none'} justifyContent="center" alignItems='center'>
                <Help></Help>
            </Box>

            <Box flexDirection="column" display={stage === 'type_setup' ? 'flex' : 'none'} justifyContent="center" alignItems='center'>
                <Text>{i18n('Select the type of your commit (use arrows to move around, enter to select)')}</Text>
                <Br/>
                <TypeSelector 
                    onSelected={onTypeSelected} 
                    types={types}
                    focusChanged={(v) => onStepFocus(v, FocusKey.typeSelector)}
                /><Br/>
            </Box>

            <Box flexDirection="column" display={stage === 'message_setup' || stage === 'scope_setup' ? 'flex' : 'none'}>
                <Box alignItems="center" display={type!! ? 'flex' : 'none'} marginBottom={1} >
                    <Box>
                        <Text>{i18n("Creating a <%=type%> commit", {type: c.bold.greenBright(type)})}{scope.value ? ' ' + i18n('on scope <%=scope%>', {scope: c.blue(scope.value)}): ''} {c.dim('|')} {typeDesc?.emoji} {c.dim('>')} {c.dim.italic(i18n(typeDesc?.desc || ''))}</Text>
                    </Box>
                </Box>
                
                <Box display={stage === 'scope_setup' ? 'flex' : 'none'} flexDirection='column'>
                    <ScopeInput   focusChanged={(v) => onStepFocus(v, FocusKey.scopeSelector)}   onSelected={onScopeSelected}   display={type !== undefined} /><Br/>
                </Box>

                <Box display={stage === 'message_setup' ? 'flex' : 'none'} flexDirection='column'>
                    <SummaryInput focusChanged={(v) => onStepFocus(v, FocusKey.summarySelector)} onSelected={onSummarySelected} display={scope.isValid}/><Br/>
                    <BodyInput    focusChanged={(v) => onStepFocus(v, FocusKey.bodySelector)}    onSelected={onBodySelected}    display={summary.isValid}/><Br/>
                    <FooterInput  focusChanged={(v) => onStepFocus(v, FocusKey.footerSelector)}  onSelected={onFooterSelected}  display={body.isValid}/>
                </Box>
            </Box>

            <Box flexDirection="column" display={stage === 'breaking' ? 'flex' : 'none'}>
                <Switch
                    focusKey={FocusKey.breakingSelector}
                    focusChanged={(v) => onStepFocus(v, FocusKey.breakingSelector)}
                    onSelected={(v) => onBreakingSelected(v)}
                    onChange={setBreaking}
                />
            </Box>
            
            <Box flexDirection="column" display={stage === 'confirm' ? 'flex' : 'none'}>
                <ConfirmCommit  
                    focusChanged={(v) => onStepFocus(v, FocusKey.confirmSelector)} 
                    type={type}
                    scope={scope.value}
                    summary={summary.value}
                    body={body.value}
                    footer={footer.value}
                    breaking={breaking}
                    onCommitConfirmed={onCommitConfirmed}
                    onCanceled={onCanceled}
                ></ConfirmCommit>
            </Box>

            <Box flexDirection="column" display={stage === 'review' ? 'flex' : 'none'}>
                <ReviewCommit 
                    result={commitResult} 
                    err={commitError}
                    focusChanged={(v) => onStepFocus(v, FocusKey.reviewSelector)}
                />
            </Box>
        </Box>
    );
};
