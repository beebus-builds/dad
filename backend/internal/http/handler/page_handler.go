package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/pkg/response"
)

func (h *Handlers) CreatePage(c *gin.Context) {
	var in entity.Page
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	if err := h.Pages.Create(c.Request.Context(), &in); err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, in)
}

func (h *Handlers) GetPageBySlug(c *gin.Context) {
	p, err := h.Pages.GetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, p)
}

func (h *Handlers) ListPages(c *gin.Context) {
	pages, err := h.Pages.List(c.Request.Context())
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, pages)
}

func (h *Handlers) UpdatePage(c *gin.Context) {
	var in entity.Page
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	if err := h.Pages.Update(c.Request.Context(), c.Param("id"), &in); err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, in)
}

func (h *Handlers) DeletePage(c *gin.Context) {
	if err := h.Pages.Delete(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}
