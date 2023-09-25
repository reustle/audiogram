let readingsList = [];
var map;
var historyChart;
var dbMeter = new DecibelMonitor();


function getCurrentPositionAsync(options) {
    // Helper function to make getCurrentPosition async/await friendly

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve(position);
            },
            (error) => {
                reject(error);
            },
            options
        );
    });
}

async function getLocation() {
    // Returns the current location

    try {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };
        const position = await getCurrentPositionAsync(options);
        return {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }
    } catch (error) {
        //console.error("Error getting location:", error.message);
        return null;
    }
}

async function createReading() {
    // Generate a single reading

    let reading = {
        timestamp: new Date(),
        location: await getLocation(),
        decibel: await dbMeter.getVolume(),
    }
    return reading;
}


function generateReadingAverage(slicedReadingList){
    let decibelsSum = 0;
    let avgDecibel = 0;

    if(!slicedReadingList.length) {
        return 0;
    }
    
    for (const item of slicedReadingList) {    
         decibelsSum += item.decibel; 
    }
    avgDecibel = decibelsSum / slicedReadingList.length;
    return avgDecibel;
}

// async function getAudioLevel2(){
//     const meter = new Tone.Meter();
//     const mic = new Tone.UserMedia().connect(meter);
//     mic.open().then(() => {
//         // promise resolves when input is available
//         console.log("mic open");
//         // print the incoming mic levels in decibels
//         setInterval(() => console.log("getAudioLevel2(): " + meter.getValue()), 2*1000);
//     }).catch(e => {
//     // promise is rejected when the user doesn't have or allow mic access
//     console.log("mic not open");
//     });
// }

async function createMap(){

    mapboxgl.accessToken  = 'pk.eyJ1IjoicGlwcGktaW0tZmluZSIsImEiOiJjbG1oYzB6MngyZ2Z6M2pvc2dramdyaHlvIn0.bG19jebzMWsgeyvW3o5mCA';
    
    map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [139.70165725408242,35.65834769457418], // starting position [lng, lat]
        zoom: 15, // starting zoom
        });
    
    
    let currentLocation = await getLocation()
    console.log('Starting point found', currentLocation);

    // create the popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
    'Loading'
    );
    
    
    // Create a default Marker and add it to the map.
    // const marker1 = new mapboxgl.Marker()
    // .setLngLat([currentLocation.lon, currentLocation.lat])
    // .setPopup(popup) // sets a popup on this marker
    // .addTo(map);

    map.flyTo({center:[currentLocation.lon, currentLocation.lat]});




    // var markers = new L.MarkerClusterGroup();

    // for (var i = 0; i < addressPoints.length; i++) {
    //     var a = addressPoints[i];
    //     var title = a[2];
    //     var marker = L.marker(new L.LatLng(a[0], a[1]), {
    //         icon: L.mapbox.marker.icon({'marker-symbol': 'post', 'marker-color': '0044FF'}),
    //         title: title
    //     });
    //     marker.bindPopup(title);
    //     markers.addLayer(marker);
    // }

    // map.addLayer(markers);
    
}

function createDBGraph(){
  const ctx = document.getElementById('decibelChart').getContext("2d");
  var data = {
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"],
    datasets: [
      {
        label: 'Right',
        data: [],
        borderColor: 'rgba(255, 100, 100, 1)',
        //If true, lines will be drawn between points with no or null data.
        spanGaps: true,
        showLine: true,
        pointStyle: false,
        borderWidth: 1,
      },
    ]
  };

  historyChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      plugins:{
        legend:{
            display:false,
            position:'top',
            labels:{
                usePointStyle: true,
            }
        }
      },
      scales: {
        x: {
            offset :true,
            title:{
                display: true,
                text: 'Time(s)',

            }                        
        },
        y: {
            offset :true,
            title: {
                display: true,
                text: 'Noise Volume (dB)'
            },
            //top 0 -> bottom 120
            reverse: false,
            min: -10,
            max: 120,
            ticks: {
                stepSize: 10,
                autoSkip: true
            }
        },
      },
  }});
}

async function decibelCheckLoop() {
  // Get the average of readings and update the UI numbers and map
  
  let reading = await createReading();
  readingsList.push(reading);

  //get all dates
  var chartData = historyChart.data.datasets[0].data;
  chartData.push(reading.decibel);
  // If the length is over 30, remove the first item
  if (chartData.length == 30) {
    chartData.shift();
  }
  historyChart.data.datasets[0].data = chartData;
  historyChart.update();

  console.log('decibelCheckLoop list', { list: readingsList });
  
  // Show the data
  document.getElementById("showDB").innerHTML = reading.decibel;

  if (readingsList.length % 5 === 0) {
    // There have been a multiple of 5 readings

    console.log('5 seconds! ITS TIME ')
    let last5Readings = readingsList.slice(-5);
    let avgOf5Decibels = generateReadingAverage(last5Readings);                
    let DBPer5 =document.getElementById("showDBPer5");
    DBPer5.innerHTML = avgOf5Decibels;
  }

  if (readingsList.length % 10 === 0) {
    // There have been a multiple of 10 readings

    console.log('10 seconds! ITS TIME')
    let avgOf10Decibels = generateReadingAverage(readingsList.slice(-10));
    let DBPer10 =document.getElementById("showDBPer10");
    DBPer10.innerHTML = avgOf10Decibels;
  }

  if (readingsList.length % 30 === 0 ) {
    // There have been a multiple of 30 readings

    console.log('30 seconds! ITS TIME')
    let last30Readings = readingsList.slice(-30);
    
    console.log("last30Readings : ", last30Readings)
    console.log(last30Readings[14])
    console.log(last30Readings[14].location.lat)
    let lastTimestamp = last30Readings[29].timestamp.toLocaleString();
    
    let markerColor;
    let middleLocationOfLast30 = last30Readings[14].location;
    let avgOf30Decibels = generateReadingAverage(last30Readings);
    console.log("30sec func", map);
    if(avgOf30Decibels < 30 ){
        markerColor = '#10ad4d'
    }else if(avgOf30Decibels >= 30 && avgOf30Decibels < 60){
        markerColor = '#6eb647'
    }else if(avgOf30Decibels >= 60 && avgOf30Decibels < 70){
        markerColor = '#a9c43d'
    }else if(avgOf30Decibels >= 70 && avgOf30Decibels < 80){
        markerColor = '#fcde03'
    }else if(avgOf30Decibels >= 80 && avgOf30Decibels < 99){
        markerColor = '#fdbf0d'
    }else if(avgOf30Decibels >= 99 && avgOf30Decibels < 130){
        markerColor = '#f74425'
    }else{
        markerColor = '#ec1a23'
    }

    // create the popup
    let popupText = `
        Time: ${lastTimestamp}<br/>
        DB: ${(Math.round(avgOf30Decibels*100))/100}
    `;
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupText);        
    // Create a default Marker and add it to the map.
    const newMarker = new mapboxgl.Marker({ color: markerColor })
    .setLngLat([middleLocationOfLast30.lon, middleLocationOfLast30.lat])
    .setPopup(popup) // sets a popup on this marker
    .addTo(map);
    map.flyTo({center:[middleLocationOfLast30.lon, middleLocationOfLast30.lat]});
  }
}

function handleButtonClicks() {
  // Create the click events for the START and STOP buttons

  let isStarted = false;
  // Variable to store the interval ID
  let intervalId ;

  async function startBtnClick() {
    if (isStarted === true) {
      return;
    }

    //getAudioLevel2();
    //connect to Device Mic
    await dbMeter.connectMic();
    intervalId = setInterval(decibelCheckLoop, 1*1000); // Every 1 second

    isStarted = true;
  }

  function stopBtnClick(){
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null; // Reset the interval ID
        console.log("Function stopped.");
    }
    isStarted = false;
  }

  let startBtn = document.getElementById("startBtn");
  startBtn.addEventListener("click", startBtnClick);

  let stopBtn = document.getElementById("stopBtn");
  stopBtn.addEventListener("click", stopBtnClick);
}


async function main() {
    // This is what runs when the page loads

    createDBGraph();

    await createMap();

    handleButtonClicks();

    
}

main();
