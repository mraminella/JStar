/*
*    JStar AI Player for Nine Men's Morris
*
*    Authors:    Scarpa Nicolò
*                Raminella Marco
*    Copyright 2018 Nicolò Scarpa, Marco Raminella.
*    
*    This file is part of JStar.
*
*    JStar is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    JStar is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with JStar.  If not, see <http://www.gnu.org/licenses/>.
* 
*/

// const coord = require("./coord");
const action_module = require("./action");

const PLAYER_STARTING_PIECES = 9;
const BOARD_SIZE = 25;

const PLAYER_WHITE = "░";
const PLAYER_BLACK = "▓";
const PLAYER_NONE = "-";

const RESULT_UNDEFINED = -1;
const RESULT_LOOSE = Number.NEGATIVE_INFINITY;
const RESULT_TIE = 0.0;
const RESULT_WIN = Number.POSITIVE_INFINITY;

const UTILITY_SPLIT = 0.02;
const UTILITY_TWO_IN_A_ROW = 0.01;
const UTILITY_THREE_IN_A_ROW = 0.05;
const UTILIITY_NEIGHBOR_AVAIL = 0.01;
const UTILITY_GOT_TOKEN = 0.02;

const TRIS_POSITIONS_SIZE = 16;
const NEIGHBOR_POSITIONS_SIZE = 24;


var State = (function () {
    function State(state) {


        var _phase;
        var _board = new Array(25);

        var _trisCombinationsPositions = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [10, 11, 12],
            [13, 14, 15],
            [16, 17, 18],
            [19, 20, 21],
            [22, 23, 24],
            [1, 10, 22],
            [4, 11, 19],
            [7, 12, 16],
            [2, 5, 8],
            [17, 20, 23],
            [9, 13, 18],
            [6, 14, 21],
            [3, 15, 24],
        ];

        var _neighborPositions = [ // NB. la posizione nell'array corrisponde alla posizione nella board
            [0], // non esiste
            [10, 2],             //1
            [1, 3, 5],            //2
            [2, 15],             //3
            [5, 11],             //4
            [2, 8, 4, 6],          //5
            [5, 14],             //6
            [8, 12],             //7
            [7, 9, 5],            //8
            [8, 13],             //9
            [1, 22, 11],          //10
            [4, 19, 10, 12],                 //11
            [7, 16, 11],                 //12
            [9, 18, 14],                 //13
            [13, 15, 6, 21],                 //14
            [3, 24, 14],                 //15
            [12, 17],                 //16
            [16, 18, 20],                 //17
            [13, 17],                 //18
            [11, 20],                 //19
            [17, 23, 19, 21],                 //20
            [14, 20],                 //21
            [10, 23],                 //22
            [20, 22, 24],                 //23
            [23, 15],                 //24
        ];

        var _forbiddenRemovalPositions = [];

        var _playerToMove = null;
        var _piecesLeftForPlayerWhite = PLAYER_STARTING_PIECES;
        var _piecesLeftForPlayerBlack = PLAYER_STARTING_PIECES;

        var _utility = RESULT_UNDEFINED;

        var _boardViewTemplate =
            "A ═══════════ B ═══════════ C\n" +
            "║             ║             ║\n" +
            "║    D ══════ E ══════ F    ║\n" +
            "║    ║        ║        ║    ║\n" +
            "║    ║    G ═ H ═ I    ║    ║\n" +
            "║    ║    ║       ║    ║    ║\n" +
            "J ══ K ══ L       M ══ N ══ O\n" +
            "║    ║    ║       ║    ║    ║\n" +
            "║    ║    P ═ Q ═ R    ║    ║\n" +
            "║    ║        ║        ║    ║\n" +
            "║    S ══════ T ══════ U    ║\n" +
            "║             ║             ║\n" +
            "V ═══════════ W ═══════════ X\n";

        _init(state);

        return {
            RESULT_UNDEFINED: RESULT_UNDEFINED,
            RESULT_LOOSE: RESULT_LOOSE,
            RESULT_TIE: RESULT_TIE,
            RESULT_WIN: RESULT_WIN,
            PLAYER_WHITE: PLAYER_WHITE,
            PLAYER_BLACK: PLAYER_BLACK,
            getPlayerToMove: _getPlayerToMove,
            isEmpty: _isEmpty,
            getValue: _getValue,
            getUtility: _getUtility,
            applyAction: _applyAction,
            updateForbiddenRemovalPositions: _updateForbiddenRemovalPositions,
            getPhase: getPhase,
            getPhaseOneActions: _getPhaseOneActions,
            getPhaseTwoActions: getPhaseTwoActions,
            getPhaseThreeActions: getPhaseThreeActions,
            getUnmarkedPositions: _getUnmarkedPositions,
            clone: clone,
            equals: equals,
            toString: _toString
        };

        function _init(state) {
            if (typeof (state) === "undefined") {
                _phase = 1;

                for (var i = 1; i < BOARD_SIZE; i++) {
                    _board[i] = PLAYER_NONE;
                }

                _forbiddenRemovalPositions = [];

                _playerToMove = PLAYER_WHITE;

                _utility = RESULT_UNDEFINED;

                _piecesLeftForPlayerWhite = PLAYER_STARTING_PIECES;
                _piecesLeftForPlayerBlack = PLAYER_STARTING_PIECES;
            } else {
                _phase = state.phase;
                _board = state.board;
                _playerToMove = state.playerToMove;
                _utility = state.utility;
                _piecesLeftForPlayerWhite = state.piecesLeftForPlayerWhite;
                _piecesLeftForPlayerBlack = state.piecesLeftForPlayerBlack;
            }
        }

        function _getPlayerToMove() {
            return _playerToMove;
        }

        function _isEmpty(position) {
            return _getValue(position) === PLAYER_NONE;
        }

        function _getValue(position) {
            return _board[position];
        }

        function _getUtility() {
            return _utility;
        }

        function _applyAction(action) {
            if (action == undefined) {
                _utility = _playerToMove === PLAYER_WHITE ? RESULT_LOOSE : RESULT_WIN;

                return;
            }

            var position = null;
            if (action.getFromPosition() !== action_module.ACTION_NONE) {
                position = action.getFromPosition();

                _remove(position);

                if (_playerToMove === PLAYER_WHITE) {
                    _piecesLeftForPlayerWhite++;
                } else {
                    _piecesLeftForPlayerBlack++;
                }
            }

            if (action.getToPosition() !== action_module.ACTION_NONE) {
                position = action.getToPosition();

                _put(position, _playerToMove);

                if (_playerToMove === PLAYER_WHITE) {
                    _piecesLeftForPlayerWhite--;
                } else {
                    _piecesLeftForPlayerBlack--;
                }
            }

            if (action.getRemovePosition() !== action_module.ACTION_NONE) {
                position = action.getRemovePosition();

                _remove(position);
            }

            _updateForbiddenRemovalPosition(position);

            _analyzeUtility();

            _changePlayerToMove();

            _initPhase();
        }

        function _initPhase() {
            switch (_phase) {
                case 1:
                    if (_piecesLeftForPlayerWhite === 0 && _piecesLeftForPlayerBlack === 0) {
                        _phase = 2;
                    }
                    break;
                case 2:
                    if (_piecesLeftForPlayerBlack <= 3 || _piecesLeftForPlayerWhite <= 3) {
                        _phase = 3;
                    }
                    break;
                case 3:
                    if (_piecesLeftForPlayerBlack < 3 || _piecesLeftForPlayerWhite < 3) {
                        if (_piecesLeftForPlayerBlack < 3)
                            _utility = RESULT_WIN;
                        else
                            _utility = RESULT_LOOSE;
                    }
                    break;
                default:
                    throw new Error("Unkown phase " + _phase);
            }
        }


        function _put(position, player) {
            _board[position] = player;
        }

        function _remove(position) {
            _board[position] = PLAYER_NONE;
        }

        function _updateForbiddenRemovalPositions() {
            for (var position = 1; position < BOARD_SIZE; position++) {
                _updateForbiddenRemovalPosition(position);
            }
        }

        function _updateForbiddenRemovalPosition(position) {
            var positionBelongsToATris = _positionBelongsToATris(position);

            if (positionBelongsToATris) {
                _forbiddenRemovalPositions.push(position);
            }
        }

        function _positionBelongsToATris(position) {
            for (var trisCombinationPositions of _trisCombinationsPositions) {
                for (var trisCombinationPosition of trisCombinationPositions) {
                    if (trisCombinationPosition === position) {
                        var positionPlayer = _getValue(position);

                        if (positionPlayer === PLAYER_NONE) {
                            continue;
                        }

                        var positionBelongsToATris = _getValue(trisCombinationPositions[0]) == _getValue(trisCombinationPositions[1]) && _getValue(trisCombinationPositions[1]) == _getValue(trisCombinationPositions[2]);
                        if (positionBelongsToATris) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        function _changePlayerToMove() {
            _playerToMove = _playerToMove === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
        }

        function _evalTrisPhaseOne(position) {
            var result = false;

            _put(position, _playerToMove);

            if (_positionBelongsToATris(position)) {
                result = true;
            }

            _remove(position);

            return result;
        }

        
        function _evalTris(fromPosition,toPosition) {
            var result = false;
            _remove(fromPosition);
            _put(toPosition, _playerToMove);

            if (_positionBelongsToATris(toPosition)) {
                result = true;
            }
            _put(fromPosition,_playerToMove);
            _remove(toPosition);

            return result;
        }

        function _analyzeUtility() {
            _utility = RESULT_TIE;

            for (var trisCombinationPositions of _trisCombinationsPositions) {
                var whitePositionsInCombo = 0;
                var blackPositionsInCombo = 0;

                for (var trisCombinationPosition of trisCombinationPositions) {
                    if (_getValue(trisCombinationPosition) === PLAYER_NONE) {
                        continue;
                    }

                    if (_getValue(trisCombinationPosition) == PLAYER_WHITE) {
                        whitePositionsInCombo++;
                    } else {
                        blackPositionsInCombo++;
                    }
                }

                if (whitePositionsInCombo == 2) {
                    _utility += UTILITY_TWO_IN_A_ROW;
                }
                if (blackPositionsInCombo == 2) {
                    _utility -= UTILITY_TWO_IN_A_ROW;
                }
                if (whitePositionsInCombo == 3) {
                    _utility += UTILITY_THREE_IN_A_ROW;
                }
                if (blackPositionsInCombo == 3) {
                    _utility -= UTILITY_THREE_IN_A_ROW;
                }

                _utility += whitePositionsInCombo * UTILITY_GOT_TOKEN;
                _utility -= blackPositionsInCombo * UTILITY_GOT_TOKEN;
            }

            if (_phase == 2) {
                var playerPositions = _getPlayerPositions(PLAYER_WHITE);
                for (let playerPosition of playerPositions) {
                    var currentNeighborhood = _neighborPositions[playerPosition];
                    for (let neighborPositionIdx in currentNeighborhood) {
                        var currNeighbor = _neighborPositions[playerPosition][neighborPositionIdx];
                        if (_board[currNeighbor] == PLAYER_NONE) {
                            _utility += UTILIITY_NEIGHBOR_AVAIL;
                        }
                    }
                }
                playerPositions = _getPlayerPositions(PLAYER_BLACK);
                for (let playerPosition of playerPositions) {
                    var currentNeighborhood = _neighborPositions[playerPosition];
                    for (let neighborPositionIdx in currentNeighborhood) {
                        var currNeighbor = _neighborPositions[playerPosition][neighborPositionIdx];
                        if (_board[currNeighbor] == PLAYER_NONE) {
                            _utility -= UTILIITY_NEIGHBOR_AVAIL;
                        }
                    }
                }
            }
        }

        function getPhase() {
            return _phase;
        }

        function getPhaseThreeActions() {
            var actions = [];

            var playerToMoveHas3CheckersLeft = (_playerToMove === PLAYER_WHITE && _piecesLeftForPlayerWhite === 3) || (_playerToMove === PLAYER_BLACK && _piecesLeftForPlayerBlack <= 3);
            var playerToMoveHasMoreThan3CheckersLeft = playerToMoveHas3CheckersLeft === false;
            if (playerToMoveHasMoreThan3CheckersLeft) {
                return getPhaseTwoActions();
            }

            var playerPositions = _getPlayerPositions(_playerToMove);
            for (let playerPosition of playerPositions) {
                var freePositions = _getUnmarkedPositions();
                for (let freePosition of freePositions) {
                    if (_evalTris(playerPosition,freePosition) == true) {
                        var adversarialRemovablePositions = _getAdversarialRemovablePositions();
                        for (let adversarialRemovablePosition of adversarialRemovablePositions) {
                            var action = new action_module.Action(playerPosition, freePosition, adversarialRemovablePosition);

                            actions.push(action);
                        }
                    } else {
                        var action = new action_module.Action(playerPosition, freePosition, action_module.ACTION_NONE);

                        actions.push(action);
                    }
                }
            }

            return actions;
        }
        function getPhaseTwoActions() {
            var actions = [];

            var playerPositions = _getPlayerPositions(_playerToMove);
            for (let playerPosition of playerPositions) {
                var currentNeighborhood = _neighborPositions[playerPosition];
                for (let currNeighbor of currentNeighborhood) {
                    if (_board[currNeighbor] === PLAYER_NONE) {
                        if (_evalTris(playerPosition,currNeighbor) === true) {
                            var adversarialRemovablePositions = _getAdversarialRemovablePositions();
                            for (let adversarialRemovablePosition of adversarialRemovablePositions) {
                                var action = new action_module.Action(playerPosition, currNeighbor, adversarialRemovablePosition);

                                actions.push(action);
                            }
                        } else {
                            var action = new action_module.Action(playerPosition, currNeighbor, action_module.ACTION_NONE);

                            actions.push(action);
                        }
                    }
                }
            }

            var winForConstriction = actions.length === 0;
            if (winForConstriction) {
                _utility = _playerToMove === PLAYER_WHITE ? RESULT_WIN : RESULT_LOOSE;
            }

            return actions;
        }

        function _getPhaseOneActions() {
            var actions = [];

            var adversarialRemovablePositions = _getAdversarialRemovablePositions();
            var freePositions = _getUnmarkedPositions();
            for (freePosition of freePositions) {
                if (_evalTrisPhaseOne(freePosition) == true) {
                    for (adversarialRemovablePosition of adversarialRemovablePositions) {
                        var action = new action_module.Action(action_module.ACTION_NONE, freePosition, adversarialRemovablePosition);

                        actions.push(action);
                    }
                } else {
                    var action = new action_module.Action(action_module.ACTION_NONE, freePosition, action_module.ACTION_NONE);

                    actions.push(action);
                }
            }

            return actions;
        }

        function _getPlayerPositions(player) {
            var playerPositions = [];
            for (var i = 1; i < BOARD_SIZE + 1; i++) {
                if (_board[i] == player) {
                    playerPositions.push(i);
                }
            }
            return playerPositions;
        }

        function _getAdversarialPositions() {
            var adversarialPlayer = _playerToMove === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;

            return _getPlayerPositions(adversarialPlayer);
        }

        function _getAdversarialRemovablePositions() {
            var removablePositions = new Array();

            var adversarialPositions = _getAdversarialPositions();
            for (position of adversarialPositions) {
                // la posizione appartiene a un tris allora non posso eliminarla
                if (_forbiddenRemovalPositions.includes(position)) {
                    continue;
                }

                removablePositions.push(position);
            }

            // sono tutti tris: in tal caso posso eliminare anche una pedina che fa tris
            if (removablePositions.length === 0) {
                return adversarialPositions;
            }

            return removablePositions;
        }

        function _getUnmarkedPositions() {
            return (_getPlayerPositions(PLAYER_NONE));
        }

        function _getForbiddenRemovalPositions() {
            return _forbiddenRemovalPositions;
        }

        function clone() {
            var boardCopy = _board.slice();

            var copy = new State({
                phase: _phase,
                board: boardCopy,
                utility: _utility,
                playerToMove: _playerToMove,
                piecesLeftForPlayerWhite: _piecesLeftForPlayerWhite,
                piecesLeftForPlayerBlack: _piecesLeftForPlayerBlack
            });

            return copy;
        }

        function equals(state) {
            for (var i = 1; i < BOARD_SIZE; i++) {
                if (_getValue(i) != state.getValue(i)) {
                    playerPositions.push(i);
                }
            }
            return true;
        }

        function _toString() {
            var string = _boardViewTemplate;

            var a = _getValue(1);
            var b = _getValue(2);
            var c = _getValue(3);

            var d = _getValue(4);
            var e = _getValue(5);
            var f = _getValue(6);

            var g = _getValue(7);
            var h = _getValue(8);
            var i = _getValue(9);

            var j = _getValue(10);
            var k = _getValue(11);
            var l = _getValue(12);
            var m = _getValue(13);
            var n = _getValue(14);
            var o = _getValue(15);

            var p = _getValue(16);
            var q = _getValue(17);
            var r = _getValue(18);

            var s = _getValue(19);
            var t = _getValue(20);
            var u = _getValue(21);

            var v = _getValue(22);
            var w = _getValue(23);
            var x = _getValue(24);

            string = string.replace('A', a);
            string = string.replace('B', b);
            string = string.replace('C', c);
            string = string.replace('D', d);
            string = string.replace('E', e);
            string = string.replace('F', f);
            string = string.replace('G', g);
            string = string.replace('H', h);
            string = string.replace('I', i);
            string = string.replace('J', j);
            string = string.replace('K', k);
            string = string.replace('L', l);
            string = string.replace('M', m);
            string = string.replace('N', n);
            string = string.replace('O', o);
            string = string.replace('P', p);
            string = string.replace('Q', q);
            string = string.replace('R', r);
            string = string.replace('S', s);
            string = string.replace('T', t);
            string = string.replace('U', u);
            string = string.replace('V', v);
            string = string.replace('W', w);
            string = string.replace('X', x);

            return string;
        }

        function getAbsPosition(col, row) {
            var absPosition = row * 3 + col;
            // No place in center position
            if (absPosition > 3) {
                absPosition = absPosition - 1;
            }
            return absPosition;
        }
    }

    return State;
})();

module.exports = {
    PLAYER_STARTING_PIECES: PLAYER_STARTING_PIECES,
    BOARD_SIZE: BOARD_SIZE,

    PLAYER_WHITE: PLAYER_WHITE,
    PLAYER_BLACK: PLAYER_BLACK,
    PLAYER_NONE: PLAYER_NONE,

    RESULT_UNDEFINED: RESULT_UNDEFINED,
    RESULT_LOOSE: RESULT_LOOSE,
    RESULT_TIE: RESULT_TIE,
    RESULT_WIN: RESULT_WIN,

    UTILITY_SPLIT: UTILITY_SPLIT,
    UTILITY_TWO_IN_A_ROW: UTILITY_TWO_IN_A_ROW,
    UTILITY_THREE_IN_A_ROW: UTILITY_THREE_IN_A_ROW,

    State: State
};