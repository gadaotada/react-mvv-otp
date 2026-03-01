import type { OTPFinalItem } from "./otp.types";

export type OtpFinalState = {
    items: OTPFinalItem[];
    activeIndex: number;
};

export type OtpFinalAction =
    | { type: "SYNC_FROM_VALUE"; items: OTPFinalItem[]; activeIndex: number }
    | { type: "SET_ACTIVE_INDEX"; activeIndex: number }
    | { type: "SET_TYPED_CHARS"; startIndex: number; chars: string[]; length: number }
    | { type: "CLEAR_OR_MOVE_LEFT"; index: number }
    | { type: "PASTE_ALL"; chars: string[]; length: number };

export const otpFinalReducer = (state: OtpFinalState, action: OtpFinalAction): OtpFinalState => {
    switch (action.type) {
        case "SYNC_FROM_VALUE":
            return { items: action.items, activeIndex: action.activeIndex };
        case "SET_ACTIVE_INDEX":
            return { ...state, activeIndex: action.activeIndex };
        case "SET_TYPED_CHARS": {
            const nextItems = [...state.items];
            let writeIndex = action.startIndex;
            for (let i = 0; i < action.chars.length && writeIndex < action.length; i += 1) {
                nextItems[writeIndex] = { ...nextItems[writeIndex], value: action.chars[i] };
                writeIndex += 1;
            }

            const nextActive = Math.min(writeIndex, action.length - 1);
            return { items: nextItems, activeIndex: nextActive };
        }
        case "CLEAR_OR_MOVE_LEFT": {
            const nextItems = [...state.items];
            if (nextItems[action.index].value) {
                nextItems[action.index] = { ...nextItems[action.index], value: "" };
                return { items: nextItems, activeIndex: action.index };
            }

            return { ...state, activeIndex: Math.max(0, action.index - 1) };
        }
        case "PASTE_ALL": {
            const nextItems = state.items.map((item, index) => ({
                ...item,
                value: action.chars[index] ?? "",
            }));
            return { items: nextItems, activeIndex: action.length - 1 };
        }
        default:
            return state;
    }
};
