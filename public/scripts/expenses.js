// Function to submit amounts to Firestore
function submitAmounts() {
    const user = firebase.auth().currentUser;
    if (user) {
      const userId = user.uid;

      // Set the document for the current user in the expenses collection
      db.collection("users")
        .doc(userId)
        .collection("expenses")
        .doc("expenseDoc")
        .set({
          income: parseFloat(document.getElementById("income").value) || 0,
          food: parseFloat(document.getElementById("food").value) || 0,
          gas: parseFloat(document.getElementById("gas").value) || 0,
          car: parseFloat(document.getElementById("car").value) || 0,
          rent: parseFloat(document.getElementById("rent").value) || 0,
          phone: parseFloat(document.getElementById("phone").value) || 0,
          entertainment: parseFloat(document.getElementById("entertainment").value) || 0,
          shopping: parseFloat(document.getElementById("shopping").value) || 0,
          fees: parseFloat(document.getElementById("fees").value) || 0,
          service: parseFloat(document.getElementById("service").value) || 0
        })
        .then(() => {
          console.log("Document successfully written!");
          window.location.href = "expenses.html";
        })
        .catch((error) => {
          console.error("Error writing document:", error);
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
          document.getElementById("food").placeholder = data.food || "0.00";
          document.getElementById("gas").placeholder = data.gas || "0.00";
          document.getElementById("car").placeholder = data.car || "0.00";
          document.getElementById("rent").placeholder = data.rent || "0.00";
          document.getElementById("phone").placeholder = data.phone || "0.00";
          document.getElementById("entertainment").placeholder = data.entertainment || "0.00";
          document.getElementById("shopping").placeholder = data.shopping || "0.00";
          document.getElementById("fees").placeholder = data.fees || "0.00";
          document.getElementById("service").placeholder = data.service || "0.00";
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