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

    /**Deep copies the board
     * @returns new Board with the same contents of this board*/
    copy() {
        const newBoard = new Board();
        newBoard.maxPlayerOutsideFigures = Array.from(this.maxPlayerOutsideFigures);
        newBoard.minPlayerOutsideFigures = Array.from(this.minPlayerOutsideFigures);

        for (let rowIndex = 0; rowIndex < 3; rowIndex ++) {
            for (let colIndex = 0; colIndex < 3; colIndex ++) {
                for (let sizeIndex = 0; sizeIndex < 3; sizeIndex ++) {
                    newBoard.threeDBoard[rowIndex][colIndex][sizeIndex] = this.threeDBoard[rowIndex][colIndex][sizeIndex];
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

class GameState {

    constructor(board) {
        this.board = board;
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
    if (actual != expected) throw new AssertionError(`Got ${actual}, but expected ${expected}`);
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

}
testBoard();




x = [1, [2, 2], 3];

y = Array.from(x);

x[2] = 5;
x[1][1] = 10;

x
y