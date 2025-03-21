;; Usage Optimization Contract
;; Determines ideal charging and discharging times

(define-data-var admin principal tx-sender)

;; Energy price data structure
(define-map energy-prices
  { time-slot: uint }
  { price: uint }
)

;; Battery usage schedule
(define-map usage-schedule
  { battery-id: uint, day: uint }
  {
    charge-start: uint,
    charge-end: uint,
    discharge-start: uint,
    discharge-end: uint
  }
)

;; Set energy price for a time slot
(define-public (set-energy-price (time-slot uint) (price uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u1))
    (map-set energy-prices
      { time-slot: time-slot }
      { price: price }
    )
    (ok true)
  )
)

;; Get energy price for a time slot
(define-read-only (get-energy-price (time-slot uint))
  (default-to { price: u0 } (map-get? energy-prices { time-slot: time-slot }))
)

;; Set usage schedule for a battery
(define-public (set-usage-schedule
                (battery-id uint)
                (day uint)
                (charge-start uint)
                (charge-end uint)
                (discharge-start uint)
                (discharge-end uint))
  (begin
    ;; In a real implementation, we would check if the user has rights to this battery
    (asserts! (< charge-start charge-end) (err u2))
    (asserts! (< discharge-start discharge-end) (err u3))

    (map-set usage-schedule
      { battery-id: battery-id, day: day }
      {
        charge-start: charge-start,
        charge-end: charge-end,
        discharge-start: discharge-start,
        discharge-end: discharge-end
      }
    )
    (ok true)
  )
)

;; Get usage schedule for a battery
(define-read-only (get-usage-schedule (battery-id uint) (day uint))
  (map-get? usage-schedule { battery-id: battery-id, day: day })
)

;; Calculate optimal charge time based on energy prices
;; This is a simplified version - a real implementation would be more complex
(define-read-only (calculate-optimal-charge-time (hours uint))
  (let ((current-time u0)
        (best-time u0)
        (best-price u999999))
    ;; In a real implementation, this would be a more sophisticated algorithm
    ;; that considers multiple factors
    (ok best-time)
  )
)
