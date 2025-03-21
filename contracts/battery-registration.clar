;; Battery Registration Contract
;; Records details of energy storage systems

(define-data-var admin principal tx-sender)

;; Battery structure
(define-map batteries
  { battery-id: uint }
  {
    owner: principal,
    capacity: uint,
    location: (string-utf8 100),
    installation-date: uint,
    active: bool
  }
)

;; Counter for battery IDs
(define-data-var next-battery-id uint u1)

;; Register a new battery
(define-public (register-battery
                (capacity uint)
                (location (string-utf8 100))
                (installation-date uint))
  (let ((battery-id (var-get next-battery-id)))
    (begin
      (asserts! (> capacity u0) (err u1))
      (asserts! (> (len location) u0) (err u2))
      (map-set batteries
        { battery-id: battery-id }
        {
          owner: tx-sender,
          capacity: capacity,
          location: location,
          installation-date: installation-date,
          active: true
        }
      )
      (var-set next-battery-id (+ battery-id u1))
      (ok battery-id)
    )
  )
)

;; Get battery details
(define-read-only (get-battery (battery-id uint))
  (map-get? batteries { battery-id: battery-id })
)

;; Update battery status
(define-public (update-battery-status (battery-id uint) (active bool))
  (let ((battery (unwrap! (map-get? batteries { battery-id: battery-id }) (err u3))))
    (begin
      (asserts! (is-eq tx-sender (get owner battery)) (err u4))
      (map-set batteries
        { battery-id: battery-id }
        (merge battery { active: active })
      )
      (ok true)
    )
  )
)

;; Update battery capacity
(define-public (update-battery-capacity (battery-id uint) (new-capacity uint))
  (let ((battery (unwrap! (map-get? batteries { battery-id: battery-id }) (err u3))))
    (begin
      (asserts! (is-eq tx-sender (get owner battery)) (err u4))
      (asserts! (> new-capacity u0) (err u5))
      (map-set batteries
        { battery-id: battery-id }
        (merge battery { capacity: new-capacity })
      )
      (ok true)
    )
  )
)
