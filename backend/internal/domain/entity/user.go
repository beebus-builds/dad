package entity

import "time"

const (
	RoleSuperAdmin     = "SUPER_ADMIN"
	RoleNationalAdmin  = "NATIONAL_ADMIN"
	RoleProvinceAdmin  = "PROVINCE_ADMIN"
	RoleDistrictAdmin  = "DISTRICT_ADMIN"
	RoleBranchAdmin    = "BRANCH_ADMIN"
	RoleMember         = "MEMBER"
	RolePublic         = "PUBLIC"
)

var AllRoles = []string{
	RoleSuperAdmin,
	RoleNationalAdmin,
	RoleProvinceAdmin,
	RoleDistrictAdmin,
	RoleBranchAdmin,
	RoleMember,
	RolePublic,
}

type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	FullName     string    `json:"fullName" db:"full_name"`
	Phone        *string   `json:"phone,omitempty" db:"phone"`
	AvatarURL    *string   `json:"avatarUrl,omitempty" db:"avatar_url"`
	Role         string    `json:"role" db:"role"`
	BranchID     *string   `json:"branchId,omitempty" db:"branch_id"`
	ProvinceCode *string   `json:"provinceCode,omitempty" db:"province_code"`
	DistrictCode *string   `json:"districtCode,omitempty" db:"district_code"`
	IsActive     bool      `json:"isActive" db:"is_active"`
	LastLoginAt  *time.Time `json:"lastLoginAt,omitempty" db:"last_login_at"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}
