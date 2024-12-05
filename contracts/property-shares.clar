;; Define the property shares token
(define-fungible-token property-shares)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-insufficient-shares (err u101))
(define-constant err-property-exists (err u102))
(define-constant err-property-not-found (err u103))
(define-constant err-invalid-shares (err u104))

;; Property data structure
(define-map properties
    principal
    {
        address: (string-ascii 100),
        total-shares: uint,
        price-per-share: uint,
        available-shares: uint
    }
)

;; Add a new property (only owner)
(define-public (add-property (property-address (string-ascii 100)) (total-shares uint) (price-per-share uint))
    (let ((property-data {
            address: property-address,
            total-shares: total-shares,
            price-per-share: price-per-share,
            available-shares: total-shares
        }))
        (if (is-eq tx-sender contract-owner)
            (match (map-insert properties tx-sender property-data)
                true (begin
                    (try! (ft-mint? property-shares total-shares tx-sender))
                    (ok true))
                false err-property-exists)
            err-owner-only)))

;; Purchase shares of a property
(define-public (purchase-shares (property-owner principal) (shares uint))
    (let (
        (property (unwrap! (map-get? properties property-owner) err-property-not-found))
        (total-cost (* shares (get price-per-share property)))
    )
    (if (<= shares (get available-shares property))
        (begin
            (try! (ft-transfer? property-shares shares property-owner tx-sender))
            (map-set properties property-owner
                (merge property { available-shares: (- (get available-shares property) shares) }))
            (ok true))
        err-insufficient-shares)))

;; Transfer shares to another user
(define-public (transfer-shares (recipient principal) (shares uint))
    (let ((sender-balance (ft-get-balance property-shares tx-sender)))
        (if (>= sender-balance shares)
            (begin
                (try! (ft-transfer? property-shares shares tx-sender recipient))
                (ok true))
            err-insufficient-shares)))

;; Read only functions
(define-read-only (get-property-details (property-owner principal))
    (ok (map-get? properties property-owner)))

(define-read-only (get-share-balance (owner principal))
    (ok (ft-get-balance property-shares owner)))

(define-read-only (get-available-shares (property-owner principal))
    (match (map-get? properties property-owner)
        property (ok (get available-shares property))
        err-property-not-found))
