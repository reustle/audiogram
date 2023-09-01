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
    const dbLevel = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    return dbLevel;
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

async function main() {
    // This is what runs when the page loads

    // Set up audio analyser
    let audioAnalyser = await setUpAudioLevel();

    let startBtn = document.getElementById("startBtn");
    async function startBtnClick() {

        setInterval(function() {
            createReading(audioAnalyser);
        }, 2*1000);

    }
    startBtn.addEventListener("click", startBtnClick);

}

main();
















async function getMicrophoneStream() {
    let decibelReadings = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
  
    source.connect(analyser);
  
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const dbLevel = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        //console.log(`Current dB level: ${dbLevel}`);
        
        document.getElementById("showDB").innerHTML = dbLevel;
        
        let timestamp = getTime(); 

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };
        function success(pos) {
            //crd = pos.coords;
            // console.log(crd);
            // console.log("Your current position is:");
            // console.log(`Latitude : ${crd.latitude}`);
            // console.log(`Longitude: ${crd.longitude}`);
            // console.log(`More or less ${crd.accuracy} meters.`);
        
            return pos.coords;
        }
        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }
        navigator.geolocation.getCurrentPosition(success, error, options);
        getTime();
        //console.log(coords);
        decibelReadings.push({
            decibel : dbLevel,
            timestamp : timestamp,
            // location : {
            //     lat : pos.coords.latitude,
            //     lon : pos.coords.longitude
            // },
        })
        console.log(decibelReadings);
        // console.log(dbLevel);
        
    }, 2*1000); // 2 seconds

}