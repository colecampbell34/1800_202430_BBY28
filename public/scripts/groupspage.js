document
  .getElementById("joinGroupForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const joinCode = document.getElementById("joinCode").value.trim();

    if (joinCode === "") {
      alert("Please enter a join code.");
      return;
    }

    db.collection("budget-sheets")
      .where("code", "==", joinCode)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docRef = doc.ref; // Reference to the budget-sheets document
          const userId = firebase.auth().currentUser.uid;
          const userName =
            firebase.auth().currentUser.displayName || "Anonymous";
          const totalGoal = doc.data().max;
          const deadline = doc.data().deadline || "No deadline set";

          docRef
            .collection("group-members")
            .get()
            .then((membersSnapshot) => {
              const groupSize = membersSnapshot.size + 1;
              const individualMax = totalGoal / groupSize;

              const groupMemberData = {
                name: userName,
                contribution: 0,
                max: individualMax,
              };

              const groupPath = `${docRef.path}/group-members/${userId}`;
              const userGroupPath = `users/${userId}/groups/${joinCode}`;

              const batch = db.batch();
              batch.set(db.doc(groupPath), groupMemberData);
              batch.set(db.doc(userGroupPath), {
                groupName: doc.data().groupname || "Unnamed Group",
                max: individualMax,
                deadline: deadline,
              });

              batch
                .commit()
                .then(() => {
                  return docRef.update({ size: groupSize }); // Update size using docRef directly
                })
                .then(() => {
                  alert("Successfully joined group: " + doc.data().groupname);
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
  cardClone.querySelector(".group-deadline").textContent =
    groupData.deadline || "N/A";

  // Event listener for the view details button
  cardClone.querySelector(".view-details-btn").onclick = () =>
    viewGroupDetails(groupId);

  // Event listener for the leave group button
  cardClone.querySelector(".leave-group-btn").onclick = () =>
    leaveGroup(groupId);

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




// Function to handle leaving the group
function leaveGroup(groupId) {
  const userId = firebase.auth().currentUser.uid;

  if (!groupId || !userId) {
    console.error("Group ID or User ID is missing.");
    return;
  }

  const groupDocRef = db.collection("budget-sheets").doc(groupId);

  // Start by getting the user's contribution and the group's current value
  groupDocRef
    .get()
    .then((groupDoc) => {
      if (groupDoc.exists) {
        const joinCode = groupDoc.data().code; // Fetch the join code here
        console.log("Join code: ", joinCode);

        // Get the user's document reference from the users/groups subcollection
        const userDocRef = db
          .collection("users")
          .doc(userId)
          .collection("groups")
          .doc(joinCode);

        // Fetch the user's contribution from the group-members subcollection
        return userDocRef.get().then((userDoc) => {
          if (userDoc.exists) {
            const userContribution = userDoc.data().currentContribution || 0;

            // Update the group's current amount by subtracting the user's contribution
            return groupDocRef.update({
              current: firebase.firestore.FieldValue.increment(
                -userContribution
              ), // Using increment to subtract
            });
          } else {
            console.error("User's group document does not exist.");
          }
        });
      } else {
        console.error("Group document does not exist.");
      }
    })
    .then(() => {
      // After updating the group's current amount, remove the user from the group's members collection
      return groupDocRef.collection("group-members").doc(userId).delete();
    })
    .then(() => {
      // Remove the group's reference from the user's groups subcollection
      const userDocRef = db
        .collection("users")
        .doc(userId)
        .collection("groups")
        .doc(groupId);
      return userDocRef.delete();
    })
    .then(() => {
      alert("You have successfully left the group.");
      location.reload(); // Reload or redirect as needed
    })
    .catch((error) => {
      console.error("Error removing user from group:", error);
      alert("An error occurred while leaving the group.");
    });
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
