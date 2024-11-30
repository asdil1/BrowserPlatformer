function saveName() {
    const username = document.getElementById("username").value;
    if(username){
        localStorage.setItem("username", username);
    }
}