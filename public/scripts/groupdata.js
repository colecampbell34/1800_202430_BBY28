// Function to read all the main group data from the Firestore "budget-sheets/" collection
// Input param is the String representing the user, aka, the document name
function readMainData(group) {
  db.collection("budget-sheets")
    .doc(group) //name of the collection and documents should match exactly with what you have in Firestore
    .onSnapshot(
      (doc) => {
        //arrow notation
        document.getElementById("group-name").innerHTML = doc.data().groupname;
        document.getElementById("group-goal").innerHTML = doc.data().max;
        document.getElementById("current-amount").innerHTML =
          doc.data().current;
      },
      (error) => {
        console.log("Error calling onSnapshot", error);
      }
    );

  db.collection("budget-sheets")
    .doc(group) //name of the collection and documents should match exactly with what you have in Firestore
    .collection("group-members")
    .doc("user1")
    .onSnapshot(
      (doc) => {
        //arrow notation
        document.getElementById("name-goes-here").innerHTML = doc.data().name;
        document.getElementById("current-goes-here").innerHTML += doc.data().current;
        document.getElementById("max-goes-here").innerHTML += doc.data().max;
      },
      (error) => {
        console.log("Error calling onSnapshot", error);
      }
    );
}
readMainData("groupidnum"); //calling the function
