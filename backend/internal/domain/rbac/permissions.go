package rbac

const (
	PermPagesManage   = "pages:manage"
	PermMenuManage    = "menu:manage"
	PermNewsRead      = "news:read"
	PermNewsWrite     = "news:write"
	PermEventsRead    = "events:read"
	PermEventsWrite   = "events:write"
	PermMembersRead   = "members:read"
	PermMembersWrite  = "members:write"
	PermUsersManage   = "users:manage"
)

func PermissionsForRole(role string) []string {
	switch role {
	case "SUPER_ADMIN":
		return []string{
			PermPagesManage, PermMenuManage, PermNewsRead, PermNewsWrite, PermEventsRead, PermEventsWrite, PermMembersRead, PermMembersWrite, PermUsersManage,
		}
	case "MEMBER":
		return []string{
			PermNewsWrite, PermEventsWrite,
		}
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
