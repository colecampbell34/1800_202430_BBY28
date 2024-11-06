// Function to get query parameters from the URL
function getGroupIdFromURL(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }
  
  // Use this function to get the group ID when the page loads
  document.addEventListener("DOMContentLoaded", function() {
    const groupId = getGroupIdFromURL("joinCode");
    if (!groupId) {
      console.error("No group ID provided in the URL");
      alert("No group ID provided. Please go back and try again.");
      return;
    } else {
        recalculateMaxForMembers(groupId); // Call the function to recalculate on page load
    }
    // Load the group data using the groupId
    console.log("Group ID:", groupId);
});



// Function to load group data into budgetsheet.html based on the specific group
function loadGroupData() {
    const groupId = getGroupIdFromURL("joinCode"); // Get groupId from URL
  
    if (!groupId) {
      console.error("No group ID provided in the URL.");
      return;
    }
    
    console.log("Fetching document with ID:", groupId);
    // Fetch the group document from Firestore using the groupId
    db.collection("budget-sheets").doc(groupId).get()
      .then((doc) => {
        if (doc.exists) {
          const groupData = doc.data();
  
          // Populate the HTML with group data
          document.getElementById("group-name").textContent = groupData.groupname || "Unnamed Group";
          document.getElementById("group-goal").textContent = groupData.max || "0";
          document.getElementById("current-amount").textContent = groupData.current || "0";
          document.getElementById("deadline-goes-here").textContent = groupData.deadline || "N/A";
  
          // Update progress bar
          const progressPercentage = (groupData.current / groupData.max) * 100;
          const progressBar = document.querySelector(".progress-bar");
          progressBar.style.width = `${progressPercentage}%`;
          progressBar.textContent = `${Math.round(progressPercentage)}%`;
  
          // Load members list
          loadGroupMembers(groupId);

          // Show join code
          document.getElementById("joinCode-goes-here").innerHTML = groupId;
          
          // Load expense breakdown if needed
        //   loadExpenseBreakdown(groupData.expenses, groupData.max);
        } else {
          console.error("Group document not found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching group data: ", error);
      });
  }
  


  // Function to load members of the group
  function loadGroupMembers(groupId) {
    const membersList = document.querySelector(".card-body ul.list-group");
    membersList.innerHTML = ""; // Clear any existing members
  
    db.collection("budget-sheets").doc(groupId).collection("group-members").get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const member = doc.data();
          
          // Create a list item for each member
          const memberItem = document.createElement("li");
          memberItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
          memberItem.innerHTML = `
            <span>${member.name || "Anonymous"}</span>
            <span>Contribution: $ (${member.contribution}/${member.max})</span>
          `;
          membersList.appendChild(memberItem);
        });
      })
      .catch((error) => {
        console.error("Error fetching group members: ", error);
      });
  }
  


  // Optional: Function to load the expense breakdown if data is structured for it
  function loadExpenseBreakdown(expenses, max) {
    const expenseTableBody = document.querySelector("table.table-striped tbody");
    expenseTableBody.innerHTML = ""; // Clear any existing rows
  
    expenses.forEach((expense) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${expense.category}</td>
        <td>$${expense.amount}</td>
        <td>${((expense.amount / max) * 100).toFixed(2)}%</td>
      `;
      expenseTableBody.appendChild(row);
    });
  }
  


  // Function to recalculate max amount for each member
function recalculateMaxForMembers(groupId) {
    // Fetch the group data to get the max goal and current size
    db.collection("budget-sheets")
      .doc(groupId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const groupData = doc.data();
          const groupMax = groupData.max;
          
          // Fetch the current size by counting the members in the group
          db.collection("budget-sheets")
            .doc(groupId)
            .collection("group-members")
            .get()
            .then((snapshot) => {
              const groupSize = snapshot.size;
              const newMaxPerMember = groupMax / groupSize;
  
              // Update each member’s max in Firestore
              snapshot.forEach((memberDoc) => {
                db.collection("budget-sheets")
                  .doc(groupId)
                  .collection("group-members")
                  .doc(memberDoc.id)
                  .update({ max: newMaxPerMember })
                  .then(() => console.log(`Updated max for ${memberDoc.id}`))
                  .catch((error) =>
                    console.error("Error updating member max:", error)
                  );
              });
            });
        } else {
          console.error("Group document not found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching group data:", error);
      });
  }



  // Inline function to update the group goal
  document.querySelector("#adjustGoal + button").addEventListener("click", () => {
    const groupId = getGroupIdFromURL("joinCode");
    const newGoal = parseFloat(document.getElementById("adjustGoal").value);
    if (!isNaN(newGoal) && newGoal > 0) {
      db.collection("budget-sheets").doc(groupId).update({
        max: newGoal,
      })
      .then(() => {
        console.log("Group goal updated to:", newGoal);
        alert("Goal updated successfully!");
        document.getElementById("group-goal").textContent = newGoal;
      })
      .catch((error) => {
        console.error("Error updating group goal:", error);
      });
    } else {
      alert("Please enter a valid goal amount.");
    }
    setTimeout(() => {
      location.reload();
    }, 500)
  });



  // Inline function to add a contribution
  document.querySelector("#addContribution + button").addEventListener("click", () => {
    const groupId = getGroupIdFromURL("joinCode");
    const contributionAmount = parseFloat(document.getElementById("addContribution").value);
    if (!isNaN(contributionAmount) && contributionAmount > 0) {
      // Fetch the current group data
      db.collection("budget-sheets").doc(groupId).get()
      .then((doc) => {
        if (doc.exists) {
          const currentAmount = doc.data().current || 0;
          const updatedAmount = currentAmount + contributionAmount;

          // Update the current amount in the group data
          db.collection("budget-sheets").doc(groupId).update({
            current: updatedAmount,
          })
          .then(() => {
            console.log("Contribution added successfully!");
            alert("Contribution added successfully!");
            document.getElementById("current-amount").textContent = updatedAmount;
          });

          // Update the contributing member's amount (assuming userId is defined)
          const userId = firebase.auth().currentUser.uid;
          db.collection("budget-sheets")
            .doc(groupId)
            .collection("group-members")
            .doc(userId)
            .get()
            .then((memberDoc) => {
              const memberData = memberDoc.data();
              const newContribution = (memberData.contribution || 0) + contributionAmount;
              db.collection("budget-sheets")
                .doc(groupId)
                .collection("group-members")
                .doc(userId)
                .update({ contribution: newContribution })
                .then(() => {
                  console.log("Member contribution updated to:", newContribution);
                });
            });
          // Update contribution in budget-sheets
          db.collection("users").doc(userId).collection("groups").doc(groupId).set({currentContribution: updatedAmount}, {merge: true});
        }
      })
      .catch((error) => {
        console.error("Error adding contribution:", error);
      });
    } else {
      alert("Please enter a valid contribution amount.");
    }
    setTimeout(() => {
      location.reload();
    }, 500)
  });


  window.onload = loadGroupData(); // Load the data on load
