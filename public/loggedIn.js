
function delete_cookie( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

//logout button
$("#logOut").on("click", function(event) {
  event.preventDefault();

  let token = localStorage.getItem("x-auth");

  $.ajax({
    url: "/logout",
    method: 'DELETE',
  }).then((response, textStatus, xhr) => {
    delete_cookie("x-auth");
    window.location = `/`;
  }).catch((e) => {
    console.log(e);
    alert("Logout failed, please try again later");
  })
})

// set pdfMake font
pdfMake.fonts = {
       SimHei: {
         normal: 'SimHei.ttf',

       }
    };

//date and time variables for pdf export

  function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
  }

  var today = new Date();
  var hr = today.getHours();
  var min = today.getMinutes();
  var sec = today.getSeconds();
  let ap = (hr < 12) ? "AM" : "PM";
  hr = (hr == 0) ? 12 : hr;
  hr = (hr > 12) ? hr - 12 : hr;

  //Add a zero in front of numbers < 10
  hr = checkTime(hr);
  min = checkTime(min);
  sec = checkTime(sec);

  let time = hr + ":" + min + ":" + sec + " " + ap;

  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var curWeekDay = days[today.getDay()];
  var curDay = today.getDate();
  var curMonth = months[today.getMonth()];
  var curYear = today.getFullYear();
  var date = curWeekDay+", "+curDay+" "+curMonth+" "+curYear;



//activate sortable connected lists while limiting the choices list to 3


$(function() {
    $( "#sortable1, #sortable2" ).sortable({
        connectWith: ".connectedSortable"

    }).disableSelection();

    $( "#sortable2" ).on( "sortreceive", function(event, ui) {
        if($("#sortable2 li").length > 10){
            $(ui.sender).sortable('cancel');
        }
    });

});


let choices = [];


// remove list items from the options list if they already appear in the choices list


const choicesList = document.getElementById("sortable2").childNodes;
const optionsList = document.getElementById("sortable1").childNodes;
const confirmButton = document.getElementById("confirm");
const cancelButton = document.getElementById("cancel");
const name = document.getElementById("name").innerText;
const studentid = document.getElementById("studentid").innerText;
const department = document.getElementById("department").innerText;



// loop through the choices and for each one, check if it matches a list item in the options list. If so, delete the item in the options list;

choicesList.forEach(item => {
   optionsList.forEach(item2 => {
       if(item.innerText == item2.innerText) {
           item2.parentNode.removeChild(item2);
       }
   })
})


// submit button functionality
$("#submit").click(function(e) {

    // reset modal buttons to default
    $("#confirm").show();
    $("#cancel").html("Cancel");

    //reset modal header to default
    $("#exampleModalLabel").html("Are you sure?")


    if(!$("#sortable2").html()) {

        $(".modal-body").html("You have chosen not to apply for any internships, are you sure?");

        confirmButton.onclick = function() {
            // on confirm - push a value of 'none' to the database


             $.ajax({
              type: "POST",
              url: "/profile",
              data: { choices: "None"},
              success: function() {

                  $(".modal-body").html("Choices successfully submitted!");
                  //alter modal header
                  $("#exampleModalLabel").html("Success!")
                  // alter modal buttons
                  $("#confirm").hide();
                  $("#cancel").html("Ok");
                },

              error: function() {$(".modal-body").html("An error occurred, please try again later.")}
             });

            // print out pdf confirmation of their choice


             var docDefinition = {
                content: [
                     { text: `Internship Choices for ${name}`, style: 'header' },
                     `Department: ${department}`,
                     `ID: ${studentid}`,

                     '\n\n I confirm that I do not wish to apply for an internship.',

                     '\n\n Please sign below to confirm your choice.\n\n\n\n',

                     'Signature:....................................\n\n\n',

                     'You must return this document to the Business Administration Department Secretary.',

                     `\nGenerated on ${date} at ${time}`

                   ],

                 styles: {
                     header: {
                       fontSize: 22,
                     },

                 },

                defaultStyle: {
                    font: 'SimHei'
                  }


            };

            pdfMake.createPdf(docDefinition).download('InternshipChoices.pdf');


        }

    } else {

        // everytime the modal pops up, choices array is reset to empty ready to be populated again

        choices = [];

        // iterate through the list items and push the text to the choices array
         $('#sortable2').children().each(function() {
            choices.push($(this).text());
        });

        let text = "You have chosen the following companies: <br>";

        // iterate through the choices array to add the companies to the modal alert text
        $(choices).each(function(index, value) {
            text += `${index + 1}. ${value}<br>`;
        });


        // display list of choices in the modal
        $(".modal-body").html(text);

        console.log(choices)

        let choicesStringified = JSON.stringify(choices).trim();
        // on confirm, update the database with the choices

        console.log(choicesStringified)

        confirmButton.onclick = function() { //need to use onclick rather than jquery click to prevent multiple printing when user modifies their choice just before confirm
            // post the data to the server


             $.ajax({
              type: "POST",
              url: "/profile",
              data: { choices: choicesStringified},
              success: function() {

                  $(".modal-body").html("Choices successfully submitted!");

                  //alter modal header

                  $("#exampleModalLabel").html("Success!")
                  // alter modal buttons
                  $("#confirm").hide();
                  $("#cancel").html("Ok");

              },
              error: function() {$(".modal-body").html("An error occurred, please try again later.")}

             });

             //print pdf
            var docDefinition = {
                content: [
                     { text: `Internship Choices for ${name}`, style: 'header' },
                     `Department: ${department}`,
                     `ID: ${studentid}\n\n`,

                        {
                          ol: choices
                        },

                     '\n\n Please sign below to confirm your choice.\n\n\n',

                     'Signature:....................................\n\n\n',

                     'You must return this document to the Business Administration Department Secretary.',

                     `\nGenerated on ${date} at ${time}`

                   ],

                 styles: {
                     header: {
                       fontSize: 22,
                     },

                 },

                defaultStyle: {
                    font: 'SimHei'
                  }
            };

            pdfMake.createPdf(docDefinition).download('InternshipChoices.pdf');
        }
}
});
