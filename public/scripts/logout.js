//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      console.log("logging out user");
      window.location.replace("/");
    })
    .catch((error) => {
      // An error happened.
    });
}


document.querySelector("#logout").addEventListener("click", function (e) {
  logout();
});




document.getElementById("delete").addEventListener("click", async (event) => {
  event.preventDefault();
  const auth = firebase.auth();
  const user = auth.currentUser;
  const userId = user.uid;

  // Confirm deletion with the user
  const confirmation = confirm(
    "Are you sure you want to delete your account? This action cannot be undone."
  );
  if (!confirmation) return;

  try {
    // Delete user data from Firestore collections
    await deleteUserData(userId);

    // Delete the user's account from Firebase Authentication
    await user.delete(); // Directly deleting the user

    alert("Account deleted successfully.");
    window.location.replace("index.html"); // Redirect after deletion
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      alert("Please re-login and try again.");
      // Handle reauthentication here
    } else {
      console.error("Error deleting account:", error);
      alert("An error occurred while trying to delete your account.");
    }
  }
});



// Helper function to delete user data from Firestore
async function deleteUserData(userId) {
  try {
    // Delete all subcollections and the user document from the "users" collection
    const userDocRef = db.collection("users").doc(userId);
    await deleteUserDocumentAndSubcollections(userDocRef);
    await userDocRef.delete();
    console.log(`User document and subcollections for ${userId} deleted.`);

    // Retrieve all group IDs in the "budget-sheet" collection
    const groupIdsSnapshot = await db.collection("budget-sheet").get();

    // Sequentially check and delete user documents in each "group-members" subcollection
    for (const groupDoc of groupIdsSnapshot.docs) {
      const groupId = groupDoc.id;
      const memberDocRef = db
        .collection("budget-sheet")
        .doc(groupId)
        .collection("group-members")
        .doc(userId);

      // Check if the user document exists in this group's "group-members" collection
      const memberDoc = await memberDocRef.get();
      if (memberDoc.exists) {
        await memberDocRef.delete();
        console.log(`Deleted user ${userId} from group-members in group ${groupId}`);
      } else {
        console.log(`User ${userId} not found in group ${groupId}`);
      }
    }

    console.log(`User ${userId} successfully removed from all groups.`);
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
}



// Helper function to delete user document and its subcollections
async function deleteUserDocumentAndSubcollections(userDocRef) {
  try {
    // Define a list of subcollections to delete
    const subcollectionsToDelete = ['groups']; // Add other subcollection names here if needed

    // Delete each specified subcollection
    for (const subcollection of subcollectionsToDelete) {
      const snapshot = await userDocRef.collection(subcollection).get();
      const batch = db.batch();

      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Deleted subcollection '${subcollection}' for user ${userDocRef.id}`);
    }
  } catch (error) {
    console.error("Error deleting user document and subcollections:", error);
    throw error;
  }
}