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

package it.jstar;


import java.io.IOException;
import java.net.UnknownHostException;

import it.unibo.ai.didattica.mulino.client.MulinoClient;
import it.unibo.ai.didattica.mulino.domain.State.Checker;

public class MulinoTCPClient extends MulinoClient {

	public MulinoTCPClient(Checker player) throws UnknownHostException, IOException {
		super(player);
	}

}
