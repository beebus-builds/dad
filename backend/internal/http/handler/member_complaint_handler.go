package handler

import (
	"encoding/csv"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/internal/http/middleware"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	"github.com/shramjagaran/cms-backend/pkg/response"
)

func (h *Handlers) ListMembers(c *gin.Context) {
	page, size := listOpts(c)
	members, total, err := h.Members.List(c.Request.Context(), buildListOpts(c, page, size))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, members, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

// scopedBranchFilter reconciles a client-supplied branchId filter with the
// caller's branch scope (set by middleware.BranchScope): a scoped BRANCH_ADMIN
// always overrides the query param, a scoped PROVINCE_ADMIN/DISTRICT_ADMIN
// restricts to their region's branch IDs.
func scopedBranchFilter(c *gin.Context, requested string) (string, []string) {
	if scoped, ok := c.Get(middleware.CtxScopeBranchID); ok {
		if id, ok := scoped.(string); ok && id != "" {
			return id, nil
		}
	}
	if scoped, ok := c.Get(middleware.CtxScopeBranchIDs); ok {
		if ids, ok := scoped.([]string); ok && len(ids) > 0 {
			return "", ids
		}
	}
	return requested, nil
}

func buildListOpts(c *gin.Context, page, size int) repository.ListMembersOptions {
	branchID, branchIDs := scopedBranchFilter(c, c.Query("branchId"))
	return repository.ListMembersOptions{
		Page:      page,
		PageSize:  size,
		Search:    c.Query("search"),
		BranchID:  branchID,
		BranchIDs: branchIDs,
		Status:    c.Query("status"),
		Tier:      c.Query("tier"),
		Tag:       c.Query("tag"),
	}
}

func (h *Handlers) GetMemberTimeline(c *gin.Context) {
	page, size := listOpts(c)
	items, total, err := h.Members.Timeline(c.Request.Context(), c.Param("id"), page, size)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, items, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) ListCommunicationLogs(c *gin.Context) {
	page, size := listOpts(c)
	items, total, err := h.CommunicationLogs.List(c.Request.Context(), c.Param("id"), page, size)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, items, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateCommunicationLog(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	var in usecase.CreateCommLogInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	l, err := h.CommunicationLogs.Create(c.Request.Context(), c.Param("id"), userID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, l)
}

func (h *Handlers) CreateMember(c *gin.Context) {
	var in usecase.CreateMemberInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Members.Create(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, m)
}

func (h *Handlers) GetMember(c *gin.Context) {
	m, err := h.Members.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) UpdateMember(c *gin.Context) {
	var in usecase.CreateMemberInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Members.Update(c.Request.Context(), c.Param("id"), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) DeleteMember(c *gin.Context) {
	if err := h.Members.Delete(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handlers) ImportMembers(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.Error(c, 422, "VALIDATION", "CSV file is required")
		return
	}
	f, err := file.Open()
	if err != nil {
		response.Error(c, 500, "INTERNAL", "Failed to open file")
		return
	}
	defer f.Close()

	reader := csv.NewReader(f)
	reader.TrimLeadingSpace = true
	reader.LazyQuotes = true

	result, err := h.Members.ImportCSV(c.Request.Context(), reader)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, result)
}

func (h *Handlers) ListComplaints(c *gin.Context) {
	page, size := listOpts(c)
	branchID, branchIDs := scopedBranchFilter(c, c.Query("branchId"))
	opts := repository.ListComplaintsOptions{
		Page: page, PageSize: size,
		Search:    c.Query("search"),
		Status:    c.Query("status"),
		Priority:  c.Query("priority"),
		BranchID:  branchID,
		BranchIDs: branchIDs,
	}
	list, total, err := h.Complaints.List(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateComplaint(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	var in usecase.CreateComplaintInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Complaints.Create(c.Request.Context(), userID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, m)
}

func (h *Handlers) GetComplaint(c *gin.Context) {
	m, err := h.Complaints.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) UpdateComplaint(c *gin.Context) {
	var in struct {
		Status     string `json:"status"`
		Priority   string `json:"priority"`
		AssignedTo string `json:"assignedTo"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Complaints.Update(c.Request.Context(), c.Param("id"), in.Status, in.Priority, in.AssignedTo)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) ComplaintStats(c *gin.Context) {
	stats, err := h.Complaints.Stats(c.Request.Context())
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, stats)
}

func (h *Handlers) ListComplaintNotes(c *gin.Context) {
	notes, err := h.ComplaintNotes.List(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, notes)
}

func (h *Handlers) AddComplaintNote(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	var in struct {
		Body       string `json:"body"`
		IsInternal bool   `json:"isInternal"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	n, err := h.ComplaintNotes.Create(c.Request.Context(), c.Param("id"), userID, in.Body, in.IsInternal)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, n)
}
