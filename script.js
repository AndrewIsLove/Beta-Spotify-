console.log('Writing JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

// let cardContainer = document.querySelector(".cardContainer") 



function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {

    currFolder = folder

    let a = await fetch(`http://192.168.29.54:3000/${folder}/`);
    let response = await a.text(); // .text() -> It extracts the text from the object a 
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log(as)

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // Show all the songs in the Playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML += `<li>
          <img class="invert" src="music.svg" alt="Music">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
                                <div>Harry</div>
                            </div>
                            <div class="playnow">
                                <img src="roundedPlay.svg" alt="play">
                            </div>        
        </li>`;
    }
    // Attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs


}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = (`/${currFolder}/` + track)
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


async function displayAlbums(params) {
    let a = await fetch(`http://192.168.29.54:3000/songs/`);
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    // Array.from(anchors).forEach(async e => {
        for(let index = 0; index < array.length; index++){
            const e = array[index]

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the meta data of the folder
            let a = await fetch(`http://192.168.29.54:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green circular background -->
                                <circle cx="25" cy="25" r="25" fill="#00da6b" />
                                <!-- Original SVG centered within the circle -->
                                <svg x="13" y="13" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 20V4L19 12L5 20Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="Happy Hits">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
                    `
        }
    }

       //Load The playlist Whenever the card is clicked
       Array.from(document.getElementsByClassName("card")).forEach(e => {
        // using Array.from because of the (forEach) {ForEach is a Method}
        e.addEventListener("click", async (item) => {
            console.log(item.currentTarget, item.currentTarget.dataset)
            // Traget gives the Element which is Clicked
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}

async function main() {



    // Get List of all songs 
    // songs = await getSongs("songs/cs");
    await getSongs(`songs/Talwiinder`)

    console.log(songs);
    playMusic(songs[0], true)


    // Display all the albums on the page
    displayAlbums()



    // Attach event Listerner to play,privous,next button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })



    //Listen for timeupdate event 
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration) // .currentTime and .duration are the properties of the HTMLMediaElement
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })


    // Add EventListener to Seekbar

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })



    // Add EventListener for Open Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
        console.log("hamburger get Opened")
    })

    // Add EventListener for Close Hamburger

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })


    // Add EventListener to Previous Button
    previous.addEventListener("click", () => {
        currentSong.pause();
        console.log("Previous Button Clicked")
        let index = songs.indexOf((currentSong.src.split("/").slice(-1))[0])
        console.log(songs, index)
        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }

    })


    // Add EventListener to Next Button
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next Button Clicked")
        // console.log(currentSong.src.split("/").slice(-1))[0]
        let index = songs.indexOf((currentSong.src.split("/").slice(-1))[0])
        console.log(songs, index)
        if ((index + 1) < songs.length)
            playMusic(songs[index + 1])
    })

    // Add EventListern to volume Bar
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting Volume to ", e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100 // (.volume is attribute), We divide it by 100 because audio.volume is a value between 0 and 1

    })


    // Add EventListern to mute the track 
    document.querySelector(".volume-control>img").addEventListener("click",(e)=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg") // casue strings are im-mutable 
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

 




    // Play the First Song
    // var audio = new Audio(songs[0]);
    // audio.play();

    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     console.log(duration) // The Duration variable now holds the duration (in Seconds) of the audio clip 
    // });

}

main()
