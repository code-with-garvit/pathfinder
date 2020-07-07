var Demo = Sketch.create({fullscreen: false, width: 512, height: 512}),
    i = w = h = 0, adjacent;

function normalize(x, y, size) {
  return {
    x: Math.ceil( x / size) - 1,
    y: Math.ceil( y / size) - 1
  }
};

function desnormalize(x, y, size) {
  return {
    x: Math.ceil( x * size) - 1,
    y: Math.ceil( y * size) - 1
  }
};

function distance(ax, ay, bx, by) {
  return Math.sqrt(Math.pow( ax - bx, 2) + Math.pow( ay - by, 2));
};

function Node() {
  this.adjacent = [];
  this.previous = null;
  this.type = random([0,0,0,0,1]);
}

Node.prototype.clear = function() {
  this.previous = null;
};

Demo.setup = function() {

  this.gridSize = 32;
  this.rows = (this.height / this.gridSize) - 1;
  this.cols = (this.width / this.gridSize) - 1;

  console.log(this.rows);

  this.normalizedMouse = normalize(this.mouse.x, this.mouse.y, this.gridSize);

  this.start = null;

  this.path = [];

  this.addAdjacent = function(w, h, ah, aw) {
    w = min(w,this.cols);
    w = max(w,0);
    h = min(h,this.rows);
    h = max(h,0);
    aw = min(aw,this.cols);
    aw = max(aw,0);
    ah = min(ah,this.rows);
    ah = max(ah,0);

    var node = this.grid[ah][aw];
    if(typeof node !== 'undefined' && typeof this.grid[ah] !== 'undefined' && node.type === 0){
      this.grid[h][w].adjacent.push(node);
    }

  };

  this.addAdjacents = function(w,h) {

    this.addAdjacent(w,h,h,w+1);
    this.addAdjacent(w,h,h+1,w);
    this.addAdjacent(w,h,h,w-1);
    this.addAdjacent(w,h,h-1,w);

  };

  this.addReachable = function(node, adjacent) {

    if(this.findNode(adjacent, this.explored) || this.findNode(adjacent, this.reachable)){
      return;
    }

    adjacent.previous = this.node;
    this.reachable.push(adjacent);

  };

  this.removeReachable = function(node) {

    this.reachable = this.reachable.filter(function(element) {
      return element !== node;
    });

  };

  this.getNodeIndex = function(node, list) {
    for (i in list) {
        if (node == list[i]) {
            return i;
        }
    }
    return -1;
  }

  this.findNode = function(node, list) {
    return this.getNodeIndex(node, list) >= 0;
  };

  this.generate = function() {
    this.grid = [];
    this.reachable = [];
    this.explored = [];
    this.path = [];

    for (h = 0; h < this.height / this.gridSize; h++) {
      for (w = 0; w < this.width / this.gridSize; w++) {
        if(typeof this.grid[h] === 'undefined'){
          this.grid[h] = [];
        }

        this.grid[h][w] = new Node();
        this.grid[h][w].h = h;
        this.grid[h][w].w = w;

      };
    };

    this.goal = this.grid[Math.round(random(0, (this.height / this.gridSize) - 1))][Math.round(random(0, (this.width / this.gridSize) - 1))];
    this.grid[this.goal.h][this.goal.w].type = 0;

    for (h = 0; h < this.grid.length; h++) {
      for (w = 0; w < this.grid[0].length; w++) {
        var node = this.grid[h][w];
        this.addAdjacents(w,h);
      }
    }


  };

  this.generate();

};

Demo.mousemove = function() {

  this.normalizedMouse = normalize(this.mouse.x, this.mouse.y, this.gridSize);

};

Demo.keydown = function() {

  if(this.keys.G){
    this.generate();
  }

};

Demo.click = function() {


  for (h = 0; h < this.grid.length; h++) {
    for (w = 0; w < this.grid[0].length; w++) {
      this.grid[h][w].clear();
    }
  }

  this.reachable = [];
  this.explored = [];
  this.path = [];

  w = this.normalizedMouse.x;
  h = this.normalizedMouse.y;

  if(this.grid[h][w].type === 1){
    return false;
  }

  this.start = this.grid[h][w];

  this.reachable.push(this.start);

  while(this.reachable.length > 0){

    this.node = random(this.reachable);

    if(this.node === this.goal){
      this.path = [];

      while(this.node) {
        this.path.unshift(this.node);
        this.node = this.node.previous;
      }

      return false;
    }

    this.removeReachable(this.node);
    this.explored.push(this.node);

    for (var i in this.node.adjacent) {
      this.addReachable(this.node, this.node.adjacent[i]);
    }
  }

};

Demo.update = function() {

};

Demo.draw = function() {
  this.fillStyle = '#272727';
  this.strokeStyle = 'rgba(24,24,24,0.05)';

  for (h = 0; h < this.grid.length; h++) {
    for (w = 0; w < this.grid[h].length; w++) {
      if(this.grid[h][w].type){
        this.fillRect(w * this.gridSize, h * this.gridSize, this.gridSize, this.gridSize);
      }
      this.beginPath();
      this.moveTo(0, w * this.gridSize);
      this.lineTo(this.width, w * this.gridSize);
      this.stroke();
      this.beginPath();
      this.moveTo(h * this.gridSize, 0);
      this.lineTo(h * this.gridSize, this.height);
      this.stroke();
    };
  };

  this.fillStyle = '#6b6b6b';
  for (i = 0; i < this.path.length; i++) {
    this.fillRect(this.path[i].w * this.gridSize, this.path[i].h * this.gridSize, this.gridSize, this.gridSize);
  };

  this.fillStyle = 'rgba(24,24,24,0.4)';
  this.fillRect(this.normalizedMouse.x * this.gridSize, this.normalizedMouse.y * this.gridSize, this.gridSize, this.gridSize);

  if(this.start){
    this.fillStyle = 'rgb(91,132,255)';
    this.fillRect(this.start.w * this.gridSize, this.start.h * this.gridSize, this.gridSize, this.gridSize);
  }

  if(this.path.length <= 0){
    this.fillStyle = '#B20000';
  } else {
    this.fillStyle = 'rgba(0,142,1,1)';
  }

  this.fillRect(this.goal.w * this.gridSize, this.goal.h * this.gridSize, this.gridSize, this.gridSize);


};