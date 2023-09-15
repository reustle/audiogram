function getTime() {
    // Returns the curren time

    const date = new Date();
    const locale = date.toISOString();
    return locale;
}

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

async function setUpAudioLevel() {
    // Set up the connection to the microphone

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    return analyser;
}

async function getAudioLevel(analyser) {
    // Returns the current audio level

    if (!analyser) {
        console.log('ERROR: You forgot to pass analyser');
        return null;
    }
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    let dbLevel = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    dbLevel = dbLevel + 30;
    return parseInt(dbLevel);
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

async function createReading(audioAnalyser) {
    // Generate a single reading

    let reading = {
        timestamp: getTime(),
        location: await getLocation(),
        decibel: await getAudioLevel(audioAnalyser),
    }
    console.log('Reading:', reading);
    return reading;
}
function generateReadingAverage5(slicedReadingListFive){
    let decibelsSum = 0;
    let avgDecibelFive = 0;
    
    for (const item of slicedReadingListFive) {    
         decibelsSum += item.decibel; 
    }
    avgDecibelFive = decibelsSum / 5;
    return avgDecibelFive;
}

function generateReadingAverage10(slicedReadingListTen){
    let decibelsSumTen = 0;
    let avgDecibelTen = 0;

    for (const item of slicedReadingListTen) {
         decibelsSumTen += item.decibel;  
    }
    avgDecibelTen = decibelsSumTen / 10;
    return avgDecibelTen;
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
    
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [139.70165725408242,35.65834769457418], // starting position [lng, lat]
        zoom: 15, // starting zoom
        });
    
    
    let currentLocation = await getLocation()
    console.log('res', currentLocation);

    
    // Create a default Marker and add it to the map.
    const marker1 = new mapboxgl.Marker()
    .setLngLat([currentLocation.lon, currentLocation.lat])
    .addTo(map);

    map.flyTo({center:[currentLocation.lon, currentLocation.lat]});


    //turf.js
    var point1 = turf.point([35.67497245075575, 139.69060972524682]);
    var point2 = turf.point([35.65834769457418, 139.70165725408242]);
    var distance = turf.distance(point1, point2);

    
    // map.setView([currentLocation.lat, currentLocation.lon], 15);

    console.log("Distance between points:", distance, "kilometers");


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

let readingsList = [];
async function main() {
    // This is what runs when the page loads

    // Set up audio analyser
    let audioAnalyser = await setUpAudioLevel();
    let readingsAvgList = [];
    let buttonClicked = false;
    // Variable to store the interval ID
    let intervalId ;
    await createMap();
    async function startBtnClick() {
        if (buttonClicked === true) { return; }
        buttonClicked = true;
        //getAudioLevel2();

        intervalId = setInterval(async function() {
            let reading = await createReading(audioAnalyser);
            readingsList.push(reading);
            console.log(readingsList);
            //show the date
            let currentDB =document.getElementById("showDB");
            currentDB.innerHTML = reading.decibel;

            if(readingsList.length % 5 === 0) {
                console.log('5 seconds! ITS TIME ')
                let readingAverage5 = generateReadingAverage5(readingsList.slice(-5));
                let DBPer5 =document.getElementById("showDBPer5");
                DBPer5.innerHTML = readingAverage5;
            }
            if(readingsList.length % 10 === 0) {
                console.log('10 seconds! ITS TIME')
                let readingAverage10 = generateReadingAverage10(readingsList.slice(-10));
                let DBPer10 =document.getElementById("showDBPer10");
                DBPer10.innerHTML = readingAverage10;

                // readingsAvgList.push(generateReadingAverage(readingsList.slice(-10)))
                //avg location & decibels , latest time
            }
        }, 2*1000);
    }

    function stopBtnClick(){
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null; // Reset the interval ID
            console.log("Function stopped.");
        }
            buttonClicked = false;
    }

    let startBtn = document.getElementById("startBtn");
    startBtn.addEventListener("click", startBtnClick);
    let stopBtn = document.getElementById("stopBtn");
    stopBtn.addEventListener("click", stopBtnClick);
}

main();
