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
    }
    // Load the group data using the groupId
    console.log("Group ID:", groupId);
    // Here you would proceed to load your group data based on groupId
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
  
          // Update progress bar
            console.log("Current contribution:", groupData.current);
            console.log("Max contribution", groupData.max);

          const progressPercentage = (groupData.current / groupData.max) * 100;
          const progressBar = document.querySelector(".progress-bar");
          progressBar.style.width = `${progressPercentage}%`;
          progressBar.textContent = `${Math.round(progressPercentage)}%`;
  
          // Load members list
          loadGroupMembers(groupId);
          
          // Load expense breakdown if needed
        //   loadExpenseBreakdown(groupData.expenses, groupData.max);           // UPDATE THIS (BREAKDOWN OF COSTS)
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
  


  // Call loadGroupData when the page loads
  window.onload = loadGroupData;
