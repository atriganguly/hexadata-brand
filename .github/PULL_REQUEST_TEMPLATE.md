## What and why

<!-- One or two sentences. Link the issue. -->

## Type

- [ ] Fix or improvement (no brand value changes)
- [ ] Additive feature (new token, component or output; no renamed or removed public names)
- [ ] Brand change (approved by the brand owner: link the approval)
- [ ] Docs, tests or tooling only

## Checklist

- [ ] I did not hand-edit any file headed `GENERATED FILE` (changed `brand/` or an emitter, then ran `npm run generate`)
- [ ] `generate:check`, `typecheck`, `lint`, `format:check` and `npm test` pass locally
- [ ] If shipped code changed: `build`, `build:fonts`, `build:logos`, `test:dist`, `test:e2e`, `test:site` and `verify:release` pass
- [ ] No brand value was invented or inferred; no contrast pair was loosened
- [ ] No new runtime dependency, network call, storage, inline style or third-party URL in shipped code
- [ ] Public names only grew (contract test), or this is a documented major change
- [ ] `CHANGELOG.md` updated
- [ ] Brand-affecting change: PDF (`build:pdf`), Figma sync state and Claude design system state updated, or listed below as follow-ups

## Not verified / follow-ups

<!-- Be honest about anything you could not run. -->
