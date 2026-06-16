package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/pkg/response"
)

func (h *Handlers) CreateMenu(c *gin.Context) {
	var in entity.MenuItem
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	if err := h.Menus.Create(c.Request.Context(), &in); err != nil {
		handleErr(c, err)
		return
	}
	response.Created(c, in)
}

func (h *Handlers) ListMenus(c *gin.Context) {
	menus, err := h.Menus.List(c.Request.Context())
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, menus)
}

func (h *Handlers) UpdateMenu(c *gin.Context) {
	var in entity.MenuItem
	if err := c.ShouldBindJSON(&in); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	if err := h.Menus.Update(c.Request.Context(), c.Param("id"), &in); err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, in)
}

func (h *Handlers) DeleteMenu(c *gin.Context) {
	if err := h.Menus.Delete(c.Request.Context(), c.Param("id")); err != nil {
		handleErr(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handlers) PublicGetMenu(c *gin.Context) {
	menus, err := h.Menus.List(c.Request.Context())
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, menus)
}
