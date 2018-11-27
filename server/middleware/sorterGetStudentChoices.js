const {User} = require("./../models/user.js");


let sorterGetStudentChoices = (req, res, next) => {
  User.find({}).then((students) => {

    let studentsArray = [];

    students.forEach(student => {
      let studentObject = {};
      studentObject.name = student.name;
      studentObject.studentid = student.studentid;
      studentObject.department = student.department;

      if(student["choices"] == "None" || !student["choices"]) {
        studentObject.choices = "None";
      } else {
        studentObject.choices = JSON.parse(student["choices"]);
      }

      studentsArray.push(studentObject);
    })

    req.studentsArray = studentsArray;
    next()
  })
}

module.exports = {
  sorterGetStudentChoices: sorterGetStudentChoices,
}
