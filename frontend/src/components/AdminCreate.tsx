import React from "react";
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
import { EducationLevelsInterface, GendersInterface, RolesInterface, UsersInterface } from "../models/IUser";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {ListGenders, ListRoles, ListEducationLevels,CreateUser} from "../services/HttpClientService";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import IconButton from "@mui/material/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AccessDenied from "./AccessDenied";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props, ref
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


function UserCreate() {
    const [date, setDate] = React.useState<Date | null>(null);
    const [user, setUser] = React.useState<Partial<UsersInterface>>({});
    const [genders, setGenders] = React.useState<GendersInterface[]>([]);
    const [roles, setRoles] = React.useState<RolesInterface[]>([]);
    const [educationlevels, setEducationLevels] = React.useState<EducationLevelsInterface[]>([]);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

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

    const handleChange = (event: SelectChangeEvent) => {
      const name = event.target.name as keyof typeof user;
      const value = event.target.value;
      setUser({
        ...user,
        [name]: value,
      });
      console.log(`[${name}]: ${value}`);
    };

    const handleInputChange = (

      event: React.ChangeEvent<{ id?: string; value: any }>

  ) => {
      const id = event.target.id as keyof typeof UserCreate;
      const { value } = event.target;
      setUser({ ...user, [id]: value });
  };

  const convertType = (data: string | number | undefined) => {
    let val = typeof data === "string" ? parseInt(data) : data;
    return val;
  };

    //ดึงข้อมูล Genders
    const listGenders = async () => {
      let res = await ListGenders();
      if (res) { setGenders(res); console.log("Load Gender Complete");}
      else{ console.log("Load Gender InComplete!!!!");}
    };

    const listRoles = async () => {
      let res = await ListRoles();
      if (res) { setRoles(res); console.log("Load Role Complete");}
      else{ console.log("Load Role InComplete!!!!");}
    };
    
    //ดึงข้อมูล EducationLevels
    const listEducationLevels = async () => {
      let res = await ListEducationLevels();
      if (res) { setEducationLevels(res); console.log("Load EducationLevel Complete");}
      else{ console.log("Load EducationLevel InComplete!!!!");}
    };

    React.useEffect(() => {
      listGenders();
      listEducationLevels();
      listRoles();
    }, []);

    
    async function  submit() {
        let data = {
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email,
            Phonenumber: user.PhoneNumber,
            IdentificationNumber: user.IdentificationNumber,
            StudentID: user.StudentID,
            Age: typeof user.Age === "string" ? parseInt(user.Age) : 0,
            Password: user.Password,
            BirthDay: date,
            
            EducationLevelID: convertType(user.EducationLevelID),
            RoleID: 1,
            GenderID: convertType(user.GenderID),
        };
        console.log(data)
        let res = await CreateUser(data);
        if (res.status) {
          setSuccess(true);
          setErrorMessage("");
      } else {
          setError(true);
          setErrorMessage(res.data);
      }
    }

    const roleLevel = localStorage.getItem('role')+""
  if (roleLevel !== "Admin") {
    return <AccessDenied />
  }


 return (
   <Container maxWidth="md">
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
         บันทึกข้อมูลไม่สำเร็จ
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
                    ลงทะเบียนสมาชิก
                </Typography>
            </Box>
       </Box>

       <Divider />

       <Grid container spacing={3} sx={{ padding: 2 }}>
         <Grid item xs={6}>
           <p>ชื่อ</p>
           <FormControl fullWidth variant="outlined">
             <TextField
               id="FirstName"
               variant="outlined"
               type="string"
               size="medium"
               label="ชื่อ" 
               inputProps={{name: "FirstName",}}
               value={user.FirstName || ""}
               onChange={handleInputChange}
             />
           </FormControl>
         </Grid>

         <Grid item xs={6}>
           <FormControl fullWidth variant="outlined">
             <p>นามสกุล</p>
             <TextField
               id="LastName"
               variant="outlined"
               type="string"
               size="medium"
               value={user.LastName || ""}
               onChange={handleInputChange}
             />
           </FormControl>
         </Grid>

         <Grid item xs={6}>
           <FormControl fullWidth variant="outlined">
             <p>อีเมลล์</p>
             <TextField
               id="Email"
               variant="outlined"
               type="string"
               size="medium"
               value={user.Email || ""}
               onChange={handleInputChange}
             />
           </FormControl>
         </Grid>

         <Grid item xs={6}>
           <FormControl fullWidth variant="outlined">
             <p>รหัสผ่าน</p>
             <OutlinedInput
              id="Password"
              onChange={handleInputChange}
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
            }
          />
           </FormControl>
         </Grid>

         <Grid item xs={6}>
           <p>รหัสนักศึกษา</p>
           <FormControl fullWidth variant="outlined">
             <TextField
               id="StudentID"
               variant="outlined"
               type="string"
               size="medium"
               value={user.StudentID || ""}
               onChange={handleInputChange}
             />
           </FormControl>
         </Grid>

         <Grid item xs={3}>
           <FormControl fullWidth variant="outlined">
             <p>อายุ</p>
             <TextField
               id="Age"
               variant="outlined"
               type="number"
               size="medium"
               InputProps={{ inputProps: { min: 1 } }}
               InputLabelProps={{ shrink: true,}}
               value={user.Age || ""}
               onChange={handleInputChange}
             />
           </FormControl>
         </Grid>

         <Grid item xs={3}>
            <FormControl fullWidth variant="outlined">
              <p>เพศ</p>
              <Select
                required
                defaultValue={"0"}
                onChange={handleChange}
                inputProps={{name: "GenderID",}}
              >
                <MenuItem value={"0"}>กรุณาเลือกเพศ</MenuItem>
                {genders?.map((item: GendersInterface) =>
                  <MenuItem
                    key={item.ID}
                    value={item.ID}
                  >
                    {item.Name}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>


         <Grid item xs={6}>
           <p>เบอร์โทรศัพท์</p>
           <FormControl fullWidth variant="outlined">
             <TextField
               id="PhoneNumber"
               variant="outlined"
               type="string"
               size="medium"
               value={user.PhoneNumber || ""}
               onChange={handleInputChange}
             />
           </FormControl>
         </Grid>

         <Grid item xs={6}>
           <p>เลขบัตรประชาชน</p>
           <FormControl fullWidth variant="outlined">
             <TextField
               id="IdentificationNumber"
               variant="outlined"
               type="string"
               size="medium"
               value={user.IdentificationNumber || ""}
               onChange={handleInputChange}
             />
           </FormControl>
         </Grid>

         <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <p>ระดับการศึกษา</p>
              <Select
                required
                defaultValue={"0"}
                onChange={handleChange}
                inputProps={{name: "EducationLevelID",}}
              >
                <MenuItem value={"0"}>กรุณาเลือกระดับการศึกษา</MenuItem>
                {educationlevels?.map((item: EducationLevelsInterface) =>
                  <MenuItem
                    key={item.ID}
                    value={item.ID}
                  >
                    {item.Name}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

         <Grid item xs={6}>
           <FormControl fullWidth variant="outlined">
             <p>วัน/เดือน/ปีเกิด</p>
             <LocalizationProvider dateAdapter={AdapterDateFns}>
               <DatePicker
                 value={date}
                 onChange={(newValue) => {setDate(newValue);}}
                 renderInput={(params) => <TextField {...params} />}
               />
             </LocalizationProvider>
           </FormControl>
         </Grid>

          <Grid item xs={3}>
            <FormControl fullWidth variant="outlined">
              <p>สถานะ</p>
              <Select
                required
                defaultValue={"0"}
                onChange={handleChange}
                inputProps={{name: "RoleID",}}
              >
                <MenuItem value={"0"}>กรุณาเลือกบทบาท</MenuItem>
                {roles?.map((item: RolesInterface) =>
                  <MenuItem
                    key={item.ID}
                    value={item.ID}
                  >
                    {item.Name}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

         <Grid item xs={12}>
           <Button component={RouterLink} to="/admins" variant="contained">
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
     </Paper>
   </Container>

 );

}


export default UserCreate;