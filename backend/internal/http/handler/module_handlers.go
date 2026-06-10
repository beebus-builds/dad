package handler

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/internal/http/middleware"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	"github.com/shramjagaran/cms-backend/pkg/response"
)

func (h *Handlers) ListEvents(c *gin.Context) {
	page, size := listOpts(c)
	opts := repository.ListEventsOptions{
		Page: page, PageSize: size,
		Search:   c.Query("search"),
		Status:   c.Query("status"),
		Category: c.Query("category"),
		Upcoming: c.Query("upcoming") == "true",
	}
	list, total, err := h.Events.List(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateEvent(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	var in usecase.CreateEventInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Events.Create(c.Request.Context(), userID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, m)
}

func (h *Handlers) GetEvent(c *gin.Context) {
	m, err := h.Events.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) UpdateEvent(c *gin.Context) {
	var body struct {
		usecase.CreateEventInput
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Events.Update(c.Request.Context(), c.Param("id"), body.CreateEventInput, body.Status)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) DeleteEvent(c *gin.Context) {
	if err := h.Events.Delete(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handlers) ListNews(c *gin.Context) {
	page, size := listOpts(c)
	opts := repository.ListNewsOptions{
		Page: page, PageSize: size,
		Search:   c.Query("search"),
		Category: c.Query("category"),
		Status:   c.Query("status"),
	}
	list, total, err := h.News.List(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateNews(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	var in usecase.CreateNewsInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.News.Create(c.Request.Context(), userID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, m)
}

func (h *Handlers) GetNews(c *gin.Context) {
	m, err := h.News.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	_ = h.News.View(c.Request.Context(), m.ID)
	response.OK(c, m)
}

func (h *Handlers) UpdateNews(c *gin.Context) {
	var body struct {
		usecase.CreateNewsInput
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.News.Update(c.Request.Context(), c.Param("id"), body.CreateNewsInput, body.Status)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) DeleteNews(c *gin.Context) {
	if err := h.News.Delete(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handlers) ListDocuments(c *gin.Context) {
	page, size := listOpts(c)
	opts := repository.ListDocumentsOptions{
		Page: page, PageSize: size,
		Search:     c.Query("search"),
		Category:   c.Query("category"),
		Visibility: c.Query("visibility"),
	}
	list, total, err := h.Documents.List(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateDocument(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	var in usecase.CreateDocumentInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Documents.Create(c.Request.Context(), userID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, m)
}

func (h *Handlers) DeleteDocument(c *gin.Context) {
	if err := h.Documents.Delete(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handlers) ListDonations(c *gin.Context) {
	page, size := listOpts(c)
	opts := repository.ListDonationsOptions{
		Page: page, PageSize: size,
		Status: c.Query("status"),
		Method: c.Query("method"),
	}
	list, total, err := h.Donations.List(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateDonation(c *gin.Context) {
	var in usecase.CreateDonationInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Donations.Create(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, m)
}

func (h *Handlers) DonationsTotal(c *gin.Context) {
	total, err := h.Donations.Total(c.Request.Context())
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, gin.H{"total": total})
}

func (h *Handlers) ListLegal(c *gin.Context) {
	page, size := listOpts(c)
	opts := repository.ListLegalCasesOptions{
		Page: page, PageSize: size,
		Type:   c.Query("type"),
		Status: c.Query("status"),
	}
	list, total, err := h.LegalCases.List(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateLegal(c *gin.Context) {
	var in usecase.CreateLegalInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.LegalCases.Create(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, m)
}

func (h *Handlers) GetLegal(c *gin.Context) {
	m, err := h.LegalCases.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) UpdateLegal(c *gin.Context) {
	var in struct {
		Status  string `json:"status"`
		Advisor string `json:"assignedAdvisor"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.LegalCases.Update(c.Request.Context(), c.Param("id"), in.Status, in.Advisor)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) ListTrainings(c *gin.Context) {
	page, size := listOpts(c)
	opts := repository.ListTrainingsOptions{Page: page, PageSize: size, Status: c.Query("status")}
	list, total, err := h.Training.List(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateTraining(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	var in usecase.CreateTrainingInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Training.Create(c.Request.Context(), userID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, m)
}

func (h *Handlers) DeleteTraining(c *gin.Context) {
	if err := h.Training.Delete(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handlers) ListIncidents(c *gin.Context) {
	page, size := listOpts(c)
	opts := repository.ListIncidentsOptions{
		Page: page, PageSize: size,
		Severity: c.Query("severity"),
		Status:   c.Query("status"),
	}
	list, total, err := h.Incidents.List(c.Request.Context(), opts)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

func (h *Handlers) CreateIncident(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	var in usecase.CreateIncidentInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	m, err := h.Incidents.Create(c.Request.Context(), userID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, m)
}

func (h *Handlers) ListNotifications(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	list, err := h.Notifications.List(c.Request.Context(), userID)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, list)
}

func (h *Handlers) MarkAllRead(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	if err := h.Notifications.MarkAllRead(c.Request.Context(), userID); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handlers) MarkRead(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	if err := h.Notifications.MarkRead(c.Request.Context(), c.Param("id"), userID); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handlers) Health(c *gin.Context) {
	c.JSON(200, gin.H{
		"status":  "ok",
		"service": "shram-jagaran-cms",
		"time":    time.Now().UTC(),
	})
}

func (h *Handlers) BranchesList(c *gin.Context) {
	list, err := h.Branches.List(c.Request.Context())
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, list)
}

func (h *Handlers) CreateBranch(c *gin.Context) {
	var in usecase.CreateBranchInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	b, err := h.Branches.Create(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, b)
}

func (h *Handlers) GetBranch(c *gin.Context) {
	b, err := h.Branches.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, b)
}

func (h *Handlers) UpdateBranch(c *gin.Context) {
	var in usecase.UpdateBranchInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	b, err := h.Branches.Update(c.Request.Context(), c.Param("id"), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, b)
}

func (h *Handlers) DeleteBranch(c *gin.Context) {
	if err := h.Branches.Delete(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, gin.H{"message": "branch deleted"})
}

func (h *Handlers) ReportsDashboard(c *gin.Context) {
	ctx := c.Request.Context()
	stats := gin.H{}
	var totalMembers, activeMembers, openComplaints, resolvedComplaints, upcomingEvents, activeLegal int
	var totalDonations float64
	if err := h.DB.QueryRow(ctx, `SELECT COUNT(*) FROM members WHERE deleted_at IS NULL`).Scan(&totalMembers); err != nil {
		handleErr(c, err)
		return
	}
	stats["totalMembers"] = totalMembers
	if err := h.DB.QueryRow(ctx, `SELECT COUNT(*) FROM members WHERE deleted_at IS NULL AND status='ACTIVE'`).Scan(&activeMembers); err != nil {
		handleErr(c, err)
		return
	}
	stats["activeMembers"] = activeMembers
	if err := h.DB.QueryRow(ctx, `SELECT COUNT(*) FROM complaints WHERE deleted_at IS NULL AND status NOT IN ('RESOLVED','CLOSED')`).Scan(&openComplaints); err != nil {
		handleErr(c, err)
		return
	}
	stats["openComplaints"] = openComplaints
	if err := h.DB.QueryRow(ctx, `SELECT COUNT(*) FROM complaints WHERE status='RESOLVED'`).Scan(&resolvedComplaints); err != nil {
		handleErr(c, err)
		return
	}
	stats["resolvedComplaints"] = resolvedComplaints
	if err := h.DB.QueryRow(ctx, `SELECT COUNT(*) FROM events WHERE status='PUBLISHED' AND starts_at >= NOW()`).Scan(&upcomingEvents); err != nil {
		handleErr(c, err)
		return
	}
	stats["upcomingEvents"] = upcomingEvents
	if err := h.DB.QueryRow(ctx, `SELECT COUNT(*) FROM legal_cases WHERE status NOT IN ('RESOLVED','CLOSED')`).Scan(&activeLegal); err != nil {
		handleErr(c, err)
		return
	}
	stats["activeLegalCases"] = activeLegal
	if err := h.DB.QueryRow(ctx, `SELECT COALESCE(SUM(amount),0) FROM donations WHERE status='COMPLETED'`).Scan(&totalDonations); err != nil {
		handleErr(c, err)
		return
	}
	stats["totalDonations"] = totalDonations

	monthlyRows, err := h.DB.Query(ctx, `
		SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
			COUNT(*) FILTER (WHERE deleted_at IS NULL) AS members,
			0 AS complaints
		FROM members WHERE created_at >= NOW() - INTERVAL '12 months'
		GROUP BY month ORDER BY month`)
	if err == nil {
		defer monthlyRows.Close()
		type mg struct {
			Month      string `json:"month"`
			Members    int    `json:"members"`
			Complaints int    `json:"complaints"`
		}
		mth := make([]mg, 0, 12)
		for monthlyRows.Next() {
			m := mg{}
			if monthlyRows.Scan(&m.Month, &m.Members, &m.Complaints) == nil {
				mth = append(mth, m)
			}
		}
		stats["monthlyGrowth"] = mth
	}

	activityRows, err := h.DB.Query(ctx, `SELECT id, action, resource, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 10`)
	if err == nil {
		defer activityRows.Close()
		type act struct {
			ID      string `json:"id"`
			Type    string `json:"type"`
			Message string `json:"message"`
			At      string `json:"at"`
		}
		acts := make([]act, 0, 10)
		for activityRows.Next() {
			a := act{}
			var ts interface{}
			if activityRows.Scan(&a.ID, &a.Type, &a.Message, &ts) == nil {
				a.At = fmt.Sprintf("%v", ts)
				acts = append(acts, a)
			}
		}
		stats["recentActivity"] = acts
	}

	response.OK(c, stats)
}
