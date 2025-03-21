;; Maintenance Fund Contract
;; Manages shared costs for system upkeep

(define-data-var admin principal tx-sender)
(define-data-var fund-balance uint u0)

;; Contribution records
(define-map contributions
  { user: principal }
  { total-contributed: uint }
)

;; Maintenance expense records
(define-map maintenance-expenses
  { expense-id: uint }
  {
    amount: uint,
    description: (string-utf8 100),
    timestamp: uint,
    approved: bool
  }
)

;; Counter for expense IDs
(define-data-var next-expense-id uint u1)

;; Contribute to the maintenance fund
(define-public (contribute (amount uint))
  (begin
    (asserts! (> amount u0) (err u1))

    ;; In a real implementation, this would involve an actual token transfer
    ;; For simplicity, we're just updating the records

    (var-set fund-balance (+ (var-get fund-balance) amount))

    (match (map-get? contributions { user: tx-sender })
      prev-contribution (map-set contributions
                          { user: tx-sender }
                          { total-contributed: (+ (get total-contributed prev-contribution) amount) })
      (map-set contributions
        { user: tx-sender }
        { total-contributed: amount })
    )

    (ok true)
  )
)

;; Get fund balance
(define-read-only (get-fund-balance)
  (var-get fund-balance)
)

;; Get user's total contributions
(define-read-only (get-user-contributions (user principal))
  (default-to { total-contributed: u0 } (map-get? contributions { user: user }))
)

;; Propose a maintenance expense
(define-public (propose-expense
                (amount uint)
                (description (string-utf8 100)))
  (let ((expense-id (var-get next-expense-id)))
    (begin
      (asserts! (> amount u0) (err u2))
      (asserts! (> (len description) u0) (err u3))

      (map-set maintenance-expenses
        { expense-id: expense-id }
        {
          amount: amount,
          description: description,
          timestamp: block-height,
          approved: false
        }
      )

      (var-set next-expense-id (+ expense-id u1))
      (ok expense-id)
    )
  )
)

;; Approve an expense (admin only)
(define-public (approve-expense (expense-id uint))
  (let ((expense (unwrap! (map-get? maintenance-expenses { expense-id: expense-id }) (err u4))))
    (begin
      (asserts! (is-eq tx-sender (var-get admin)) (err u5))
      (asserts! (not (get approved expense)) (err u6))
      (asserts! (<= (get amount expense) (var-get fund-balance)) (err u7))

      (var-set fund-balance (- (var-get fund-balance) (get amount expense)))

      (map-set maintenance-expenses
        { expense-id: expense-id }
        (merge expense { approved: true })
      )

      (ok true)
    )
  )
)

;; Get expense details
(define-read-only (get-expense (expense-id uint))
  (map-get? maintenance-expenses { expense-id: expense-id })
)
