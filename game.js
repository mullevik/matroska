class NotImplemented extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message;
    }
}

class GameRulesViolation extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message;
    }
}

class AbstractMethod extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message;
    }
}


class Player {
    constructor(playerId, isHuman, isMaximizing) {
        this.playerId = playerId;
        this.isHuman = isHuman;
        this.isMaximizing = isMaximizing;
    }

    equals(other) {
        if (other instanceof Player 
            && other.playerId == this.playerId) {
            return true;
        }
        return false;
    }

    toString() {
        let maxStr = "max";
        let humanStr = "human";
        if (! this.isMaximizing) {
            maxStr = "min";
        }
        if (! this.isHuman) {
            humanStr = "CPU";
        }
        return `P(${this.playerId}, ${maxStr}, ${humanStr})`;
    }
}

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Position(this.x, this.y);
    }

    equals(other) {
        if (other instanceof Position 
            && other.x == this.x 
            && other.y == this.y) {
            return true;
        }
        return false;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

class Matroska {

    /**@param owner - the Player who owns this
     * @param size - integer representing the size of this
     * @param position - the Position of this, 
     * may be null if this Matroska is not placed yet*/
    constructor(owner, size, position) {
        this.owner = owner;
        if (size > 2 || size < 0) {
            throw new GameRulesViolation(`Invalid size of ${size} for matroska`);
        }
        this.size = size;
        this.position = position;
    }

    equals(other) {
        if (other instanceof Matroska 
            && other.owner.equals(this.owner) 
            && other.size == this.size) {
            return true;
        }
        return false;
    }

    toString() {
        return `M(${this.owner}, ${this.size}, ${this.position})`;
    }
}

class Board {

    constructor() {
        this.maxPlayerOutsideFigures = [[], [], []];
        this.minPlayerOutsideFigures = [[], [], []];

        this.threeDBoard = [[[null, null, null], [null, null, null], [null, null, null]],
        [[null, null, null], [null, null, null], [null, null, null]],
        [[null, null, null], [null, null, null], [null, null, null]]];
    }

    /**@returns true if position is not null and is inside the board */
    contains(position) {
        if (position === null) {
            return false;
        }
        if (position.x >= 0 && position.x <= 2 
            && position.y >= 0 && position.y <= 2) {
            return true;
        }
        return false;
    }

    /**@param matroska - the Matroska to be added 
     * @throws GameRulesViolation - if `matroska` can not be added*/
    addMatroska(matroska) {
        const position = matroska.position;
        const player = matroska.owner;
        if (position === null) {
            if (player.isMaximizing) {
                if (this.maxPlayerOutsideFigures[matroska.size].length >= 2) {
                    throw new GameRulesViolation("more than 2 matroskas of same size");
                } else {
                    this.maxPlayerOutsideFigures[matroska.size].push(matroska);
                }
                return;
            } else {
                if (this.minPlayerOutsideFigures[matroska.size].length >= 2) {
                    throw new GameRulesViolation("more than 2 matroskas of same size");
                } else {
                    this.minPlayerOutsideFigures[matroska.size].push(matroska);
                }
                return;
            }
        } else {
            if (this.contains(position)) {
                const top = this.topAt(position);
                if (top === null || top.size < matroska.size) {
                    this.threeDBoard[position.y][position.x][matroska.size] = matroska;
                } else {
                    throw new GameRulesViolation(`Position ${position} occupied with ${top}`);
                }
            } else {
                throw new GameRulesViolation(`Position ${position} out of board's range`)
            }
        }
    }

    /**@param matroska - remove Matroska
     * @throws GameRulesViolation - if `matroska` can not be removed
    */
    removeMatroska(matroska) {
        const position = matroska.position;
        const player = matroska.owner;

        if (position === null) {
            if (player.isMaximizing) {
                if (this.maxPlayerOutsideFigures[matroska.size].length > 0) {
                    this.maxPlayerOutsideFigures[matroska.size].pop();
                    return;
                } else {
                    throw new GameRulesViolation(`No matroska ${matroska} found outside the board`);
                }
            } else {
                if (this.minPlayerOutsideFigures[matroska.size]) {
                    this.minPlayerOutsideFigures[matroska.size].pop();
                    return;
                } else {
                    throw new GameRulesViolation(`No matroska ${matroska} found outside the board`);
                }
            }
        } else {
            if (this.contains(position)) {
                const top = this.topAt(position);
                if (matroska.equals(top)) {
                    this.removeTop(position);
                } else {
                    throw new GameRulesViolation(`Matroska ${matroska} could not be removed from ${position}`);
                }
            } else {
                throw new GameRulesViolation(`Position ${position} out of board's range`)
            }
        }
    }

    /**@param position - a Position from which to remove the top-most matroska
     * @returns true if a matroska was removed, false if there were no matroskas at this position */
    removeTop(position) {
        const figures = this.threeDBoard[position.y][position.x];
        for (let i = 2; i >= 0; i --) {
            if (figures[i] !== null) {
                figures[i] = null;
                return true;
            }
        }
        return false;
    }

    /**@returns array of figures at `position` */
    at(position) {
        return this.threeDBoard[position.y][position.x];
    }

    /**@returns a the top most Matroska or null if there are no figures at this `position` */
    topAt(position) {
        const figures = this.at(position);

        for (let i = 2; i >= 0; i --) {
            if (figures[i] !== null) {
                return figures[i];
            }
        }
        return null;
    }

    /**@param maxPlayer - the maximizing player
     * @param minPlayer - the minimizing player 
     * @returns a Player (maxPlayer of minPlayer) who won the game 
     * or null, if no such player exists */
    getWinner(maxPlayer, minPlayer) {
        // check rows
        for (let rowIndex = 0; rowIndex < 3; rowIndex ++) {
            let maxPlayerScore = 0;
            let minPlayerScore = 0;
            for (let colIndex = 0; colIndex < 3; colIndex ++) {
                const top = this.topAt(new Position(colIndex, rowIndex));
                if (top === null) {
                    break;
                } else if (maxPlayer.equals(top.owner)) {
                    maxPlayerScore += 1;
                } else {
                    minPlayerScore += 1;
                }
            }
            if (maxPlayerScore == 3) {
                return maxPlayer;
            } else if (minPlayerScore == 3) {
                return minPlayer;
            }
        }
        // check columns
        for (let colIndex = 0; colIndex < 3; colIndex ++) {
            let maxPlayerScore = 0;
            let minPlayerScore = 0;
            for (let rowIndex = 0; rowIndex < 3; rowIndex ++) {
                const top = this.topAt(new Position(colIndex, rowIndex));
                if (top === null) {
                    break;
                } else if (maxPlayer.equals(top.owner)) {
                    maxPlayerScore += 1;
                } else {
                    minPlayerScore += 1;
                }
            }
            if (maxPlayerScore == 3) {
                return maxPlayer;
            } else if (minPlayerScore == 3) {
                return minPlayer;
            }
        }
        // check decreasing diagonal
        let maxPlayerScore = 0;
        let minPlayerScore = 0;
        for (let i = 0; i < 3; i ++) {
            const top = this.topAt(new Position(i, i));
            if (top === null) {
                break;
            } else if (maxPlayer.equals(top.owner)) {
                maxPlayerScore += 1;
            } else {
                minPlayerScore += 1;
            }
        }
        if (maxPlayerScore == 3) {
            return maxPlayer;
        } else if (minPlayerScore == 3) {
            return minPlayer;
        }
        // check increasing diagonal
        maxPlayerScore = 0;
        minPlayerScore = 0;
        for (let i = 0; i < 3; i ++) {
            const top = this.topAt(new Position(i, 2 - i));
            if (top === null) {
                break;
            } else if (maxPlayer.equals(top.owner)) {
                maxPlayerScore += 1;
            } else {
                minPlayerScore += 1;
            }
        }
        if (maxPlayerScore == 3) {
            return maxPlayer;
        } else if (minPlayerScore == 3) {
            return minPlayer;
        }

        return null;
    }

    /**Deep copies the board
     * @returns new Board with the same contents of this board*/
    copy() {
        const newBoard = new Board();
        newBoard.maxPlayerOutsideFigures = Array.from(this.maxPlayerOutsideFigures);
        newBoard.minPlayerOutsideFigures = Array.from(this.minPlayerOutsideFigures);

        for (let rowIndex = 0; rowIndex < 3; rowIndex ++) {
            for (let colIndex = 0; colIndex < 3; colIndex ++) {
                for (let sizeIndex = 0; sizeIndex < 3; sizeIndex ++) {
                    newBoard.threeDBoard[rowIndex][colIndex][sizeIndex] = 
                    this.threeDBoard[rowIndex][colIndex][sizeIndex];
                }
            }
        }
        return newBoard;
    }

    toString() {
        const maxPlayerOutsideFigures = this.maxPlayerOutsideFigures.flat(Infinity);
        const minPlayerOutsideFigures = this.minPlayerOutsideFigures.flat(Infinity);

        let out = "===Board===\n";
        out += `max player outside figures: ${maxPlayerOutsideFigures}\n`;
        out += `min player outside figures: ${minPlayerOutsideFigures}\n`;

        for (let rowIndex = 0; rowIndex < 3; rowIndex ++) {
            for (let colIndex = 0; colIndex < 3; colIndex ++) {
                const top = this.topAt(new Position(colIndex, rowIndex));
                if (top !== null) {
                    out += `${top}  `;
                } else {
                    out += "null  "
                }
            }
            out += "\n"
        }
        return out;
    }
}

class AbstractAction {

    constructor(player) {
        this.player;
    }

    /** Generates new GameState from current GameState.
     * @param gameState - current Gamestate
     * @returns new GameState with applied action
     * @throws GameRuleViolation if the action is not applicable*/
    applyAction(gameState) {
        throw new AbstractMethod();
    }
}

/**Move action removes sourceMatroska and adds targetMatroska to the board */
class MoveAction extends AbstractAction {

    constructor(player, sourceMatroska, targetMatroska) {
        super(player);
        this.sourceMatroska = sourceMatroska;
        this.targetMatroska = targetMatroska;
    }

    applyAction(gameState) {
        const oldBoard = gameState.board;
        const newBoard = oldBoard.copy();
        newBoard.removeMatroska(this.sourceMatroska);
        newBoard.addMatroska(this.targetMatroska);

        const playerForNextTurn = gameState.getPlayerForNextTurn();
        return new GameState(
            newBoard, gameState.maxPlayer, gameState.minPlayer, playerForNextTurn);
    }
}

class GameState {

    constructor(board, maxPlayer, minPlayer, playerOnTurn) {
        this.board = board;
        this.maxPlayer = maxPlayer;
        this.minPlayer = minPlayer;
        this.playerOnTurn = playerOnTurn;
    }

    getPossibleActions(player) {
        throw new NotImplemented();
    }

    isTerminal() {
        throw new NotImplemented();
    }

    utility() {
        throw new NotImplemented();
    }

    getPlayerOnTurn() {
        return this.playerOnTurn;
    }

    getPlayerForNextTurn() {
        if (this.playerOnTurn.equals(this.maxPlayer)) {
            return this.minPlayer;
        } else {
            return this.maxPlayer;
        }
    }
}


class AssertionError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message;
    }
}

function assertTrue(x) {
    if (! x) throw new AssertionError();
}

function assertEquals(actual, expected) {
    if (actual != expected) {
        throw new AssertionError(`Got ${actual}, but expected ${expected}`)
    };
}

function assertNull(x) {
    if (x !== null) throw new AssertionError();
}

function assertThrows(executionFunction, exceptionClass) {
    try {
        executionFunction();

    } catch (e) {

        console.log(e);

        if (! (e instanceof exceptionClass)) {
            throw new AssertionError(`Exception other than expected ${exceptionClass} was thrown`);
        } else {
            return;
        }
    }
    throw new AssertionError("No exception was thrown");
}


function testBoard() {
    const p1 = new Player(0, true, true);
    const p2 = new Player(1, false, false);

    const middle = new Position(1, 1);
    const top = new Position(1, 0);
    const bottom = new Position(1, 2);
    const left = new Position(0, 1);
    const right = new Position(2, 1);

    const b = new Board();
    
    b.addMatroska(new Matroska(p1, 1, null));
    b.addMatroska(new Matroska(p1, 1, null));
    assertThrows(() => {b.addMatroska(new Matroska(p1, 1, null));}, GameRulesViolation);
    console.log(`${b}`);

    // overlapping figures
    b.removeMatroska(new Matroska(p1, 1, null));
    b.addMatroska(new Matroska(p1, 1, null));
    console.log(`${b}`);

    assertThrows(() => {b.removeMatroska(new Matroska(p1, 1, new Position(1, 1)))}, GameRulesViolation);

    b.addMatroska(new Matroska(p1, 1, middle));
    b.addMatroska(new Matroska(p1, 2, middle));
    console.log(`${b}`);
    assertThrows(() => {b.removeMatroska(new Matroska(p1, 1, middle))}, GameRulesViolation);
    b.removeMatroska(new Matroska(p1, 2, middle));

    // invalid board positions
    assertThrows(() => {b.addMatroska(new Matroska(p1, 0, new Position(0, 3)))}, GameRulesViolation);
    assertThrows(() => {b.addMatroska(new Matroska(p1, 0, new Position(-1, 2)))}, GameRulesViolation);
    assertThrows(() => {b.addMatroska(new Matroska(p1, 0, new Position(0, 4)))}, GameRulesViolation);
    assertThrows(() => {b.addMatroska(new Matroska(p1, 0, new Position(3, 3)))}, GameRulesViolation);

    // deep copying
    const b1 = new Board();
    b1.addMatroska(new Matroska(p1, 0, null));
    b1.addMatroska(new Matroska(p2, 1, null));
    b1.addMatroska(new Matroska(p1, 0, middle));
    b1.addMatroska(new Matroska(p2, 1, middle));
    b1.addMatroska(new Matroska(p1, 2, top));
    console.log(`${b1}`);
    const b2 = b1.copy();
    console.log(`${b2}`);
    b2.removeMatroska(new Matroska(p2, 1, middle));
    console.log(`${b1}`);
    console.log(`${b2}`);

    // wins
    const b3 = new Board();
    b3.addMatroska(new Matroska(p1, 0, middle));
    b3.addMatroska(new Matroska(p1, 0, top));
    b3.addMatroska(new Matroska(p1, 1, bottom));
    console.log(`${b3}`);
    assertEquals(b3.getWinner(p1, p2), p1);

    b3.addMatroska(new Matroska(p2, 1, middle));
    b3.addMatroska(new Matroska(p2, 2, top));
    console.log(`${b3}`);
    assertNull(b3.getWinner(p1, p2));

    b3.addMatroska(new Matroska(p1, 1, left));
    b3.addMatroska(new Matroska(p1, 2, right));
    console.log(`${b3}`);
    assertNull(b3.getWinner(p1, p2));

    b3.addMatroska(new Matroska(p1, 2, middle));
    assertEquals(b3.getWinner(p1, p2), p1);
    
    const b4 = new Board();
    b4.addMatroska(new Matroska(p2, 0, middle));
    b4.addMatroska(new Matroska(p2, 0, new Position(0, 0)));
    b4.addMatroska(new Matroska(p2, 1, new Position(2, 2)));
    console.log(`${b4}`);
    assertEquals(b4.getWinner(p1, p2), p2);

    b4.addMatroska(new Matroska(p1, 2, new Position(2, 2)));
    assertNull(b4.getWinner(p1, p2));
    b4.addMatroska(new Matroska(p1, 0, right));
    b4.addMatroska(new Matroska(p1, 0, new Position(2, 0)));
    assertEquals(b4.getWinner(p1, p2), p1);
    
}
testBoard();




x = [1, [2, 2], 3];

y = Array.from(x);

x[2] = 5;
x[1][1] = 10;

x
y