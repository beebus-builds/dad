package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/pkg/response"
)

func (h *Handlers) GetOrganisationSettings(c *gin.Context) {
	settings, err := h.Settings.GetOrganisation(c.Request.Context())
	if err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, settings)
}

func (h *Handlers) UpdateOrganisationSettings(c *gin.Context) {
	var body map[string]any
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 422, "VALIDATION", err.Error())
		return
	}
	if err := h.Settings.UpdateOrganisation(c.Request.Context(), body); err != nil {
		handleErr(c, err)
		return
	}
	response.OK(c, gin.H{"message": "settings updated"})
}
