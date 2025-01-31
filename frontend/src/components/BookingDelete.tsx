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
import { BookingsInterface } from "../models/IBooking";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { 
    ListBookingbyUser,
    GetBooking,
    GetBuilding,
    DeleteBooking,
} from "../services/HttpClientService";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { BuildingsInterface } from "../models/IBuilding";
import MenuItem from "@mui/material/MenuItem";
import AccessDenied from "./AccessDenied";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props, ref
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


function BookingDelete() {
  const uid = parseInt(localStorage.getItem("userID")+"")
  const [building, setBuilding] = useState<BuildingsInterface>({});
  const [bookingUser, setBookingUser] = useState<BookingsInterface>({
    Code: "",
    Date_Start: new Date(),
    Date_End: new Date(),
  });
  const [bookings, setBookings] = useState<BookingsInterface[]>([]);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const handleClose = (
      event?: React.SyntheticEvent | Event,
      reason?: string
  ) => {
      if (reason === "clickaway") {
          return;
      }
      setSuccess(false);
      setError(false);
  };

  const onChangeBooking = async (e: SelectChangeEvent) =>{ 
    const bid = e.target.value;
    let res = await GetBooking(bid); // Transaction #1
    if (res) {
      setBookingUser(res);  
    }
    else{
      console.log("Load BookingUser Incomplete!!!");
    }
    res = await GetBuilding(res.Room.BuildingID);  // Transaction #2
    if (res) {
      setBuilding(res);
    }
    else{
      console.log("Load Building Incomplete!!!");
    }   
  }

  const listBookingbyUser = async () => {
    let res = await ListBookingbyUser(uid); // Transaction #3
    if (res.status) {
      setBookings(res.data)
    }
    else{
      console.log("Load Bookings InComplete!!!!");
    }
  };

  async function submit() {
      let res = await DeleteBooking(bookingUser.ID); // Transaction #4
      if (res.status) {
          setSuccess(true);
          setErrorMessage("");
          listBookingbyUser();
      } else {
          setError(true);
          setErrorMessage(res.data);
      }
  }

  useEffect(() => {
    listBookingbyUser();
  }, []);

  //Check Role
  const roleLevel = localStorage.getItem('role')+""
  if (roleLevel !== "User") {
    return <AccessDenied />
  }

 return (
  <Container maxWidth="md">
    <Snackbar
      id="success" 
      open={success}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity="success">
        ลบข้อมูลสำเร็จ
      </Alert>
    </Snackbar>

    <Snackbar id="error" open={error} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error">
        ลบข้อมูลไม่สำเร็จ: {errorMessage}
      </Alert>
    </Snackbar>

    <Grid container spacing={3} sx={{ padding: 2 }}>
      <Grid item xs={12} >
          <Grid container spacing={1} sx={{ padding: 2 }} component={Paper} display="flex" >
            <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
            >
                Delete Booking
            </Typography>
          </Grid>
      </Grid>

      <Grid item xs={12} >
        <Grid container spacing={1} sx={{ padding: 2 }} component={Paper} display="flex" >
          <Grid item xs={12}>รหัสการจองใช้ห้อง</Grid>
          <Grid item xs={12} >
            <FormControl fullWidth variant="outlined">
              <InputLabel id="BookingID">กรุณารหัสการจองของคุณ</InputLabel>
              <Select
                labelId="BookingID"
                label="กรุณารหัสการจองของคุณ *"
                onChange={ (onChangeBooking) }
                inputProps={{
                  name: "BookingID",
                }}
              >
                {bookings.map((item: BookingsInterface) => (
                  <MenuItem 
                    key={item.ID}
                    value={item.ID}
                  >
                    {item.Code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <p>เวลาเริ่มต้นการจอง</p>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="กรุณาเลือกเวลา"
                value={bookingUser.Date_Start}
                onChange={(newValue) => {
                  setBookingUser({
                    ...bookingUser,
                    Date_Start: newValue,
                  });
                }}
                ampm={true}
                disabled
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={6}>
            <p>เวลาสิ้นสุดการจอง</p>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="กรุณาเลือกเวลา"
                value={bookingUser.Date_End}
                minDateTime={bookingUser.Date_Start}
                onChange={(newValue) => {
                  setBookingUser({
                    ...bookingUser,
                    Date_End: newValue,
                  });               
                }}
                disabled
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={6} >
            <p>ตึก</p>
            <FormControl required fullWidth >
              <TextField 
                value={building?.Detail}
                disabled
              />
            </FormControl>
          </Grid>

          <Grid item xs={6} >
            <p>ห้อง</p>
            <FormControl required fullWidth >
              <TextField 
                value={bookingUser.Room?.Detail}
                disabled
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} >
            <p>จุดประสงค์ในการจอง</p>
            <FormControl required fullWidth >
              <TextField 
                value={bookingUser?.Objective?.Detail}
                disabled
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
           <Button component={RouterLink} to="/bookings" variant="contained">
             Back
           </Button>

           <Button
             style={{ float: "right" }}
             onClick={submit}
             variant="contained"
             color="primary"
           >
             Submit
           </Button>
          </Grid>
          </Grid>
        </Grid>
     </Grid>
   </Container>

 );

}

export default BookingDelete;
