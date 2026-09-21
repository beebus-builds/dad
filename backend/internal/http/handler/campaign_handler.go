package handler

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/internal/http/middleware"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	"github.com/shramjagaran/cms-backend/pkg/response"
)

func (h *Handlers) ListCampaigns(c *gin.Context) {
	page, size := listOpts(c)
	list, total, err := h.Campaigns.List(c.Request.Context(), repository.ListCampaignsOptions{
		Page: page, PageSize: size, Status: c.Query("status"),
	})
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}

type campaignBody struct {
	Name    string                 `json:"name"`
	Subject string                 `json:"subject"`
	Body    string                 `json:"body"`
	Segment entity.CampaignSegment `json:"segment"`
}

func (h *Handlers) CreateCampaign(c *gin.Context) {
	uid, _ := c.Get(middleware.CtxUserID)
	userID, _ := uid.(string)
	var in campaignBody
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	campaign, err := h.Campaigns.Create(c.Request.Context(), userID, usecase.CreateCampaignInput{
		Name: in.Name, Subject: in.Subject, Body: in.Body, Segment: in.Segment,
	})
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, campaign)
}

func (h *Handlers) GetCampaign(c *gin.Context) {
	campaign, err := h.Campaigns.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, campaign)
}

func (h *Handlers) UpdateCampaign(c *gin.Context) {
	var in campaignBody
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	campaign, err := h.Campaigns.Update(c.Request.Context(), c.Param("id"), usecase.UpdateCampaignInput{
		Name: in.Name, Subject: in.Subject, Body: in.Body, Segment: in.Segment,
	})
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, campaign)
}

func (h *Handlers) PreviewCampaignAudience(c *gin.Context) {
	var in struct {
		Segment entity.CampaignSegment `json:"segment"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	count, err := h.Campaigns.PreviewAudience(c.Request.Context(), in.Segment)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, gin.H{"count": count})
}

func (h *Handlers) ScheduleCampaign(c *gin.Context) {
	var in struct {
		ScheduledAt time.Time `json:"scheduledAt"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	campaign, err := h.Campaigns.Schedule(c.Request.Context(), c.Param("id"), in.ScheduledAt)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, campaign)
}

func (h *Handlers) SendCampaign(c *gin.Context) {
	campaign, err := h.Campaigns.Send(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, campaign)
}

func (h *Handlers) CancelCampaign(c *gin.Context) {
	campaign, err := h.Campaigns.Cancel(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, campaign)
}

func (h *Handlers) CampaignStats(c *gin.Context) {
	stats, err := h.Campaigns.Stats(c.Request.Context(), c.Param("id"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, stats)
}

func (h *Handlers) ListCampaignRecipients(c *gin.Context) {
	page, size := listOpts(c)
	list, total, err := h.Campaigns.Recipients(c.Request.Context(), c.Param("id"), page, size)
	if err != nil {
		handleErr(c, err)
		return
	}
	response.Paginated(c, list, response.Pagination{
		Page: page, PageSize: size, Total: total, TotalPages: totalPages(total, size),
	})
}
