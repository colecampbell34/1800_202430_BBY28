// Generate a random 5-digit code
function generateJoinCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}


// Handle form submission
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the form from submitting the traditional way

  // Get user input values
  const groupName = document.getElementById("groupName").value;
  const groupGoal = parseFloat(document.getElementById("groupGoal").value);
  const groupDate = document.getElementById("groupDate").value;
  const startDate = new Date().toLocaleDateString('en-CA');

  // Generate a unique join code
  const joinCode = generateJoinCode();

  // Define the data to write to Firestore
  const groupData = {
    groupname: groupName,
    max: groupGoal,
    deadline: groupDate,
    start: startDate,
    size: 1,
    current: 0,
    code: joinCode,
  };


  // Write to Firestore using the join code as the collection name
  db.collection("budget-sheets")
    .add(groupData)
    .then((docRef) => {
      // docRef creates a reference to the newly created group doc id
      // Assuming `userId` is the ID of the currently logged-in user
      const userId = firebase.auth().currentUser.uid;
      const userName = firebase.auth().currentUser.displayName;

      // Create a `group-members` subcollection with the user's ID
      docRef
        .collection("group-members")
        .doc(userId)
        .set({
          name: userName, // Replace this with actual user data
          max: groupData.max / groupData.size, // Dividing max / group members which in this case is just / 1 since this is the first member
          contribution: 0, // Initial contribution, can be set as needed
        })
        .then(() => {
          // Add the group details to the user's groups collection
          const userGroupPath = `users/${userId}/groups/${joinCode}`;

          return db.doc(userGroupPath).set({
            groupName: groupData.groupname || "Unnamed Group", // Optional: Group name
            max: groupData.max / groupData.size, // User's max goal in this group
            deadline: groupDate,
          });
        })
        .then(() => {
          alert("Group created successfully! Your join code is " + joinCode);
          window.location.assign("groups.html");
        });
    })
    .catch((error) => {
      console.error("Error creating group:", error);
    });
});
