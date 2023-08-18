let thresholdTestChart;

// Prepare our bone images

const leftHAImage = new Image(30,30);
leftHAImage.src = '/public/img/leftHA.png';
const rightHAImage = new Image(30,30);
rightHAImage.src = '/public/img/rightHA.png';
const noHAImage = new Image(30,30);
noHAImage.src = '/public/img/noHA.png';
const bothHAImage = new Image(30,30);
bothHAImage.src = '/public/img/withHA.png';


function init() {
    //show the date
    let currentDate =document.getElementById("today");
    currentDate.innerHTML = new Date().toJSON().slice(0, 10);

    // Add dB options to each dropdown
    // Load the data from localStroage if it is available
    let thresholdTestData = loadthresholdTestData ();
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
    if(thresholdTestData){
        let unusedVar = ['noHA', 'bothHA', 'rightHA', 'leftHA'].forEach(ear => {
            document.querySelectorAll(`#${ear}Values .dbCell`).forEach((dbCell, dbCellIndex) => {
                let dbSelect = dbCell.querySelector(".frequencyInput");
                let scaleOutSelect = dbCell.querySelector(".scaleOutInput");

                let foundDbValue = thresholdTestData[ear][dbCellIndex].frequency;
                if (foundDbValue && foundDbValue !== "-") {
                    dbSelect.value = foundDbValue;
                }
            });
        });
        
        document.getElementById("memo").value = thresholdTestData.memo;

    }

    var ctx = document.getElementById('chart').getContext("2d");
    var data = {
        labels: ["125", "250", "500", "1000",  "2000", "4000", "8000"],
        datasets: [
            {
                label: 'bothHA',
                data: [],
                borderColor: 'rgba(255, 100, 100, 1)',
                //If true, lines will be drawn between points with no or null data.
                spanGaps: false,
                showLine:false,
                pointStyle: [bothHAImage],
                borderWidth: 1,
                order: 2,
            },
            {
                label: 'noHA',
                data: [],
                borderColor: 'rgba(15, 10, 222, 1)',
                spanGaps: false,
                showLine:false,
                pointStyle: [noHAImage],
                borderWidth: 1,
                order: 1,
            },
            {
                label: 'RightHA',
                data: [],
                spanGaps: false,
                showLine:false,
                pointStyle: [rightHAImage],
                order:3,
            },
            {
                label: 'LeftHA',
                data: [],
                spanGaps: false,
                showLine:false,
                pointStyle: [leftHAImage],
                order:4,
            }            
        ]
    };

    // Create the chart(config)
    thresholdTestChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            elements:{
                point:{
                    pointStyle:[
                        bothHAImage,
                        noHAImage,
                        leftHAImage,
                        rightHAImage
                    ],
                }
            },
            plugins:{
                legend:{
                    display:false,
                    position:'top',
                    labels:{
                        usePointStyle: true,
                    }
                }
            },
            // onClick: (e) => {
            //     console.log('mapClick', e);
            // },
            responsive: false,
            layout: {
                padding: 50
            },
            scales: {
                x: {
                    offset :true,
                    title:{
                        display: true,
                        text: '音の高さ：周波数(Hz) / Pitch in Hertz(Hz)',

                    }                        
                },
                y: {
                    offset :true,
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
                }
            },                
        }
    });
    // Draw the chart, if there is data in localstorage
    updateChart();
}

// When the Update button is clicked, read the values
// and update the chart
function updateBtnClick() {
    readForm();
    updateChart();
}
var updateBtn = document.getElementById("updateBtn");
updateBtn.addEventListener("click", updateBtnClick);

// Save the form and draw the chart every time the input changes
document.querySelectorAll('select.frequencyInput, input.scaleOutInput').forEach( (input) => {
    input.addEventListener('change', updateBtnClick);
});

// When the Clear button is clicked, remove the values and memo
function clear(){
    if( confirm("本当にすべてのデータを消去しますか？") ){
        localStorage.clear();
        window.location.reload(); // Refresh the page
    }
}
var clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click", clear);

//Function to update the properties of the clicked point with an image
function updateClickedPointWithImage(index, imagePath) {
    myChart.data.datasets[0].pointStyle[index] = 'image';
    myChart.data.datasets[0].pointStyleImage[index] = imagePath;
    myChart.update();
}

function readForm(){
    // Load the data from the form and save it

    let thresholdTestData = {        
        bothHA: [],
        noHA: [],
        rightHA: [],
        leftHA: [],
        memo: document.getElementById("memo").value
    }
    let unusedVar = ['bothHA', 'noHA', 'leftHA', 'rightHA'].map(ear => {
        document.querySelectorAll(`#${ear}Values .dbCell`).forEach(earInputs => {
            thresholdTestData[ear].push({
                frequency: earInputs.querySelector('.frequencyInput').value
            });
        });
    });

    //console.log('readForm', thresholdTestData);
    localStorage.setItem("thresholdTestData", JSON.stringify(thresholdTestData));
}
function loadthresholdTestData(){
    return JSON.parse(localStorage.getItem("thresholdTestData"));
}

function updateChart(){
    
    let thresholdTestData = loadthresholdTestData();
    if(!thresholdTestData){
        return;
    }
    console.log(thresholdTestData.bothHA)
    let bothHAValues = thresholdTestData.bothHA.map(function(thisValue){
        return thisValue.frequency;
    });
    let noHAValues = thresholdTestData.noHA.map(function(thisValue){
        return thisValue.frequency;
    });
    let rightHAValues = thresholdTestData.rightHA.map(function(thisValue){
        return thisValue.frequency;
    });
    let leftHAValues = thresholdTestData.leftHA.map(function(thisValue){
        return thisValue.frequency;
    });

    // Since Bone values start at 250, and not 125
    // We need to offset the list of values by +1
    // Adds "null" as the first value of the list
    // rightValues.unshift(null);
    // leftHAValues.unshift(null);
    
    //set null when scaleout is checked
    thresholdTestChart.data.datasets[0].data = thresholdTestData.bothHA.map(function(thisValue, index){
        return thresholdTestChart.data.datasets[0].pointStyle[index] = bothHAImage;
        
    })
    thresholdTestChart.data.datasets[1].data = thresholdTestData.noHA.map(function(thisValue, index){
        return thresholdTestChart.data.datasets[1].pointStyle[index] = noHAImage;
    })    
    thresholdTestChart.data.datasets[2].data = thresholdTestData.rightHA.map(function(thisValue, index){
        return thresholdTestChart.data.datasets[2].pointStyle[index] = rightHAImage;
    })
    thresholdTestChart.data.datasets[3].data = thresholdTestData.leftHA.map(function(thisValue, index){
            return thresholdTestChart.data.datasets[3].pointStyle[index] = leftHAImage;
    })
    // Update the chart
    thresholdTestChart.data.datasets[0].data = bothHAValues;
    thresholdTestChart.data.datasets[1].data = noHAValues;
    thresholdTestChart.data.datasets[2].data = rightHAValues;
    thresholdTestChart.data.datasets[3].data = leftHAValues;
    
    console.log(thresholdTestChart.data.datasets[0])

    thresholdTestChart.update();
}

init();




function sampleData() {
    let rightInputs = document.querySelectorAll('#rightValues .dbCell');
    let leftInputs = document.querySelectorAll('#leftValues .dbCell');
    let rightBoneInputs = document.querySelectorAll('#rightBoneValues .dbCell');
    let leftHAInputs = document.querySelectorAll('#leftHAValues .dbCell');

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
