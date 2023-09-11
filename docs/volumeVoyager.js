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

function generateReadingAverage(slicedReadingList){
    let decibelsSum = 0;
    let avgDecibel = 0;

    for (const item of slicedReadingList) {
         console.log(item.decibel);
         decibelsSum += item.decibel;  
      }

    avgDecibel = decibelsSum / 10;
    console.log("decibel's Sum " + decibelsSum);
    console.log("decibel's avg " + avgDecibel);
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

async function main() {
    // This is what runs when the page loads

    // Set up audio analyser
    let audioAnalyser = await setUpAudioLevel();
    let readingsList = [];
    let readingsAvgList = [];
    let buttonClicked = false;
    // Variable to store the interval ID
    let intervalId ;

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


            if(readingsList.length % 10 === 0) {
                console.log('ITS TIME')
                let readingAverage = generateReadingAverage(readingsList.slice(-10));
                console.log(readingAverage)

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
    }

    let startBtn = document.getElementById("startBtn");
    startBtn.addEventListener("click", startBtnClick);
    let stopBtn = document.getElementById("stopBtn");
    stopBtn.addEventListener("click", stopBtnClick);
}

main();
