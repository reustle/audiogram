let audiogramChart;

function init() {
    // Add dB options to each dropdown

    // Load the data from localStroage (if it is available)
    let audiogramData = loadAudiogramData();
    console.log(audiogramData);

    document.querySelectorAll('#rightValues select').forEach( dbSelector => {
        console.log(dbSelector.id);
        let defaultNoneOption = document.createElement("option");
        defaultNoneOption.innerHTML = "-";
        dbSelector.appendChild(defaultNoneOption);
         
        // Make an <option> element for each dB level
        for (let i = -10; i <= 120; i = i + 5) {
            let option = document.createElement("option");
            // option.innerHTML = i + "dB";
            option.innerHTML = i;
            dbSelector.appendChild(option);
        }
        // If there is a dB value for this ear + this frequency in localstorage,
        // we should set this dbSelector.value as that value
        // 0701 TODO HERE
        // if(audiogramData){
        //     let counter = j - 1;
        //     let foundRightDbValue = audiogramData.right[counter];
        //     console.log(counter);            
        //     if(counter >= 11) {
        //         counter -= 11;
        //         let foundLeftDbValue = audiogramData.left[counter];
        //         if(foundLeftDbValue){
        //             console.log(counter);
        //             console.log('We found ', foundLeftDbValue)
        //             dbSelector.value = foundLeftDbValue;
        //         }
        //     }            
        //     if(foundRightDbValue){
        //         console.log('We found ', foundRightDbValue)
        //         dbSelector.value = foundRightDbValue;

        //     }
        // }
    })

    // for (let j = 1; j <= 22; j++) {
    //     // For each frequency <select> dropdown

    //     //let dbSelector = document.getElementById("db" + j);


    //     let none = document.createElement("option");
    //     none.innerHTML = "-";
    //     dbSelector.appendChild(none);

        // // Make an <option> element for each dB level
        // for (let i = -10; i <= 120; i = i + 5) {
        //     let option = document.createElement("option");
        //     // option.innerHTML = i + "dB";
        //     option.innerHTML = i;
        //     dbSelector.appendChild(option);
        // }

        // // If there is a dB value for this ear + this frequency in localstorage,
        // // we should set this dbSelector.value as that value
        // // TODO HERE
        // console.log('Lets look for ', j)
        // if(audiogramData){
        //     let counter = j - 1;
        //     let foundRightDbValue = audiogramData.right[counter];
        //     console.log(counter);            
        //     if(counter >= 11) {
        //         counter -= 11;
        //         let foundLeftDbValue = audiogramData.left[counter];
        //         if(foundLeftDbValue){
        //             console.log(counter);
        //             console.log('We found ', foundLeftDbValue)
        //             dbSelector.value = foundLeftDbValue;
        //         }
        //     }            
        //     if(foundRightDbValue){
        //         console.log('We found ', foundRightDbValue)
        //         dbSelector.value = foundRightDbValue;

        //     }
        // }


    // }

    // Create the chart
    var ctx = document.getElementById('chart');

    var data = {
        labels: ["125", "250", "500", "750", "1000", "1500", "2000", "3000", "4000", "6000", "8000"],
        datasets: [
            {
                label: 'Right',
                data: [],
                borderColor: 'rgba(255, 100, 100, 1)',
                //If true, lines will be drawn between points with no or null data.
                spanGaps: true,
                pointStyle: 'circle',
                pointRadius: 10,
                pointHoverRadius: 15,
            },
            {
                label: 'Left',
                data: [],
                borderColor: 'rgba(15, 10, 222, 1)',
                spanGaps: true,
                pointStyle: 'crossRot',
                pointRadius: 10,
                pointHoverRadius: 15,
            }
        ]
    };

    var options = {};

    audiogramChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            onClick: (e) => {
                console.log(e);
                
            },
            responsive: false,
            layout: {
                padding: 50
            },
            scales: {
                x: {
                    title:{
                        display: true,
                        text: '周波数(Hz)'
                    }                        
                },
                y: {
                    title: {
                        display: true,
                        text: '聴力レベル(dB)'
                    },
                    //top 0 -> bottom 120
                    reverse: true,
                    min: -10,
                    max: 120,
                    ticks: {
                        stepSize: 10,
                        autoSkip: false
                    }
                },
            },
            
        }
    });

    // Draw the chart, if there is data in localstorage
    updateChart();
}


// When the Update button is clicked, read the values
// and update the chart
function btnClick() {
    readForm();
    updateChart();
}
var updateBtn = document.getElementById("updateBtn");
updateBtn.addEventListener("click", btnClick);

//0701TODO
function readForm(){
    // Load the data from the form and save it
    let rightEarData = [];
    let leftEarData = [];

    for (let j = 1; j <= 11; j++) {
        let rightEarInputs = document.getElementById("db" + j);
        let idx = rightEarInputs.selectedIndex;
        rightEarData.push(rightEarInputs[idx].text);
    }

    for (let j = 12; j <= 22; j++) {
        let leftEarInputs = document.getElementById("db" + j);
        let idx = leftEarInputs.selectedIndex;
        leftEarData.push(leftEarInputs[idx].text);
    }
    console.log(leftEarData);

    let audiogramData = {
        left : leftEarData,
        right : rightEarData
    }
    localStorage.setItem("audiogramData", JSON.stringify(audiogramData));

}
function loadAudiogramData(){
    return JSON.parse(localStorage.getItem("audiogramData"));
}

function updateChart(){
    
    let audiogramData = loadAudiogramData();
    if(!audiogramData){
        return;
    }

    // Update the chart
    audiogramChart.data.datasets[0].data = audiogramData.right;
    audiogramChart.data.datasets[1].data = audiogramData.left;
    audiogramChart.update();
}



init();
