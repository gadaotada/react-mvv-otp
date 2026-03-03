import { useMemo, useState } from "react";
import type { FocusEvent } from "react";
import { OtpInput } from "../OTP/otp.main";
import styles from "./otp.examples.module.css";

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
const backupMaskByIndex = ["a", "#", "$", "X", "l", "]", "*", ""] as const;

export const OtpExamples = () => {
    const [smsCode, setSmsCode] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [backupCode, setBackupCode] = useState("");
    const [readonlyCode, setReadonlyCode] = useState("927411");
    const [isAutoLockEditable, setIsAutoLockEditable] = useState(false);
    const [lastEvent, setLastEvent] = useState("none");

    const authHasError = useMemo(() => authCode.length > 0 && authCode.length < 6, [authCode]);
    const authHelperId = "otp-auth-helper";
    const autoLockHelperId = "otp-autolock-helper";

    const handleAutoLockBlur = (event: FocusEvent<HTMLDivElement>) => {
        const nextFocused = event.relatedTarget as Node | null;
        if (nextFocused && event.currentTarget.contains(nextFocused)) {
            return;
        }
        setIsAutoLockEditable(false);
    };

    return (
        <section className={styles.wrapper}>
            <article className={styles.card}>
                <h2 className={styles.title}>SMS Verification (6 digits)</h2>
                <p className={styles.hint}>Typical phone verification flow.</p>
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
                />
                <p id="sms-hint" className={styles.meta}>Value: {smsCode || "(empty)"}</p>
                <div className={styles.actions}>
                    <button className={styles.button} type="button" onClick={() => setSmsCode("")}>Clear</button>
                    <button className={styles.button} type="button" onClick={() => setSmsCode("428137")}>Fill 428137</button>
                </div>
            </article>

            <article className={styles.card}>
                <h2 className={styles.title}>Authenticator App (3-3 grouped)</h2>
                <p className={styles.hint}>Grouped display with validation error styling.</p>
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
                    describedBy={authHelperId}
                />
                <p className={styles.meta}>Value: {authCode || "(empty)"}</p>
                <p id={authHelperId} className={authHasError ? styles.metaError : styles.meta}>
                    {authHasError ? "Enter all 6 digits to continue." : "Looks good."}
                </p>
                <div className={styles.actions}>
                    <button className={styles.button} type="button" onClick={() => setAuthCode("")}>Clear</button>
                    <button className={styles.button} type="button" onClick={() => setAuthCode("120934")}>Fill 120934</button>
                </div>
            </article>

            <article className={styles.card}>
                <h2 className={styles.title}>Backup Code (Alphanumeric + Masked)</h2>
                <p className={styles.hint}>Text mode with masking. Locked until user enables editing, auto-locks on blur.</p>
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
                    describedBy={autoLockHelperId}
                    onBlur={handleAutoLockBlur}
                />
                <p className={styles.meta}>Value: {backupCode || "(empty)"}</p>
                <p className={styles.meta}>Last event: {lastEvent}</p>
                <p id={autoLockHelperId} className={styles.meta}>
                    {isAutoLockEditable ? "Editing enabled. Blur locks it again." : "Locked. Click Enable Edit."}
                </p>
                <div className={styles.actions}>
                    <button className={styles.button} type="button" onClick={() => setBackupCode("")}>Clear</button>
                    <button className={styles.button} type="button" onClick={() => setBackupCode("A1B2C3D4")}>Fill A1B2C3D4</button>
                    <button className={styles.button} type="button" onClick={() => setIsAutoLockEditable(true)}>
                        Enable Edit
                    </button>
                </div>
            </article>

            <article className={styles.card}>
                <h2 className={styles.title}>Read-Only Session Code (Disabled)</h2>
                <p className={styles.hint}>Server-generated value shown as disabled input group.</p>
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
                />
                <p className={styles.meta}>Value: {readonlyCode}</p>
                <div className={styles.actions}>
                    <button className={styles.button} type="button" onClick={() => setReadonlyCode("483920")}>
                        Rotate Code
                    </button>
                </div>
            </article>
        </section>
    );
};
