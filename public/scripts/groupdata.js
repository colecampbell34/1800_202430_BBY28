// // Function to read all the main group data from the Firestore "budget-sheets/" collection
// // Input param is the String representing the user, aka, the document name
// function readMainData(group) {
//   db.collection("budget-sheets")
//     .doc(group) //name of the collection and documents should match exactly with what you have in Firestore
//     .onSnapshot(
//       (doc) => {
//         //arrow notation
//         document.getElementById("group-name").innerHTML = doc.data().groupname;
//         document.getElementById("group-goal").innerHTML = doc.data().max;
//         document.getElementById("current-amount").innerHTML =
//           doc.data().current;
//       },
//       (error) => {
//         console.log("Error calling onSnapshot", error);
//       }
//     );

//   var user = authResult.user;
//   db.collection("budget-sheets")
//     .doc(group) //name of the collection and documents should match exactly with what you have in Firestore
//     .collection("group-members")
//     .doc(user.uid)
//     .onSnapshot(
//       (doc) => {
//         //arrow notation
//         document.getElementById("name-goes-here").innerHTML = doc.data().name;
//         document.getElementById("current-goes-here").innerHTML +=
//           doc.data().current;
//         document.getElementById("max-goes-here").innerHTML += doc.data().max;
//       },
//       (error) => {
//         console.log("Error calling onSnapshot", error);
//       }
//     );
// }
// readMainData("groupidnum"); //calling the function







// Function to read all the main group data from the Firestore "budget-sheets" collection
// Input param is the String representing the group, aka, the document name
function readMainData(group) {
    // Get general group data
    db.collection("budget-sheets")
      .doc(group)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            document.getElementById("group-name").innerHTML = doc.data().groupname;
            document.getElementById("group-goal").innerHTML = doc.data().max;
            document.getElementById("current-amount").innerHTML = doc.data().current;
          } else {
            console.log("No group document found.");
          }
        },
        (error) => {
          console.log("Error calling onSnapshot:", error);
        }
      );
  
    // Ensure user is authenticated before accessing user-specific data
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        db.collection("budget-sheets")
          .doc(group)
          .collection("group-members")
          .doc(user.uid)
          .onSnapshot(
            (doc) => {
              if (doc.exists) {
                document.getElementById("name-goes-here").innerHTML = doc.data().name;
                document.getElementById("current-goes-here").innerHTML = doc.data().current;
                document.getElementById("max-goes-here").innerHTML = doc.data().max;
              } else {
                console.log("No document found for this user in group-members.");
              }
            },
            (error) => {
              console.log("Error calling onSnapshot for user data:", error);
            }
          );
      } else {
        console.log("No user is signed in.");
      }
    });
  }
  
  // Call the function with a specific group ID
  readMainData("groupidnum");
