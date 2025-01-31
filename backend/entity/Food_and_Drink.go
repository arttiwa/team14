package entity

import (
	"gorm.io/gorm"
)

type Food_and_Drink struct {
	gorm.Model

	Menu string `gorm:"uniqueIndex" valid:"required~กรุณากรอกชื่ออาหารและเครื่องดื่ม"`
	Address string `valid:"required~กรุณากรอกที่อยู่"`
	Tel string `valid:"matches(^\\d{10}$)~เบอร์โทรศัพท์ต้องมีตัวเลข 10 หลัก, required~กรุณากรอกเบอร์โทรศัพท์"`

	Foodtype   Foodtype `gorm:"references:id"`
	FoodtypeID *uint

	Shop   Shop `gorm:"references:id"`
	ShopID *uint

	// Admin ผู้เพิ่มอาหาร
	Admin   User `gorm:"references:id" valid:"-"`
	AdminID *uint

	Order_Food     []Order_Food     `gorm:"foreignKey:Food_and_DrinkID"` // ของจัดการร้องขออาหารและเครื่องดื่ม
}

type Foodtype struct {
	gorm.Model
	Name string `gorm:"uniqueIndex"`

	Food_and_Drink []Food_and_Drink `gorm:"foreignkey:FoodtypeID"`
}

type Shop struct {
	gorm.Model
	Name string `gorm:"uniqueIndex"`

	Food_and_Drink []Food_and_Drink `gorm:"foreignkey:ShopID"`
}
