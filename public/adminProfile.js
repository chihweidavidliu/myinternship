const companyListForm = document.getElementById("companyListForm");
const companyListInput = document.getElementById("companyListInput");
const companyList = document.getElementById("companyList");
const companyChoices = document.getElementById("companyChoices");


// toggle between student and company choices

 $('.toggle').click(function(e) {

     e.preventDefault();

    $("#companyChoices").toggle();
    $("#studentChoices").toggle();

    $("#displayStudentChoices").toggle();
     $("#displayCompanyChoices").toggle();

})


// logout button

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


// change contenteditable enter functionality
function preventDefaultEnter() {

    $("tr").on('keydown', function(e) {

        let el = event.target;

        if(e.keyCode == 13 /*ENTER*/) {

            // prevent default behaviour for enter (create new line)
            e.preventDefault();


            //defocus input

             el.blur();

        } else if(e.keyCode == 27 /*ESC*/) {

            // restore state
          document.execCommand('undo');


            //defocus input
          el.blur();

        }

    });

}

preventDefaultEnter();




// add row functionality


const addRowButton = document.getElementById("addRow");


addRowButton.onclick = function() {

    const headers = document.getElementById("headers");
    const tableBody2 = document.getElementById("tableBody2");
    const tableRows = tableBody2.querySelectorAll("tr");
    let NumberOfColumns = headers.querySelectorAll("th").length;


    let tr = document.createElement("tr");

    let rowContent = "";

    rowContent += '<th scope="row" contenteditable="true"></th>';


    for(let i = 1; i < NumberOfColumns; i++) {


        rowContent += `<td contenteditable="true"></td>`;

    }

    tr.innerHTML = rowContent;

    tableBody2.appendChild(tr);

    tr.scrollIntoView();

    //reinitialise preventDefaultEnter
     preventDefaultEnter();



}




//remove row functionality

const removeRowButton = document.getElementById("removeRow");

removeRowButton.onclick = function() {

    const headers = document.getElementById("headers");
    const tableBody2 = document.getElementById("tableBody2");
    const tableRows = tableBody2.querySelectorAll("tr");
    let NumberOfRows = tableRows.length;

    if(NumberOfRows > 1) {


        tableBody2.removeChild(tableBody2.lastChild);

    }

}








// add column functionality
 const addColumnButton = document.getElementById("addColumn");

addColumnButton.onclick = function() {

    const headers = document.getElementById("headers");
    const tableBody2 = document.getElementById("tableBody2");
    const tableRows = tableBody2.querySelectorAll("tr");
    let NumberOfColumns = headers.querySelectorAll("th").length;

    let th = document.createElement("th");

    th.setAttribute("scope", "col");
    th.setAttribute("style", "text-align: center");

    th.innerHTML = `Choice ${NumberOfColumns-1}`;
    headers.appendChild(th);


    // add empty cells for each company

    console.log(tableRows);

    tableRows.forEach(row => {

        row.innerHTML += `<td scope="col" contenteditable="true"></td>`;

    })

    th.scrollIntoView();

    //reinitialise preventDefaultEnter
     preventDefaultEnter();

}


// remove column functionality

const removeColumnButton = document.getElementById("removeColumn");



removeColumnButton.onclick = function() {

    const headers = document.getElementById("headers");
    const tableBody2 = document.getElementById("tableBody2");
    const tableRows = tableBody2.querySelectorAll("tr");
    let NumberOfColumns = headers.querySelectorAll("th").length;

    const lastHeader = headers.lastChild;

    console.log(lastHeader);

    if(NumberOfColumns > 3) { // don't remove column if the only one remaining is the company names


        $('#headers').children().last().remove();

        tableRows.forEach(row => {

            row.removeChild(row.lastChild);

        })

    }


}




// function to update database with company choices

const submitChoicesButton = document.getElementById("submitChoices");



submitChoicesButton.onclick = function() {

    const headersList = document.getElementById("headers").querySelectorAll("th");
    const tableBody2 = document.getElementById("tableBody2");
    const tableRows = tableBody2.querySelectorAll("tr");
    let NumberOfColumns = headers.querySelectorAll("th").length;

    let companyChoices = [];



    tableRows.forEach(row => {
        let company = row.firstChild.innerText.trim(); // trim the string to make sure their are no empty space characters
        let choicesArray = [];
        let choices = row.querySelectorAll("td");

        choicesArray.push(company);

        choices.forEach(choice => {
            choicesArray.push(choice.innerText.trim());
        })
        companyChoices.push(choicesArray);
    })

    console.log(companyChoices);

    let companyChoicesStringified = JSON.stringify(companyChoices);
    let token = localStorage.getItem("admin-auth");

     $.ajax({
      type: "POST",
      url: "/admin/update",
      data: {companyChoices: companyChoicesStringified},
      beforeSend: function(request) {
        request.setRequestHeader("admin-auth", token);
      },
      error: function() {alert("An error occurred, please try again later")},
      success: function() {alert("Data submitted")}

     });





}
