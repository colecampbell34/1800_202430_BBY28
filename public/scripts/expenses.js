// Function to submit amounts to Firestore
function submitAmounts() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userId = user.uid;
    const userExpensesRef = db.collection("users").doc(userId).collection("expenses").doc("expenseDoc");

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

          // Set the updated values to Firebase
          userExpensesRef.set({
            income: currentIncome,
            expenses: currentExpense,
            distributions: parseFloat(document.getElementById("distributions").value) || 0,
            remainings: parseFloat(document.getElementById("remainings").value) || 0,
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
          document.getElementById("income").placeholder = data.income || "0.00";
          document.getElementById("expenses").placeholder = data.expenses || "0.00";
          document.getElementById("distributions").placeholder = data.distributions || "0.00";
          document.getElementById("remainings").placeholder = data.income - data.expenses - data.distributions|| "0.00";
          console.log("Placeholders loaded successfully");
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