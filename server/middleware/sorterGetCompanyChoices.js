let sorterGetCompanyChoices = (req, res, next) => {
  let companyChoices = JSON.parse(req.admin.companyChoices);
  let companyChoicesObject = {};

  companyChoices.forEach(company => {
    let subArray = {};
    let choicesArray = [];

    subArray.numberAccepted = company[1];

    for(let i = 2; i < company.length; i++) {
      if(company[i] != "") {
        choicesArray.push(company[i]);
      }
    }

    subArray.choices = choicesArray;
    companyChoicesObject[company[0]] = subArray;
  })

  req.companyChoicesObject = companyChoicesObject;
  next();
}

module.exports = {
  sorterGetCompanyChoices: sorterGetCompanyChoices,
}
