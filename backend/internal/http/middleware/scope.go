package middleware

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/jwt"
)

const (
	// CtxScopeBranchID is set for BRANCH_ADMIN callers: list handlers must
	// restrict results to this single branch, overriding any client-supplied
	// branchId filter.
	CtxScopeBranchID = "scopeBranchID"
	// CtxScopeBranchIDs is set for PROVINCE_ADMIN/DISTRICT_ADMIN callers: list
	// handlers must restrict results to branches within this set.
	CtxScopeBranchIDs = "scopeBranchIDs"
)

// BranchScopeResolver resolves the set of branch IDs a regional admin can see,
// based on their home branch's province/district code.
type BranchScopeResolver interface {
	BranchIDsForAdmin(ctx context.Context, role, homeBranchID string) ([]string, error)
}

type branchRepoScopeResolver struct {
	branches repository.BranchRepository
}

func NewBranchScopeResolver(branches repository.BranchRepository) BranchScopeResolver {
	return &branchRepoScopeResolver{branches: branches}
}

func (r *branchRepoScopeResolver) BranchIDsForAdmin(ctx context.Context, role, homeBranchID string) ([]string, error) {
	if homeBranchID == "" {
		return nil, nil
	}
	all, err := r.branches.List(ctx)
	if err != nil {
		return nil, err
	}
	var homeProvince, homeDistrict string
	found := false
	for _, b := range all {
		if b.ID == homeBranchID {
			homeProvince, homeDistrict = b.ProvinceCode, b.DistrictCode
			found = true
			break
		}
	}
	if !found {
		return []string{homeBranchID}, nil
	}
	ids := make([]string, 0, len(all))
	for _, b := range all {
		switch role {
		case "PROVINCE_ADMIN":
			if b.ProvinceCode == homeProvince {
				ids = append(ids, b.ID)
			}
		case "DISTRICT_ADMIN":
			if b.DistrictCode == homeDistrict {
				ids = append(ids, b.ID)
			}
		}
	}
	return ids, nil
}

// BranchScope reads the authenticated caller's role/branch (set by Auth) and,
// for roles limited to a subset of branches, stores the allowed scope on the
// request context for handlers to apply to their list queries. No-op for
// roles with organisation-wide access (SUPER_ADMIN/NATIONAL_ADMIN) or MEMBER
// (self-scoped elsewhere).
func BranchScope(resolver BranchScopeResolver) gin.HandlerFunc {
	return func(c *gin.Context) {
		claimsVal, ok := c.Get(CtxClaims)
		if !ok {
			c.Next()
			return
		}
		claims, _ := claimsVal.(*jwt.Claims)
		if claims == nil {
			c.Next()
			return
		}
		switch claims.Role {
		case "BRANCH_ADMIN":
			if claims.BranchID != "" {
				c.Set(CtxScopeBranchID, claims.BranchID)
			}
		case "PROVINCE_ADMIN", "DISTRICT_ADMIN":
			ids, err := resolver.BranchIDsForAdmin(c.Request.Context(), claims.Role, claims.BranchID)
			if err == nil && len(ids) > 0 {
				c.Set(CtxScopeBranchIDs, ids)
			}
		}
		c.Next()
	}
}
