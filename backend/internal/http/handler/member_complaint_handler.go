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
	opts := repository.ListComplaintsOptions{
		Page: page, PageSize: size,
		Search:   c.Query("search"),
		Status:   c.Query("status"),
		Priority: c.Query("priority"),
		BranchID: c.Query("branchId"),
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
