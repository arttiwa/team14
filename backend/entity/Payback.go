package entity

import (
	"time"

	"github.com/asaskevich/govalidator"
	"gorm.io/gorm"
)

type Payback struct {
	gorm.Model
	// เวลาที่ยืม
	Timeofpayback time.Time `valid:"IsPresent~เวลาไม่ใช่ปัจจุปัน"` // เวลาปัจจุบัน

	// ผู้จองใช้ห้อง
	Admin   User `gorm:"references:id" valid:"-"`
	AdminID *uint

	// การจองใช้ห้องไปหาห้อง
	Borrow   Borrow `gorm:"references:id" valid:"-"`
	BorrowID *uint

	// อุปกรณ์
	Device   Device `gorm:"references:id" valid:"-"`
	DeviceID *uint

	
}

func init() {
	govalidator.CustomTypeTagMap.Set("IsFuture", func(i interface{}, context interface{}) bool {
		t := i.(time.Time)
		return t.After(time.Now())
	})

	govalidator.CustomTypeTagMap.Set("IsPresent", func(i interface{}, context interface{}) bool {
		t := i.(time.Time)
		return t.Equal(time.Now())
	})

	govalidator.CustomTypeTagMap.Set("IsPast", func(i interface{}, context interface{}) bool {
		t := i.(time.Time)
		return t.Before(time.Now())
	})
}
