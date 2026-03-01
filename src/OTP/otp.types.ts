import type { FocusEvent, HTMLAttributes, KeyboardEvent, ReactNode } from "react";

export type OTPFinalMode = "numeric" | "text";

export type OTPFinalItem = {
    id: string;
    value: string;
};

export type OTPStateStyles = {
    base?: string;
    active?: string;
    error?: string;
    disabled?: string;
};

export type OTPClasses = {
    container?: OTPStateStyles;
    boxGroup?: OTPStateStyles;
    boxContainer?: OTPStateStyles;
    boxValue?: OTPStateStyles;
    boxPlaceholder?: OTPStateStyles;
    boxSeparator?: OTPStateStyles;
    groupSeparator?: OTPStateStyles;
};

export type OTPFinalProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
    name: string;
    value?: string;
    defaultValue?: string;
    length?: number;
    mode?: OTPFinalMode;
    type?: "text" | "password";
    mask?: string;
    placeholder?: string;
    separator?: ReactNode;
    groupSeparator?: ReactNode;
    separatorEvery?: number;
    isDisabled?: boolean;
    hasError?: boolean;
    classes?: OTPClasses;
    groupLabelId?: string;
    groupAriaLabel?: string;
    describedBy?: string;
    inputAriaLabel?: string;
    onChange?: (value: string) => void;
    onManualComplete?: () => void | Promise<void>;
    onEnter?: (value: string, event: KeyboardEvent<HTMLInputElement>) => void;
};

export type OTPFinalBoxProps = {
    id: string;
    index: number;
    value: string;
    isActive: boolean;
    isDisabled: boolean;
    hasError: boolean;
    inputType: "text" | "password";
    inputMode: "numeric" | "text";
    className?: string;
    valueClassName?: string;
    placeholder?: string;
    ariaLabel: string;
    ariaDescribedBy?: string;
    autoComplete?: string;
    onFocusIndex: (index: number) => void;
    onInputChange: (index: number, rawValue: string, caretPosition: number | null) => void;
    onInputKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
    onInputPaste: (index: number, text: string) => void;
    onInputBlur: (event: FocusEvent<HTMLInputElement>) => void;
};
