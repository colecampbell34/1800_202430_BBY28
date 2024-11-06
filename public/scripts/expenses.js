function submitAmounts() {
  console.log("inside amount review");
  const monthlyincome = parseFloat(document.getElementById("income").value);
  const food = parseFloat(document.getElementById("food").value);
  const gas = parseFloat(document.getElementById("gas").value);
  const car = parseFloat(document.getElementById("car").value);
  const rent = parseFloat(document.getElementById("rent").value);
  const phone = parseFloat(document.getElementById("phone").value);
  const entertainment = parseFloat(document.getElementById("entertainment").value);
  const shopping = parseFloat(document.getElementById("shopping").value);
  const fees = parseFloat(document.getElementById("fees").value);
  const service = parseFloat(document.getElementById("service").value);

  console.log(
    monthlyincome,
    food,
    gas,
    car,
    rent,
    phone,
    entertainment,
    shopping,
    fees,
    service
  );

  var user = firebase.auth().currentUser;
  if (user) {
    const userId = user.uid;

    // Set the document for the current user in the expenses collection
    db.collection("expenses")
      .doc(userId)
      .set({
        userID: userId,
        monthlyincome: monthlyincome,
        food: food,
        gas: gas,
        car: car,
        rent: rent,
        phone: phone,
        entertainment: entertainment,
        shopping: shopping,
        fees: fees,
        service: service
      })
      .then(() => {
        window.location.href = "expensesupdated.html"; // Redirect to the thanks page
      });
  } else {
    console.log("No user is signed in");
    window.location.href = "expenses.html";
  }
}
