//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
        window.location.replace("/");
      }).catch((error) => {
        // An error happened.
      });
  }
  
  document.querySelector("#logout").addEventListener("click", function (e) {
    logout();
  });