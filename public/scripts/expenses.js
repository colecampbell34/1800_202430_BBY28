function submitAmounts(){
          console.log("inside amount review");
    let monthlyincome = document.getElementById("income").value;
    let food = document.getElementById("food").value;
    let gas = document.getElementById("gas").value;
    let car= document.getElementById("car").value;
    let rent = document.getElementById("rent").value;
    let phone = document.getElementById("phone").value;  
    let entertainment = document.getElementById("entertainment").value;  
    let shopping = document.getElementById("shopping").value;  
    let fees = document.getElementById("fees").value;  
    let service = document.getElementById("service").value;  

    console.log(monthlyincome, food, gas, car, rent, phone, entertainment, shopping, fees, service);

    var user = firebase.auth().currentUser;
    if (user) {
          var currentUser = db.collection("users").doc(user.uid);
          var userID = user.uid;
  
          // Get the document for the current user.
          db.collection("expenses").add({
              userID: userID,
              monthlyincome: monthlyincome,
              food: food,
              gas: gas,
              car: car,
              rent: rent,
              phone: phone,
              entertainment: entertainment, // Include the rating in the review
              shopping:shopping,
              fees: fees,
              service: service,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => {
              window.location.href = "expensesupdated.html"; // Redirect to the thanks page
          });
      } else {
          console.log("No user is signed in");
          window.location.href = "expenses.html";
      }
}