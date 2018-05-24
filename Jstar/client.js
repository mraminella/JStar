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
const action_module = require('./action');

const net = require('net');

const PROXY_SOCKET_HOST = '127.0.0.1';
const PROXY_SOCKET_PORT = 5900;

const PROTOCOL_INIT = 0;
const PROTOCOL_READ_INITIAL_STATE = 1;

const PROTOCOL_MSG_PLAYER_WHITE = "WHITE";
const PROTOCOL_MSG_PLAYER_BLACK = "BLACK";

var Client = (function () {
    function Client(player) {
        var _socket;

        var _player;
        var _otherPlayer;
        var _state;

        var _myTurn;

        var _readStatePromise;
        var _readStatePromiseResolve;
        var _readStatePromiseReject;

        var _playerMappings = {
            'O': state_module.PLAYER_NONE,
            'W': state_module.PLAYER_WHITE,
            'B': state_module.PLAYER_BLACK
        }

        var _positionsMapping = {
            1: "a7",
            2: "d7",
            3: "g7",
            4: "b6",
            5: "d6",
            6: "f6",
            7: "c5",
            8: "d5",
            9: "e5",
            10: "a4",
            11: "b4",
            12: "c4",
            13: "e4",
            14: "f4",
            15: "g4",
            16: "c3",
            17: "d3",
            18: "e3",
            19: "b2",
            20: "d2",
            21: "f2",
            22: "a1",
            23: "d1",
            24: "g1"
        };
        
        _init(player);

        return {
            readState: _readState,
            writeAction: _writeAction
        };

        function _init(player) {
            _player = player;
            _otherPlayer = _player === "WHITE" ? "BLACK" : "WHITE";

            _myTurn = _player === "WHITE";

            _socket = new net.Socket();

            var port = PROXY_SOCKET_PORT;
            if (player === "BLACK") {
                port = 5901;
            }

            _socket.connect(port, PROXY_SOCKET_HOST, function () {
                console.log('Connected');

                _socket.write(_player + '\n');
            });

            _socket.on('data', function (data) {
                console.log('Received: ' + data);

                _state = _buildStateFromString(data.toString());

                _readStatePromiseResolve(_state);

                _buildNewReadStatePromise();
            });

            _socket.on('close', function () {
                console.log('Connection closed');
            });

            _buildNewReadStatePromise();
        }

        function _buildNewReadStatePromise() {
            _readStatePromise = new Promise(function(resolve, reject) {
                _readStatePromiseResolve = resolve;
                _readStatePromiseReject = reject;
            });
        }

        function _readState() {
            return _readStatePromise;
        }

        function _writeAction(phase, action) {
            var actionString = _buildActionString(action);

            _socket.write(phase + "-" + actionString + "\n");
        }

        function _buildActionString(action) {
            var actionString = "";

            var fromPosition = action.getFromPosition();
            var toPosition = action.getToPosition();
            var removePosition = action.getRemovePosition();

            if (fromPosition !== action_module.ACTION_NONE) {
                actionString += _positionsMapping[fromPosition];
            }

            if (toPosition !== action_module.ACTION_NONE) {
                actionString += _positionsMapping[toPosition];
            }

            if (removePosition !== action_module.ACTION_NONE) {
                actionString += _positionsMapping[removePosition];
            }

            return actionString;
        }

        function _buildStateFromString(stateString) {
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

            var playerToMove = _myTurn ? playerStringPlayerCheckerMapping[_player] : playerStringPlayerCheckerMapping[_otherPlayer];
            _myTurn = !_myTurn;

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
            var board = new Array(state_module.BOARD_SIZE);
            for (var i = 0; i < 24; i++) {
                var positionState = boardString.charAt(i);
                board[i + 1] = _playerMappings[positionState];
            }

            return board;
        }
    }

    return Client;
})();

module.exports = {
    Client: Client,
    PROTOCOL_MSG_PLAYER_WHITE: PROTOCOL_MSG_PLAYER_WHITE,
    PROTOCOL_MSG_PLAYER_BLACK: PROTOCOL_MSG_PLAYER_BLACK
};
