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


const ACTION_NONE = "-";

var Action = (function () {
    function Action(from, to, remove) {

        var fromPosition;
        var toPosition;
        var removePosition;


        init(from, to, remove);

        return {
            getFromPosition: getFromPosition,
            getToPosition: getToPosition,
            getRemovePosition: getRemovePosition,
            toString: toString,
            equals: equals
        }

        function init(from, to, remove) {
            fromPosition = from;
            toPosition = to;
            removePosition = remove;
        }

        function getFromPosition() {
            return fromPosition;
        }

        function getToPosition() {
            return toPosition;
        }

        function getRemovePosition() {
            return removePosition;
        }

        function equals(action) {
            return (action.getFromPosition.equals(fromPosition) && action.getToPosition.equals(toPosition) && action.getRemovePosition.equals(removePosition));
        }

        function toString() {
            var result = "";

            if (typeof(fromPosition) !== "undefined" && fromPosition !== ACTION_NONE) {
                result += "from: " + fromPosition + " ";
            }

            result += "to: " + toPosition + " ";

            if (typeof(removePosition) !== "undefined" && removePosition !== ACTION_NONE) {
                result += " removes: " + removePosition;
            }

            return result;
        }
    }

    return Action;
})();

module.exports = {
    ACTION_NONE: ACTION_NONE,
    Action: Action
};