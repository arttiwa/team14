package controller

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"

	"github.com/sut65/team14/entity"
)

// POST /booking
func CreateBooking(c *gin.Context) {

	var booking entity.Booking
	var user entity.User
	var objective entity.Objective
	var Room entity.Room

	// ผลลัพธ์ที่ได้จากขั้นตอนที่ x จะถูก bind เข้าตัวแปร Booking
	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ค้นหา user ด้วย id
	if tx := entity.DB().Where("id = ?", booking.UserID).First(&user); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบสมาชิก"})
		return
	}

	// ค้นหา objective ด้วย id
	if tx := entity.DB().Where("id = ?", booking.ObjectiveID).First(&objective); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบรายละเอียดการจอง"})
		return
	}

	// ค้นหา room ด้วย id
	if tx := entity.DB().Where("id = ?", booking.RoomID).First(&Room); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบห้อง"})
		return
	}

	//สร้าง Booking
	bod := entity.Booking{
		Code:       booking.Code,
		Date_Start: booking.Date_Start,
		Date_End:   booking.Date_End,

		User:      user,
		Objective: objective,
		Room:      Room,
	}

	// ขั้นตอนการ validate
	if _, err := govalidator.ValidateStruct(bod); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ถ้าเจอ   ก็คือ เวลาชนกัน --> ไปเช็คว่าการจองนั้นได้รับอนุมัติไหม
	// ถ้าไม่เจอ ก็คือ *ไม่เวลาชนกัน* หรือ *ถูกยกเลิกไปแล้ว*
	var checkDate entity.Booking
	if err := entity.DB().
		Raw("select b.* from "+
			"rooms r inner join bookings b on r.id = ? and b.room_id = r.id "+
			"where datetime(b.date_start) >= datetime(?) "+ /*Start*/
			"and datetime(b.date_end) <= datetime(?) and b.deleted_at is NULL "+ /*END*/
			"ORDER BY id DESC LIMIT 1 ", Room.ID, booking.Date_Start, booking.Date_End).
		Scan(&checkDate).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if checkDate.ID != 0 {
		// เอา booking ที่เจอไปค้นหา
		// ถ้าเจอ ก็คือ การจองนั้นได้รับอนุมัติไปแล้ว *หรือ* การจองนั้นรอการได้รับการอนุมัติ
		// ถ้าไม่เจอ   การจองนั้น *ไม่ได้รับอนุมัติ* **ไม่เข้า if-else**

		var checkApprove entity.Booking
		// if *checkDate.Approve.StatusBookID == 1 || *checkDate.Approve.StatusBookID == 0 {
		// 	c.JSON(http.StatusBadRequest, gin.H{"error": "หมายเลขห้องนี้ถูกจองใช้ห้องไปแล้ว"})
		// 	return
		// }
		if err := entity.DB().
			Raw("select b.* from bookings b "+
				"inner join approves a on a.booking_id = b.id  "+ //ไม่ได้รับการอนุมัติ
				"WHERE a.status_book_id = 2 and a.booking_id = ? "+
				"ORDER BY id DESC LIMIT 1;", checkDate.ID).
			Scan(&checkApprove).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if checkApprove.ID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "หมายเลขห้องนี้ถูกจองใช้ห้องไปแล้ว"})
			return
		}
	}

	// บันทึก
	if err := entity.DB().Create(&bod).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": bod})
}

// GET /booking/:id
func GetBooking(c *gin.Context) {
	var Booking entity.Booking
	id := c.Param("id")
	if err := entity.DB().Preload("User").Preload("Objective").Preload("Room").Preload("Approve").
		Raw("SELECT * FROM bookings WHERE id = ?", id).Find(&Booking).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": Booking})
}

// GET /booking/code/:code
func GetBookingbyCode(c *gin.Context) {
	var Booking entity.Booking
	code := c.Param("code")
	if err := entity.DB().Preload("User").Preload("Objective").Preload("Room").Preload("Room.Building").Preload("Approve").
		Raw("SELECT * FROM bookings WHERE code = ?", code).Find(&Booking).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": Booking})
}

// GET approve/booking/code/:code
func GetBookingbyCodeThatApprove(c *gin.Context) {
	var Booking entity.Booking
	code := c.Param("code")
	if err := entity.DB().Preload("User").Preload("Room").Preload("Room.Building").Preload("Approve").
		Raw("select b.* from bookings b inner join approves a on a.booking_id = b.id where a.status_book_id=1 and b.code = ?", code).
		Find(&Booking).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": Booking})
}

// GET /bookings/user/:id
func ListBookingsByUser(c *gin.Context) {
	var Booking []entity.Booking
	id := c.Param("id")
	if err := entity.DB().Preload("User").Preload("Objective").Preload("Room").Preload("Approve").
		Raw("SELECT * FROM bookings WHERE user_id = ? and datetime(date_end) > datetime('now', 'localtime')", id).Find(&Booking).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": Booking})
}

// GET notapprove/booking/code/:code
func GetBookingbyCodeThatNotApprove(c *gin.Context) {
	var Booking entity.Booking
	code := c.Param("code")
	if err := entity.DB().Preload("User").Preload("Objective").Preload("Room").Preload("Room.Building").
		Raw("SELECT * FROM bookings where code = ? and id not in ( Select b1.id as id from bookings b1 "+
			"inner JOIN approves a1 on a1.booking_id = b1.id and b1.deleted_at is not NULL);", code).
		Find(&Booking).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if Booking.ID == '0' || Booking.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสการจองนี้ อาจจะถูกอนุมัติ หรือ ถูกยกเลิก หรือ ไม่พบรหัสการจองนี้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": Booking})
}

// GET notapprove/bookings
func ListBookingsThatNotApprove(c *gin.Context) {
	var Booking entity.Booking
	if err := entity.DB().Preload("User").Preload("Objective").Preload("Room").Preload("Room.Building").
		Raw("SELECT * FROM bookings where id not in ( Select b1.id as id from bookings b1 " +
			"inner JOIN approves a1 on a1.booking_id = b1.id and b1.deleted_at is not NULL);").
		Find(&Booking).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if Booking.ID == '0' || Booking.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสการจองนี้ อาจจะถูกอนุมัติ หรือ ถูกยกเลิก หรือ ไม่พบรหัสการจองนี้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": Booking})
}

// GET /bookings
func ListBookings(c *gin.Context) {
	var Bookings []entity.Booking
	if err := entity.DB().Preload("User").Preload("Objective").Preload("Room").Preload("Approve").Preload("Approve.StatusBook").
		Raw("SELECT * FROM bookings").Find(&Bookings).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": Bookings})
}

// GET /bookings/room/:id
func ListBookingsbyRoom(c *gin.Context) {
	var bookings []entity.Booking
	detail := c.Param("id")
	if detail != "0" {
		// เอาแค่ การจองที่ *รอการได้รับอนุมัติ* และ *ได้รับอนุมัติ* แล้ว เท่านั้น!!
		if err := entity.DB().Preload("User").Preload("Objective").Preload("Room").Preload("Approve").Preload("Approve.StatusBook").
			Raw("select b.* from "+
				"rooms r inner join bookings b on r.id = b.room_id "+
				"and datetime(date_end) > datetime('now', 'localtime') and b.deleted_at is null "+
				"EXCEPT "+
				"select b.* from "+
				"rooms r inner join bookings b on r.id = b.room_id "+
				"inner join approves a on a.booking_id = b.id "+
				"and a.id in (select max(a.id) from approves a group by a.booking_id) "+
				"where a.status_book_id = 2;", detail).Find(&bookings).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	if detail == "0" {
		if err := entity.DB().Preload("User").Preload("Objective").Preload("Room").Preload("Approve").Preload("Approve.StatusBook").
			Raw("select b.* from " +
				"rooms r inner join bookings b on r.id = b.room_id " +
				"and datetime(date_end) > datetime('now', 'localtime') and b.deleted_at is null " +
				"EXCEPT " +
				"select b.* from " +
				"rooms r inner join bookings b on r.id = b.room_id " +
				"inner join approves a on a.booking_id = b.id " +
				"and a.id in (select max(a.id) from approves a group by a.booking_id) " +
				"where a.status_book_id = 2;").
			Find(&bookings).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

// function สำหรับลบ booking ด้วย ID
// DELETE /booking/:id
func DeleteBooking(c *gin.Context) {
	var Booking entity.Booking
	id := c.Param("id")
	// UPDATE booking SET deleted_at="now" WHERE id = ?;
	if tx := entity.DB().Where("id = ?", id).Delete(&Booking); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Booking not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": id})
}

// PUT /booking
func UpdateBooking(c *gin.Context) {
	var booking entity.Booking
	var tmp entity.Booking

	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// ค้นหา booking ด้วย id
	if tx := entity.DB().Where("id = ?", booking.ID).First(&tmp); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Booking not found"})
		return
	}
	var user entity.User
	var objective entity.Objective
	var room entity.Room
	// ค้นหา user ด้วย id
	if tx := entity.DB().Where("id = ?", booking.UserID).First(&user); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบสมาชิก"})
		return
	}

	// ค้นหา objective ด้วย id
	if tx := entity.DB().Where("id = ?", booking.ObjectiveID).First(&objective); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบรายละเอียดการจอง"})
		return
	}

	// ค้นหา room ด้วย id
	if tx := entity.DB().Where("id = ?", booking.RoomID).First(&room); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบห้อง"})
		return
	}
	tmp.Code = booking.Code
	tmp.User = user
	tmp.Objective = objective
	tmp.Room = room

	if err := entity.DB().Save(&tmp).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": booking})
}
