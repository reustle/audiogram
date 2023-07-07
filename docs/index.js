let audiogramChart;

function init() {
    // Add dB options to each dropdown

    // Load the data from localStroage (if it is available)
    let audiogramData = loadAudiogramData();

    document.querySelectorAll('#rightValues select,#leftValues select').forEach( dbSelector => {
        //Make None Option '-'
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
    })

        // If there is a dB value for this ear + this frequency in localstorage,
        // we should set this dbSelector.value as that value
        // TODO HERE

        if(audiogramData){
            document.querySelectorAll("#rightValues select").forEach((dbSelect, dbSelectIndex) => {
                let foundRightDbValue = audiogramData.right[dbSelectIndex];
                if (foundRightDbValue && foundRightDbValue !== "-") {
                    dbSelect.value = foundRightDbValue;
                }
            });
            document.querySelectorAll("#leftValues select").forEach((dbSelect, dbSelectIndex) => {
                let foundLeftDbValue = audiogramData.left[dbSelectIndex];
                if (foundLeftDbValue && foundLeftDbValue !== "-") {
                    dbSelect.value = foundLeftDbValue;
                }
            });            
        }
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
                        text: '音の高さ：周波数(Hz) / Pitch in Hertz(Hz)'
                    }                        
                },
                y: {
                    title: {
                        display: true,
                        text: '音の大きさ：聴力レベル(dB) / Hearing Level in Decibels(dB)'
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

// When the Clear button is clicked, remove the values and memo
function clear(){
    //TODO

    let audiogramData = loadAudiogramData();
    document.querySelectorAll("#rightValues select").forEach((dbSelect, dbSelectIndex) => {
        let foundRightDbValue = audiogramData.right[dbSelectIndex];
        if (foundRightDbValue && foundRightDbValue !== "-") {
            dbSelect.value = "-";
        }
    });
    document.querySelectorAll("#leftValues select").forEach((dbSelect, dbSelectIndex) => {
        let foundLeftDbValue = audiogramData.left[dbSelectIndex];
        if (foundLeftDbValue && foundLeftDbValue !== "-") {
            dbSelect.value = "-";
        }
    });
    readForm();
    updateChart();
    localStorage.clear();

    let memo = document.getElementById("memo");
    memo.value = '';

}
var clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click", clear);

function readForm(){
    // Load the data from the form and save it
    let rightEarData = [];
    let leftEarData = [];
    
    document.querySelectorAll('#rightValues select :checked').forEach(rightEarInputs => {
        rightEarData.push(rightEarInputs.innerHTML);
        console.log(rightEarData);
    })
    document.querySelectorAll('#leftValues select :checked').forEach(leftEarInputs => {
        leftEarData.push(leftEarInputs.innerHTML);
        console.log(leftEarData);
    })

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
