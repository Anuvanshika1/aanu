const express = require("express");
const path = require("path");
const data = require("./data-service.js");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const exphbs = require("express-handlebars");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.set("view engine", ".hbs");

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    // we write the filename as the current date down to the millisecond
    // in a large web service this would possibly cause a problem if two people
    // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
    // this is a simple example.
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/images/add", (req, res) => {
  res.render("addImage");
});

app.get("/employees/add", (req, res) => {
  data
    .getDepartments()
    .then((data) => {
      res.render("addEmployee", { departments: data });
    })
    .catch(() => {
      res.render("addEmployee", { departments: [] });
    });
});

app.get("/images", (req, res) => {
  fs.readdir("./public/images/uploaded", function (err, items) {
    res.render("images", { images: items });
  });
});

app.get("/employees", (req, res) => {
  if (req.query.status) {
    data
      .getEmployeesByStatus(req.query.status)
      .then((data) => {
        if (data.length > 0) {
          res.render("employees", { employees: data });
        } else {
          res.render("employees", {
            message: "No Data Available. Try changing filters.",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("employees", { message: "No results" });
      });
  } else if (req.query.department) {
    data
      .getEmployeesByDepartment(req.query.department)
      .then((data) => {
        if (data.length > 0) {
          res.render("employees", { employees: data });
        } else {
          res.render("employees", {
            message: "No Data Available. Try changing filters.",
          });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.manager) {
    data
      .getEmployeesByManager(req.query.manager)
      .then((data) => {
        if (data.length > 0) {
          if (data.length > 0) {
            res.render("employees", { employees: data });
          } else {
            res.render("employees", {
              message: "No Data Available. Try changing filters.",
            });
          }
        } else {
          res.render("employees", {
            message: "No Data Available. Try changing filters.",
          });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else {
    data
      .getAllEmployees()
      .then((data) => {
        if (data.length > 0) {
          res.render("employees", { employees: data });
        } else {
          res.render("employees", {
            message: "No Data Available.",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("employees", { message: "no results returned" });
      });
  }
});

app.get("/employee/:empNum", (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  data
    .getEmployeeByNum(req.params.empNum)
    .then((data) => {
      if (data) {
        viewData.employee = data[0].dataValues; //store employee data in the "viewData" object as "employee"
      } else {
        viewData.employee = null; // set employee to null if none were returned
      }
    })
    .catch(() => {
      viewData.employee = null; // set employee to null if there was an error
    })
    .then(data.getDepartments)
    .then((data) => {
      viewData.departments = data; // store department data in the "viewData" object as "departments"
      // loop through viewData.departments and once we have found the departmentId that matches
      // the employee's "department" value, add a "selected" property to the matching
      // viewData.departments object
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = []; // set departments to empty if there was an error
    })
    .then(() => {
      if (viewData.employee == null) {
        // if no employee - return an error
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData }); // render the "employee" view
      }
    });
});

app.get("/departments", (req, res) => {
  data
    .getDepartments()
    .then((data) => {
      if (data.length > 0) {
        res.render("departments", { departments: data });
      } else {
        res.render("departments", {
          message: "No Data Available.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.render("departments", { message: "no results returned" });
    });
});

app.post("/employees/add", (req, res) => {
  data
    .addEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.render("employee", { message: "no results" });
    });
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.post("/employee/update", (req, res) => {
  data
    .updateEmployee(req.body)
    .then((data) => {
      res.redirect("/employees");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).render("employee", { message: "Employee Not Updated" });
    });
});

app.get("/employees/delete/:empNum", (req, res) => {
  data
    .deleteEmployeeByNum(req.params.empNum)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).render("employee", {
        message: "Unable to Remove Employee / Employee not found",
      });
    });
});

app.get("/departments/add", (req, res) => {
  res.render("addDepartment");
});

app.post("/departments/add", (req, res) => {
  data
    .addDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.render("department", { message: "no results" });
    });
});

app.get("/department/:id", (req, res) => {
  data
    .getDepartmentById(req.params.id)
    .then((data) => {
      res.render("department", { department: data[0].dataValues });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).render("department", { message: "Department not found" });
    });
});

app.post("/department/update", (req, res) => {
  data
    .updateDepartment(req.body)
    .then((data) => {
      res.redirect("/departments");
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .render("department", { message: "Department Not Updated" });
    });
});

app.get("/departments/delete/:id", (req, res) => {
  data
    .deleteDepartmentById(req.params.id)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).render("department", {
        message: "Unable to Remove Employee / Employee not found",
      });
    });
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

data
  .initialize()
  .then(function () {
    console.log("Database Connected");
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log("unable to start server: " + err);
  });
