import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { GetUser,ListBorrows, DeleteBorrow, GetBorrow, GetBooking,} from "../services/HttpClientService";
import { UsersInterface } from "../models/IUser";
import { ApprovesInterface } from "../models/IApprove";
import { DevicesInterface } from "../models/IDevice";
import { BorrowsInterface } from "../models/IBorrow";
import { DeviceTypesInterface } from "../models/IDeviceType";
import { BookingsInterface } from "../models/IBooking";
import Borrows from "./Borrow";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props, ref
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function BorrowDelete() {
    const uid = localStorage.getItem("userID")
    const [borrows, setBorrows] = useState<BorrowsInterface[]>([]);
    const [borrow, setBorrow] = React.useState<BorrowsInterface>({
      BorrowNote1: "",BorrowAPNote:"",
      Timeofborrow: new Date(),});

    const [user, setUser] = useState<UsersInterface>({});    
    const [approves, setApproves] = React.useState<ApprovesInterface>({}); 
    const [appid, setAppid] = React.useState("");
    const [booking, setBooking] = React.useState<BookingsInterface>({}); 

    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleClose = (
      event?: React.SyntheticEvent | Event,
      reason?: string
    ) => {
      if (reason === "clickaway") 
      {
      return;
      }
      setSuccess(false);
      setError(false);
    };  
            
   const onChangeBorrow = async (e: SelectChangeEvent) =>{
    const borrowid = e.target.value;
    let res = await GetBorrow(borrowid);
    if (res) {
        setBorrow(res);
        console.log("Load BookingUser Complete");
        console.log(res);
        searchBorrowid(res);
    }
    else{
        console.log("Load Borrow Incomplete!!!");
    }   
  }

    async function searchBorrowid(id: any) {
    let res = await GetBorrow(id);
    console.log(res);
    if (res) {
        setBorrows(res);
        searchBookingid(res.Approve?.BookingID);
    } 
    }

    async function searchBookingid(id: any) {
    let res = await GetBooking(id);     
    console.log(res);
        if (res) {
            setBooking(res);
        }
        else{
            console.log("Load booking InComplete!!!!");
        } 
    }
  
    const getUser = async () => {
    const uid = localStorage.getItem("userID")
    let res = await GetUser(uid);
    if (res.status) {
        setUser(res.data);
        console.log("Load User Complete");
        console.log(`UserName: ${res.data.FirstName} + ${res.data.LastName}`);    
    }
    else{
        console.log("Load User InComplete!!!!");
    }
    };

    const listBorrows = async () => {
        let res = await ListBorrows();
        if (res) {
          setBorrows(res); 
        }
        else{
          console.log("Load Approves InComplete!!!!");
        }
      };

        ////////////////////////////////////////search///////////////////
    async function submit() {
    let res = await DeleteBorrow(borrow.ID);
    if (res.status) {
        setSuccess(true);
        setErrorMessage("");
        ListBorrows();
    } else {
        setError(true);
        setErrorMessage(res.data);
    } 
    }
      ///////////////////////////////search/////////////////////////
useEffect(() => {

    listBorrows();
    getUser();},[]);

return (
<Container maxWidth="lg">
<Snackbar
    open={success}
    autoHideDuration={6000}
    onClose={handleClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
    <Alert onClose={handleClose} severity="success">
    บันทึกข้อมูลสำเร็จ
    </Alert>
</Snackbar>

<Snackbar open={error} autoHideDuration={6000} onClose={handleClose}>
    <Alert onClose={handleClose} severity="error">
    บันทึกข้อมูลไม่สำเร็จ: {errorMessage}
    </Alert>
</Snackbar>

<Paper>
    <Box
        display="flex"
        sx={{
        marginTop: 2,
        }}
    >
    <Box sx={{ paddingX: 2, paddingY: 1 }}>
    <Typography
        component="h2"
        variant="h6"
        color="primary"
        gutterBottom
    >
    Delete Borrow
    </Typography>
    </Box>
    </Box>

    <Divider />
    <Grid container spacing={3} sx={{ padding: 2 }}>
    <Grid item xs={12}>รหัสการยืมอุปกรณ์</Grid>
        <Grid item xs={12} >  
        <FormControl required fullWidth> 
              <InputLabel id="menu-BorrowID">กรุณาเลือกรหัสการยืมอุปกรณ์</InputLabel>
              <Select
                id="BorrowID"
                value={borrow.ID || ""}
                label="กรุณาเลือกรหัสการยืมอุปกรณ์ *"
                onChange={onChangeBorrow}
                inputProps={{
                  name: "ID",
                }}
              >
                {borrows?.map((item: BorrowsInterface) => 
                  <MenuItem
                    key={item.ID}
                    value={item.ID}
                  >
                    {item.ID}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

                                                                {/* //////////////////////////// */}

        <Grid item xs={12} >
        <FormControl fullWidth variant="outlined">
            <p>หมายเหตุจากผู้บันทึก</p>
            <TextField
            label="หมายเหตุจากผู้บันทึก"
            type="string"
            disabled
            variant="filled"
            value={ borrow?.BorrowAPNote || ""}  
            />
            </FormControl>
        </Grid>

        <Grid item xs={12} >
        <FormControl fullWidth variant="outlined">
            <p>หมายเหตุจากผู้ยืม</p>
            <TextField
            label="หมายเหตุจากผู้ยืม"
            type="string"
            disabled
            variant="filled"
            value={ borrow?.BorrowNote1 || ""}  
            />
            </FormControl>
        </Grid>
        

    <Grid container spacing={2}>
        <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
            <p>ผู้ยืมอุปกรณ์</p>
            <TextField
            label="ชื่อ"
            type="string"
            disabled
            variant="filled"
            value={(booking.User?.FirstName + " " + booking.User?.LastName) || ""}  
            />
            </FormControl>
        </Grid>
        <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
            <p>Bookingcode</p>
            <TextField
                label="รหัสการจอง"
                type="string"
                disabled
                variant="filled"
                value={approves?.Booking?.Code || ""}
            /> 
            </FormControl>
        </Grid>  
        </Grid>               
        
    <Grid container spacing={2}>
        <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
            <p>เริ่มจองเวลา</p>
            <TextField
            label="เริ่มจองเวลา"
            type="string"
            disabled
            variant="filled"
            value={approves?.Booking?.Date_Start || ""}  
            />
            </FormControl>
        </Grid>
        <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
            <p>หมดจองเวลา</p>
            <TextField
            label="หมดจองเวลา"
            type="string"
            disabled
            variant="filled"
            value={approves?.Booking?.Date_End || ""}
            /> 
            </FormControl>
        </Grid>  
        </Grid>   
        </Grid>
        <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
            <p>ประเภทอุปกรณ์</p>
            <TextField
            label="ประเภทอุปกรณ์"
            type="string"
            disabled
            variant="filled"
            value={ borrow?.Device?.DeviceType?.DeviceTypeDetail || ""}
            /> 
            </FormControl>
        </Grid>  
        <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
            <p>อุปกรณ์</p>
            <TextField
            label="อุปกรณ์"
            type="string"
            disabled
            variant="filled"
            value={ borrow?.Device?.Detail || ""}
            /> 
            </FormControl>
        </Grid> 

        <Grid item xs={12}>
        <Button component={RouterLink} to="/borrows" variant="contained">
        Back
        </Button>

        <Button
        style={{ float: "right" }}
        onClick={submit}
        variant="contained"
        color="primary"
        >
        ยกเลิกการยืมอุปกรณ์
        </Button>
        </Grid>
    
    </Grid>
</Paper>
</Container>
 );
}
export default BorrowDelete;