function showUsernameHelp() {
    document.getElementById('usernameHelp').classList.remove('d-none');
}
function hideUsernameHelp() {
    document.getElementById('usernameHelp').classList.add('d-none');
}
function showEmailHelp() {
    document.getElementById('emailHelp').classList.remove('d-none');
}
function hideEmailHelp() {
    document.getElementById('emailHelp').classList.add('d-none');
}
function showPasswordHelp() {
    document.getElementById('passwordHelp').classList.remove('d-none');
}
function hidePasswordHelp() {
    document.getElementById('passwordHelp').classList.add('d-none');
}

// Password live validation
const passwordInput = document.getElementById('password');
passwordInput.addEventListener('input', function() {
    const value = passwordInput.value;
    // Length check
    if (value.length >= 6 && value.length <= 32) {
        document.getElementById('pw-length').innerHTML = '&#9989;';
    } else {
        document.getElementById('pw-length').innerHTML = '&#10060;';
    }
    // Letter check
    if (/[A-Za-z]/.test(value)) {
        document.getElementById('pw-letter').innerHTML = '&#9989;';
    } else {
        document.getElementById('pw-letter').innerHTML = '&#10060;';
    }
    // Number check
    if (/[0-9]/.test(value)) {
        document.getElementById('pw-number').innerHTML = '&#9989;';
    } else {
        document.getElementById('pw-number').innerHTML = '&#10060;';
    }
});