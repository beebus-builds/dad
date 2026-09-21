package rbac

// This permission set mirrors frontend/src/lib/rbac.ts (PERMISSIONS /
// ROLE_PERMISSIONS) exactly — the two need to stay in lockstep since the
// frontend gates UI visibility per role and the backend gates API access per
// permission string; a divergence means either a button that 403s or an
// endpoint that's reachable but hidden.
const (
	PermMembersRead       = "members:read"
	PermMembersWrite      = "members:write"
	PermMembersDelete     = "members:delete"
	PermComplaintsRead    = "complaints:read"
	PermComplaintsWrite   = "complaints:write"
	PermComplaintsResolve = "complaints:resolve"
	PermEventsRead        = "events:read"
	PermEventsWrite       = "events:write"
	PermEventsPublish     = "events:publish"
	PermNewsRead          = "news:read"
	PermNewsWrite         = "news:write"
	PermNewsPublish       = "news:publish"
	PermDocumentsRead     = "documents:read"
	PermDocumentsWrite    = "documents:write"
	PermDonationsRead     = "donations:read"
	PermDonationsWrite    = "donations:write"
	PermLegalRead         = "legal:read"
	PermLegalWrite        = "legal:write"
	PermTrainingRead      = "training:read"
	PermTrainingWrite     = "training:write"
	PermIncidentsRead     = "incidents:read"
	PermIncidentsWrite    = "incidents:write"
	PermReportsView       = "reports:view"
	PermSettingsManage    = "settings:manage"
	PermAuditView         = "audit:view"
	PermUsersManage       = "users:manage"
	PermBranchesManage    = "branches:manage"
	PermCampaignsRead     = "campaigns:read"
	PermCampaignsWrite    = "campaigns:write"

	// PermPagesManage/PermMenuManage gate the site page-builder — no
	// frontend-visible role currently distinguishes these from user
	// management, so /pages and /menus stay gated by PermUsersManage in the
	// router (unchanged from before this file was rewritten).
	PermPagesManage = "pages:manage"
	PermMenuManage  = "menu:manage"
)

var allPerms = []string{
	PermMembersRead, PermMembersWrite, PermMembersDelete,
	PermComplaintsRead, PermComplaintsWrite, PermComplaintsResolve,
	PermEventsRead, PermEventsWrite, PermEventsPublish,
	PermNewsRead, PermNewsWrite, PermNewsPublish,
	PermDocumentsRead, PermDocumentsWrite,
	PermDonationsRead, PermDonationsWrite,
	PermLegalRead, PermLegalWrite,
	PermTrainingRead, PermTrainingWrite,
	PermIncidentsRead, PermIncidentsWrite,
	PermReportsView, PermSettingsManage, PermAuditView,
	PermUsersManage, PermBranchesManage,
	PermPagesManage, PermMenuManage,
	PermCampaignsRead, PermCampaignsWrite,
}

var nationalAdminPerms = []string{
	PermMembersRead, PermMembersWrite, PermMembersDelete,
	PermComplaintsRead, PermComplaintsWrite, PermComplaintsResolve,
	PermEventsRead, PermEventsWrite, PermEventsPublish,
	PermNewsRead, PermNewsWrite, PermNewsPublish,
	PermDocumentsRead, PermDocumentsWrite,
	PermDonationsRead, PermDonationsWrite,
	PermLegalRead, PermLegalWrite,
	PermTrainingRead, PermTrainingWrite,
	PermIncidentsRead, PermIncidentsWrite,
	PermReportsView, PermAuditView,
	PermUsersManage, PermBranchesManage,
	PermCampaignsRead, PermCampaignsWrite,
}

var provinceAdminPerms = []string{
	PermMembersRead, PermMembersWrite,
	PermComplaintsRead, PermComplaintsWrite, PermComplaintsResolve,
	PermEventsRead, PermEventsWrite,
	PermNewsRead, PermNewsWrite,
	PermDocumentsRead, PermDocumentsWrite,
	PermDonationsRead,
	PermLegalRead, PermLegalWrite,
	PermTrainingRead,
	PermIncidentsRead, PermIncidentsWrite,
	PermReportsView,
}

var districtAdminPerms = []string{
	PermMembersRead, PermMembersWrite,
	PermComplaintsRead, PermComplaintsWrite,
	PermEventsRead, PermEventsWrite,
	PermNewsRead,
	PermDocumentsRead,
	PermLegalRead,
	PermIncidentsRead, PermIncidentsWrite,
	PermReportsView,
}

var branchAdminPerms = []string{
	PermMembersRead, PermMembersWrite,
	PermComplaintsRead, PermComplaintsWrite,
	PermEventsRead,
	PermNewsRead,
	PermDocumentsRead,
	PermIncidentsRead, PermIncidentsWrite,
}

// memberPerms deliberately excludes PermMembersRead — a plain member has no
// business listing the full membership roster; their own profile is served
// via /auth/me and /public/members/:id, not the admin /members endpoints.
var memberPerms = []string{
	PermComplaintsRead, PermComplaintsWrite,
	PermEventsRead,
	PermNewsRead,
	PermDocumentsRead,
	PermLegalRead,
	PermTrainingRead,
}

var publicPerms = []string{
	PermNewsRead, PermEventsRead,
}

func PermissionsForRole(role string) []string {
	switch role {
	case "SUPER_ADMIN":
		return allPerms
	case "NATIONAL_ADMIN":
		return nationalAdminPerms
	case "PROVINCE_ADMIN":
		return provinceAdminPerms
	case "DISTRICT_ADMIN":
		return districtAdminPerms
	case "BRANCH_ADMIN":
		return branchAdminPerms
	case "MEMBER":
		return memberPerms
	case "PUBLIC":
		return publicPerms
	default:
		return []string{}
	}
}

func HasPermission(perms []string, required string) bool {
	for _, p := range perms {
		if p == required {
			return true
		}
	}
	return false
}

func HasAny(perms []string, required ...string) bool {
	for _, r := range required {
		if HasPermission(perms, r) {
			return true
		}
	}
	return false
}
