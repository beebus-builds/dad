package rbac

const (
	PermMembersRead     = "members:read"
	PermMembersWrite    = "members:write"
	PermMembersDelete   = "members:delete"
	PermComplaintsRead  = "complaints:read"
	PermComplaintsWrite = "complaints:write"
	PermComplaintsResolve = "complaints:resolve"
	PermEventsRead      = "events:read"
	PermEventsWrite     = "events:write"
	PermEventsPublish   = "events:publish"
	PermNewsRead        = "news:read"
	PermNewsWrite       = "news:write"
	PermNewsPublish     = "news:publish"
	PermDocumentsRead   = "documents:read"
	PermDocumentsWrite  = "documents:write"
	PermDonationsRead   = "donations:read"
	PermDonationsWrite  = "donations:write"
	PermLegalRead       = "legal:read"
	PermLegalWrite      = "legal:write"
	PermTrainingRead    = "training:read"
	PermTrainingWrite   = "training:write"
	PermIncidentsRead   = "incidents:read"
	PermIncidentsWrite  = "incidents:write"
	PermReportsView     = "reports:view"
	PermSettingsManage  = "settings:manage"
	PermAuditView       = "audit:view"
	PermUsersManage     = "users:manage"
	PermBranchesManage  = "branches:manage"
)

func PermissionsForRole(role string) []string {
	switch role {
	case "SUPER_ADMIN":
		return []string{
			PermMembersRead, PermMembersWrite, PermMembersDelete,
			PermComplaintsRead, PermComplaintsWrite, PermComplaintsResolve,
			PermEventsRead, PermEventsWrite, PermEventsPublish,
			PermNewsRead, PermNewsWrite, PermNewsPublish,
			PermDocumentsRead, PermDocumentsWrite,
			PermDonationsRead, PermDonationsWrite,
			PermLegalRead, PermLegalWrite,
			PermTrainingRead, PermTrainingWrite,
			PermIncidentsRead, PermIncidentsWrite,
			PermReportsView, PermSettingsManage, PermAuditView, PermUsersManage, PermBranchesManage,
		}
	case "NATIONAL_ADMIN":
		return []string{
			PermMembersRead, PermMembersWrite, PermMembersDelete,
			PermComplaintsRead, PermComplaintsWrite, PermComplaintsResolve,
			PermEventsRead, PermEventsWrite, PermEventsPublish,
			PermNewsRead, PermNewsWrite, PermNewsPublish,
			PermDocumentsRead, PermDocumentsWrite,
			PermDonationsRead, PermDonationsWrite,
			PermLegalRead, PermLegalWrite,
			PermTrainingRead, PermTrainingWrite,
			PermIncidentsRead, PermIncidentsWrite,
			PermReportsView, PermAuditView, PermUsersManage, PermBranchesManage,
		}
	case "PROVINCE_ADMIN":
		return []string{
			PermMembersRead, PermMembersWrite,
			PermComplaintsRead, PermComplaintsWrite, PermComplaintsResolve,
			PermEventsRead, PermEventsWrite,
			PermNewsRead, PermNewsWrite,
			PermDocumentsRead, PermDocumentsWrite,
			PermDonationsRead, PermLegalRead, PermLegalWrite,
			PermTrainingRead, PermIncidentsRead, PermIncidentsWrite,
			PermReportsView,
		}
	case "DISTRICT_ADMIN":
		return []string{
			PermMembersRead, PermMembersWrite,
			PermComplaintsRead, PermComplaintsWrite,
			PermEventsRead, PermEventsWrite,
			PermNewsRead, PermDocumentsRead,
			PermLegalRead, PermIncidentsRead, PermIncidentsWrite,
			PermReportsView,
		}
	case "BRANCH_ADMIN":
		return []string{
			PermMembersRead, PermMembersWrite,
			PermComplaintsRead, PermComplaintsWrite,
			PermEventsRead, PermNewsRead, PermDocumentsRead,
			PermIncidentsRead, PermIncidentsWrite,
		}
	case "MEMBER":
		return []string{
			PermComplaintsRead, PermComplaintsWrite,
			PermEventsRead, PermNewsRead, PermDocumentsRead,
			PermLegalRead, PermTrainingRead,
		}
	default:
		return []string{PermNewsRead, PermEventsRead}
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
