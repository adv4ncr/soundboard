import PlayMode from "./play-mode.js";
import Mp3File from "./mp3file.js";

// Note: this class also has an x and y property. And it messes with the DOM.
// That's all a bit dirty. TODO: clean this mess up some time.

export default class Sound {
  constructor() {
    this._mp3File = null;
    this._colour = this._randomColour();
    this._playMode = PlayMode.Retrigger;
    this._player = new Audio();
    this._playerLoaded = false;
    this._playing = false;
    this._alive = true;
    this._button_div = null;
    this._volume = 1;
  }

  _loadPlayer() {
    if (!this._playerLoaded) {
      this._player.src = this._mp3File.data;
      this._player.load();
      this._player.addEventListener("ended", () => this._stopAnimation());
      requestAnimationFrame(() => this._renderProgress());
      this._playerLoaded = true;
    }
  }

  _randomColour() {
    let colours = ["#26748E", "#D35528", "#934873", "#00B9AE", "#F9C80E", "#48BA66", "#FF9C4C"];
    return colours[Math.floor(Math.random() * colours.length)];
  }

  _startAnimation() {
    this._playing = true;
    const _div = document.querySelector(`div.sound[data-x='${this.x}'][data-y='${this.y}']`);
    _div.classList.add("playingState");
  }
  
  _stopAnimation() {
    this._playing = false;
    // this._button_div.classList.remove("playingState");
    const _div = document.querySelector(`div.sound[data-x='${this.x}'][data-y='${this.y}']`);
    _div.classList.remove("playingState");
  }

  _renderProgress() {
    if (!this._alive) return;
    if (!this._playing) return requestAnimationFrame(() => this._renderProgress());

    const progress = document.querySelector(
      `div.sound[data-x='${this.x}'][data-y='${this.y}'] .progress .bar`
    );
    const percentage = (this._player.currentTime / this._player.duration) * 100;
    progress.style.background = `linear-gradient(90deg, white 0%, white ${percentage}%, rgba(255,255,255,0.3) ${percentage}%, rgba(255,255,255,0.3) 100%)`;
    requestAnimationFrame(() => this._renderProgress());
  }

  // Setters

  set mp3File(mp3File) {
    this._mp3File = mp3File || this._mp3File;
    this._playerLoaded = false;
  }

  set colour(colour) {
    this._colour = colour || this._colour;
  }

  set key(key) {
    this._key = key || this._key;
  }

  set control(control) {
    this._control = control || this._control;
  }

  set playMode(playMode) {
    this._playMode = playMode || this._playMode;
  }

  set volume(volume) {
    this._volume = volume || this._volume;
  }
  
  setPlayModeRetrigger() {
    this._playMode = PlayMode.Retrigger;
  }
  
  setPlayModeOneShot() {
    this._playMode = PlayMode.OneShot;
  }
  
  setPlayModeGate() {
    this._playMode = PlayMode.Gate;
  }
  
  setVolumeIncrement(increment) {
    this.setVolume(this._volume + increment);
  }

  setMidiVolume(midiVolume) {
    //console.log((midiVolume-64)/100);
    if(midiVolume != 64) {
      this.setVolume(this._volume + (midiVolume-64)/100);
    }
  }

  setVolume(volume) {
    if (volume > 1) volume = 1;
    else if (volume < 0) volume = 0;
    this._volume = volume;
    this._player.volume = volume;
    if (!this._alive) return;
    const progress = document.querySelector(`div.sound[data-x='${this.x}'][data-y='${this.y}'] .volume .bar`);
    progress?.style.setProperty("background", `linear-gradient(90deg, white 0%, white ${volume*100}%, rgba(255,255,255,0.3) ${volume*100}%, rgba(255,255,255,0.3) 100%)`);
  }

  // Getters

  get mp3File() {
    return this._mp3File;
  }

  get colour() {
    return this._colour;
  }

  get playMode() {
    return this._playMode;
  }

  get key() {
    return this._key;
  }

  get control() {
    return this._control;
  }

  get volume() {
    return this._volume;
  }

  // Saving and loading

  toStorageObject() {
    return {
      colour: this._colour,
      playMode: this._playMode,
      key: this._key,
      control: this._control,
      //volume: this._volume,
      file: this._mp3File.toStorageObject(),
    };
  }

  static fromStorageObject(obj) {
    const sound = new Sound();
    sound.colour = obj.colour;
    sound.playMode = obj.playMode;
    sound.key = obj.key;
    sound.control = obj.control;
    //sound.volume = obj.volume;
    sound.mp3File = Mp3File.fromStorageObject(obj.file);
    return sound;
  }

  // Playback

  push() {
    this._loadPlayer();
    this._player.currentTime = 0;

    switch (this._playMode) {
      case PlayMode.Retrigger:
        this._player.loop = false;
        this._stopAnimation();
        this._startAnimation();
        this._player.play();
        break;
      case PlayMode.OneShot:
        this._player.loop = false;
        if (this._player.paused) {
          this._startAnimation();
          this._player.play();
        } else {
          this._stopAnimation();
          this._player.pause();
        }
        break;
      case PlayMode.Gate:
        this._player.loop = true;
        this._startAnimation();
        this._player.play();
        break;
    }
  }

  release() {
    switch (this._playMode) {
      case PlayMode.Gate:
        this._stopAnimation();
        this._player.pause();
        break;
    }
  }

  destroy() {
    this._player.pause();
    this._stopAnimation();
    this._alive = false;
  }
}
