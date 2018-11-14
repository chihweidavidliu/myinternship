
let loadCompanyChoices = (req, res, next) => {
  if(req.admin.companyChoices && req.admin.companyChoices.length > 0) {
    let companyChoices = JSON.parse(req.admin.companyChoices);
    let headers = '<th scope="col">Company</th><th scope="col">Number Accepted</th>';
    let rows = "";



    companyChoices.forEach(company => {
      rows += '<tr>';


        company.forEach(entry => {
          if(company.indexOf(entry) == 0) { // identify the company name (position 0 in index)
            rows += `<th scope="row" contenteditable="true">${entry}</th>`; // give company names head value (bolded)
          } else {
            rows += `<td scope="col" contenteditable="true">${entry}</td>`; // give the other column entries a normal table data value (not bolded)
          }
        })

      rows += '</tr>';
    })

    function columnCount(array) {
             let max = 0;
             companyChoices.forEach(company => {
               if(company.length > max) { max = company.length;}
             })
             return max;
         }

    let numberOfColumns = columnCount(companyChoices);

    // add the requisite number of 'choices' column headers
    for(let i = 1; i < (numberOfColumns -1); i++) {
      headers += `<th scope="col" style="text-align: center">Choice ${i}</th>`;
    }


    let table = `<h4>Company Choices</h4>
                <div id="tableFlexBox">
                    <div id="buttons">
                        <button id="addRow">Add row</button>
                        <button id="removeRow">Remove row</button>
                        <button id="addColumn">Add column</button>
                        <button id="removeColumn">Remove column</button>
                        <button id="submitChoices">Save</button>
                    </div>
                    <div id = "tableDiv" style="overflow-x:scroll; overflow-y: scroll">
                        <table class="table table-hover table-bordered table-sm" id="companyChoices">
                          <thead>
                            <tr id="headers">
                              ${headers}
                            </tr>
                          </thead>
                          <tbody id="tableBody2">${rows}</tbody>
                        </table>
                    </div>
                </div>`;

    req.companyChoicesTable = table;
    next();
  }
}

module.exports = {
  loadCompanyChoices: loadCompanyChoices
}
