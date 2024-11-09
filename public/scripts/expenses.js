// Function to initialize the document for new users with default values
function initializeUserDocument() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userId = user.uid;
    const userExpensesRef = db.collection("users").doc(userId).collection("expenses").doc("expenseDoc");

    // Check if the document exists
    return userExpensesRef.get()
      .then((doc) => {
        if (!doc.exists) {
          // Initialize with default values if document doesn't exist
          return userExpensesRef.set({
            income: 0,
            expenses: 0,
            distributions: 0,
            remainings: 0
          }).then(() => {
            console.log("Document initialized with default values for new user!");
          });
        } else {
          console.log("User document already exists.");
        }
      })
      .catch((error) => {
        console.error("Error initializing document:", error);
      });
  }
}

// Function to submit amounts, including initialization check
function submitAmounts() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userId = user.uid;
    const userExpensesRef = db.collection("users").doc(userId).collection("expenses").doc("expenseDoc");

    // First, initialize the document if it’s a new user
    initializeUserDocument().then(() => {
      // After initialization, proceed with updating income and expenses
      userExpensesRef.get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            const income = parseFloat(data.income) || 0;
            const newIncome = parseFloat(document.getElementById("income").value) || 0;
            const currentIncome = income + newIncome;
            const expense = parseFloat(data.expenses) || 0;
            const newExpense = parseFloat(document.getElementById("expenses").value) || 0;
            const currentExpense = expense + newExpense;
            const distributions = parseFloat(document.getElementById("distributions").value) || 0;
            const currentRemainings = currentIncome - currentExpense - distributions;

            // Set the updated values to Firebase
            userExpensesRef.set({
              income: currentIncome,
              expenses: currentExpense,
              distributions: distributions,
              remainings: currentRemainings,
            })
            .then(() => {
              console.log("Document successfully written!");
              window.location.href = "expenses.html";
            })
            .catch((error) => {
              console.error("Error writing document:", error);
            });
          } else {
            console.log("No data found for the specified user.");
          }
        })
        .catch((error) => {
          console.error("Error loading placeholders:", error);
        });
    });
  } else {
    console.log("No user is signed in");
    window.location.href = "expenses.html";
  }
}


  // Load expense data from Firestore and set as placeholders
  function loadExpenseData(userId) {
    const userExpensesRef = db.collection("users").doc(userId).collection("expenses").doc("expenseDoc");

    userExpensesRef.get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          document.getElementById("income").placeholder = "0.00";
          document.getElementById("expenses").placeholder = "0.00";
          document.getElementById("distributions").placeholder = data.distributions || "0.00";
          document.getElementById("remainings").innerText = data.income - data.expenses - data.distributions|| "0.00";
          console.log("Loaded successfully");
        } else {
          console.log("No data found for the specified user.");
        }
      })
      .catch((error) => {
        console.error("Error loading placeholders:", error);
      });
  }


  // Check if a user is logged in and call loadExpenseData
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      loadExpenseData(user.uid);
    } else {
      console.log("No user is signed in.");
      // Optional: Redirect to login page or display a message
    }
  });