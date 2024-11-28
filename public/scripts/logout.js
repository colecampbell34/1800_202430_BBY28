//-------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
document.querySelector("#logout").addEventListener("click", function() {
  const confirmation = confirm(
    "Are you sure you want to log out?"
  );
  if (!confirmation) return;

  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      // console.log("logging out user");
      window.location.replace("/");
    })
    .catch((error) => {
      // An error happened.
    });
});


//-------------------------------------------------
// Call this function when the "delete" button is clicked
//-------------------------------------------------
document.getElementById("delete").addEventListener("click", async (e) => {
  e.preventDefault(); // Stops the traditional acton of refreshing the page on form submission, and runs this function instead
  const auth = firebase.auth();
  const user = auth.currentUser;
  const userId = user.uid;

  // Confirm deletion with the user
  const confirmation = confirm(
    "Are you sure you want to delete your account? This action cannot be undone."
  );
  if (!confirmation) return;

  try {
    // Step 1: Delete user data from Firestore
    await deleteUserData(userId); // <== await pauses here until deleteUserData is done

    try {
      // Step 2: Delete user from Firebase Authentication
      await user.delete(); // <== await pauses here until the user's account is deleted
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        const credential = firebase.auth.EmailAuthProvider.credential(
          user.email,
          prompt("Please enter your password again to confirm deletion:")
        );
        await user.reauthenticateWithCredential(credential);
        await user.delete(); // Retry after re-authentication
      } else {
        throw error;
      }
    }

    alert("Account deleted successfully.");
    window.location.replace("index.html");
  } catch (error) {
    console.error("Error deleting account:", error);
    alert("An error occurred while trying to delete your account.");
  }
});



// Helper function to delete user data from Firestore
async function deleteUserData(userId) {
  try {
    // Delete all sub-collections and the user document from the "users" collection
    const userDocRef = db.collection("users").doc(userId);
    await deleteUserDocumentAndSubcollections(userDocRef);
    await userDocRef.delete();
    // console.log(`User document and sub-collections for ${userId} deleted.`);

    // Retrieve all group IDs in the "budget-sheet" collection
    const groupIdsSnapshot = await db.collection("budget-sheets").get();
    // console.log(`Number of groups found: ${groupIdsSnapshot.size}`);

    // Sequentially check and delete user documents in each "group-members" sub-collection
    for (const groupDoc of groupIdsSnapshot.docs) {
      const groupId = groupDoc.id;
      const memberDocRef = db
        .collection("budget-sheets")
        .doc(groupId)
        .collection("group-members")
        .doc(userId);

      // Check if the user document exists in this group's "group-members" collection
      const memberDoc = await memberDocRef.get();

      if (memberDoc.exists) {
        await memberDocRef.delete();
      }
    }
    // console.log(`User ${userId} successfully removed from all groups.`);
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
}



// Helper function to delete user document in 'users' and its sub-collections
async function deleteUserDocumentAndSubcollections(userDocRef) {
  // Define a list of sub-collections to delete
  const subcollectionsToDelete = ["groups", "expenses"]; // Add other sub-collection names here if needed

  // Delete each specified sub-collection
  for (const subcollection of subcollectionsToDelete) {
    const snapshot = await userDocRef.collection(subcollection).get();
    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}
