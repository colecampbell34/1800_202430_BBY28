// Expense Updates
function submitAmounts() {
  const userId = firebase.auth().currentUser.uid;
  const incomeInput = parseFloat(document.getElementById("income").value) || 0;
  const expenseInput = parseFloat(document.getElementById("expenses").value) || 0;

  const expensesRef = db.collection("users").doc(userId).collection("expenses").doc("expensesDoc");

  expensesRef.get().then((doc) => {
    if (doc.exists) {
      const currentIncome = doc.data().totalIncome || 0;
      const currentExpenses = doc.data().totalExpenses || 0;

      // Update totals
      const updatedIncome = currentIncome + incomeInput;
      const updatedExpenses = currentExpenses + expenseInput;
      const updatedRemaining = updatedIncome - updatedExpenses;

      // Write to Firestore
      return expensesRef.update({
        totalIncome: updatedIncome,
        totalExpenses: updatedExpenses,
        remaining: updatedRemaining
      });
    } else {
      // Create initial values if doc doesn't exist
      const initialRemaining = incomeInput - expenseInput;
      return expensesRef.set({
        totalIncome: incomeInput,
        totalExpenses: expenseInput,
        remaining: initialRemaining
      });
    }
  })
  .then(() => {
    // Refresh page to update remaining balance
    location.reload();
  })
  .catch((error) => {
    console.error("Error updating totals:", error);
  });
}




// Load Remaining Value on Page Load
function loadRemaining() {
  const userId = firebase.auth().currentUser.uid;
  const expensesRef = db.collection("users").doc(userId).collection("expenses").doc("expensesDoc");

  expensesRef.get().then((doc) => {
    if (doc.exists) {
      document.getElementById("remaining").textContent = doc.data().remaining.toFixed(2) || 0;
    }
  }).catch((error) => {
    console.error("Error loading remaining:", error);
  });
}




// Call loadRemaining when the page loads
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    loadRemaining();
  }
});
