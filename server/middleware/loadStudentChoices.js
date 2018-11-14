const {User} = require("./../models/user.js");

let loadStudentChoices = (req, res, next) => {
  // prepare studentChoices tableDiv
  let studentChoicesHeaders =
          `<th scope="col">Id</th>
          <th scope="col">Name</th>
          <th scope="col">Department</th>
          <th scope="col" style="text-align: center">1</th>
          <th scope="col" style="text-align: center">2</th>
          <th scope="col" style="text-align: center">3</th>
          <th scope="col" style="text-align: center">4</th>
          <th scope="col" style="text-align: center">5</th>
          <th scope="col" style="text-align: center">6</th>
          <th scope="col" style="text-align: center">7</th>
          <th scope="col" style="text-align: center">8</th>
          <th scope="col" style="text-align: center">9</th>
          <th scope="col" style="text-align: center">10</th>`

let studentChoicesRows = "";

  // Get student data
  User.find({}).then(users => {
    users.forEach(user => {

      let name = user["name"];
      let studentid = user["studentid"];
      let department = user["department"];
      let choices = JSON.parse(user["choices"]) || "None";

      studentChoicesRows += '<tr>';
      studentChoicesRows += `<th scope="row">${studentid}</th>`;
      studentChoicesRows += `<td scope="col">${name}</td>`;
      studentChoicesRows += `<td scope="col">${department}</td>`;

      if(Array.isArray(choices)) {
        choices.forEach(choice => {
          studentChoicesRows += `<td scope="col">${choice}</td>`;
        })

        for(let i = 10; i > choices.length; i--) { // add empty cells if student has chosen fewer than 10 companies
          studentChoicesRows += '<td scope="col"></td>';
        }

      } else {
        for(let i = 0; i < 10; i++) {
          studentChoicesRows += '<td scope="col"></td>';
        }
      }

      studentChoicesRows += "</tr>";
    })

  let studentChoicesTable = `<h4>Student Choices</h4>
                    <div id="tableFlexBox">
                        <div id = "tableDiv" style="overflow-x:auto; overflow-y: auto">
                            <table class="table table-hover table-bordered table-sm">
                              <thead>
                                <tr>
                                  ${studentChoicesHeaders}
                                </tr>
                              </thead>
                              <tbody>${studentChoicesRows}</tbody>
                            </table>
                        </div>
                    </div>`;

    req.studentChoicesTable = studentChoicesTable;
    next();
  })
}
module.exports = {
  loadStudentChoices: loadStudentChoices
}
