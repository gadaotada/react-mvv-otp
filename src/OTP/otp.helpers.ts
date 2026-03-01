import type { OTPFinalItem, OTPFinalMode, OTPStateStyles } from "./otp.types";

export const cx = (...parts: Array<string | false | null | undefined>) =>
    parts.filter(Boolean).join(" ");

export const resolveClass = (
    styles: OTPStateStyles | undefined,
    state: { isActive: boolean; hasError: boolean; isDisabled: boolean },
) =>
    cx(
        styles?.base,
        state.isActive && styles?.active,
        state.hasError && styles?.error,
        state.isDisabled && styles?.disabled,
    );

export const isAllowedChar = (mode: OTPFinalMode, char: string) => {
    if (mode === "numeric") return /^\d$/.test(char);
    return /^[a-zA-Z0-9]$/.test(char);
};

export const sanitize = (value: string | undefined, mode: OTPFinalMode, length: number) =>
    Array.from(value ?? "").filter((char) => isAllowedChar(mode, char)).slice(0, length);

export const createItems = (
    ids: string[],
    value: string | undefined,
    mode: OTPFinalMode,
): OTPFinalItem[] => {
    const chars = sanitize(value, mode, ids.length);
    return ids.map((id, index) => ({ id, value: chars[index] ?? "" }));
};

export const findFirstEmpty = (items: OTPFinalItem[]) => {
    const index = items.findIndex((item) => !item.value);
    return index < 0 ? items.length - 1 : index;
};
