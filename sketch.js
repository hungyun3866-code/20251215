// ===================================================================
// P5.JS 互動常識測驗遊戲程式碼 (答案容錯優化)
// ===================================================================

// --- 核心變數與常數 ---
let standSheet, walkSheet, jumpSheet, attackSheet;
let character2Sheet, character2TouchSheet, character2AttackSheet;
let character3Sheet, character3TouchSheet;
let character4Sheet, character4TouchSheet;
let backgroundTexture;

// 幀數常數 (根據您的圖片定義)
const STAND_FRAMES = 2, WALK_FRAMES = 6, JUMP_FRAMES = 3, ATTACK_FRAMES = 3;
const CHARACTER2_FRAMES = 21, CHARACTER2_TOUCH_FRAMES = 10, CHARACTER2_ATTACK_FRAMES = 11;
const CHARACTER3_FRAMES = 4, CHARACTER3_TOUCH_FRAMES = 7;
const CHARACTER4_FRAMES = 10, CHARACTER4_TOUCH_FRAMES = 2;

// 縮放比例
const SCALE_FACTOR = 3, SCALE_FACTOR_2 = 2, SCALE_FACTOR_3 = 2, SCALE_FACTOR_4 = 1.5;

// 動態計算的寬度（用於碰撞）
let CHARACTER1_WIDTH, CHARACTER2_WIDTH, CHARACTER3_WIDTH, CHARACTER4_WIDTH;
let standFrameWidth, standFrameHeight;
let character2FrameWidth, character2FrameHeight;
let character3FrameWidth, character3FrameHeight;
let character4FrameWidth, character4FrameHeight;
let character4TouchFrameWidth;

// 物理與位置
let posX, posY;
let character2PosX, character2PosY;
let character3PosX, character3PosY;
let character4PosX, character4PosY;
let speed = 3;
let direction = 1; // 1: 右, -1: 左
let state = 'stand'; // 角色1 狀態
let char2State = 'stand', char3State = 'stand', char4State = 'stand'; // NPC 狀態
let velocityY = 0, gravity = 0.5, jumpStrength = -12, onGround = false;
let groundY;
let animationSpeed = 8;
let attackAnimationStartTime = 0;

// --- 測驗與互動變數 ---
let character1Input;
let answerPromptText = "請作答："; 
let answerPromptBoxWidth = 320; 
let answerPromptBoxHeight = 50; 
let BUBBLE_OFFSET_Y_P1; 
let BUBBLE_OFFSET_X_P1; 

let isCharacter1Near = false;
let character2DisplayText = "嗨！靠近我來開始常識測驗。";
let BUBBLE_OFFSET_Y; 

let currentQuiz = null; 
let quizState = 'awaiting_question'; 
let isQuizActive = false; 
let char2FeedbackTimer = 0;
const FEEDBACK_DURATION = 150; // 約 2.5 秒的回饋時間 (幀數)


// 【測驗題庫：30 題常識問答 (答案擴充為陣列，包含常見變體)】
const QUIZ_BANK = [
  // 欄位: 題目 (q), 答案 (a, 包含所有可接受的變體), 答對回饋 (c), 答錯回饋 (i)
  // 範例：'棕色', '棕' 都能過
  { q: '綠色加紫色是什麼顏色？', a: ['棕色', '棕','咖啡色'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  // 範例：'24', '二十四', '24小時' 都能過
  { q: '一天有幾個小時？', a: ['24', '二十四', '24小時'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  // 範例：'Dog', '狗' 都能過
  { q: '狗的英文是什麼？', a: ['Dog', 'dog'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '水的化學式是什麼？', a: ['H2O', 'h2o'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '地球是繞著哪個星球轉？', a: ['太陽'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '請問台灣的首都是哪裡？', a: ['台北', '台北市'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  // 範例：'7', '七', '7種', '七種' 都能過
  { q: '彩虹有幾種顏色？', 'a': ['7', '七', '7種', '七種'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '老鼠的英文是什麼？', a: ['Mouse', 'mouse','rat','Rat' ], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '人體最大的器官是什麼？', a: ['皮膚'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '哪個國家以生產披薩聞名？', a: ['義大利', '意大利'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '蘋果「通常」是什麼顏色？', a: ['紅色', '紅'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '三角形有幾條邊？', a: ['3', '三', '3條', '三條'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '企鵝會飛嗎？', a: ['不會'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  // 範例：'7', '七', '7天', '七天' 都能過
  { q: '一週有幾天？', a: ['7', '七', '7天', '七天'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '月球是地球的什麼？', a: ['衛星', '天然衛星'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '藍色加黃色是什麼顏色？', a: ['綠色', '綠'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '貓的英文是什麼？', a: ['Cat', 'cat'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '請問光速大約是多少公里/秒？', a: ['30萬', '三十萬'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '人類有多少根手指頭？', a: ['10', '十', '10根', '十根'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '哪種動物被稱為「沙漠之舟」？', a: ['駱駝'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  // 範例：'粉紅色', '粉', '粉色', 'Pink' 都能過
  { q: '紅色加白色是什麼顏色？', a: ['粉紅色', '粉', '粉色', 'Pink'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  // 範例：'12', '十二', '12個月' 都能過
  { q: '一年有幾個月？', a: ['12', '十二', '12個月', '十二個月'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '熊貓的主要食物是什麼？', a: ['竹子', '竹'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '請問 p5.js 是什麼語言的函式庫？', a: ['JavaScript', 'javascript'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '長頸鹿的脖子長嗎？', a: ['長'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '哪個季節會下雪？', a: ['冬天', '冬季'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '請問 5x5 等於多少？', a: ['25', '二十五'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '鳥類的英文是什麼？', a: ['Bird', 'bird'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '香蕉通常是什麼顏色？', a: ['黃色', '黃'], c: '恭ссии你答對囉~', i: '答錯囉! 請再加油~' },
  { q: '請問時鐘上，數字 12 對面是數字幾？', a: ['6', '六'], c: '恭喜你答對囉~', i: '答錯囉! 請再加油~' }
];


// -------------------------------------------------------------------
// P5.js 核心函式
// -------------------------------------------------------------------

function preload() {
    // 載入所有精靈圖 (請確保路徑正確)
    standSheet = loadImage('stand/1all.png');
    walkSheet = loadImage('walk/2all.png');
    jumpSheet = loadImage('jump/3all.png');
    attackSheet = loadImage('attack/4all.png');
    character2Sheet = loadImage('2/stop/all.png');
    character2TouchSheet = loadImage('2/touch/3all.png');
    character2AttackSheet = loadImage('2/attack/1all.png');
    character3Sheet = loadImage('3/stand/2all.png');
    character3TouchSheet = loadImage('3/touch/3all.png');
    character4Sheet = loadImage('4/stand/2all.png');
    character4TouchSheet = loadImage('4/touch/3all.png');

    backgroundTexture = loadImage('jump/Backgrounds.png');
}


function setup() {
    createCanvas(windowWidth, windowHeight);

    // --- 計算尺寸 ---
    standFrameWidth = standSheet.width / STAND_FRAMES;
    standFrameHeight = standSheet.height;
    character2FrameWidth = character2Sheet.width / CHARACTER2_FRAMES;
    character2FrameHeight = character2Sheet.height;
    character3FrameWidth = character3Sheet.width / CHARACTER3_FRAMES;
    character3FrameHeight = character3Sheet.height;
    character4FrameWidth = character4Sheet.width / CHARACTER4_FRAMES;
    character4FrameHeight = character4Sheet.height;
    character4TouchFrameWidth = character4TouchSheet.width / CHARACTER4_TOUCH_FRAMES;

    // --- 初始化位置 ---
    groundY = height * 0.75;
    character2PosX = width / 2 - 600;
    character2PosY = groundY;
    character4PosX = width / 2 + 300;
    character4PosY = groundY;
    posX = width / 2 - 150;
    posY = groundY;
    onGround = true;
    character3PosX = width / 2 + 700;
    character3PosY = groundY;

    // --- 計算碰撞寬度與對話框偏移量 ---
    CHARACTER1_WIDTH = standFrameWidth * SCALE_FACTOR;
    CHARACTER2_WIDTH = character2FrameWidth * SCALE_FACTOR_2;
    CHARACTER3_WIDTH = character3FrameWidth * SCALE_FACTOR_3;
    CHARACTER4_WIDTH = character4FrameWidth * SCALE_FACTOR_4;
    
    let CHARACTER2_SCALED_HEIGHT = character2FrameHeight * SCALE_FACTOR_2;
    BUBBLE_OFFSET_Y = (CHARACTER2_SCALED_HEIGHT / 2) + 10;
    
    let CHARACTER1_SCALED_HEIGHT = standFrameHeight * SCALE_FACTOR;
    BUBBLE_OFFSET_Y_P1 = (CHARACTER1_SCALED_HEIGHT / 2) + 10 + answerPromptBoxHeight / 2;
    BUBBLE_OFFSET_X_P1 = answerPromptBoxWidth / 4; 


    // --- 建立玩家輸入框 (白底框) ---
    character1Input = createInput('');
    character1Input.attribute('placeholder', '在此輸入答案...');
    character1Input.size(answerPromptBoxWidth * 0.65); 
    character1Input.style('font-size', '16px');
    character1Input.style('text-align', 'center'); 
    character1Input.hide();
    character1Input.elt.addEventListener('keydown', checkInputEnter);
}


function draw() {
    image(backgroundTexture, 0, 0, width, height);

    handleMovement();

    // 檢查碰撞
    checkCollision2(); 
    checkCollision3();
    checkCollision4();

    // --- 測驗狀態管理 (回饋計時器) ---
    if (quizState === 'feedback') {
        if (frameCount > char2FeedbackTimer + FEEDBACK_DURATION) {
            
            if (isCharacter1Near) {
                // 回饋結束後，重新獲取下一題
                currentQuiz = getNewQuiz();
                character2DisplayText = currentQuiz.question;
                quizState = 'awaiting_answer';
                isQuizActive = true;
            } else {
                // 如果玩家離開，則重置狀態
                character2DisplayText = "需要我解答嗎?";
                quizState = 'awaiting_question';
                isQuizActive = false;
            }
        }
    }
    // --- 測驗狀態管理 結束 ---

    // 繪製角色與文字
    drawCharacter();
    drawCharacter4();
    drawCharacter3();
    if (char2State !== 'hit') {
        drawCharacter2();
        drawCharacter2Text();
    }

    // 作答介面跟隨角色1的頭部偏右
    handleInputDisplay(); 
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    // 重新設定地面和角色位置... (略)
    let oldGroundY = groundY;
    groundY = height * 0.75;
    posY += (groundY - oldGroundY);
    character2PosY += (groundY - oldGroundY);
    character3PosY += (groundY - oldGroundY);
    character4PosY += (groundY - oldGroundY);

    character2PosX = width / 2 - 600;
    posX = width / 2 - 150;
    character4PosX = width / 2 + 300;
    character3PosX = width / 2 + 700;
}


// -------------------------------------------------------------------
// 答案標準化與測驗核心函式
// -------------------------------------------------------------------

/**
 * 【新增】標準化函式：將字串轉為小寫，移除所有空格和標點符號，以方便寬鬆比對。
 * @param {string} str - 玩家輸入或標準答案
 * @returns {string} 標準化後的字串
 */
function normalizeAnswer(str) {
    if (typeof str !== 'string') return '';
    let cleaned = str.toLowerCase().trim();
    // 移除所有空格
    cleaned = cleaned.replace(/\s+/g, ''); 
    // 移除常見標點符號 (逗號, 句號, 問號, 驚嘆號, 括號等)
    cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()？，。！]/g, ""); 
    return cleaned;
}

/**
 * 從 QUIZ_BANK 中隨機抽取一個新的題目
 */
function getNewQuiz() {
    let index = floor(random(QUIZ_BANK.length));
    let quiz = QUIZ_BANK[index];
    
    // 將所有可接受的答案都進行標準化
    const normalizedAnswers = quiz.a.map(ans => normalizeAnswer(ans));
    
    // 原始答案用於提示 '不知道' 時顯示，通常取第一個
    const originalAnswer = quiz.a[0].trim();
    
    return {
        question: quiz.q,
        // 儲存標準化後的答案陣列
        acceptableAnswers: normalizedAnswers, 
        originalAnswer: originalAnswer, 
        correctFeedback: quiz.c,
        incorrectFeedback: quiz.i,
    };
}

function checkInputEnter(event) {
    if (event.key === 'Enter') {
        submitText();
    }
}

/**
 * 處理玩家提交的測驗答案
 */
function submitText() {
    let inputText = character1Input.value().trim();
    character1Input.value(''); // 清空輸入框

    if (isQuizActive && quizState === 'awaiting_answer') {
        
        // 玩家輸入標準化
        let playerNormalized = normalizeAnswer(inputText);
        
        // 檢查是否為 '不知道'
        if (playerNormalized === '不知道' || playerNormalized === "idontknow" || playerNormalized === "dontknow") {
            character2DisplayText = "正確答案是: " + currentQuiz.originalAnswer;
            quizState = 'feedback';
            isQuizActive = true; 
            char2FeedbackTimer = frameCount; 
            character1Input.hide(); 
            return;
        }

        // 檢查答案是否正確
        // 只要玩家的標準化輸入存在於可接受的標準化答案陣列中，即為答對
        const isCorrect = currentQuiz.acceptableAnswers.includes(playerNormalized);

        if (isCorrect) {
            character2DisplayText = currentQuiz.correctFeedback;
        } else {
            character2DisplayText = currentQuiz.incorrectFeedback;
        }
        
        // 進入回饋計時
        quizState = 'feedback';
        isQuizActive = true; 
        char2FeedbackTimer = frameCount; 
        character1Input.hide(); 

    } else if (inputText !== '') {
        // 非測驗狀態下的普通對話
        character2DisplayText = inputText + ", 歡迎你";
    }
}

// -------------------------------------------------------------------
// 角色互動與狀態函式
// -------------------------------------------------------------------

function handleMovement() {
    if (state === 'attack') {
        const attackDurationFrames = ATTACK_FRAMES * animationSpeed;
        if (frameCount >= attackAnimationStartTime + attackDurationFrames) {
            state = (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW)) ? 'walk' : 'stand';
        }
    }

    velocityY += gravity;
    posY += velocityY;
    if (posY >= groundY) {
        posY = groundY;
        velocityY = 0;
        onGround = true;
    } else {
        onGround = false;
    }

    if (state !== 'attack') {
        if (keyIsDown(UP_ARROW) && onGround) {
            velocityY = jumpStrength;
            onGround = false;
            state = 'jump';
        } else if (keyIsDown(DOWN_ARROW) && onGround) {
            state = 'attack';
            attackAnimationStartTime = frameCount;
        } else if (keyIsDown(RIGHT_ARROW)) {
            posX += speed;
            direction = 1;
            if (onGround) state = 'walk';
        } else if (keyIsDown(LEFT_ARROW)) {
            posX -= speed;
            direction = -1;
            if (onGround) state = 'walk';
        } else if (onGround) {
            state = 'stand';
        }
        if (!onGround && state !== 'jump') {
            state = 'jump';
        }
    }
    posX = constrain(posX, 0, width);
}

// --- 碰撞偵測 ---

function checkCollision2() {
    const distanceX = abs(posX - character2PosX);
    const collisionThreshold = CHARACTER1_WIDTH / 2 + CHARACTER2_WIDTH / 2;

    if (distanceX < collisionThreshold) {
        if (state === 'attack' && char2State !== 'hit') {
            char2State = 'hit';
            isQuizActive = false;
            quizState = 'awaiting_question';
            character2DisplayText = "哎呦！別打我...";
            char2FeedbackTimer = frameCount;
        }
        else if (char2State !== 'hit') {
            char2State = 'touch';
            isCharacter1Near = true;

            if (quizState === 'awaiting_question') {
                currentQuiz = getNewQuiz();
                character2DisplayText = currentQuiz.question;
                quizState = 'awaiting_answer';
                isQuizActive = true;
            }
        }
    } else {
        if (char2State !== 'stand' && char2State !== 'hit') {
            char2State = 'stand';
        }
        isCharacter1Near = false;

        if (isQuizActive && quizState !== 'awaiting_question') {
            character2DisplayText = "測驗已取消，下次見！";
            quizState = 'awaiting_question';
            isQuizActive = false;
        }
    }
}

function checkCollision3() {
    const distanceX = abs(posX - character3PosX);
    const collisionThreshold = CHARACTER1_WIDTH / 2 + CHARACTER3_WIDTH / 2;
    char3State = (distanceX < collisionThreshold) ? 'touch' : 'stand';
}

function checkCollision4() {
    const distanceX = abs(posX - character4PosX);
    const collisionThreshold = CHARACTER1_WIDTH / 2 + CHARACTER4_WIDTH / 2;
    char4State = (distanceX < collisionThreshold) ? 'touch' : 'stand';
}

/**
 * 處理玩家輸入框和粉色提示框的顯示和定位 (跟隨角色1，並偏右)
 */
function handleInputDisplay() {
    
    const boxX = posX + BUBBLE_OFFSET_X_P1;
    const boxY = posY - BUBBLE_OFFSET_Y_P1;

    if (isCharacter1Near && isQuizActive && quizState === 'awaiting_answer') {
        
        // --- 1. 繪製淡粉色提示框 ---
        push();
        rectMode(CENTER);
        noStroke();
        fill(255, 200, 220, 200); 
        rect(boxX, boxY, answerPromptBoxWidth, answerPromptBoxHeight, 10);
        
        // --- 2. 繪製「請作答」文字 ---
        fill(0); 
        textSize(18);
        textAlign(LEFT, CENTER);
        
        const textOffset = (answerPromptBoxWidth / 2) - (answerPromptBoxWidth * 0.95 / 2); 
        const textX = boxX - answerPromptBoxWidth / 2 + textOffset;
        text(answerPromptText, textX, boxY);
        pop();
        
        // --- 3. 定位並顯示白色輸入框 ---
        
        const inputX = textX + textWidth(answerPromptText) + 5; 
        const inputY = boxY - character1Input.size().height / 2;

        character1Input.position(inputX, inputY);
        character1Input.show();
        
    } else {
        character1Input.hide();
    }
}


// -------------------------------------------------------------------
// 繪製函式
// -------------------------------------------------------------------

function drawCharacter2Text() {
    if (isCharacter1Near) {
        push();
        textSize(18);
        textAlign(CENTER, CENTER);
        let textW = textWidth(character2DisplayText);
        let boxPadding = 20;
        let boxW = textW + boxPadding;
        let boxH = 18 + boxPadding;

        rectMode(CENTER);
        noStroke();
        fill('#e9edc9');

        rect(character2PosX, character2PosY - BUBBLE_OFFSET_Y - boxH / 2, boxW, boxH, 5);

        fill(0);
        text(character2DisplayText, character2PosX, character2PosY - BUBBLE_OFFSET_Y - boxH / 2);

        pop();
    }
}

function drawCharacter() {
    let currentSheet, currentFrames, currentFrameW, currentFrameH, currentFrameIndex;
    
    if (state === 'walk') {
        currentSheet = walkSheet;
        currentFrames = WALK_FRAMES;
        currentFrameW = walkSheet.width / WALK_FRAMES;
        currentFrameH = walkSheet.height;
        currentFrameIndex = floor(frameCount / animationSpeed) % currentFrames;
    } else if (state === 'jump') {
        currentSheet = jumpSheet;
        currentFrames = JUMP_FRAMES;
        currentFrameW = jumpSheet.width / JUMP_FRAMES;
        currentFrameH = jumpSheet.height;
        currentFrameIndex = floor(frameCount / animationSpeed) % currentFrames;
    } else if (state === 'attack') {
        currentSheet = attackSheet;
        currentFrames = ATTACK_FRAMES;
        currentFrameW = attackSheet.width / ATTACK_FRAMES;
        currentFrameH = attackSheet.height;
        const elapsedFrames = frameCount - attackAnimationStartTime;
        currentFrameIndex = min(floor(elapsedFrames / animationSpeed), currentFrames - 1);
    } else { // 'stand' 狀態
        currentSheet = standSheet;
        currentFrames = STAND_FRAMES;
        currentFrameW = standFrameWidth;
        currentFrameH = standFrameHeight;
        currentFrameIndex = floor(frameCount / animationSpeed) % currentFrames;
    }

    let sx = currentFrameIndex * currentFrameW;
    push();
    translate(posX, posY);
    if (direction === -1) scale(-1, 1);

    let scaledW = currentFrameW * SCALE_FACTOR;
    let scaledH = currentFrameH * SCALE_FACTOR;

    image(currentSheet, -scaledW / 2, -scaledH / 2, scaledW, scaledH,
        sx, 0, currentFrameW, currentFrameH);
    pop();
}

function drawCharacter2() {
    let currentSheet2, currentFrames2, currentFrameW2, scaleFactor2 = SCALE_FACTOR_2;

    if (char2State === 'hit') {
        currentSheet2 = character2AttackSheet;
        currentFrames2 = CHARACTER2_ATTACK_FRAMES;
        currentFrameW2 = character2AttackSheet.width / CHARACTER2_ATTACK_FRAMES;
    } else if (char2State === 'touch') {
        currentSheet2 = character2TouchSheet;
        currentFrames2 = CHARACTER2_TOUCH_FRAMES;
        currentFrameW2 = character2TouchSheet.width / CHARACTER2_TOUCH_FRAMES;
    } else {
        currentSheet2 = character2Sheet;
        currentFrames2 = CHARACTER2_FRAMES;
        currentFrameW2 = character2FrameWidth;
    }

    let currentFrameIndex = floor(frameCount / animationSpeed) % currentFrames2;
    let sx = currentFrameIndex * currentFrameW2;
    let scaledW = currentFrameW2 * scaleFactor2;
    let scaledH = character2FrameHeight * scaleFactor2;

    push();
    translate(character2PosX, character2PosY);
    if (posX < character2PosX) scale(-1, 1);

    image(currentSheet2, -scaledW / 2, -scaledH / 2, scaledW, scaledH,
        sx, 0, currentFrameW2, character2FrameHeight);
    pop();
}

function drawCharacter3() {
    let currentSheet, currentFrames, currentFrameW, currentFrameH = character3FrameHeight;
    let scaleFactor = SCALE_FACTOR_3;

    if (char3State === 'touch') {
        currentSheet = character3TouchSheet;
        currentFrames = CHARACTER3_TOUCH_FRAMES;
        currentFrameW = character3TouchFrameWidth;
    } else {
        currentSheet = character3Sheet;
        currentFrames = CHARACTER3_FRAMES;
        currentFrameW = character3FrameWidth;
    }

    let currentFrameIndex = floor(frameCount / animationSpeed) % currentFrames;
    let sx = currentFrameIndex * currentFrameW;

    push();
    translate(character3PosX, character3PosY);
    if (posX < character3PosX) scale(-1, 1);

    let scaledW = currentFrameW * scaleFactor;
    let scaledH = currentFrameH * scaleFactor;

    image(currentSheet, -scaledW / 2, -scaledH / 2, scaledW, scaledH,
        sx, 0, currentFrameW, currentFrameH);
    pop();
}

function drawCharacter4() {
    let currentSheet, currentFrames, currentFrameW, currentFrameH;
    let scaleFactor = SCALE_FACTOR_4;

    if (char4State === 'touch') {
        currentSheet = character4TouchSheet;
        currentFrames = CHARACTER4_TOUCH_FRAMES;
        currentFrameW = character4TouchFrameWidth;
        currentFrameH = character4TouchSheet.height;
    } else {
        currentSheet = character4Sheet;
        currentFrames = CHARACTER4_FRAMES;
        currentFrameW = character4FrameWidth;
        currentFrameH = character4FrameHeight;
    }

    let currentFrameIndex = floor(frameCount / animationSpeed) % currentFrames;
    let sx = currentFrameIndex * currentFrameW;

    push();
    translate(character4PosX, character4PosY);
    if (posX < character4PosX) scale(-1, 1);

    let scaledW = currentFrameW * scaleFactor;
    let scaledH = currentFrameH * scaleFactor;

    image(currentSheet, -scaledW / 2, -scaledH / 2, scaledW, scaledH,
        sx, 0, currentFrameW, currentFrameH);
    pop();
}