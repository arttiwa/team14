package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/sut65/team14/entity"
)

// POST /objectives
func CreateObjective(c *gin.Context) {
	var objective entity.Objective
	if err := c.ShouldBindJSON(&objective); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := entity.DB().Create(&objective).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": objective})
}

// GET /objective/:id
func GetObjective(c *gin.Context) {
	var objective entity.Objective
	id := c.Param("id")
	// if err := entity.DB().Raw("SELECT * FROM objectives WHERE id = ?", id).Scan(&objective).Error; err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	// 	return
	// }

	if tx := entity.DB().Where("id = ?", id).First(&objective); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "objective not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": objective})
}

// GET /objectives
func ListObjectives(c *gin.Context) {
	var objectives []entity.Objective
	if err := entity.DB().Raw("SELECT * FROM objectives").Find(&objectives).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": objectives})
}

// DELETE /objectives/:id
func DeleteObjective(c *gin.Context) {
	id := c.Param("id")
	if tx := entity.DB().Exec("DELETE FROM objectives WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "objective not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": id})
}

// PATCH /objectives
func UpdateObjective(c *gin.Context) {
	var objective entity.Objective
	if err := c.ShouldBindJSON(&objective); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if tx := entity.DB().Where("id = ?", objective.ID).First(&objective); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "objective not found"})
		return
	}
	if err := entity.DB().Save(&objective).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": objective})
}
