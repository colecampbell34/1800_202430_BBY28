function getNameFromAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    // Check if a user is signed in:
    if (user) {
      // Do something for the currently logged-in user here:
      console.log(user.uid); //print the uid in the browser console
      console.log(user.displayName); //print the user name in the browser console
      userName = user.displayName;

      //method #1:  insert with JS
      document.getElementById("name-goes-here").innerText = userName;

    } else {
      // No user is signed in.
      console.log("No user is logged in");
    }
  });
}
getNameFromAuth(); //run the function


// TODO clinton
// const userId = firebaseConfigbase.auth().currentUser.uid;
// const userGroups = db.collection("users").doc(userId).collection("groups");
// Update progress bar
// const progressPercentage = (groupData.current / groupData.max) * 100;
document.addEventListener("DOMContentLoaded", () => {
  const current = localStorage.getItem("groupCurrent");
  const max = localStorage.getItem("groupMax");
  const name = localStorage.getItem("groupName");
  const progressPercentage = (current / max) * 100;

  const progressBar = document.querySelector(".progress-bar");
  progressBar.style.width = `${progressPercentage}%`;
  progressBar.textContent = `${Math.round(progressPercentage)}%`;
  document.querySelector(".nearest-trip").textContent = name;
});
