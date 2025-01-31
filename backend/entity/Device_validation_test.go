package entity

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestDevicePass(t *testing.T) {
	g := NewGomegaWithT(t)

	// ข้อมูลทั้งหมดถูกต้องหมดทุก field
	device := Device{
		Detail:           "ยางลบ",
		Number: 10,
		Note:             "test",
		StatusDevice:     true,
	}

	// ตรวจสอบด้วย govalidator
	ok, err := govalidator.ValidateStruct(device)

	// ok ต้องเป็น true แปลว่าไม่มี error
	g.Expect(ok).To(BeTrue())

	// err ต้องเป็น nil แปลว่าไม่มี error
	g.Expect(err).To(BeNil())
}

func TestDeviceDetailNull(t *testing.T) {
	g := NewGomegaWithT(t)

	// ข้อมูล Detail ไม่ถูกต้องตาม Format
	device := Device{
		Detail:           "",
		Number: 10,
		Note:             "test",
		StatusDevice:     true,
	}

	// ตรวจสอบด้วย govalidator
	ok, err := govalidator.ValidateStruct(device)

	// ok ต้องไม่เป็น true แปลว่าต้องจับ error ได้
	g.Expect(ok).ToNot(BeTrue())

	// err ต้องไม่เป็น nil แปลว่าต้องจับ error ได้
	g.Expect(err).ToNot(BeNil())

	// err.Error() ต้องมี message แสดงออกมา
	g.Expect(err.Error()).To(Equal("กรุณากรอกชื่ออุปกรณ์"))
}

func TestNumberNull(t *testing.T) {
	g := NewGomegaWithT(t)

	// ข้อมูล Address ไม่ถูกต้องตาม Format
	device := Device{
		Detail:           "test",
		Number: 0,
		Note:             "test",
		StatusDevice:     true,
	}

	// ตรวจสอบด้วย govalidator
	ok, err := govalidator.ValidateStruct(device)

	// ok ต้องไม่เป็น true แปลว่าต้องจับ error ได้
	g.Expect(ok).ToNot(BeTrue())

	// err ต้องไม่เป็น nil แปลว่าต้องจับ error ได้
	g.Expect(err).ToNot(BeNil())

	// err.Error() ต้องมี message แสดงออกมา
	g.Expect(err.Error()).To(Equal("จำนวนไม่ต่ำกว่า 0"))
}

func TestDeviceNoteNull(t *testing.T) {
	g := NewGomegaWithT(t)

	// ข้อมูล tel ไม่ถูกต้องตาม Format
	device := Device{
		Detail:           "test",
		Number: 10,
		Note:             "",
		StatusDevice:     true,
	}

	// ตรวจสอบด้วย govalidator
	ok, err := govalidator.ValidateStruct(device)

	// ok ต้องไม่เป็น true แปลว่าต้องจับ error ได้
	g.Expect(ok).ToNot(BeTrue())

	// err ต้องไม่เป็น nil แปลว่าต้องจับ error ได้
	g.Expect(err).ToNot(BeNil())

	// err.Error() ต้องมี message แสดงออกมา
	g.Expect(err.Error()).To(Equal("กรุณากรอกหมายเหตุ"))
}
