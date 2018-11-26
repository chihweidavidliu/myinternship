$("#signInButton").click(function(event) {
  event.preventDefault();

  const username = document.getElementById("signInId").value;
  const password = document.getElementById("signInPassword").value;
  const stayLoggedInCheck = $("#stayLoggedIn");

  let stayLoggedIn = false;
  if (stayLoggedInCheck.is(':checked')) {
    stayLoggedIn = true;
  }

  $.ajax({
    url: '/admin',
    method: 'POST',
    data: {
      username: username,
      password: password,
      stayLoggedIn: stayLoggedIn,
    },
    success: function (response, textStatus, xhr) {
      console.log(response);
      window.location = `/admin/profile`;
    },
    error: function (response, textStatus, xhr) {
      if(response.status == 400) {
        alert("Sign in failed, please try again later.")
      }
    }
  });
})
