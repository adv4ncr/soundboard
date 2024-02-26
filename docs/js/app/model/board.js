import Sound from "./sound.js";

export default class Board {

  constructor() {
    this._rows = 3;
    this._cols = 3;
    this._grid = [];
    this._makeGrid();
  }

  _makeGrid() {
    for (var y = 0; y < this._rows; y++) {
      this._grid[y] = this._grid[y] || [];
      for (var x = 0; x < this._cols; x++) {
        this._grid[y][x] = this._grid[y][x] || null;
      }
    }
  }

  _validateCoords(x, y) {
    if (x === undefined ||
      y === undefined ||
      x > this._cols ||
      y > this._rows ||
      x < 0 ||
      y < 0) {
      throw new Error('Out of bounds');
    }
  }

  // Public methods

  get cols() {
    return this._cols;
  }

  get rows() {
    return this._rows;
  }

  set cols(cols) {
    this._cols = cols || this._cols;
    this._makeGrid();
  }

  set rows(rows) {
    this._rows = rows || this._rows;
    this._makeGrid();
  }

  addColumn() {
    this._cols += 1;
    this._makeGrid();
  }

  addRow() {
    this._rows += 1;
    this._makeGrid();
  }

  placeSound(x, y, sound) {
    this._validateCoords(x, y);
    this._grid[y][x] = sound;
    sound.x = x;
    sound.y = y;
  }

  getSound(x, y) {
    this._validateCoords(x, y);
    return this._grid[y][x];
  }

  getByKey(key) {
    return this._grid.flat().find(s => s && s.key === key);
  }

  allSounds() {
    return this._grid.flat().filter(s => s);
  }

  // Saving and loading

  toStorageObject() {
    const soundObjects = [];
    for (let y = 0; y < this._rows; y++) {
      for (let x = 0; x < this._cols; x++) {
        if (this._grid[y][x])
          soundObjects.push({
            x,
            y,
            ...this._grid[y][x].toStorageObject(),
          });
      }
    }
    return {
      version: '1.0',
      rows: this._rows,
      cols: this._cols,
      sounds: soundObjects,
    };
  }

  static fromStorageObject(obj) {
    if (!obj || !('version' in obj) || obj.version != '1.0')
      throw new Error("Can't read this file.")
    const board = new Board();
    board.cols = obj.cols;
    board.rows = obj.rows;
    for (const soundObj of obj.sounds) {
      const sound = Sound.fromStorageObject(soundObj);
      board.placeSound(soundObj.x, soundObj.y, sound);
    }
    return board;
  }
}
