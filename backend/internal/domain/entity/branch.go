package entity

import "time"

type Branch struct {
	ID           string    `json:"id" db:"id"`
	Name         string    `json:"name" db:"name"`
	NameNepali   *string   `json:"nameNepali,omitempty" db:"name_nepali"`
	ProvinceCode string    `json:"provinceCode" db:"province_code"`
	DistrictCode string    `json:"districtCode" db:"district_code"`
	Address      *string   `json:"address,omitempty" db:"address"`
	ContactEmail *string   `json:"contactEmail,omitempty" db:"contact_email"`
	ContactPhone *string   `json:"contactPhone,omitempty" db:"contact_phone"`
	IsActive     bool      `json:"isActive" db:"is_active"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}
