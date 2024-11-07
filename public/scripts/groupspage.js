// Handle form submission for joining a group
document
  .getElementById("joinGroupForm")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the form from submitting traditionally

    // Get the join code from input
    const joinCode = document.getElementById("joinCode").value.trim();

    // Validate the join code
    if (joinCode === "") {
      alert("Please enter a join code.");
      return;
    }

    // Check if a group with the join code exists in Firestore
    db.collection("budget-sheets")
      .doc(joinCode)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userId = firebase.auth().currentUser.uid;
          const userName =
            firebase.auth().currentUser.displayName || "Anonymous";
          const totalGoal = doc.data().max; // Group's total goal
          const deadline = doc.data().deadline || "No deadline set"; // Group's deadline

          // Get the number of members in the group-members subcollection
          db.collection("budget-sheets")
            .doc(joinCode)
            .collection("group-members")
            .get()
            .then((membersSnapshot) => {
              const groupSize = membersSnapshot.size + 1; // Including the new member
              const individualMax = totalGoal / groupSize; // Calculate max per member

              // Add the current user to the group-members subcollection
              const groupMemberData = {
                name: userName, // User's name (or default to "Anonymous")
                contribution: 0, // Initial contribution
                max: individualMax, // Individual max goal
              };

              const groupPath = `budget-sheets/${joinCode}/group-members/${userId}`;
              const userGroupPath = `users/${userId}/groups/${joinCode}`;

              // Perform both operations: add user to group-members and update user groups
              const batch = db.batch();

              // Add the user to the group-members subcollection
              batch.set(db.doc(groupPath), groupMemberData);

              // Add the join code to the user's groups collection
              batch.set(db.doc(userGroupPath), {
                joinCode: joinCode,
                groupName: doc.data().groupname || "Unnamed Group", // Optional: Add group name
                max: individualMax,
                deadline: deadline,
              });

              // Update all existing members with the new max
              membersSnapshot.forEach((memberDoc) => {
                const memberId = memberDoc.id; // Existing member's ID
                const updatedMemberData = {
                  max: totalGoal / groupSize, // New max per member
                };
                batch.update(
                  db.doc(`budget-sheets/${joinCode}/group-members/${memberId}`),
                  updatedMemberData
                );
              });

              // Commit the batch operation
              batch
                .commit()
                .then(() => {
                  // Update the size of the group in the budget-sheets document
                  return db
                    .collection("budget-sheets")
                    .doc(joinCode)
                    .update({ size: groupSize });
                })
                .then(() => {
                  alert("Successfully joined group: " + doc.data().groupname);
                  // Redirect to a relevant page or update UI
                  window.location.href = "groups.html";
                })
                .catch((error) => {
                  console.error(
                    "Error adding user to group or user groups: ",
                    error
                  );
                  alert("Error joining group. Please try again.");
                });
            })
            .catch((error) => {
              console.error("Error retrieving group size: ", error);
              alert("Error joining group. Please try again.");
            });
        } else {
          alert("Invalid join code. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error checking group: ", error);
        alert("Error joining group. Please try again later.");
      });
  });



// Load the group data onto the cards
// Fetch groups for the current user and populate the group cards
function loadUserGroups() {
  const userId = firebase.auth().currentUser.uid; // Get the current user's ID
  const groupsContainer = document.querySelector(
    ".row.row-cols-1.row-cols-md-2.row-cols-lg-2.g-4"
  ); // Select the container for the group cards
  const groupCardTemplate = document.getElementById("groupCardTemplate"); // Select the card template

  // Reference to the budget-sheets collection to find groups the user is part of
  db.collection("budget-sheets")
    .get()
    .then((querySnapshot) => {
      const groupPromises = []; // Array to hold promises for group data

      querySnapshot.forEach((doc) => {
        const groupRef = db
          .collection("budget-sheets")
          .doc(doc.id)
          .collection("group-members")
          .doc(userId);

        // Check if the user is a member of this group
        groupPromises.push(
          groupRef.get().then((memberDoc) => {
            if (memberDoc.exists) {
              // User is a member, fetch group data
              const groupData = doc.data();
              groupData.id = doc.id; // Add the document ID to groupData
              groupData.currentContribution = memberDoc.data().contribution; // Add member contribution to groupData
              return groupData; // Return group data
            } else {
              return null; // User is not a member
            }
          })
        );
      });

      // Wait for all group membership checks to complete
      return Promise.all(groupPromises);
    })
    .then((groupDataArray) => {
      // Filter out null values (non-member groups)
      const validGroupData = groupDataArray.filter((data) => data !== null);

      if (validGroupData.length === 0) {
        groupsContainer.innerHTML =
          '<p class="text-center fill-space">You are not a member of any groups.</p>';
        return;
      }

      // Clear existing cards
      groupsContainer.innerHTML = "";

      // Create and append group cards
      validGroupData.forEach((groupData) => {
        const groupId = groupData.id; // Get the groupId from groupData
        const groupCard = createGroupCard(
          groupData,
          groupId,
          groupCardTemplate
        );
        groupsContainer.appendChild(groupCard); // Append the card to the container
      });
    })
    .catch((error) => {
      console.error("Error fetching user groups: ", error);
    });
}



// Create a card element for a group using the template
function createGroupCard(groupData, groupId, template) {
  const cardClone = template.cloneNode(true); // Clone the template
  cardClone.classList.remove("d-none"); // Remove the hidden class

  // Populate the card with group data
  cardClone.querySelector(".group-name").textContent =
    groupData.groupname || "Unnamed Group";
  cardClone.querySelector(".group-goal").textContent = groupData.max || "N/A";
  cardClone.querySelector(".group-contribution").textContent =
    groupData.currentContribution || "0";
  cardClone.querySelector(".group-deadline").textContent = groupData.deadline || "N/A";

  // Attach event listener for the view details button
  cardClone.querySelector(".view-details-btn").onclick = () =>
    viewGroupDetails(groupId);

  return cardClone;
}



function viewGroupDetails(groupId) {
  console.log("Group ID before redirection:", groupId); // Check value here
  if (!groupId) {
    console.error("No Group ID provided!");
    return; // Prevent proceeding if groupId is not valid
  }
  // Redirect to the budget sheet page with the join code
  window.location.href = `budgetsheet.html?joinCode=${groupId}`;
}



// Call the function to load user groups when the page loads
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    loadUserGroups(); // User is signed in, load user groups
  } else {
    console.log("No user is signed in.");
    // Optionally, handle the case when no user is logged in
  }
});
