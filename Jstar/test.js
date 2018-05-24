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


const state_module = require('./state');

main();

function main() {
    let state = _buildStateFromString("WOOWWBBBWWBBBOOBOOOOBOWO-Second-0,0-9,7", state_module.PLAYER_WHITE);

    console.log(state.toString());

    var actions = state.getPhaseTwoActions();

    for (let action of actions) {
        console.log(action.toString());
    }
}

function _buildStateFromString(stateString, playerToMove) {
    // OOOOOOOOOOOOOOOOOOOOOOOO-First-9,9-0,0
    var stateStringTokens = stateString.split('-');

    // OOOOOOOOOOOOOOOOOOOOOOOO
    var boardString = stateStringTokens[0];
    // First
    var phaseString = stateStringTokens[1];
    // 9,9
    var piecesLeftString = stateStringTokens[2];
    // 0,0
    var piecesOnBoardString = stateStringTokens[3];

    var phaseMappings = {
        "First": 1,
        "Second": 2,
        "Final": 3
    };
    var phase = parseInt(phaseMappings[phaseString]);

    var board = _buildBoardFromString(boardString);

    var playerStringPlayerCheckerMapping = {
        "WHITE": state_module.PLAYER_WHITE,
        "BLACK": state_module.PLAYER_BLACK
    }

    var piecesLeftArray = piecesLeftString.split(',');
    var piecesLeftForPlayerWhite = piecesLeftArray[0];
    var piecesLeftForPlayerBlack = piecesLeftArray[1];

    var state = new state_module.State({
        phase: phase,
        board: board,
        playerToMove: playerToMove,
        piecesLeftForPlayerWhite: piecesLeftForPlayerWhite,
        piecesLeftForPlayerBlack: piecesLeftForPlayerBlack
    });

    state.updateForbiddenRemovalPositions();

    return state;
}

function _buildBoardFromString(boardString) {
    var _playerMappings = {
        'O': state_module.PLAYER_NONE,
        'W': state_module.PLAYER_WHITE,
        'B': state_module.PLAYER_BLACK
    }

    var board = new Array(state_module.BOARD_SIZE);
    for (var i = 0; i < 24; i++) {
        var positionState = boardString.charAt(i);
        board[i + 1] = _playerMappings[positionState];
    }

    return board;
}
