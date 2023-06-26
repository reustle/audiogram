    //dB
    for (let j = 1; j <= 22; j++) {
        let id = document.getElementById("db" + j);
        let none = document.createElement("option");
        none.innerHTML = "-";
        id.appendChild(none);

        for (let i = -10; i <= 120; i = i + 5) {
            let option = document.createElement("option");
            // option.innerHTML = i + "dB";
            option.innerHTML = i;
            id.appendChild(option);
        }
    }
    //get selected dB
    function btnClick() {
        updateChart();
    }
    var updateBtn = document.getElementById("updateBtn");
    updateBtn.addEventListener("click", btnClick);

    //Chart
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

        var audiogramChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
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
                }
            }
        });
        
        function updateChart(){
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

        audiogramChart.data.datasets[0].data = rightEarData;
        audiogramChart.data.datasets[1].data = leftEarData;
        audiogramChart.update();
    }

