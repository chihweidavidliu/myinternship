const consoleLog = document.getElementById("consoleLog");
const outputLog = document.getElementById("outputLog");
const button = document.getElementById("sort");
const pdfButton = document.getElementById("pdf");
const token = localStorage.getItem("admin-auth");

            $("#logOut").click(function(event) {
              event.preventDefault();

              let token = localStorage.getItem("admin-auth");

              $.ajax({
                url: '/admin/logout',
                method: 'DELETE',
                beforeSend: function(request) {
                  request.setRequestHeader("admin-auth", token);
                },
              }).then((response) => {
                localStorage.removeItem('admin-auth');
                localStorage.removeItem('username');

                window.location = `/admin`;
              }).catch((e) => {
                console.log(e);
                alert("Logout failed, please try again later");
              })

            })

             function nameRemover(companyChoices, student, tentativeAdmits) {

                for(let company in companyChoices) {
                    companyChoices[company]['choices'].forEach(choice => {
                        if(choice == student) {
                            // if the student appears in the company's list, get the index
                            let index = companyChoices[company]['choices'].indexOf(choice);
                            // splice the student's name out using index
                            companyChoices[company]['choices'].splice(index, 1);
                        }
                    })
                }
            }


            function logger(target, text) {
               const li = document.createElement("li");

                //within the li, put text into a contenteditable span and button afterwards
                li.innerHTML = text;
                target.appendChild(li);

                //scroll to the new list item (important if the list overflows the container);
                li.scrollIntoView();
            }


            function sorter(companyChoices, students, tentativeAdmits) {
                let numberOfStudents = students.length;
                students.forEach(student => {
                        student['resolved'] = false;
                    })

               let round = 1;
                    while(students.some(student => (student.resolved == false))) {
                        logger(consoleLog, `<span style="color:blue; font-weight:bold">Initiating round ${round}</span>`)

                        // loop through students
                        for(let i = 0; i < numberOfStudents; i++) {
                            // skip students who have already been resolved
                                if(students[i]['resolved'] == true || students[i]['resolved'] == "tentative") {
                                    continue;
                                }

                            console.log(students[i]);
                                let currentStudent = students[i]['name'];
                                logger(consoleLog, `<span style="font-weight:bold">${currentStudent}</span>`);

                                // skip students who have explicitly or implicitly withdrawn from the programme
                                if(students[i]['choices'] == "None" || students[i]['choices'] == null) {
                                    students[i]['choices'] = "None"; // set null values to 'None' for consistency

                                    // mark the students as resolved, ready for filtering
                                    students[i]['resolved'] = true;

                                    // remove instances of the student from companyChoices
                                    nameRemover(companyChoices, currentStudent);

                                    // log the resolution of the student
                                    logger(consoleLog, `${currentStudent} has not chosen any companies.`);
                                    logger(consoleLog, `${currentStudent} has been removed from company lists.`)

                                    continue;
                                } else { // if students have choices, loop through them
                                    for (let ii = 0; ii < students[i]['choices'].length; ii++) {
                                        let currentStudentChoice = students[i]['choices'][ii];

                                        if(!companyChoices[currentStudentChoice]) { // skip companies chosen by students which do not appear in the companies list for whatever reason
                                            logger(consoleLog, `Choice number ${ii + 1} for ${currentStudent} is ${currentStudentChoice}`);
                                            logger(consoleLog, `<span style="color:red">This company is not on the company list.</span>`);
                                            logger(consoleLog, `<span style="color:red">Moving to next choice</span>`);
                                            continue;
                                        }

                                        let currentCompanyChoices = companyChoices[currentStudentChoice]['choices'];
                                        logger(consoleLog, `Choice number ${ii + 1} for ${currentStudent} is ${currentStudentChoice}`);

                                         // if the currentStudent does not appear in the company's list, mark the choice as eliminated
                                        if(currentCompanyChoices.includes(currentStudent) == false) {

                                            console.log(`${currentStudent} eliminated by ${currentStudentChoice} (not on company list)`);
                                            logger(consoleLog, `<span style="color:red">${currentStudent} eliminated by ${currentStudentChoice} (not on company list)</span>`);
                                            students[i]['choices'][ii] = "eliminated";

                                        } else { // if the student is on the company list

                                            // check how many acceptances the company has
                                            let numberAccepted = companyChoices[currentStudentChoice]['numberAccepted'];
                                            console.log(`${currentStudentChoice} accepts ${numberAccepted} student(s)`);
                                            logger(consoleLog, `${currentStudentChoice} accepts ${numberAccepted} student(s)`);

                                            let currentNumberOfAdmits = tentativeAdmits[currentStudentChoice].length;
                                            console.log(`${currentStudentChoice} has currently accepted ${currentNumberOfAdmits} student(s)`);
                                            logger(consoleLog, `${currentStudentChoice} has currently accepted ${currentNumberOfAdmits} student(s)`);

                                            if(currentNumberOfAdmits < numberAccepted) { // if the company has not filled its quota, the student is tentatively admitted

                                                console.log(`${currentStudent} has been tentatively selected by ${currentStudentChoice}`);
                                                logger(consoleLog, `<span style="color:green">${currentStudent} has been tentatively selected by ${currentStudentChoice}</span>`);

                                                // signal acceptance by pushing student name to tentativeAdmits array (if name is not already in the array)
                                                if(!tentativeAdmits[currentStudentChoice].includes(currentStudent)) {
                                                    tentativeAdmits[currentStudentChoice].push(currentStudent);
                                                }

                                                // sort the array in rank order
                                                tentativeAdmits[currentStudentChoice].sort(function(a, b) {
                                                    return companyChoices[currentStudentChoice]['choices'].indexOf(a) - companyChoices[currentStudentChoice]['choices'].indexOf(b);
                                                });

                                                // mark student resolved status as tentative
                                                students[i]['resolved'] = "tentative";
                                                break;  // move on to the next student

                                            } else { // if the chosen company's quota has already been filled
                                                console.log(`${currentStudentChoice}'s quota has already been filled. Checking student ranking.`);
                                                logger(consoleLog, `${currentStudentChoice}'s quota has already been filled`);
                                                logger(consoleLog, "Checking student ranking")

                                                // push the current student name into the array provisionally
                                                tentativeAdmits[currentStudentChoice].push(currentStudent);

                                                // sort the array in rank order
                                                tentativeAdmits[currentStudentChoice].sort(function(a, b) {
                                                    return companyChoices[currentStudentChoice]['choices'].indexOf(a) - companyChoices[currentStudentChoice]['choices'].indexOf(b);
                                                });

                                                console.log(tentativeAdmits[currentStudentChoice]);

                                                // if last person in array is the current student, student is rejected
                                                let lastPerson = tentativeAdmits[currentStudentChoice].length -1;

                                                if(tentativeAdmits[currentStudentChoice][lastPerson] == currentStudent) {
                                                    console.log(`${currentStudent} is ranked too low to be placed in ${currentStudentChoice}'s shortlist and is eliminated from contention.`)

                                                    logger(consoleLog, `<span style="color:red">${currentStudent} is ranked lower than current admits.</span>`)
                                                    logger(consoleLog, `<span style="color:red">${currentStudent} is eliminated from contention.</span>`)

                                                    // mark the choice as eliminated
                                                    students[i]['choices'][ii] = "eliminated";

                                                    // remove the student from tentative admits array
                                                    tentativeAdmits[currentStudentChoice].pop();

                                                    // move on to next choice
                                                    continue;

                                                } else { // if last person in the array is not the current student, current student is accepted
                                                    console.log(`${currentStudent} shortlisted by ${currentStudentChoice}`);
                                                    logger(consoleLog, `<span style="color:green">${currentStudent} shortlisted by ${currentStudentChoice}</span>`);

                                                    // mark current student resolved status as tentative
                                                    students[i]['resolved'] = "tentative";
                                                    console.log(`${tentativeAdmits[currentStudentChoice][lastPerson]} is ranked lower and is removed from ${currentStudentChoice}'s shortlist`);

                                                    logger(consoleLog, `<span style="color:red">${tentativeAdmits[currentStudentChoice][lastPerson]} has been displaced. </span>`);
                                                    logger(consoleLog, `<span style="color:red">${tentativeAdmits[currentStudentChoice][lastPerson]} is unshortlisted by ${currentStudentChoice}`)

                                                     // remove the displaced student's highest choice from students array
                                                    let index = students.findIndex(student => student.name == tentativeAdmits[currentStudentChoice][lastPerson])

                                                    if(Array.isArray(students[index]['choices'])) {
                                                       students[index]['choices'].shift();
                                                   };

                                                    // switch displaced student's resolved status back to false
                                                    students[index]['resolved'] = false;

                                                     // remove displaced person from tentative admits array
                                                    tentativeAdmits[currentStudentChoice].pop();

                                                    // move on to next student
                                                    break;

                                                }
                                            }
                                        }
                                    } // end of student choices for loop
                                }
                        } // end of first loop through students array


                         // filter out instances of 'eliminated' from the students' choices
                         students.forEach(student => {
                            if(Array.isArray(student.choices)) { // ignore students who do not have a choices array
                                let filtered = student.choices.filter(choice => {
                                    return choice != "eliminated";
                                })
                                student['choices'] = [...filtered];
                            }
                        })

                        // if the student has been eliminated from all choices, their empty array is marked as 'Eliminated' and they are marked as resolved
                        students.forEach(student => {
                            // mark any student who has been eliminated as resolved
                            if(Array.isArray(student.choices) && student.choices.length == 0) {
                                student.choices = "Eliminated";
                                student.resolved = true;
                                logger(consoleLog, `<span style="color:red">${student.name} has been rejected by all choices</span>`)
                            }
                        })

                        console.log(`Student choices after this round:`)
                        console.log(students);
                        console.log(`Tentative Admits after this round:`)
                        console.log(tentativeAdmits);

                        logger(consoleLog, `<span style='font-weight: bold'>Tentative Admits after round ${round}:</span>`);

                        for (let company in tentativeAdmits) {
                           let list = "";
                           let rank = 1;

                            tentativeAdmits[company].forEach(admit => {
                               list += `${rank}. ${admit} `;
                                rank++;
                            })
                             logger(consoleLog, `<span style="text-decoration:underline">${company}</span>: ${list}`);
                        }
                        round++;
                   } // end of while loop
            }


            function finalResults(students, tentativeAdmits) {
                        logger(consoleLog, `<span style="font-weight:bold; color:blue">SORTING COMPLETED</span>`)

                        students.forEach(student => {
                            student.resolved = true;
                            if(Array.isArray(student.choices)) {
                                student.choices = student.choices[0];
                            }
                        })

                        console.log(`FINAL STUDENT CHOICES:`)
                        console.log(students);

                        outputLog.innerHTML = `<h5>Final Student Choices</h5>
                            <table class="table table-hover" id="studentChoices">
                              <thead>
                                <tr>
                                  <th scope="col">ID</th>
                                  <th scope="col">Name</th>
                                  <th scope="col">Department</th>
                                  <th scope="col">Choice</th>
                                </tr>
                              </thead>
                              <tbody id="tableBody"></tbody>
                            </table>`;

                        const tableBody = document.getElementById("tableBody");

                        students.forEach(student => {
                            let tableItem = `<tr>
                              <th scope="row">${student.studentid}</th>
                              <td>${student.name}</td>
                              <td>${student.department}</td>
                              <td>${student.choices}</td>
                            </tr>`;

                            tableBody.innerHTML += tableItem;
                        })

                        console.log("FINAL COMPANY CHOICES:")
                        console.log(tentativeAdmits);

                        outputLog.innerHTML += `<hr><h5>Final Company Choices</h5>
                            <table class="table table-hover table-bordered" id="companyChoices">
                              <thead>
                                <tr id="headers">
                                  <th scope="col">Company</th>


                                </tr>
                              </thead>
                              <tbody id="tableBody2"></tbody>
                            </table>`;


                        const tableBody2 = document.getElementById("tableBody2");
                        const headers = document.getElementById("headers");

                         let highestAdmitCount = 0;

                         for (let company in tentativeAdmits) {
                             // get the length of the longest array in tentativeAdmits and create that number of choice columns
                            if(tentativeAdmits[company].length > highestAdmitCount) {
                                     highestAdmitCount = tentativeAdmits[company].length;
                                 }

                             // add company names
                            let tableData = `<th scope="row">${company}</th>`;

                            tentativeAdmits[company].forEach(admit => {
                                tableData += `<td scope="col">${admit}</td>`;
                            })
                            tableBody2.innerHTML += `<tr>${tableData}</tr>`;
                        }

                        // add the suitable number of 'choice' columns to match the highest number of admits for any single company
                        for(let i = 0; i < highestAdmitCount; i++) {
                            headers.innerHTML += `<th scope="col" style="text-align: center">Choice ${i+1}</th>`;
                        }
                    }


            function savePDF() {
                pdfMake.fonts = {
                   SimHei: {
                     normal: 'SimHei.ttf',
                   }
                };

                // prepare student choices pdf

                // get the student data as a 2d array to put into the body section of the tbale
                const tableBody = document.getElementById("tableBody");
                const tableRows = tableBody.querySelectorAll("tr");
                let bodyArray = [['ID', 'Name', 'Department', 'Choice']];

                console.log(tableRows);

                tableRows.forEach(row => { // loop through the students
                    let rowID = row.querySelector("th"); // get each individual info nodes for the student
                    let rowInfo = row.querySelectorAll("td");
                    console.log(rowInfo);
                    let subArray = [];
                    subArray.push(rowID.innerText);
                    rowInfo.forEach(item => subArray.push(item.innerText)); // push the text of each node into subArray
                    bodyArray.push(subArray); // add the student information to the bodyArray

                })

                console.log(bodyArray);

                var docDefinition = {
                    content: [
                         { text: 'Final Student Choices', style: 'header' },
                         {
                            style: 'tableExample',
                            table: {
                                body: bodyArray
                            }
                        },
                       ],
                     styles: {
                         header: {
                           fontSize: 22,
                         },

                        tableExample: {
                            margin: [0, 5, 0, 15]
                        },
                     },
                    defaultStyle: {
                        font: 'SimHei'
                      }
                };

                pdfMake.createPdf(docDefinition).download('FinalStudentChoices.pdf');
                // prepare company choices pdf
                const companyTableBody = document.getElementById("tableBody2");
                const companyTableRows = companyTableBody.querySelectorAll("tr");
                const headers = document.getElementById("headers").querySelectorAll("th");
                let numOfHeaders = headers.length;

                let bodyArray2 = [];
                let headerArray = [];
                headers.forEach(header => headerArray.push(header.innerText));

                bodyArray2.push(headerArray);

                companyTableRows.forEach(row => {
                    let subArray = [];
                    let rowHeader = row.querySelector("th");
                    let rowInfo = row.querySelectorAll("td");
                    let numOfChoices = rowInfo.length + 1;

                    subArray.push(rowHeader.innerText);

                    rowInfo.forEach(item => subArray.push(item.innerText));

                    // add empty cells for companies which had fewer choices than the number of columns
                    for(let i = numOfHeaders; i > numOfChoices; i--) {
                        subArray.push("");
                    }

                    bodyArray2.push(subArray);

                })
                console.log(bodyArray2)

                var docDefinition2 = {
                    content: [
                         { text: 'Final Company Choices', style: 'header' },
                         {
                            style: 'tableExample',
                            table: {
                                body: bodyArray2
                            }
                        },
                       ],
                     styles: {
                         header: {
                           fontSize: 22,
                         },

                        tableExample: {
                            margin: [0, 5, 0, 15]
                        },

                     },
                    defaultStyle: {
                        font: 'SimHei'
                      }
                };
                pdfMake.createPdf(docDefinition2).download('FinalCompanyChoices.pdf');
            }

            pdfButton.addEventListener("click", savePDF);

             let finalChoices = [];
            let students = [];


          // get data then initiate sort
           $.ajax({
                  url: '/fetchSorterData',
                  method: 'GET',
                  beforeSend: function(request) {
                    request.setRequestHeader("admin-auth", token);
                  },
                }).then(data => {

                  // put data into the studentsArray and the companyChoices array
                  let studentsArray = data.studentsArray;
                  let companyChoices = data.companyChoices;

                  console.log(studentsArray);
                  console.log(companyChoices)

                })


         //    // fetch students data and push to students array
         //    var xmlhttp = new XMLHttpRequest();
         //
         //    xmlhttp.onreadystatechange = function() {
         //        if (this.readyState == 4 && this.status == 200) {
         //            let studentsArray = JSON.parse(this.responseText);
         //            studentsArray.forEach(student => {
         //                students.push(student);
         //            })
         //        }
         //    };
         //    xmlhttp.open("GET", "getJSON.php", true);
         //    xmlhttp.send();
         //
         // // fetch companyChoices object and initiate the sorting process
         //    fetch('getCompanyChoicesJSON.php')
         //      .then(response => response.json())
         //      .then(data => {
         //        let companyChoices = data;
         //        console.log(companyChoices);
         //        // set up tentativeadmits with all the company names from the database
         //        let tentativeAdmits = {};
         //
         //        for(let company in companyChoices) {
         //            tentativeAdmits[company] = [];
         //        }
         //        //initiate everything
         //
         //        let initiateAll = function() {
         //            // initiate sorting
         //            sorter(companyChoices, students, tentativeAdmits);
         //
         //            // print final results to output console
         //            finalResults(students, tentativeAdmits);
         //
         //            // remove click functionality to stop people sorting more than once but with the updated students array
         //            button.removeEventListener('click', initiateAll);
         //            // reveal the save output as pdf button
         //            pdfButton.style.display = "block";
         //        }
         //         button.addEventListener("click", initiateAll)
         //    });
