// Function to get query parameters from the URL
function getGroupIdFromURL(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}



// Use this function to get the group ID when the page loads
document.addEventListener("DOMContentLoaded", function () {
  const groupId = getGroupIdFromURL("joinCode");
  if (!groupId) {
    console.error("No group ID provided in the URL");
    alert("No group ID provided. Please go back and try again.");
    return;
  } else {
    recalculateMaxForMembers(groupId); // Call the function to recalculate on page load
    loadGroupData();
  }
});



// Function to load group data into budgetsheet.html based on the specific group
function loadGroupData() {
  const groupId = getGroupIdFromURL("joinCode"); // Get groupId from URL

  if (!groupId) {
    console.error("No group ID provided in the URL.");
    return;
  }

  // console.log("Fetching document with ID:", groupId);
  // Fetch the group document from Firestore using the groupId
  db.collection("budget-sheets")
    .doc(groupId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const groupData = doc.data();

        // Populate the HTML with group data
        document.getElementById("group-name").textContent =
          groupData.groupname || "Unnamed Group";
        document.getElementById("group-goal").textContent =
          groupData.max || "0";
        document.getElementById("current-amount").textContent =
          groupData.current || "0";
        document.getElementById("deadline-goes-here").textContent =
          groupData.deadline || "N/A";

        // Update progress bar
        const progressPercentage = (groupData.current / groupData.max) * 100;
        const progressBar = document.querySelector(".progress-bar");
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.textContent = `${Math.round(progressPercentage)}%`;

        // Load members list
        loadGroupMembers(groupId);

        // Show join code
        document.getElementById("joinCode-goes-here").innerHTML =
          groupData.code;

        // Load expense breakdown
        loadExpenseBreakdown();

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

  db.collection("budget-sheets")
    .doc(groupId)
    .collection("group-members")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const member = doc.data();

        // Create a list item for each member
        const memberItem = document.createElement("li");
        memberItem.classList.add(
          "list-group-item",
          "d-flex",
          "justify-content-between",
          "align-items-center"
        );
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



// Function to recalculate max amount for each member
function recalculateMaxForMembers(groupId) {
  return db
    .collection("budget-sheets")
    .doc(groupId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const groupData = doc.data();
        const groupMax = groupData.max;

        return db
          .collection("budget-sheets")
          .doc(groupId)
          .collection("group-members")
          .get()
          .then((snapshot) => {
            const groupSize = snapshot.size;
            const newMaxPerMember = groupMax / groupSize;

            const updatePromises = snapshot.docs.map((memberDoc) =>
              db
                .collection("budget-sheets")
                .doc(groupId)
                .collection("group-members")
                .doc(memberDoc.id)
                .update({ max: newMaxPerMember })
            );

            return Promise.all(updatePromises);
          });
      } else {
        throw new Error("Group document not found.");
      }
    });
}



// Inline function to update the group goal
document.querySelector("#adjustGoal + button").addEventListener("click", () => {
  const groupId = getGroupIdFromURL("joinCode");
  const newGoal = parseFloat(document.getElementById("adjustGoal").value);
  if (!isNaN(newGoal) && newGoal > 0) {
    db.collection("budget-sheets")
      .doc(groupId)
      .update({
        max: newGoal,
      })
      .then(() => recalculateMaxForMembers(groupId)) // Wait for recalculation
      .then(() => recalculateAllocations()) // Wait for another recalculation
      .then(() => loadGroupData()) // Load data after recalculation completes
      .then(() => {
        // console.log("Goal and member maxes updated successfully!");
        alert("Goal updated successfully!");
        // setTimeout(() => location.reload(), 1000);
      })
      .catch((error) => {
        console.error("Error updating group goal:", error);
      });
  } else {
    alert("Please enter a valid goal amount.");
  }
});



// Inline function to add a contribution
document
  .querySelector("#addContribution + button")
  .addEventListener("click", () => {
    const groupId = getGroupIdFromURL("joinCode");
    const contributionAmount = parseFloat(
      document.getElementById("addContribution").value
    );

    if (!isNaN(contributionAmount) && contributionAmount > 0) {
      const userId = firebase.auth().currentUser.uid;

      // Fetch current group data and update the contribution
      db.collection("budget-sheets")
        .doc(groupId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const currentAmount = doc.data().current || 0;
            const updatedAmount = currentAmount + contributionAmount;

            // Update the group's current amount
            const updateGroupAmount = db
              .collection("budget-sheets")
              .doc(groupId)
              .update({
                current: updatedAmount,
              });

            // Update the user's contribution in the group-members collection
            const updateUserContribution = db
              .collection("budget-sheets")
              .doc(groupId)
              .collection("group-members")
              .doc(userId)
              .get()
              .then((memberDoc) => {
                const memberData = memberDoc.data();
                const newContribution =
                  (memberData.contribution || 0) + contributionAmount;
                return db
                  .collection("budget-sheets")
                  .doc(groupId)
                  .collection("group-members")
                  .doc(userId)
                  .update({ contribution: newContribution });
              });

            // Update the user's contribution in the users/groups subcollection
            const updateUserCurrentContribution = db
              .collection("users")
              .doc(userId)
              .collection("groups")
              .doc(groupId)
              .set({ currentContribution: updatedAmount }, { merge: true });

            // Wait for all updates to complete before reloading data
            return Promise.all([
              updateGroupAmount,
              updateUserContribution,
              updateUserCurrentContribution,
            ]);
          } else {
            throw new Error("Group document not found.");
          }
        })
        .then(() => {
          loadGroupData(); // Reload data after updates complete
          // console.log("Contribution added successfully!");
          alert("Contribution added successfully!");
        })
        .catch((error) => {
          console.error("Error adding contribution:", error);
        });
    } else {
      alert("Please enter a valid contribution amount.");
    }
    // setTimeout(() => {
    //   location.reload();
    // }, 500);
  });





  // When user clicks the add allocation button
function addAllocation() {
  const category = prompt("Enter expense category:");
  const amount = parseFloat(prompt("Enter allocated amount:"));

  if (category && !isNaN(amount) && amount > 0) {
    addAllocationData(category, amount);
  } else {
    alert("Please enter valid details.");
  }
}



// This function loads if the user put in valid info
function addAllocationData(category, amount) {
  // Validate category and amount
  if (!category || isNaN(amount)) {
    console.error("Invalid input: category or amount is missing or incorrect.");
    alert("Please enter a valid category and amount.");
    return;
  }

  const goal = parseFloat(document.getElementById("group-goal").innerText);
  const percentage = ((amount / goal) * 100).toFixed(2);

  const groupId = getGroupIdFromURL("joinCode");
  const groupRef = db.collection("budget-sheets").doc(groupId);

  // Prepare the data for the Firestore document
  const allocationData = {
    category: category,
    amount: amount,
    percentage: percentage,
  };

  // Add allocation to the "expenseBreakdown" subcollection within the group document
  groupRef
    .collection("expenseBreakdown")
    .add(allocationData)
    .then(() => {
      console.log("Allocation added successfully!");
      loadExpenseBreakdown();
    })
    .catch((error) => {
      console.error("Error adding allocation:", error);
    });
}



function recalculateAllocations() {
  const groupId = getGroupIdFromURL("joinCode");
  const groupRef = db.collection("budget-sheets").doc(groupId);

  groupRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const goal = parseFloat(doc.data().max); // Current group goal
        if (!isNaN(goal) && goal > 0) {
          // Fetch all allocations in the expenseBreakdown subcollection
          groupRef.collection("expenseBreakdown")
            .get()
            .then((querySnapshot) => {
              const batch = db.batch(); // Use batch to update all docs together

              querySnapshot.forEach((doc) => {
                const data = doc.data();
                const newPercentage = ((data.amount / goal) * 100).toFixed(2); // Recalculate percentage

                // Update each allocation with the new percentage
                const allocationRef = groupRef.collection("expenseBreakdown").doc(doc.id);
                batch.update(allocationRef, { percentage: newPercentage });
              });

              // Commit the batch update
              return batch.commit();
            })
            .then(() => {
              console.log("All allocations recalculated successfully.");
              loadExpenseBreakdown(); // Reload the table with updated data
            })
            .catch((error) => {
              console.error("Error recalculating allocations:", error);
            });
        } else {
          console.error("Invalid goal value for recalculations.");
        }
      } else {
        console.error("Group not found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching group data:", error);
    });
}



function loadExpenseBreakdown() {
  const groupId = getGroupIdFromURL("joinCode");
  const groupRef = db.collection("budget-sheets").doc(groupId);
  const expenseTableBody = document.getElementById("expense-table-body");

  // Clear the table body to avoid duplicates
  expenseTableBody.innerHTML = "";

  // Fetch expense breakdown data
  groupRef.collection("expenseBreakdown")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Create a new row with expense data
        const row = document.createElement("tr");

        // Add the expense category
        const categoryCell = document.createElement("td");
        categoryCell.textContent = data.category;
        row.appendChild(categoryCell);

        // Add the allocated amount
        const amountCell = document.createElement("td");
        amountCell.textContent = `$${data.amount.toFixed(2)}`;
        row.appendChild(amountCell);

        // Add the percentage of the goal
        const percentageCell = document.createElement("td");
        percentageCell.textContent = `${data.percentage}%`;
        row.appendChild(percentageCell);

        // Append the row to the table body
        expenseTableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error loading expense breakdown:", error);
    });
}




// window.onload = loadGroupData();
