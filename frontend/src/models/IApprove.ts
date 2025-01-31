import { StatusBooksInterface } from "./IStatusBook";
import { BookingsInterface } from "./IBooking";
import { UsersInterface } from "./IUser";
import { BorrowsInterface } from "./IBorrow";

export interface ApprovesInterface {
    ID?: string,

    Code?: string | null;
    Note?: string | "";
    ApproveTime?: Date | null;

    UserID?: string | null;
    StatusBookID?: string | null;
    BookingID?: string | null;

    User?: UsersInterface;
    StatusBook?: StatusBooksInterface;
    Booking?: BookingsInterface;

    Borrow?: BorrowsInterface;
}