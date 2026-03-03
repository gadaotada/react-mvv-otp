import type { FocusEvent, HTMLAttributes, KeyboardEvent, ReactNode } from "react";

export type OTPMode = "numeric" | "text";
export type OTPMask<L extends number = number> = string | (readonly string[] & { length: NoInfer<L> });

export type OTPItem = {
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

export type OTPProps<L extends number = number> = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
    name: string;
    value?: string;
    defaultValue?: string;
    length?: L;
    mode?: OTPMode;
    type?: "text" | "password";
    mask?: OTPMask<L>;
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

export type OTPBoxProps = {
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
