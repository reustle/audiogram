let audiogramChart;

function init() {
    
    // Prepare our bone images
    const pointImageL = new Image(20,20);
    pointImageL.src = 'https://github.com/Harukka/audiogram/blob/main/docs/left_bone.png?raw=true';
    const pointImageR = new Image(20,20);
    pointImageR.src = 'https://github.com/Harukka/audiogram/blob/main/docs/right_bone.png?raw=true';
    
    // Add dB options to each dropdown
    // Load the data from localStroage if it is available
    let audiogramData = loadAudiogramData();
    document.querySelectorAll('.frequencyInput').forEach( (dbSelector, dbSelectorIndex) => {
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
        let unusedVar = ['right', 'left', 'rightBone', 'leftBone'].forEach(ear => {
            document.querySelectorAll(`#${ear}Values .dbCell`).forEach((dbCell, dbCellIndex) => {
                let dbSelect = dbCell.querySelector(".frequencyInput");
                let scaleOutSelect = dbCell.querySelector(".scaleOutInput");

                let foundDbValue = audiogramData[ear][dbCellIndex].frequency;
                if (foundDbValue && foundDbValue !== "-") {
                    dbSelect.value = foundDbValue;
                }

                let foundScaleOutValue = audiogramData[ear][dbCellIndex].scaleOut;
                if (foundScaleOutValue) {
                    scaleOutSelect.checked = true;
                }
            });
        });

        // document.querySelectorAll("#leftValues select").forEach((dbSelect, dbSelectIndex) => {
        //     let foundLeftDbValue = audiogramData.left[dbSelectIndex].frequency;
        //     if (foundLeftDbValue && foundLeftDbValue !== "-") {
        //         dbSelect.value = foundLeftDbValue;
        //     }
        // });
        // document.querySelectorAll("#rightBoneValues select").forEach((dbSelect, dbSelectIndex) => {
        //     let foundRightBoneDbValue = audiogramData.rightBone[dbSelectIndex].frequency;
        //     if (foundRightBoneDbValue && foundRightBoneDbValue !== "-") {
        //         dbSelect.value = foundRightBoneDbValue;
        //     }
        // });
        // document.querySelectorAll("#leftBoneValues select").forEach((dbSelect, dbSelectIndex) => {
        //     let foundLeftBoneDbValue = audiogramData.leftBone[dbSelectIndex].frequency;
        //     if (foundLeftBoneDbValue && foundLeftBoneDbValue !== "-") {
        //         dbSelect.value = foundLeftBoneDbValue;
        //     }
        // });
        
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
                spanGaps: false,
                pointStyle: 'circle',
                pointRadius: 10,
                pointHoverRadius: 15,
            },
            {
                label: 'Left',
                data: [],
                borderColor: 'rgba(15, 10, 222, 1)',
                spanGaps: false,
                pointStyle: 'crossRot',
                pointRadius: 10,
                pointHoverRadius: 15,
            },
            {
                label: 'RightBone',
                data: [],
                spanGaps: false,
                showLine:false,
                pointStyle: [pointImageR],
                pointRadius: 10,
                pointHoverRadius: 15,
             
            },
            {
                label: 'LeftBone',
                data: [],
                spanGaps: false,
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

    let audiogramData = {
        left: [],
        right: [],
        rightBone: [],
        leftBone: [],
        memo: document.getElementById("memo").value
    }
    let unusedVar = ['left', 'right', 'leftBone', 'rightBone'].map(ear => {
        document.querySelectorAll(`#${ear}Values .dbCell`).forEach(earInputs => {
            audiogramData[ear].push({
                frequency: earInputs.querySelector('.frequencyInput').value,
                scaleOut: earInputs.querySelector('.scaleOutInput').checked? true:false
            });
        });
    });

    console.log('readForm', audiogramData);
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

    let rightValues = audiogramData.right.map(function(thisValue){
        //console.log('updateChart thing', thisValue);
        if(thisValue.checked == true){
            return null;
        }
        return thisValue.frequency;
    });
    let leftValues = audiogramData.right.map(function(thisValue){
        //console.log('updateChart thing', thisValue);
        if(thisValue.checked == true){
            return null;
        }
        return thisValue.frequency;
    });
    
    // Update the chart
    // audiogramChart.data.datasets[0].data = audiogramData.right;
    audiogramChart.data.datasets[0].data = rightValues;
    audiogramChart.data.datasets[1].data = leftValues;
    audiogramChart.data.datasets[2].data = audiogramData.rightBone;
    audiogramChart.data.datasets[3].data = audiogramData.leftBone;


    audiogramChart.update();
}


init();

function sampleData() {
    let rightInputs = document.querySelectorAll('#rightValues .dbCell');
    let leftInputs = document.querySelectorAll('#leftValues .dbCell');
    let rightBoneInputs = document.querySelectorAll('#rightBoneValues .dbCell');
    let leftBoneInputs = document.querySelectorAll('#leftBoneValues .dbCell');

    // Right ear
    rightInputs.forEach((rightInput, index) => {
        let frequency = rightInput.querySelector('.frequencyInput');
        let scaleOut = rightInput.querySelector('.scaleOutInput');
        frequency.value = 10 * (index + 1);
        scaleOut.checked = false;
    });

    // Left ear
    leftInputs.forEach((leftInput, index) => {
        let frequency = leftInput.querySelector('.frequencyInput');
        let scaleOut = leftInput.querySelector('.scaleOutInput');
        frequency.value = 10 * (index + 1);
        scaleOut.checked = false;
    });
}
