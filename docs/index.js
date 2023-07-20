let audiogramChart;

function init() {
    // Add dB options to each dropdown
    // Load the data from localStroage (if it is available)
    let audiogramData = loadAudiogramData();
    const pointImageL = new Image(20,20);
    pointImageL.src = 'https://github.com/Harukka/audiogram/blob/main/docs/left_bone.png?raw=true';
    const pointImageR = new Image(20,20);
    pointImageR.src = 'https://github.com/Harukka/audiogram/blob/main/docs/right_bone.png?raw=true';
        

    document.querySelectorAll('#rightValues select,#leftValues select,#rightBoneValues select, #leftBoneValues select').forEach( (dbSelector, dbSelectorIndex) => {
        //Make None Option '-'
        let defaultNoneOption = document.createElement("option");
        defaultNoneOption.innerHTML = "-";
        dbSelector.appendChild(defaultNoneOption)

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
            document.querySelectorAll("#rightBoneValues select").forEach((dbSelect, dbSelectIndex) => {
                let foundRightBoneDbValue = audiogramData.rightBone[dbSelectIndex];
                if (foundRightBoneDbValue && foundRightBoneDbValue !== "-") {
                    dbSelect.value = foundRightBoneDbValue;
                }
            });
            document.querySelectorAll("#leftBoneValues select").forEach((dbSelect, dbSelectIndex) => {
                let foundLeftBoneDbValue = audiogramData.leftBone[dbSelectIndex];
                if (foundLeftBoneDbValue && foundLeftBoneDbValue !== "-") {
                    dbSelect.value = foundLeftBoneDbValue;
                }
            });
            
            document.getElementById("memo").value = audiogramData.memo;

        }

    var ctx = document.getElementById('chart').getContext("2d");

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
            },
            {
                label: 'RightBone',
                data: [],
                spanGaps: true,
                showLine:false,
                pointStyle: [pointImageR],
                pointRadius: 10,
                pointHoverRadius: 15,
             
            },
            {
                label: 'LeftBone',
                data: [],
                spanGaps: true,
                showLine:false,
                pointStyle: [pointImageL],
                pointRadius: 10,
                pointHoverRadius: 15,
            }            
        ]
    };

    // Create the chart(config)
    audiogramChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            elements:{
                point:{
                    pointStyle:[pointImageL, pointImageR],
                }
            },
            plugins:{
                legend:{
                    position:'top',
                    labels:{
                        usePointStyle: true,
                    }
                }
            },
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
            }
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
    //0707
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
    document.querySelectorAll("#rightBoneValues select").forEach((dbSelect) => {
        dbSelect.value = "-";
    });
    document.querySelectorAll("#leftBoneValues select").forEach((dbSelect) => {
        dbSelect.value = "-";
    });

    readForm();
    updateChart();
    localStorage.clear();

    let memo = document.getElementById("memo");
    memo.value = '';
}
var clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click", clear);

// Function to update the properties of the clicked point with an image
function updateClickedPointWithImage(index, imagePath) {
    myChart.data.datasets[0].pointStyle[index] = 'image';
    myChart.data.datasets[0].pointStyleImage[index] = imagePath;
    myChart.update();
  }


function readForm(){
    // Load the data from the form and save it
    let rightEarData = [];
    let leftEarData = [];
    let rightBoneData = [{frequency :'-',checked:false}];
    let leftBoneData = [{frequency :'-',checked:false}];
    // let selected = [];
    // selected =document.querySelectorAll('input[type="checkbox"]:checked');
    // console.log(selected);
    // selected =document.querySelectorAll('#leftBoneValues select :checked, input[type="checkbox"]:checked');
    // console.log(selected);

    document.querySelectorAll('#rightValues select :checked').forEach(rightEarInputs => {
        rightEarData.push(rightEarInputs.innerHTML);
    })
    document.querySelectorAll('#leftValues select :checked').forEach(leftEarInputs => {
        leftEarData.push(leftEarInputs.innerHTML);
    })
    document.querySelectorAll('#rightBoneValues select :checked, input[type="checkbox"]:checked').forEach(rightBoneInputs => {
        rightBoneData.push({frequency:rightBoneInputs.innerHTML,checked:rightBoneInputs.checked});
    })
    document.querySelectorAll('#leftBoneValues select :checked, input[type="checkbox"]:checked').forEach(leftBoneInputs => {
        
        leftBoneData.push({frequency:leftBoneInputs.innerHTML,checked:leftBoneInputs.checked});
    })
    console.log(leftBoneData)
    let memo = document.getElementById("memo").value;

    let audiogramData = {
        left : leftEarData,
        right : rightEarData,
        rightBone : rightBoneData,
        leftBone : leftBoneData,
        memo : memo 
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
    audiogramChart.data.datasets[2].data = audiogramData.rightBone.frequency;
    audiogramChart.data.datasets[3].data = audiogramData.leftBone.frequency;


    audiogramChart.update();
}




init();
