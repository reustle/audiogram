let audiogramChart;

// Prepare our bone images

const leftImage = new Image(30,30);
leftImage.src = '/public/img/left.png';
const rightImage = new Image(30,30);
rightImage.src = '/public/img/right.png';
const lScaleOutImage = new Image(30,30);
lScaleOutImage.src = '/public/img/leftScaleOut.png';
const rScaleOutImage = new Image(30,30);
rScaleOutImage.src = '/public/img/rightScaleOut.png';
const leftBoneImage = new Image(30,30);
leftBoneImage.src = '/public/img/leftBone.png';
const rightBoneImage = new Image(30,30);
rightBoneImage.src = '/public/img/rightBone.png';
const lBoneScaleOutImage = new Image(30,30);
lBoneScaleOutImage.src = '/public/img/leftBoneScaleOut.png';
const rBoneScaleOutImage = new Image(30,30);
rBoneScaleOutImage.src = '/public/img/rightBoneScaleOut.png';


function init() {
    
    
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
                showLine:true,
                pointStyle: [rightImage],
                pointRadius: 10,
                pointHoverRadius: 15,
                borderWidth: 1
            },
            {
                label: 'Left',
                data: [],
                borderColor: 'rgba(15, 10, 222, 1)',
                spanGaps: true,
                showLine:true,
                pointStyle: [leftImage],
                pointRadius: 10,
                pointHoverRadius: 15,
                borderWidth: 1
            },
            {
                label: 'RightBone',
                data: [],
                spanGaps: false,
                showLine:false,
                pointStyle: [rightBoneImage],
                pointRadius: 10,
                pointHoverRadius: 15,
             
            },
            {
                label: 'LeftBone',
                data: [],
                spanGaps: false,
                showLine:false,
                pointStyle: [leftBoneImage],
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
                    pointStyle:[
                        rightImage,
                        leftImage,
                        leftBoneImage,
                        rightBoneImage
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
            layout:{
                padding:50
            },


            onClick: (e) => {
                console.log('mapClick', e);
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

// TODO Function to disconnect the data point from the chart

//Function to update the properties of the clicked point with an image
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

    //console.log('readForm', audiogramData);
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
    console.log(audiogramData.right)
    let rightValues = audiogramData.right.map(function(thisValue){
        return thisValue.frequency;
    });
    let leftValues = audiogramData.left.map(function(thisValue){
        return thisValue.frequency;
    });
    let rightBoneValues = audiogramData.rightBone.map(function(thisValue){
        return thisValue.frequency;
    });
    let leftBoneValues = audiogramData.leftBone.map(function(thisValue){
        return thisValue.frequency;
    });

    // Since Bone values start at 250, and not 125
    // We need to offset the list of values by +1
    // Adds "null" as the first value of the list
    rightBoneValues.unshift(null);
    leftBoneValues.unshift(null);
    
    //set scaleout image when scaleout is checked
    audiogramChart.data.datasets[0].data = audiogramData.right.map(function(thisValue, index){
        if(thisValue.scaleOut == true){
            return audiogramChart.data.datasets[0].pointStyle[index] = rScaleOutImage;
            //TODO disconnect      
        }else{
            return audiogramChart.data.datasets[0].pointStyle[index] = rightImage;
        }
    })
    audiogramChart.data.datasets[1].data = audiogramData.left.map(function(thisValue, index){
        if(thisValue.scaleOut == true){
            return audiogramChart.data.datasets[1].pointStyle[index] = lScaleOutImage;
            //TODO disconnect 
        }else{
            return audiogramChart.data.datasets[1].pointStyle[index] = leftImage;
        }
    })
    audiogramChart.data.datasets[2].data = audiogramData.rightBone.map(function(thisValue, index){
        if(thisValue.scaleOut == true){
            return audiogramChart.data.datasets[2].pointStyle[index] = rBoneScaleOutImage;
            //TODO disconnect 
        
        }else{
            return audiogramChart.data.datasets[2].pointStyle[index] = rightBoneImage;
        }
    })
    audiogramChart.data.datasets[3].data = audiogramData.leftBone.map(function(thisValue, index){
        if(thisValue.scaleOut == true){
            
            return audiogramChart.data.datasets[3].pointStyle[index] = lBoneScaleOutImage;
            //TODO  disconnect 
        }else{
            return audiogramChart.data.datasets[3].pointStyle[index] = leftBoneImage;
        }
    })
    // Since Bone values start at 250, and not 125
    // We need to offset the list of values by +1
    // Adds "null" as the first value of the pointStyle's list
    audiogramChart.data.datasets[2].pointStyle.unshift(null);
    audiogramChart.data.datasets[3].pointStyle.unshift(null);

    // Update the chart
    audiogramChart.data.datasets[0].data = rightValues;
    audiogramChart.data.datasets[1].data = leftValues;
    audiogramChart.data.datasets[2].data = rightBoneValues;
    audiogramChart.data.datasets[3].data = leftBoneValues;
    console.log(audiogramChart.data.datasets[0])

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
