# CHANGELOG — YieldBox

## [2.0.0] — 2026-02-19

### Added
- **Rewards System**: Time-weighted mining simulation (~5% per 144 blocks).
- **Auto-Compounding**: Stakes compound automatically every cycle.
- **Lockup Period**: 10-cycle withdrawal penalty applied to early exits.
- **Read-Only**: `get-pending-rewards` estimates claimable amounts.
- **SDK**: TypeScript client with full staking lifecycle management.

### Changed
- **Withdrawals**: Now subject to penalty check (`< 1440 blocks`).
- **Claim Logic**: Requires active stake balance > 0.

---

## [1.0.0] — 2026-02-10

### Added
- Basic deposit and withdrawal functionality.
