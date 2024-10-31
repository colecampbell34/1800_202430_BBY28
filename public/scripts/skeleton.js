//Loads the header and navbar
function loadSkeleton() {
    console.log($("#header").load('skeleton/header.html'));
    console.log($("#navbar").load('skeleton/navbar.html'));
}
loadSkeleton();