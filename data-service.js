const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "dcg5ua7t25hdmu",
  "hwoaopyyabgooh",
  "c7c643639f8e81c202b6c2729dc059923ee5052d8508dbc067873e33c7f8ec28",
  {
    host: "ec2-52-70-205-234.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    logging: false,
  }
);

//creating models

var Employee = sequelize.define("Employee", {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  employeeManagerNum: Sequelize.INTEGER,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  status: Sequelize.STRING,
});

var Department = sequelize.define("Department", {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  departmentName: Sequelize.STRING,
});

//database relationship defined
Department.hasMany(Employee, { foreignKey: "department" });

module.exports.initialize = function () {
  return sequelize.sync();
};

module.exports.getAllEmployees = function () {
  return new Promise(function (resolve, reject) {
    Employee.sync().then(() => {
      Employee.findAll()
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.addEmployee = function (employeeData) {
  for (const property in employeeData) {
    if (employeeData[property] === "") {
      employeeData[property] = null;
    }
  }
  employeeData.isManager = employeeData.isManager ? true : false;
  return new Promise(function (resolve, reject) {
    Employee.sync().then(() => {
      Employee.create(employeeData)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.getEmployeeByNum = function (num) {
  return new Promise(function (resolve, reject) {
    Employee.sync().then(() => {
      Employee.findAll({
        where: {
          employeeNum: num,
        },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.getEmployeesByStatus = function (status) {
  return new Promise(function (resolve, reject) {
    Employee.sync().then(() => {
      Employee.findAll({
        where: {
          status: status,
        },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.getEmployeesByDepartment = function (department) {
  return new Promise(function (resolve, reject) {
    Employee.sync().then(() => {
      Employee.findAll({
        where: {
          department: department,
        },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.getEmployeesByManager = function (manager) {
  return new Promise(function (resolve, reject) {
    Employee.sync().then(() => {
      Employee.findAll({
        where: {
          employeeManagerNum: manager,
        },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.deleteEmployeeByNum = function (empNum) {
  return new Promise(function (resolve, reject) {
    Employee.sync().then(() => {
      Employee.destroy({
        where: {
          employeeNum: empNum,
        },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.getManagers = function () {
  return new Promise(function (resolve, reject) {
    Employee.sync().then(() => {
      Employee.findAll({
        where: {
          isManager: true,
        },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.getDepartments = function () {
  return new Promise(function (resolve, reject) {
    Department.sync().then(() => {
      Department.findAll()
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.updateEmployee = function (employeeData) {
  for (const property in employeeData) {
    if (employeeData[property] === "") {
      employeeData[property] = null;
    }
  }
  employeeData.isManager = employeeData.isManager ? true : false;
  return new Promise(function (resolve, reject) {
    Employee.sync().then(() => {
      Employee.update(employeeData, {
        where: { employeeNum: employeeData.employeeNum },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.addDepartment = function (departmentData) {
  return new Promise(function (resolve, reject) {
    Department.sync().then(() => {
      Department.create(departmentData)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.getDepartmentById = function (id) {
  return new Promise(function (resolve, reject) {
    Department.sync().then(() => {
      Department.findAll({
        where: {
          departmentId: id,
        },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

module.exports.updateDepartment = function (departmentData) {
  return new Promise(function (resolve, reject) {
    Department.sync().then(() => {
      Department.update(departmentData, {
        where: { departmentId: departmentData.departmentId },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  });
};

module.exports.deleteDepartmentById = function (id) {
  return new Promise(function (resolve, reject) {
    Department.sync().then(() => {
      Department.destroy({
        where: {
          departmentId: id,
        },
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};
