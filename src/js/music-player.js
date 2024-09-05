'use strict';
import { songList as initialSongList } from "./songs-data.js";
let songList = [...initialSongList];
const songListInitial = [...initialSongList];

const songImg = document.querySelector("#song-img");
const songName = document.querySelector("#song-name");
const songArtist = document.querySelector("#song-artist");
const songAlbum = document.querySelector("#song-album");
const songCurrentTimeBar = document.querySelector("#song-current-time-bar");
const songCurrentTime = document.querySelector("#song-current-time");
const songDuration = document.querySelector("#song-duration");
const btnList = document.querySelector("#btn-list");
const btnCloseList = document.querySelector("#btn-close-list");
const btnPrevious = document.querySelector("#btn-previous");
const btnState = document.querySelector("#btn-state");
const btnNext = document.querySelector("#btn-next");
const btnRandom = document.querySelector("#btn-random");
const containerList = document.querySelector("#container-list");
const songListDom = document.querySelector("#song-list");

let setIntervalSongCurrentTimeBar, setIntervalSongCurrentTime, percentage;

let currentSong = 0;
const songPlaying = new Audio(songList[currentSong].src);


/**
 * @param {number} time 
 * @returns {string} mm:ss
 */
function minutesSong (time) {
  const minutes = time/60<10 ? `0${parseInt(time/60)}`: parseInt(time/60);
  const seconds = time%60<10 ? `0${parseInt(time%60)}`: parseInt(time%60);
  return `${minutes}:${seconds}`;
}

//Start the intervals to update song current time 
function startIntervals () {
  setIntervalSongCurrentTimeBar = setInterval(() => {
    if (songPlaying.duration > 0 && isFinite(songPlaying.duration)) {
      percentage = Math.floor((songPlaying.currentTime / songPlaying.duration) * 100)
      songCurrentTimeBar.value = isFinite(percentage) ? percentage : 0;
    }
    if (songPlaying.ended) stopIntervals()
  }, 0);
  
  setIntervalSongCurrentTime = setInterval(() => {
    songCurrentTime.textContent = minutesSong(songPlaying.currentTime);
    if (songPlaying.ended) stopIntervals()
}, 0);
}

//Stops the song intervals
function stopIntervals () {
  clearInterval(setIntervalSongCurrentTimeBar);
  clearInterval(setIntervalSongCurrentTime);
}

//Loads new song when the song end o change
function loadNewSong () {
  setTimeout(() => {
    btnState.classList.add("playing"); 
    
    songPlaying.currentTime = 0;
    songCurrentTimeBar.value = 0;
    songPlaying.src = songList[currentSong].src;
  
    songPlaying.load();
    songPlaying.addEventListener("loadedmetadata", () => {
      songDuration.textContent = minutesSong(songPlaying.duration);
      songPlaying.play();
    })
  }, 200);
}

//Changes state song
btnState.addEventListener("click", () => {
  btnState.classList.toggle("playing")
  btnState.classList.contains("playing") 
    ? songPlaying.play()
    : songPlaying.pause();
})
//When song played
songPlaying.addEventListener("play", () => {
  songImg.children[0].classList.add("animate-spin");
  songImg.children[0].src = songList[currentSong].img === "" ? "../../assets/images/disc-default.webp" : songList[currentSong].img
  btnState.children[0].src = "../../assets/images/player-buttons/song-pause.svg"
  songName.textContent = songList[currentSong].name;
  songName.classList.add("animate-bounce");
  songArtist.textContent = songList[currentSong].artist;
  songAlbum.textContent = songList[currentSong].album;  
  startIntervals();
  songDuration.textContent = minutesSong(songPlaying.duration);
  //Cleans the songListDom to apply background after
  for (let i = 0; i < songListDom.children.length; i++) {
    songListDom.children[i].classList.remove("bg-sky-400");
    
  }
  songListDom.children[currentSong].classList.add("bg-sky-400")
  
})
//Updates time while moving input range
songCurrentTimeBar.addEventListener("input", (e) => {
  let newCurrentTime = (Number(e.target.value) / 100) * songPlaying.duration;
  songPlaying.currentTime = newCurrentTime;
})
//When song paused
songPlaying.addEventListener("pause", () => {
  songImg.children[0].classList.remove("animate-spin");
  songName.classList.remove("animate-bounce");
  btnState.children[0].src = "../../assets/images/player-buttons/song-play.svg";
  stopIntervals();
})
//When song ended
songPlaying.addEventListener("ended", () => {
  currentSong = (currentSong + 1) % songList.length;
  loadNewSong();
})

//Previous song
btnPrevious.addEventListener("click", () => {
  currentSong = (currentSong - 1) % songList.length;
  if (currentSong < 0) currentSong = songList.length - 1;
  loadNewSong();
})
//Next song
btnNext.addEventListener("click", () => {
  currentSong = (currentSong + 1) % songList.length;
  loadNewSong();
})

//Fill songListDom with the elements in songList
function loadListSong () {
  songListDom.innerHTML = ""
  songList.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = `${index<9 ? `0${index + 1}` : index + 1} ${song.name}`
    songListDom.appendChild(li)
    li.addEventListener("click", () => {
      const indexSong = songList.findIndex(songPosition => songPosition.name === song.name)
      currentSong = indexSong;
      loadNewSong();
    })
  })
}
loadListSong();

//Show or hiddens list songs
btnList.addEventListener("click", () => {
  containerList.classList.remove("-translate-x-full")
})
btnCloseList.addEventListener("click", () => {
  containerList.classList.add("-translate-x-full")
})

//Create an new unordered song list
btnRandom.addEventListener("click", () => {
  btnRandom.classList.toggle("random");
  if (btnRandom.classList.contains("random")) {
    btnRandom.children[0].classList.replace("bg-slate-950", "bg-sky-400");
    songList.sort(() => Math.random() - 0.5);
    currentSong = 0;
    loadListSong();
    loadNewSong();
  } else {
    btnRandom.children[0].classList.replace("bg-sky-400", "bg-slate-950");    
    songList = [...songListInitial];
    currentSong = 0;
    loadListSong();
    loadNewSong();
  }
})

