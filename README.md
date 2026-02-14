# Yieldbox 🌾

**Yieldbox** is a DeFi vault protocol on Stacks. It allows users to deposit STX into pooled strategies that auto-compound yield.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![DeFi](https://img.shields.io/badge/sector-DeFi%20Yield-green)

## How It Works

1.  **Deposit**: Users send STX and receive `Share Tokens` representing their pool ownership.
2.  **Compound**: The protocol generates yield (simulated via `harvest-yield` in this version).
3.  **Withdraw**: Users burn shares to retrieve their principal + earned interest.

## Contract Interface

```clarity
;; Deposit 100 STX
(deposit u100000000)

;; Withdraw 50 Shares
(withdraw u50)

;; Check Balance
(get-shares 'SP2J6...)
```

## Share Calculation
`Shares = (Deposit Amount * Total Shares) / Total Assets`

## License
MIT
