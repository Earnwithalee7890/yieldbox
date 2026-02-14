;; Yieldbox - DeFi Vaults
;; Users deposit STX to earn yield from auto-compounding strategies.

(define-constant err-insufficient-funds (err u100))
(define-constant err-min-deposit (err u101))

(define-map user-shares principal uint)
(define-data-var total-shares uint u0)
(define-data-var total-assets uint u0)

(define-public (deposit (amount uint))
    (let
        (
            (shares (calculate-shares amount))
            (sender tx-sender)
        )
        (asserts! (> amount u1000000) err-min-deposit)
        
        ;; Transfer STX to vault
        (try! (stx-transfer? amount sender (as-contract tx-sender)))
        
        ;; Mint shares
        (map-set user-shares sender (+ (get-shares sender) shares))
        (var-set total-shares (+ (var-get total-shares) shares))
        (var-set total-assets (+ (var-get total-assets) amount))
        
        (ok shares)
    )
)

(define-public (withdraw (shares uint))
    (let
        (
            (amount (calculate-assets shares))
            (sender tx-sender)
        )
        (asserts! (<= shares (get-shares sender)) err-insufficient-funds)
        
        ;; Burn shares
        (map-set user-shares sender (- (get-shares sender) shares))
        (var-set total-shares (- (var-get total-shares) shares))
        (var-set total-assets (- (var-get total-assets) amount))
        
        ;; Transfer STX back
        (as-contract (stx-transfer? amount tx-sender sender))
    )
)

(define-read-only (get-shares (user principal))
    (default-to u0 (map-get? user-shares user))
)

(define-read-only (calculate-shares (amount uint))
    (if (is-eq (var-get total-shares) u0)
        amount
        (/ (* amount (var-get total-shares)) (var-get total-assets))
    )
)

(define-read-only (calculate-assets (shares uint))
    (if (is-eq (var-get total-shares) u0)
        u0
        (/ (* shares (var-get total-assets)) (var-get total-shares))
    )
)

;; Simulate yield generation (admin only in prod)
(define-public (harvest-yield)
    (begin
        (var-set total-assets (+ (var-get total-assets) u5000000)) ;; Add 5 STX "yield"
        (ok true)
    )
)
