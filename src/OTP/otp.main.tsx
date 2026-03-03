import { Fragment, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { Box } from "./otp.box";
import { createItems, cx, findFirstEmpty, isAllowedChar, resolveClass } from "./otp.helpers";
import { otpReducer } from "./otp.reducer";
import type { OTPItem, OTPProps } from "./otp.types";

export const OtpInput = <L extends number = number,>({
    name,
    value,
    defaultValue,
    length,
    mode = "numeric",
    type = "text",
    mask,
    placeholder,
    separator,
    groupSeparator,
    separatorEvery,
    isDisabled = false,
    hasError = false,
    classes = {},
    groupLabelId,
    groupAriaLabel = "One-time password input",
    describedBy,
    inputAriaLabel = "One-time password digit",
    onChange,
    onManualComplete,
    onEnter,
    ...rest
}: OTPProps<L>) => {
    // DATA-FLOW and CONSTANTS
    const normalizedLength = Math.max(1, Number(length ?? 6));
    const ids = useMemo(
        () => Array.from({ length: normalizedLength }, (_, i) => `otp-${name}-${i}`),
        [normalizedLength, name],
    );
    const initialItems = useMemo(
        () => createItems(ids, value ?? defaultValue, mode),
        [ids, value, defaultValue, mode],
    );
    const isControlled = value !== undefined;
    const hasCustomMask = type === "password" || !!mask;
    const resolvedInputType: "text" | "password" = hasCustomMask ? "text" : type;
    
    // REFS
    const rootRef = useRef<HTMLDivElement | null>(null);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const itemsRef = useRef<OTPItem[]>(initialItems);
    const lastInternalValueRef = useRef<string | null>(null);
    const skipFirstCallbackRef = useRef(true);
    const onEnterRef = useRef(onEnter);
    const onChangeRef = useRef(onChange);
    const onManualCompleteRef = useRef(onManualComplete);
    const lastActionFromSyncRef = useRef(false);

    const inputRefSetters = useMemo(
        () => ids.map((_, index) => (element: HTMLInputElement | null) => {
            inputRefs.current[index] = element;
        }),
        [ids],
    );
    const groupSize = separatorEvery && separatorEvery > 0 ? separatorEvery : normalizedLength;
    const [state, dispatch] = useReducer(otpReducer, {
        items: initialItems,
        activeIndex: isDisabled ? -1 : findFirstEmpty(initialItems),
    });
    const groups = useMemo(() => {
        const out: { start: number; end: number; items: OTPItem[] }[] = [];
        for (let start = 0; start < state.items.length; start += groupSize) {
            const end = Math.min(state.items.length, start + groupSize);
            out.push({ start, end, items: state.items.slice(start, end) });
        }
        return out;
    }, [state.items, groupSize]);

    // HANDLERS
    const handleInputChange = useCallback((index: number, rawValue: string, caretPosition: number | null) => {
        if (isDisabled) return;

        const rawChars = Array.from(rawValue);
        if (rawChars.length === 0) {
            dispatch({ type: "CLEAR_OR_MOVE_LEFT", index });
            return;
        }

        // Prefer the character around caret so replacement works when caret is on either side.
        const candidateIndex =
            caretPosition === null
                ? rawChars.length - 1
                : Math.max(0, Math.min(rawChars.length - 1, caretPosition - 1));
        const candidateChar = rawChars[candidateIndex];
        const nextChar = isAllowedChar(mode, candidateChar)
            ? candidateChar
            : rawChars.find((char) => isAllowedChar(mode, char));

        if (!nextChar) return;

        dispatch({
            type: "SET_TYPED_CHARS",
            startIndex: index,
            chars: [nextChar],
            length: normalizedLength,
        });
    }, [isDisabled, mode, normalizedLength]);

    const focusIndex = useCallback((index: number) => {
        if (isDisabled) return;

        const next = Math.max(0, Math.min(index, normalizedLength - 1));
        dispatch({ type: "SET_ACTIVE_INDEX", activeIndex: next });
        inputRefs.current[next]?.focus();
        inputRefs.current[next]?.select();
    }, [isDisabled, normalizedLength]);

    const handleInputKeyDown = useCallback(
        (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
            if (isDisabled) return;

            if (
                event.key.length === 1 &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.altKey
            ) {
                event.preventDefault();
                if (!isAllowedChar(mode, event.key)) return;

                dispatch({
                    type: "SET_TYPED_CHARS",
                    startIndex: index,
                    chars: [event.key],
                    length: normalizedLength,
                });
                return;
            }

            switch (event.key) {
                case "Delete":
                case "Backspace": {
                    event.preventDefault();
                    dispatch({ type: "CLEAR_OR_MOVE_LEFT", index });
                    return;
                }
                case "ArrowLeft": {
                    event.preventDefault();
                    focusIndex(Math.max(0, index - 1));
                    return;
                }
                case "ArrowRight": {
                    event.preventDefault();
                    focusIndex(Math.min(normalizedLength - 1, index + 1));
                    return;
                }
                case "Tab": {
                    if (event.shiftKey) {
                        if (index > 0) {
                            event.preventDefault();
                            focusIndex(index - 1);
                        }
                        return;
                    }
                    if (index < normalizedLength - 1) {
                        event.preventDefault();
                        focusIndex(index + 1);
                    }
                    return;
                }
                case "Enter": {
                    const joined = itemsRef.current.map((item) => item.value).join("");
                    if (joined.length === normalizedLength) {
                        onEnterRef.current?.(joined, event);
                    }
                    return;
                }
                default:
                    return;
            }
        },
        [focusIndex, isDisabled, mode, normalizedLength],
    );

    const handleInputPaste = useCallback((_: number, text: string) => {
        if (isDisabled) return;

        const chars = Array.from(text);
        if (chars.length !== normalizedLength) return;
        if (!chars.every((char) => isAllowedChar(mode, char))) return;

        dispatch({ type: "PASTE_ALL", chars, length: normalizedLength });
    }, [isDisabled, mode, normalizedLength]);

    const handleInputBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        const nextFocused = event.relatedTarget as Node | null;
        if (nextFocused && rootRef.current?.contains(nextFocused)) {
            return;
        }

        dispatch({ type: "SET_ACTIVE_INDEX", activeIndex: -1 });
    }, []);

    // SIDE EFFECTS
    useEffect(() => {
        onEnterRef.current = onEnter;
        onChangeRef.current = onChange;
        onManualCompleteRef.current = onManualComplete;
    }, [onEnter, onChange, onManualComplete]);

    useEffect(() => {
        itemsRef.current = state.items;
    }, [state.items]);

    useEffect(() => {
        if (!isControlled) return;

        if (value === lastInternalValueRef.current) {
            lastInternalValueRef.current = null;
            return;
        }

        const nextItems = createItems(ids, value, mode);
        itemsRef.current = nextItems;
        lastActionFromSyncRef.current = true;
        dispatch({
            type: "SYNC_FROM_VALUE",
            items: nextItems,
            activeIndex: isDisabled ? -1 : findFirstEmpty(nextItems),
        });
    }, [ids, isControlled, mode, value, isDisabled]);

    useEffect(() => {
        if (skipFirstCallbackRef.current) {
            skipFirstCallbackRef.current = false;
            return;
        }

        if (lastActionFromSyncRef.current) {
            lastActionFromSyncRef.current = false;
            return;
        }

        const nextValue = state.items.map((item) => item.value).join("");
        lastInternalValueRef.current = nextValue;
        onChangeRef.current?.(nextValue);

        if (nextValue.length === normalizedLength) {
            onManualCompleteRef.current?.();
        }
    }, [state.items, normalizedLength]);

    useEffect(() => {
        if (isDisabled && state.activeIndex !== -1) {
            dispatch({ type: "SET_ACTIVE_INDEX", activeIndex: -1 });
            return;
        }

        const active = state.activeIndex;
        inputRefs.current[active]?.focus();
        inputRefs.current[active]?.select();
    }, [isDisabled, state.activeIndex]);

    // STYLES
    const containerClassName = resolveClass(classes.container, {
        isActive: false,
        hasError,
        isDisabled,
    });
    const separatorClassName = resolveClass(classes.boxSeparator, {
        isActive: false,
        hasError,
        isDisabled,
    });
    const groupSeparatorClassName = resolveClass(classes.groupSeparator, {
        isActive: false,
        hasError,
        isDisabled,
    });
    console.log("re-render")
    return (
        <div 
            {...rest}
            ref={rootRef}
            role="group"
            className={containerClassName} 
            aria-disabled={isDisabled || undefined}
            aria-labelledby={groupLabelId}
            aria-label={groupLabelId ? undefined : groupAriaLabel}
            aria-describedby={describedBy}
        >
            {groups.map((group, groupIndex) => {
                const isGroupActive = state.activeIndex >= group.start && state.activeIndex < group.end;
                const groupClassName = resolveClass(classes.boxGroup, {
                    isActive: isGroupActive,
                    hasError,
                    isDisabled,
                });
                const shouldRenderGroupSeparator =
                    groupSeparator !== undefined &&
                    groupSeparator !== null &&
                    groupIndex < groups.length - 1;

                return (
                    <span key={`group-wrap-${group.start}`} data-group-wrap>
                        <span className={groupClassName || undefined} data-group>
                            {group.items.map((item, localIndex) => {
                                const index = group.start + localIndex;
                                const isActive = index === state.activeIndex;
                                const boxClassName = resolveClass(classes.boxContainer, { isActive, hasError, isDisabled });
                                const valueClassName = resolveClass(classes.boxValue, { isActive, hasError, isDisabled });
                                const placeholderClassName = resolveClass(classes.boxPlaceholder, {
                                    isActive,
                                    hasError,
                                    isDisabled,
                                });
                                const currentMask = Array.isArray(mask) ? (mask[index] ?? "") : (mask ?? "");
                                const displayValue = hasCustomMask && item.value ? currentMask : item.value;
                                const placeholderChar = placeholder ? placeholder[index] ?? "" : "";
                                const valueClassWithPlaceholder = cx(
                                    valueClassName,
                                    !displayValue && !!placeholderChar && placeholderClassName,
                                );
                                const shouldRenderBoxSeparator =
                                    separator !== undefined &&
                                    separator !== null &&
                                    localIndex < group.items.length - 1;

                                return (
                                    <Fragment key={item.id}>
                                        <Box
                                            id={item.id}
                                            index={index}
                                            value={displayValue}
                                            isActive={isActive}
                                            isDisabled={isDisabled}
                                            hasError={hasError}
                                            inputType={resolvedInputType}
                                            inputMode={mode === "numeric" ? "numeric" : "text"}
                                            className={boxClassName}
                                            valueClassName={valueClassWithPlaceholder}
                                            placeholder={placeholderChar}
                                            ariaLabel={`${inputAriaLabel} ${index + 1} of ${normalizedLength}`}
                                            ariaDescribedBy={describedBy}
                                            autoComplete={index === 0 ? "one-time-code" : "off"}
                                            onFocusIndex={focusIndex}
                                            onInputChange={handleInputChange}
                                            onInputKeyDown={handleInputKeyDown}
                                            onInputPaste={handleInputPaste}
                                            onInputBlur={handleInputBlur}
                                            ref={inputRefSetters[index]}
                                        />
                                        {shouldRenderBoxSeparator && (
                                            <span
                                                aria-hidden="true"
                                                className={separatorClassName || undefined}
                                                data-separator
                                            >
                                                {separator}
                                            </span>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </span>
                        {shouldRenderGroupSeparator && (
                            <span
                                aria-hidden="true"
                                className={groupSeparatorClassName || undefined}
                                data-group-separator
                            >
                                {groupSeparator}
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
};
