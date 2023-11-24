const express= require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

app.use(
    session({
      secret: "12345qwertasdfzxcvbnm", 
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use("/assets",express.static("assets"));

  app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/employee_management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
    console.log("Connected to MongoDB");
});

const router = express.Router(); // Add this line to define the router object

// Define the User model (replace with your actual User model)
const User = mongoose.model('User', new mongoose.Schema({
    phone_no: String,
    password: String,
  }));


app.post('/login', async (req, res) => {
    console.log('Request received at /login');
    const { username, password } = req.body;
console.log(req.body);
    try {
        // Check if the user with the provided phone number exists
        const user = User.findOne({  username, password });

        //console.log(user);
        if (!user) {
            // User not found
            return res.json({ success: false });
        }
       // Compare the provided password with the hashed password in the database
        return res.json({ 
            success: true
         });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


// Define a mongoose schema for your Employee model
const employeeSchema = new mongoose.Schema({
    employeeName: String,
    id: String,
    fatherName: String,
    salary: Number,
    dob: Date,
    gender: String,
    languages: [String],
    country: String,
    profileUpload: String,
    resumeUpload: String,
  });
  
  // Create a mongoose model based on the schema
  const Employee = mongoose.model('Employee', employeeSchema);

  // Route handler for inserting employee details
app.post('/insert-employee-details', async (req, res) => {
    try {
        const {
            employeeName,
            id,
            fatherName,
            salary,
            dob,
            gender,
            languages,
            country,
        } = req.body;

        console.log(req.body);

        // Create a new Employee instance
        const newEmployee = new Employee({
            employeeName,
            id,
            fatherName,
            salary,
            dob,
            gender,
            languages,
            country,
        });

        await newEmployee.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, error: 'Failed to insert employee data' });
    }
});

// Route handler for getting employee details by ID
app.get('/api/get-employee-details-by-id', async (req, res) => {
    try {
        const employeeId = req.query.id;
        console.log("employee id",employeeId); 

        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({
            _id: employee._id,
            employeeName: employee.employeeName,
            id: employee.id,
            fatherName: employee.fatherName,
            salary: employee.salary,
            dob: employee.dob,
            gender: employee.gender,
            languages: employee.languages,
            country: employee.country,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/update-employee-data', async (req, res) => {
    try {
        const {
            employee_id,
            employeeName,
            id,
            fatherName,
            salary,
            dob,
            gender,
            languages,
            country,
        } = req.body;

        const updatedEmployee = await Employee.findByIdAndUpdate(employee_id, {
            employeeName,
            id,
            fatherName,
            salary,
            dob,
            gender,
            languages,
            country,
        }, { new: true });

        if (!updatedEmployee) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


app.delete('/delete-employee/:id', async (req, res) => {
    try {
        const employeeId = req.params.id;

        const deletedEmployee = await Employee.findByIdAndDelete(employeeId);

        if (!deletedEmployee) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


// Route handler to get all employee details
app.get('/get-employee-details', async (req, res) => {
    try {
      const employees = await Employee.find();
      res.json(employees);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


//   function requireAdminAuth(req, res, next) {
//     console.log("admin check",req.session.adminUser);
  
//       if (req.session.adminUser) {
//          return next();
//       }
//       res.redirect("/");
//   }


app.get("/",function(req,res){
    res.sendFile(__dirname + "/login.html");
});

app.get("/home",function(req,res){
    res.sendFile(__dirname + "/home.html");
});

//logout handler
app.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/"); 
    });
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

