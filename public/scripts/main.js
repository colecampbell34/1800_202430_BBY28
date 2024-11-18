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




// loads progress of all groups user is in
function loadGroups() {
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
        const container = document.getElementById("group-progress-container");

        validGroupData.forEach((group) => {
          const groupCurrent = group.current || 0;
          const groupMax = group.max || 1;
          const groupName = group.groupname || "N/A";
        

        // Populate the progress bar
        const progressPercentage = (groupCurrent / groupMax) * 100;
        // create new div for card
        const groupCard = document.createElement("div");
        // set class for the div: class="card shadow-sm mb-4"
        groupCard.classList.add("card", "shadow-sm", "mb-4");
        // pass formatted card template that will contain progress bar
        groupCard.innerHTML = `
            <div class="card-header bg-success text-white">
            <a href="budgetsheet.html?joinCode=${group.id}" class="card-header bg-success text-white">${groupName}</a>
            </div>
              <div class="card-body">
                <div class="progress mb-2">
                  <div
                    class="progress-bar bar-style-money progress-bar-striped"
                    role="progressbar"
                    style="width: ${progressPercentage}%"
                    aria-valuemin="0"
                    aria-valuemax="100%"
                    >
                    ${Math.round(progressPercentage)}%
                  </div>
                </div>
                <div class="d-flex justify-content-between">
                  <small class="text-muted">$0</small>
                  <small class="text-muted">$${groupMax}</small>
                </div>
              </div>
              `;
              // add card to div with id groups-progress-container in main.html
              container.appendChild(groupCard);
              

          

        {/* const progressBar = document.querySelector(".progress-bar");
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.textContent = `${Math.round(progressPercentage)}%`;
        document.querySelector(".nearest-trip").textContent = nearestGroupName;
        document.getElementById("nearest-trip-goal").textContent =
          nearestGroupMax || "N/A"; */}
          });
      } else {
        // const nearestGroupName = "N/A";
        // localStorage.setItem("groupName", nearestGroupName);
        // document.querySelector(".nearest-trip").textContent = nearestGroupName;
        // return;
        const container = document.getElementById("groups-progress-container");
        container.innerHTML = '<p>No groups found...</p>';
      }
    })
    .catch((error) => {
      console.error("Error fetching user groups: ", error);
    });
}




document.addEventListener("DOMContentLoaded", () => {
  getNameFromAuth()
    .then(() => loadGroups())
    .catch((error) => {
      console.error("An error occurred:", error);
    });
});