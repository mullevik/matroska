class NotImplemented extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message;
    }
}

class Player {
    constructor(playerId, isHuman) {
        this.playerId = playerId;
        this.isHuman = isHuman;
    }

    equals(other) {
        if (other instanceof Player 
            && other.playerId == this.playerId) {
            return true;
        }
        return false;
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
}

class Board {

    constructor(figures) {
        this.figures = figures;
        this.outsideFigures = [];

        this.threeDBoard = [[[null, null, null], [null, null, null], [null, null, null]],
        [[null, null, null], [null, null, null], [null, null, null]],
        [[null, null, null], [null, null, null], [null, null, null]]];

        for (let matroska of figures) {
            // place figures on board
            if (matroska.position !== null) {
                this.threeDBoard[matroska.position.y][matroska.position.x][matroska.size] = matroska;
            } else {
                this.outsideFigures.push(matroska);
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