// Function to submit amounts to Firestore
function submitAmounts() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userId = user.uid;
    const userExpensesRef = db.collection("users").doc(userId).collection("expenses").doc("expenseDoc");

    // NOTES FOR JESSIE - PLEASE ASK COLE IF YOU HAVE QUESTIONS

    // THIS DOESNT WORK BECAUSE YOU ARE TRYING TO ACCESS VALUES YOU HAVENT SET YET
    // MAKE SEPERATE FUNCTIONS: ONE TO WRITE THE DATA AND ONE TO LOAD IT

    // WE TALKED ABOUT NOT HAVING PLACEHOLDERS BECAUSE THEY ARE NOT GOING TO BE SUBMITTING THE NEW TOTAL EACH TIME, 
    //    THEY ARE GOING TO BE SUBMITTING THEIR NUMBERS TO ADD, AND WE WILL ADD THEM TO THE TOTAL FOR THEM, ITS A RUNNING TOTAL

    // WE SHOULD BE WRITING THE 2 INPUT FIELDS OF INCOME EARNED AND EXPENSE TO FIRESTORE, THEN WE NEED A SEPARATE FUNCTION TO LOAD THE REMAINING BALANCE ONTO THE PAGE
    // SHOULD LOOK LIKE THIS ==>>
    // totalIncome += incomeInput;
    // totalExpense += expenseInput;
    // totalRemaining = totalIncome - totalExpense; (recalculate this every time you reload the page in a **SEPARATE FUNCTION**)

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