"use strict"

const CELL_SIZE = 50;
const CELL_MARGIN = 5;
const SLEEP_TIME = 100;

const EMPTY_COLOR = "#161616";
const SNAKE_BODY_COLOR = "#1b91e5";
const SNAKE_HEAD_COLOR = "#024cf9";
const APPLE_COLOR = "#fcda00";

let table_width = 0;
let table_height = 0;
let table = [];

let graph = new Graph(table);
let start;
let end;
let shortest_path = [];

let snake_start_size = 3;
let snake_head = {};
let snake = [];

let apple = [];

let last_length = 0;
let game_over = false;

function startGame(){
  game_over = false;
  last_length = 0;

  initTableSize();
  initSnake();
  initTable();
  generateApple();
  makeTable();
  getShortestPath();
  game();
}

startGame();

async function game(){
  while(!game_over){
    for(let step of shortest_path){
      await sleep(SLEEP_TIME);

      if(step.row == snake_head.row){
        if(step.col < snake_head.col){
          moveSnake(3);
        }
        else if(step.col > snake_head.col){
          moveSnake(1);
        }
      }

      if(step.col == snake_head.col){
        if(step.row < snake_head.row){
          moveSnake(0);
        }
        else if(step.row > snake_head.row){
          moveSnake(2);
        }
      }
      getShortestPath();
    }
    addSnakepart();
    generateApple();
    getShortestPath();
  }

  startGame();
}

function addSnakepart(){
  let tail = snake[snake.length - 1];
  snake.push({row: tail.row + 1, col: tail.col});
}

function generateApple(){
  apple = {row: Math.floor((Math.random() * table_height)), col: Math.floor((Math.random() * table_width))};
  while(isInSnake(apple)){
    apple = {row: Math.floor((Math.random() * table_height)), col: Math.floor((Math.random() * table_width))};
  }
}

function checkEmptyDirections(){
  empty_directions = [];
  if(snake_head.row - 1 > 0){
    if(!isInSnake({row: snake_head.row - 1, col: snake_head.col})){
      empty_directions.push(0);
    }
  }
  if(snake_head.row + 1 < table_height){
    if(!isInSnake({row: snake_head.row + 1, col: snake_head.col})){
      empty_directions.push(2);
    }
  }
  if(snake_head.col - 1 > 0){
    if(!isInSnake({row: snake_head.row, col: snake_head.col - 1})){
      empty_directions.push(3);
    }
  }
  if(snake_head.col + 1 < table_width){
    if(!isInSnake({row: snake_head.row, col: snake_head.col + 1})){
      empty_directions.push(1);
    }
  }
}

function moveSnake(direction){
  let index;
  for(index = snake.length - 1; index > 0; index--){
    snake[index].row = snake[index - 1].row;
    snake[index].col = snake[index - 1].col;
  }

  snake[0].row = snake_head.row;
  snake[0].col = snake_head.col;

  if(direction === 0){
    snake_head.row--;
  }
  else if(direction === 2){
    snake_head.row++;
  }
  else if(direction === 3){
    snake_head.col--;
  }
  else if(direction === 1){
    snake_head.col++;
  }

  makeTable();
}

function initSnake(){
  snake = [];

  let start_row = Math.round(table_height / 2, 0);
  let start_col = Math.round(table_width / 2, 0);
  
  snake_head = {row: start_row, col: start_col};
  snake.push({row: start_row + 1, col: start_col});
  snake.push({row: start_row + 1, col: start_col + 1});
  snake.push({row: start_row + 2, col: start_col + 1});
}

function initTableSize(){
  table_width = Math.round(window.innerWidth / (CELL_SIZE) *.8, 0);
  table_height = Math.round(window.innerHeight / (CELL_SIZE) *.8, 0);
  table_width++;
  table_height++;
}

function getShortestPath(){
  let new_table = [];
  for(let row_index = 0; row_index < table_height; row_index++){
    let row = [];
    for(let col_index = 0; col_index < table_width; col_index++){
      if(isInSnake(table[row_index][col_index]) || (snake_head.row === row_index && snake_head.col === col_index)){
        row.push(0);
      }
      else{
        row.push(1);
      }
    }
    new_table.push(row);
  }
  graph = new Graph(new_table);
  start = graph.grid[snake_head.row][snake_head.col];
  end = graph.grid[apple.row][apple.col];
  let result = astar.search(graph, start, end);

  shortest_path = [];
  for(let coordinate of result){
    shortest_path.push({row: coordinate.x, col: coordinate.y});
  }

  if(last_length >= 2){
    game_over = true;
    return;
  }
  if(shortest_path.length === 0){
    last_length++;
  }
  else{
    last_length = 0;
  }
}

function initTable(){
  table = [];
  let row_index;
  for(row_index = 0; row_index < table_height; row_index++){
    let row = []
    let col_index;
    for(col_index = 0; col_index < table_width; col_index++){
      row.push({row: row_index, col: col_index});
    }
    table.push(row);
  }
}

function makeTable(){
  document.getElementById("game").innerHTML = "";

  let row_index;
  for(row_index = 0; row_index < table_height; row_index++){
    let row_div = document.createElement("div");
    row_div.className = "row";

    let col_index;
    for(col_index = 0; col_index < table_width; col_index++){
      let cell_color;
      if(isSnakePartTheHead(table[row_index][col_index])){
        cell_color = SNAKE_HEAD_COLOR;
      }
      else if(isInSnake(table[row_index][col_index])){
        cell_color = SNAKE_BODY_COLOR;
      }
      else if(apple.row === row_index && apple.col === col_index){
        cell_color = APPLE_COLOR;
      }
      else{
        cell_color = EMPTY_COLOR;
      }
   
      let cell_div = document.createElement("div");
      cell_div.style.width = CELL_SIZE + "px";
      cell_div.style.height = CELL_SIZE + "px";
      cell_div.style.background = cell_color;
      cell_div.style.margin = CELL_MARGIN + "px";
      cell_div.id = "cell_" + row_index + ";" + col_index;
      cell_div.style.top = (CELL_SIZE + CELL_MARGIN * 2) * row_index  + "px";
      cell_div.style.left = (CELL_SIZE + CELL_MARGIN * 2) * col_index + "px";
      cell_div.style.position = "absolute";
      cell_div.style.borderRadius = "5px";
      row_div.appendChild(cell_div);
    }
    document.getElementById("game").appendChild(row_div);
  }
}

function isSnakePartTheHead(cell){
  if(snake_head.row === cell.row && snake_head.col === cell.col){
    return true;
  }

  return false;
}

function isInSnake(cell){
  for(let part of snake){
    if(part.row == cell.row && part.col == cell.col){
      return true;
    }
  }

  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
