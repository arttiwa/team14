import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { UsersInterface } from "../models/IUser";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ListUsers, } from "../services/HttpClientService";

function Users() {
  const [users, setUsers] = React.useState<UsersInterface[]>([]);
  const listUsers = async () => {
    let res = await ListUsers();
    if (res) {
      setUsers(res);
    }
  };

  const columns: GridColDef[] = [
      { field: "ID", headerName: "ID", width: 50 },
      { field: "FirstName", headerName: "ชื่อ", width: 150 },
      { field: "LastName", headerName: "นามสกุล", width: 150 },
      { field: "Email", headerName: "อีเมลล์", width: 150 },
      { field: "PhoneNumber", headerName: "เบอร์โทรศัพท์", width: 120 },
      { field: "IdentificationNumber", headerName: "เลขบัตรประชาชน", width: 150 },
      { field: "StudentID", headerName: "รหัสนักศึกษา", width: 100 },
      { field: "Age", headerName: "อายุ", width: 30 },
      { field: "Password", headerName: "รหัสผ่าน", width: 100, },
      { field: "BirthDay", headerName: "วัน/เดือน/ปีเกิด", width: 150 },
      { field: "Role", headerName: "สถานะ", width: 70, valueFormatter: (params) => params.value.Name,  },
      { field: "Gender", headerName: "เพศ", width: 80, valueFormatter: (params) => params.value.Name  },
      { field: "EducationLevel", headerName: "ระดับการศึกษา", width: 120, valueFormatter: (params) => params.value.Name  },
  ];

  useEffect(() => {
    listUsers();
  }, []);

 return (

   <div>
     <Container maxWidth="md">
       <Box
         display="flex"
         sx={{
           marginTop: 2,
         }}
       >

         <Box flexGrow={1}>
           <Typography
             component="h2"
             variant="h6"
             color="primary"
             gutterBottom
           >
             แอดมิน
           </Typography>
         </Box>

         <Box>
           <Button
             component={RouterLink}
             to="/admin/create"
             variant="contained"
             color="primary"
           >
             ลงทะเบียนสมาชิก/แอดมิน
           </Button>
         </Box>
       </Box>

       <div style={{ height: 400, width: "100%", marginTop: '20px'}}>
         <DataGrid
           rows={users}
           getRowId={(row) => row.ID}
           columns={columns}
           pageSize={5}
           rowsPerPageOptions={[5]}
         />
       </div>
       
     </Container>
   </div>

 );

}


export default Users;