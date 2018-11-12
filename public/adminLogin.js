$("#signInButton").click(function(event) {
  event.preventDefault();

  const username = document.getElementById("signInId").value;
  const password = document.getElementById("signInPassword").value;

  $.ajax({
    url: '/admin',
    method: 'POST',
    data: {
      username: username,
      password: password,
    },
    success: function (response, textStatus, xhr) {
      console.log(response);

      let auth = xhr.getResponseHeader('admin-auth');
      let id = xhr.getResponseHeader('username');

      localStorage.setItem('admin-auth', auth);
      localStorage.setItem('username', id);

      window.location = `/admin/${auth}`;

    },
    error: function (response, textStatus, xhr) {
      if(response.status == 400) {
        alert("Sign in failed, please try again later.")
      }
    }
  });
})
