# Custom OTP (Built For My Needs)

Custom OTP input component built with React + TypeScript.

## What It Supports

- controlled + uncontrolled usage
- numeric and text modes
- grouped boxes + custom separators
- shared disabled/error states
- custom mask / password-like display
- keyboard navigation + paste handling
- callback hooks: `onChange`, `onManualComplete`, `onEnter`
- styling through class variants

## Project Structure

- OTP core component: `src/OTP`
- usage examples + responsive styles: `src/OTP-examples`
- demo app entry: `src/App.tsx`

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- main OTP docs and prop guide: `src/OTP/otp.md`
- examples are intentionally separate from core OTP logic
