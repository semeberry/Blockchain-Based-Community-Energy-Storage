;; Capacity Sharing Contract
;; Manages allocation of storage among participants

(define-data-var admin principal tx-sender)

;; Allocation structure
(define-map allocations
  { user: principal, battery-id: uint }
  {
    allocated-capacity: uint,
    start-time: uint,
    end-time: uint,
    active: bool
  }
)

;; Request allocation of capacity
(define-public (request-allocation
                (battery-id uint)
                (requested-capacity uint)
                (start-time uint)
                (end-time uint))
  (begin
    (asserts! (> requested-capacity u0) (err u1))
    (asserts! (< start-time end-time) (err u2))

    ;; In a real implementation, we would check available capacity
    ;; and possibly implement a payment mechanism

    (map-set allocations
      { user: tx-sender, battery-id: battery-id }
      {
        allocated-capacity: requested-capacity,
        start-time: start-time,
        end-time: end-time,
        active: true
      }
    )
    (ok true)
  )
)

;; Get user's allocation for a specific battery
(define-read-only (get-allocation (user principal) (battery-id uint))
  (map-get? allocations { user: user, battery-id: battery-id })
)

;; Cancel allocation
(define-public (cancel-allocation (battery-id uint))
  (let ((allocation (unwrap! (map-get? allocations { user: tx-sender, battery-id: battery-id }) (err u3))))
    (begin
      (map-set allocations
        { user: tx-sender, battery-id: battery-id }
        (merge allocation { active: false })
      )
      (ok true)
    )
  )
)

;; Check if a user has active allocation
(define-read-only (has-active-allocation (user principal) (battery-id uint))
  (match (map-get? allocations { user: user, battery-id: battery-id })
    allocation (get active allocation)
    false
  )
)
