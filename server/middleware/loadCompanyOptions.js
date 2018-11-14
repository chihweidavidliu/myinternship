
const {Admin} = require("./../models/admin.js");

let loadCompanyOptions = (req, res, next) => {
  let companyList = "";

  Admin.findByCredentials("admin", "1521993").then(admin => {
    let companies = JSON.parse(admin.companyChoices) || "None";

    if(Array.isArray(companies)) {
      companies.forEach(company => {
        companyList += `<li class='ui-state-default'>${company[0]}</li>`;
      })
    }

    req.companyList = companyList;
    next();
  })

}

module.exports = {
  loadCompanyOptions: loadCompanyOptions,
}
