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
        const maxStr = "max";
        const humanStr = "human";
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
        this.size = size;
        this.position = position;
    }

    toString() {
        return `M(${this.owner}, ${this.position}, ${this.size})`;
    }
}

class Board {

    constructor() {
        this.figures = [];
        this.maxPlayerOutsideFigures = [[], [], []];
        this.minPlayerOutsideFigures = [[], [], []];

        this.threeDBoard = [[[null, null, null], [null, null, null], [null, null, null]],
        [[null, null, null], [null, null, null], [null, null, null]],
        [[null, null, null], [null, null, null], [null, null, null]]];
    }

    /**@returns true if position is not null and is inside the board */
    contains(position) {
        if (position === null) return false;

        if (position.x >= 0 && position.x <= 3 
            && position.y >= 0 && position.y <= 3) {
            return true;
        }
        return false;
    }

    /**@param matroska - the Matroska to be added 
     * @throws GameRulesViolation - if `matroska` can not be added*/
    addMatroska(matroska) {
        const position = matroska.position;
        const player = matroska.player;
        if (position === null) {
            if (player.isMaximizing) {
                this.maxPlayerOutsideFigures[matroska.size].push(matroska);
                if (this.maxPlayerOutsideFigures[matroska.size].length > 2) {
                    throw new GameRulesViolation("more than 2 matroskas of same size");
                }
                return;
            } else {
                this.minPlayerOutsideFigures[matroska.size].push(matroska);
                if (this.minPlayerOutsideFigures[matroska.size].length > 2) {
                    throw new GameRulesViolation("more than 2 matroskas of same size");
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
        const player = matroska.player;

        if (position === null) {
            if (player.isMaximizing) {
                this.maxPlayerOutsideFigures[matroska.size].pop();
                return;
            } else {
                this.minPlayerOutsideFigures[matroska.size].pop();
                return;
            }
        } else {
            if (this.contains(position)) {
                throw new NotImplemented("TODO");
            } else {
                throw new GameRulesViolation(`Position ${position} out of board's range`)
            }
        }
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
