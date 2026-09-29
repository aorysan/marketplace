# scripts/bin — engine binaries

This directory is where the `impeccable` launcher (`../impeccable`,
`../impeccable.cmd`) looks for a pre-bundled engine binary, before it
falls back to `~/.impeccable/bin`, `PATH`, and finally a network
download from `https://github.com/pbakaus/impeccable/releases`.

**This directory must be populated at packaging time**, one binary per
supported platform, at:

- `bin/darwin-arm64/impeccable`
- `bin/darwin-x64/impeccable`
- `bin/linux-arm64/impeccable`
- `bin/linux-x64/impeccable`
- `bin/windows-arm64/impeccable.exe`
- `bin/windows-x64/impeccable.exe`

Each binary must match the release tagged `engine-v<version in
../VERSION>` in the releases repo above (the launcher does not check
this at runtime — only the version-pinned download path is checksum
verified, not a binary placed directly under `bin/`).

Without these files, `scripts/impeccable context` and every other verb
require either network egress (to download and sha256-verify the
binary into `~/.impeccable/bin`) or a preinstalled binary reachable via
`$IMPECCABLE_BIN` or `PATH`. In network-isolated sandboxes, this means
the skill's Setup step 1 will fail with `impeccable: no engine binary
for <os>-<arch> found...` and the SKILL.md Setup section's "Launcher
unavailable" fallback path takes over instead.

Do not commit a placeholder or empty file directly at one of the paths
above — the launcher only checks `[ -x "$bin" ]`, so any executable
file there is treated as the real engine and exec'd.
