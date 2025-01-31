package controller

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"github.com/sut65/team14/entity"
)

// POST /buildings
func CreateBuilding(c *gin.Context) {
	var building entity.Building
	var guard entity.Guard
	var company entity.Company
	var admin entity.User

	if err := c.ShouldBindJSON(&building); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if tx := entity.DB().Where("id = ?", building.AdminID).First(&admin); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบสมาชิก"})
		return
	}
	if tx := entity.DB().Where("id = ?", building.CompanyID).First(&company); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบบริษัท]"})
		return
	}
	if tx := entity.DB().Where("id = ?", building.GuardID).First(&guard); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบผู้รักษาความปลอดภัย"})
		return
	}

	bod := entity.Building{
		Admin:   admin,
		Company: company,
		Guard:   guard,
		Detail: building.Detail,
		Note:     building.Note,
		Time:     building.Time,
	}
	// ขั้นตอนการ validate
	if _, err := govalidator.ValidateStruct(bod); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// บันทึก
	if err := entity.DB().Create(&bod).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": building})
}

// GET /Building
func GetBuilding(c *gin.Context) {
	var Building entity.Building
	id := c.Param("id")
	if err := entity.DB().Preload("Admin").Preload("Company").Preload("Guard").Raw("SELECT * FROM buildings WHERE id = ?", id).Find(&Building).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": Building})
}

// GET /Buildings
func ListBuildings(c *gin.Context) {
	var Building []entity.Building
	if err := entity.DB().Preload("Admin").Preload("Company").Preload("Guard").Raw("SELECT * FROM buildings where deleted_at is null").Find(&Building).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": Building})
}

// DELETE /buildings/:id
func DeleteBuilding(c *gin.Context) {
	var Building entity.Building
	id := c.Param("id")
	// UPDATE Buildings SET deleted_at="now" WHERE id = ?;
	if tx := entity.DB().Where("id = ?", id).Delete(&Building); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Building not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": id})
}

// PATCH /buildings
func UpdateBuilding(c *gin.Context) {
	var building entity.Building
	if err := c.ShouldBindJSON(&building); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var tmp entity.Building
	var admin entity.User
	var company entity.Company
	var guard entity.Guard
	

	if tx := entity.DB().Where("id = ?", building.ID).First(&tmp); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบสมาชิก"})
		return
	}
	if tx := entity.DB().Where("id = ?", building.AdminID).First(&admin); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบสมาชิก"})
		return
	}
	if tx := entity.DB().Where("id = ?", building.CompanyID).First(&company); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบบริษัท]"})
		return
	}
	if tx := entity.DB().Where("id = ?", building.GuardID).First(&guard); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบผู้รักษาความปลอดภัย"})
		return
	}
	
	tmp.Admin = admin
	tmp.Guard = guard
	tmp.Company = company
	tmp.Detail = building.Detail
	tmp.Note = building.Note

	if _, err := govalidator.ValidateStruct(tmp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := entity.DB().Save(&building).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": building})
}
