// Wait for the page to load
document.addEventListener("DOMContentLoaded", function() {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookies");
    const declineBtn = document.getElementById("decline-cookies");

    // 1. Check if user already made a choice
    const userChoice = localStorage.getItem("cookieConsent");

    // If they haven't made a choice, show the banner
    if (!userChoice) {
        cookieBanner.style.display = "flex";
    } else {
        cookieBanner.style.display = "none";
    }

    // 2. Handle "Accept" click
    acceptBtn.addEventListener("click", function() {
        localStorage.setItem("cookieConsent", "accepted");
        cookieBanner.style.display = "none";
        // You can actually set real cookies here if you want later!
    });

    // 3. Handle "Decline" click
    declineBtn.addEventListener("click", function() {
        localStorage.setItem("cookieConsent", "declined");
        cookieBanner.style.display = "none";
    });
});