package handler

import (
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	"github.com/shramjagaran/cms-backend/pkg/response"
)

func (h *Handlers) PublicGetNewsBySlug(c *gin.Context) {
	m, err := h.News.GetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		handleErr(c, err)
		return
	}
	if m.Status != "PUBLISHED" {
		response.Error(c, 404, "NOT_FOUND", "news not found")
		return
	}
	_ = h.News.View(c.Request.Context(), m.ID)
	response.OK(c, m)
}

func (h *Handlers) PublicRegisterForEvent(c *gin.Context) {
	var in usecase.RegisterForEventInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	reg, err := h.PublicEvents.Register(c.Request.Context(), c.Param("id"), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, reg)
}

func (h *Handlers) PublicMemberApply(c *gin.Context) {
	var in usecase.MemberApplyInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	app, err := h.MemberApps.Apply(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, app)
}

func (h *Handlers) PublicCreateDonation(c *gin.Context) {
	var in usecase.CreateDonationInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	d, err := h.Donations.Create(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, d)
}

type searchItem struct {
	Type      string `json:"type"`
	ID        string `json:"id"`
	Title     string `json:"title"`
	Excerpt   string `json:"excerpt"`
	Slug      string `json:"slug,omitempty"`
	CreatedAt string `json:"createdAt"`
}

func (h *Handlers) PublicSearch(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		response.OK(c, []searchItem{})
		return
	}
	ctx := c.Request.Context()
	results := make([]searchItem, 0, 20)

	newsList, _, _ := h.News.List(ctx, repository.ListNewsOptions{Search: q, Status: "PUBLISHED", Page: 1, PageSize: 5})
	for _, n := range newsList {
		ts := ""
		if n.PublishedAt != nil {
			ts = n.PublishedAt.Format(time.RFC3339)
		}
		results = append(results, searchItem{Type: "news", ID: n.ID, Title: n.Title, Excerpt: n.Excerpt, Slug: n.Slug, CreatedAt: ts})
	}

	events, _, _ := h.Events.List(ctx, repository.ListEventsOptions{Search: q, Status: "PUBLISHED", Page: 1, PageSize: 5})
	for _, e := range events {
		results = append(results, searchItem{Type: "event", ID: e.ID, Title: e.Title, Excerpt: e.Description, Slug: e.Slug, CreatedAt: e.StartsAt.Format(time.RFC3339)})
	}

	docs, _, _ := h.Documents.List(ctx, repository.ListDocumentsOptions{Search: q, Visibility: "PUBLIC", Page: 1, PageSize: 5})
	for _, d := range docs {
		excerpt := ""
		if d.Description != nil {
			excerpt = *d.Description
		}
		results = append(results, searchItem{Type: "document", ID: d.ID, Title: d.Title, Excerpt: excerpt, CreatedAt: d.CreatedAt.Format(time.RFC3339)})
	}

	response.OK(c, results)
}

func (h *Handlers) PublicGetMemberProfile(c *gin.Context) {
	m, err := h.Members.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, m)
}

func (h *Handlers) PublicContactSubmit(c *gin.Context) {
	var in usecase.CreateContactInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	msg, err := h.Contact.Create(c.Request.Context(), in)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, msg)
}
