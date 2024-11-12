function getNameFromAuth() {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const userName = user.displayName;
        document.getElementById("name-goes-here").innerText = userName;
        resolve(); // Resolves if user is found
      } else {
        console.log("No user is logged in");
        reject("No user is logged in"); // Rejects if no user is logged in
      }
    });
  });
}




// Modify loadNearestGroup to update the progress bar after setting localStorage
function loadNearestGroup() {
  const userId = firebase.auth().currentUser.uid; 

  return db.collection("budget-sheets")
    .get()
    .then((querySnapshot) => {
      const groupPromises = []; 

      querySnapshot.forEach((doc) => {
        const groupRef = db.collection("budget-sheets").doc(doc.id).collection("group-members").doc(userId);

        groupPromises.push(
          groupRef.get().then((memberDoc) => {
            if (memberDoc.exists) {
              const groupData = doc.data();
              groupData.id = doc.id;
              groupData.currentContribution = memberDoc.data().contribution;
              return groupData;
            } else {
              return null;
            }
          })
        );
      });

      return Promise.all(groupPromises);
    })
    .then((groupDataArray) => {
      const validGroupData = groupDataArray.filter((data) => data !== null);

      validGroupData.sort((x, y) => {
        const dateX = new Date(x.deadline || "3000-01-01");
        const dateY = new Date(y.deadline || "3000-01-01");
        return dateX - dateY;
      });

      if (validGroupData.length > 0) {
        const nearestGroup = validGroupData[0];
        const nearestGroupCurrent = nearestGroup.current || 0;
        const nearestGroupMax = nearestGroup.max || 1;
        const nearestGroupName = nearestGroup.groupname || "N/A";

        // localStorage.setItem("groupCurrent", nearestGroupCurrent);
        // localStorage.setItem("groupMax", nearestGroupMax);
        // localStorage.setItem("groupName", nearestGroupName);

        // Update the progress bar
        const progressPercentage = (nearestGroupCurrent / nearestGroupMax) * 100;
        const progressBar = document.querySelector(".progress-bar");
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.textContent = `${Math.round(progressPercentage)}%`;
        document.querySelector(".nearest-trip").textContent = nearestGroupName;
      } else {
        const nearestGroupName = "N/A";
        // localStorage.setItem("groupName", nearestGroupName);
        document.querySelector(".nearest-trip").textContent = nearestGroupName;
        return;
      }
    })
    .catch((error) => {
      console.error("Error fetching user groups: ", error);
    });
}




document.addEventListener("DOMContentLoaded", () => {
  getNameFromAuth()
    .then(() => loadNearestGroup())
    .catch((error) => {
      console.error("An error occurred:", error);
    });
});