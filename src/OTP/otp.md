# OtpInput Guide

## Import

```tsx
import { OtpInput } from "./OTP/otp.main";
```

or from index:

```tsx
import { OtpInput } from "./OTP";
```

---

## Basic Usage (Uncontrolled)

```tsx
<OtpInput
  name="otp-login"
  length={6}
  mode="numeric"
/>
```

---

## Controlled Usage

```tsx
const [otp, setOtp] = useState("");

<OtpInput
  name="otp-login"
  value={otp}
  onChange={setOtp}
  onManualComplete={() => {
    console.log("user filled all boxes");
  }}
  onEnter={(value) => {
    console.log("enter pressed with full value:", value);
  }}
/>;
```

---

## Props

- `name: string` (required)
- `value?: string` controlled value
- `defaultValue?: string` uncontrolled initial value
- `length?: number` default `6`
- `mode?: "numeric" | "text"` default `"numeric"`
  - `numeric`: digits only
  - `text`: `a-zA-Z0-9`
- `type?: "text" | "password"` default `"text"`
- `mask?: string | readonly string[]`
  - single symbol for all boxes: `mask="x"`
  - per-index symbols: `mask={["d", "c", "x"] as const}`
  - when `length` is a literal, tuple mask length is type-checked against it
- `placeholder?: string` per-box placeholder characters (ex: `"123456"`)
- `separator?: ReactNode` separator between boxes
- `groupSeparator?: ReactNode` separator between groups
- `separatorEvery?: number` group size
- `isDisabled?: boolean`
- `hasError?: boolean`
- `classes?: OTPClasses`
- `groupLabelId?: string`
- `groupAriaLabel?: string`
- `describedBy?: string`
- `inputAriaLabel?: string`
- `onChange?: (value: string) => void`
- `onManualComplete?: () => void | Promise<void>` fired when user input fills all boxes
- `onEnter?: (value: string, event: KeyboardEvent<HTMLInputElement>) => void`

---

## Grouping and Separators

```tsx
<OtpInput
  name="otp-grouped"
  length={6}
  separator="-"
  separatorEvery={3}
  groupSeparator="<>"
/>
```

Example layout with `length={6}` and `separatorEvery={2}`:

`[] [] <> [] [] <> [] []`

---

## Styling

`classes` supports state-aware style variants:

```tsx
<OtpInput
  name="otp-styled"
  classes={{
    container: { base: "otp-root" },
    boxGroup: { base: "otp-group" },
    boxContainer: {
      base: "otp-box",
      active: "otp-box-active",
      error: "otp-box-error",
      disabled: "otp-box-disabled",
    },
    boxValue: { base: "otp-box-value" },
    boxPlaceholder: { base: "otp-box-placeholder" },
    boxSeparator: { base: "otp-separator" },
    groupSeparator: { base: "otp-group-separator" },
  }}
/>
```

State flags:

- active box: `active`
- error state: `error`
- disabled state: `disabled`

---

## Accessibility

Container:

- `role="group"`
- `aria-label` via `groupAriaLabel` (fallback)
- `aria-labelledby` via `groupLabelId`
- `aria-describedby` via `describedBy`

Inputs:

- each input gets `aria-label` based on `inputAriaLabel` + index
- `aria-invalid` reflects `hasError`
- first input uses `autoComplete="one-time-code"`

Suggested setup:

```tsx
<>
  <p id="otp-help">Enter the 6-digit code we sent to your phone.</p>
  <OtpInput
    name="otp-a11y"
    describedBy="otp-help"
    groupAriaLabel="Verification code"
    inputAriaLabel="Verification digit"
  />
</>
```

---

## Keyboard Behavior

- typing valid char: writes current box, moves right
- special case: typing in the last box jumps to the lowest empty box on the left (if any)
- `Backspace` / `Delete`: same behavior in this implementation
  - clear current if it has value
  - otherwise move left
- `ArrowLeft` / `ArrowRight`: manual navigation
- `Tab` / `Shift+Tab`: move inside OTP until edge
- `Enter`: triggers `onEnter` only when all boxes are filled

---

## Notes

- Controlled mode: pass `value` + `onChange`.
- Uncontrolled mode: use `defaultValue`.
- Input is sanitized by `mode`.
- If `type="password"` or `mask` is set, display is masked.
- `mask` arrays are resolved by index (`mask[index]`).

---

## Real-World Examples

Actual snippets from `src/OTP-examples/otp.examples.tsx`.

Shared classes object:

```tsx
const otpClasses = {
  container: { base: styles.otpRoot },
  boxContainer: {
    base: styles.otpBox,
    active: styles.otpBoxActive,
    error: styles.otpBoxError,
    disabled: styles.otpBoxDisabled,
  },
  boxValue: { base: styles.otpValue },
  boxSeparator: { base: styles.boxSeparator },
  groupSeparator: { base: styles.groupSeparator },
};

const smsOtpClasses = {
  ...otpClasses,
  container: { base: `${styles.otpRoot} ${styles.smsRoot}` },
};
```

### 1) SMS Verification (numeric)

```tsx
const [smsCode, setSmsCode] = useState("");

<OtpInput
  name="otp-example-sms"
  length={6}
  mode="numeric"
  value={smsCode}
  onChange={setSmsCode}
  onManualComplete={() => setLastEvent("sms-complete")}
  onEnter={(value) => setLastEvent(`sms-enter:${value}`)}
  classes={smsOtpClasses}
  describedBy="sms-hint"
/>;
```

### 2) Authenticator App (3-3 grouped + error state)

```tsx
const [authCode, setAuthCode] = useState("");
const authHasError = authCode.length > 0 && authCode.length < 6;

<OtpInput
  name="otp-example-auth-app"
  length={6}
  mode="numeric"
  value={authCode}
  placeholder="000000"
  separator=""
  separatorEvery={3}
  groupSeparator=":"
  hasError={authHasError}
  onChange={setAuthCode}
  onManualComplete={() => setLastEvent("auth-complete")}
  onEnter={(value) => setLastEvent(`auth-enter:${value}`)}
  classes={otpClasses}
  describedBy="otp-auth-helper"
/>;
```

### 3) Backup Code (text + per-index mask + auto-lock on blur)

```tsx
const [backupCode, setBackupCode] = useState("");
const [isAutoLockEditable, setIsAutoLockEditable] = useState(false);
const backupMaskByIndex = ["•", "•", "*", "*", "#", "#", "x", "x"] as const;

const handleAutoLockBlur = (event: FocusEvent<HTMLDivElement>) => {
  const nextFocused = event.relatedTarget as Node | null;
  if (nextFocused && event.currentTarget.contains(nextFocused)) return;
  setIsAutoLockEditable(false);
};

<OtpInput
  name="otp-example-backup"
  length={8}
  mode="text"
  type="password"
  mask={backupMaskByIndex}
  value={backupCode}
  isDisabled={!isAutoLockEditable}
  separator="-"
  separatorEvery={4}
  groupSeparator="|"
  placeholder="A1B2C3D4"
  onChange={(next) => setBackupCode(next.toUpperCase())}
  onManualComplete={() => setLastEvent("backup-complete")}
  onEnter={(value) => setLastEvent(`backup-enter:${value}`)}
  classes={otpClasses}
  describedBy="otp-autolock-helper"
  onBlur={handleAutoLockBlur}
/>;
```

### 4) Read-only Session Code (disabled)

```tsx
const [readonlyCode, setReadonlyCode] = useState("927411");

<OtpInput
  name="otp-example-readonly"
  length={6}
  mode="numeric"
  value={readonlyCode}
  isDisabled={true}
  separator=""
  separatorEvery={3}
  groupSeparator="•"
  classes={otpClasses}
/>;
```
