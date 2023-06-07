let db = document.getElementById("db");

for (let i = -10; i <= 120; i+5){
    let option = document.createElement("option");
    option.setAttribute("value", i);
    option.innerHTML = i + "dB";
    db.appendChild(option);
console.log(option);
}