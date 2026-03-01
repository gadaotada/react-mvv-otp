import { forwardRef, memo, useCallback } from "react";
import type { ChangeEvent, ClipboardEvent, FocusEvent, KeyboardEvent } from "react";
import type { OTPFinalBoxProps } from "./otp.types";
import { cx } from "./otp.helpers";

const BoxComponent = forwardRef<HTMLInputElement, OTPFinalBoxProps>(({
    id,
    index,
    value,
    isActive,
    isDisabled,
    hasError,
    inputType,
    inputMode,
    className,
    valueClassName,
    placeholder,
    ariaLabel,
    ariaDescribedBy,
    autoComplete,
    onFocusIndex,
    onInputChange,
    onInputKeyDown,
    onInputPaste,
    onInputBlur,
}, ref) => {
    const handleFocus = useCallback(() => {
        onFocusIndex(index);
    }, [index, onFocusIndex]);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onInputChange(index, event.target.value, event.target.selectionStart);
    }, [index, onInputChange]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        onInputKeyDown(index, event);
    }, [index, onInputKeyDown]);

    const handlePaste = useCallback((event: ClipboardEvent<HTMLInputElement>) => {
        onInputPaste(index, event.clipboardData.getData("text"));
        event.preventDefault();
    }, [index, onInputPaste]);


    const handleBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
        onInputBlur(event);
    }, [onInputBlur]);

    return (
        <input
            ref={ref}
            id={id}
            value={value}
            type={inputType}
            inputMode={inputMode}
            disabled={isDisabled}
            autoComplete={autoComplete}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={hasError || undefined}
            data-active={isActive || undefined}
            data-has-value={value ? true : undefined}
            data-disabled={isDisabled || undefined}
            data-error={hasError || undefined}
            data-placeholder={(!value && !!placeholder) || undefined}
            className={cx(className, valueClassName) || undefined}
            placeholder={placeholder}
            onFocus={handleFocus}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={handleBlur}
        />
    );
});

export const BoxFinal = memo(BoxComponent);
