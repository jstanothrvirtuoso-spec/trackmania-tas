const textDecoder = new TextDecoder('utf-8');

function decodeUtf8(bytes) {
	return textDecoder.decode(bytes);
}
class Vector3 {
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	scaled(factor) {
		return new Vector3(this.x * factor, this.y * factor, this.z * factor);
	}
}
class Quaternion {
	constructor(w = 1, x = 0, y = 0, z = 0) {
		this.w = w;
		this.x = x;
		this.y = y;
		this.z = z;
	}
}
class ByteReader {
	constructor(source) {
		if (source instanceof Uint8Array) {
			this.buffer = source;
			this.view = new DataView(source.buffer, source.byteOffset, source.byteLength);
		} else if (source instanceof ArrayBuffer) {
			this.buffer = new Uint8Array(source);
			this.view = new DataView(source);
		} else {
			throw new Error('ByteReader expects a Uint8Array or ArrayBuffer');
		}
		this._pos = 0;
		this.size = this.buffer.length;
		this.seenLoopback = false;
		this.storedStrings = [];
		this.currentInfo = {
			pos: -1,
			size: 0
		};
	}
	get pos() {
		return this._pos;
	}
	set pos(value) {
		this._pos = value;
	}
	readBytes(length) {
		const slice = this.buffer.subarray(this._pos, this._pos + length);
		this._pos += length;
		return slice;
	}
	readUint32() {
		const value = this.view.getUint32(this._pos, true);
		this._pos += 4;
		return value >>> 0;
	}
	readInt32() {
		const value = this.view.getInt32(this._pos, true);
		this._pos += 4;
		return value;
	}
	readUint16() {
		const value = this.view.getUint16(this._pos, true);
		this._pos += 2;
		return value;
	}
	readInt16() {
		const value = this.view.getInt16(this._pos, true);
		this._pos += 2;
		return value;
	}
	readFloat() {
		const value = this.view.getFloat32(this._pos, true);
		this._pos += 4;
		return value;
	}
	readString() {
		const length = this.readUint32();
		if (length === 0) {
			return '';
		}
		const bytes = this.readBytes(length);
		return decodeUtf8(bytes);
	}
	readByte() {
		const value = this.buffer[this._pos];
		this._pos += 1;
		return value;
	}
	skip(length) {
		this._pos += length;
	}
	pushInfo() {
		this.currentInfo = {
			pos: this._pos,
			size: 0
		};
	}
	popInfo() {
		const info = {
			pos: this.currentInfo.pos,
			size: this._pos - this.currentInfo.pos
		};
		this.currentInfo = {
			pos: -1,
			size: 0
		};
		return info;
	}
	readStringLookback() {
		if (!this.seenLoopback) {
			this.readUint32();
		}
		this.seenLoopback = true;
		const value = this.readUint32();
		let unsigned = value >>> 0;
		if ((unsigned & 0xc0000000) !== 0 && (unsigned & 0x3fffffff) === 0) {
			const s = this.readString();
			this.storedStrings.push(s);
			return s;
		}
		if (unsigned === 0) {
			const s = this.readString();
			this.storedStrings.push(s);
			return s;
		}
		if ((value | 0) === -1 || unsigned === 0xffffffff) {
			return '';
		}
		if ((unsigned & 0x3fffffff) === unsigned) {
			switch (unsigned) {
				case 11:
					return 'Valley';
				case 12:
					return 'Canyon';
				case 13:
					return 'Lagoon';
				case 17:
					return 'TMCommon';
				case 202:
					return 'Storm';
				case 299:
					return 'SMCommon';
				case 10003:
					return 'Common';
				default:
					break;
			}
		}
		unsigned &= 0x3fffffff;
		if (unsigned === 0 || unsigned > this.storedStrings.length) {
			return '';
		}
		return this.storedStrings[unsigned - 1];
	}
	readVec3() {
		return new Vector3(this.readFloat(), this.readFloat(), this.readFloat());
	}
	readVec3Unit2() {
		const axisHeading = this.readByte() * Math.PI / 127.0;
		const axisPitch = this.readByte() * (Math.PI / 2.0) / 127.0;
		const cosPitch = Math.cos(axisPitch);
		return new Vector3(
			Math.cos(axisHeading) * cosPitch,
			Math.sin(axisHeading) * cosPitch,
			Math.sin(axisPitch)
		);
	}
	readVec3Unit4() {
		const axisHeading = this.readInt16() * Math.PI / 32767.0;
		const axisPitch = this.readInt16() * (Math.PI / 2.0) / 32767.0;
		const cosPitch = Math.cos(axisPitch);
		return new Vector3(
			Math.cos(axisHeading) * cosPitch,
			Math.sin(axisHeading) * cosPitch,
			Math.sin(axisPitch)
		);
	}
	readVec3_4() {
		const mag16 = this.readInt16();
		const mag = mag16 === -32768 ? 0 : Math.exp(mag16 / 1000.0);
		const vec = this.readVec3Unit2();
		return vec.scaled(mag);
	}
	readQuat6() {
		const angle = this.readUint16() * Math.PI / 65535.0;
		const axis = this.readVec3Unit4();
		const sinAngle = Math.sin(angle);
		return new Quaternion(Math.cos(angle), axis.x * sinAngle, axis.y * sinAngle, axis.z * sinAngle);
	}
}
class ControlEntry {
	constructor(time, eventName, enabled, flags) {
		this.time = time;
		this.event_name = eventName;
		this.enabled = enabled;
		this.flags = flags;
	}
}
class CGameHeader {
	constructor(id) {
		this.id = id;
	}
}
class CGameReplayRecord extends CGameHeader {
	constructor(id) {
		super(id);
		this.track = null;
		this.nickname = null;
		this.driver_login = null;
	}
}
class CGameGhost extends CGameHeader {
	constructor(id) {
		super(id);
		this.records = [];
		this.saved_mobil_class_id = 0;
		this.is_fixed_time_step = false;
		this.U01 = 0;
		this.sample_period = null;
		this.version = 0;
	}
}
class CGameCtnGhost extends CGameGhost {
	constructor(id) {
		super(id);
		this.race_time = 0;
		this.num_respawns = 0;
		this.light_trail_color = new Vector3();
		this.stunts_score = 0;
		this.uid = null;
		this.login = null;
		this.cp_times = [];
		this.control_entries = [];
		this.game_version = '';
		this.control_names = [];
		this.events_duration = 0;
		this.exe_checksum = 0;
		this.os_kind = 0;
		this.cpu_kind = 0;
		this.race_settings_xml = null;
		this.is_maniaplanet = false;
	}
}
const GbxType = {
	CHALLENGE: 0x03043000,
	REPLAY_RECORD: 0x03093000,
	REPLAY_RECORD_OLD: 0x2407e000,
	CTN_GHOST: 0x03092000,
	CTN_GHOST_OLD: 0x2401b000,
	GAME_GHOST: 0x0303f005,
	UNKNOWN: 0x0
};
let cachedLzo = null;

function getLzo() {
	if (cachedLzo) {
		return cachedLzo;
	}
	if (typeof lzo1x !== 'undefined') {
		cachedLzo = lzo1x;
		return cachedLzo;
	}
	if (typeof require === 'function') {
		try {
			const mod = require('./lzo1x.js');
			if (mod && typeof mod.decompress === 'function') {
				cachedLzo = mod;
				return cachedLzo;
			}
			if (typeof globalThis !== 'undefined' && globalThis.lzo1x && typeof globalThis.lzo1x.decompress === 'function') {
				cachedLzo = globalThis.lzo1x;
				return cachedLzo;
			}
		} catch (err) {}
	}
	throw new Error('lzo1x decompressor is not available');
}
class Gbx {
	constructor(sourceBytes) {
		if (!(sourceBytes instanceof Uint8Array) && !(sourceBytes instanceof ArrayBuffer)) {
			throw new Error('Gbx expects raw bytes');
		}
		this.rootParser = new ByteReader(sourceBytes instanceof Uint8Array ? sourceBytes : new Uint8Array(sourceBytes));
		this.positions = {};
		this.classes = new Map();
		this.rootClasses = new Map();
		this.__current_waypoint = null;
		this.__replay_header_info = {};
		this.__community = null;
		const magic = decodeUtf8(this.rootParser.readBytes(3));
		if (magic !== 'GBX') {
			throw new Error('Not a GBX file');
		}
		this.version = this.rootParser.readUint16();
		this.rootParser.skip(3);
		if (this.version >= 4) {
			this.rootParser.skip(1);
		}
		if (this.version >= 3) {
			this.classId = this.rootParser.readUint32();
			this.type = Object.values(GbxType).includes(this.classId) ? this.classId : GbxType.UNKNOWN;
			if (this.version >= 6) {
				this._readUserData();
			}
			this.num_nodes = this.rootParser.readUint32();
		} else {
			this.classId = 0;
			this.num_nodes = 0;
		}
		this.num_external_nodes = this.rootParser.readUint32();
		if (this.num_external_nodes > 0) {
			this.rootParser.readUint32();
			this._readSubFolder();
			for (let node = 0; node < this.num_external_nodes; node += 1) {
				const flags = this.rootParser.readUint32();
				if ((flags & 4) === 0) {
					this.rootParser.readString();
				} else {
					this.rootParser.readUint32();
				}
				this.rootParser.skip(4);
				if (this.version >= 5) {
					this.rootParser.skip(4);
				}
				if ((flags & 4) === 0) {
					this.rootParser.skip(4);
				}
			}
		}
		this.rootParser.pushInfo();
		this.positions['data_size'] = this.rootParser.popInfo();
		const dataSize = this.rootParser.readUint32();
		const compressedDataSize = this.rootParser.readUint32();
		const compressedData = this.rootParser.readBytes(compressedDataSize);
		const state = {
			inputBuffer: compressedData
		};
		const lzo = getLzo();
		const status = lzo.decompress(state);
		if (status !== 0) {
			throw new Error('LZO decompression failed');
		}
		this.data = state.outputBuffer;
		this._chunkCache = new Map();
		const bp = new ByteReader(this.data);
		this._readNode(this.classId, -1, bp);
	}
	_readSubFolder() {
		const numSubFolders = this.rootParser.readUint32();
		for (let i = 0; i < numSubFolders; i += 1) {
			this.rootParser.readString();
			this._readSubFolder();
		}
	}
	_readUserData() {
		const entries = [];
		this.rootParser.pushInfo();
		this.user_data_size = this.rootParser.readUint32();
		this.positions['user_data_size'] = this.rootParser.popInfo();
		const userDataPos = this.rootParser.pos;
		const numChunks = this.rootParser.readUint32();
		for (let i = 0; i < numChunks; i += 1) {
			if (this.rootParser.pos >= this.rootParser.size - 1) {
				this.rootParser.pos = userDataPos + this.user_data_size;
				return;
			}
			const cid = this.rootParser.readUint32();
			this.rootParser.pushInfo();
			const size = this.rootParser.readUint32();
			this.positions[String(cid)] = this.rootParser.popInfo();
			entries.push({
				cid,
				size
			});
		}
		for (const entry of entries) {
			const startPos = this.rootParser.pos;
			this._readHeaderEntry(entry.cid, entry.size);
			const consumed = this.rootParser.pos - startPos;
			if (consumed < entry.size) {
				this.rootParser.skip(entry.size - consumed);
			}
		}
		this.rootParser.pos = userDataPos + this.user_data_size;
	}
	_readHeaderEntry(cid, size) {
		const startPos = this.rootParser.pos;
		if (cid === 0x03043002 || cid === 0x24003002) {
			const version = this.rootParser.readByte();
			if (version < 3) {
				for (let i = 0; i < 3; i += 1) {
					this.rootParser.readStringLookback();
				}
				this.rootParser.readString();
			}
			this.rootParser.skip(4);
			if (version >= 1) {
				this.rootParser.skip(16);
				if (version === 2) {
					this.rootParser.skip(4);
				}
				if (version >= 4) {
					this.rootParser.skip(4);
					if (version >= 5) {
						this.rootParser.skip(4);
						if (version === 6) {
							this.rootParser.skip(4);
						}
						if (version >= 7) {
							this.rootParser.readUint32();
							if (version >= 9) {
								this.rootParser.skip(4);
								if (version >= 10) {
									this.rootParser.skip(4);
									if (version >= 11) {
										this.rootParser.skip(4);
										if (version >= 12) {
											this.rootParser.skip(4);
											if (version >= 13) {
												this.rootParser.skip(8);
											}
										}
									}
								}
							}
						}
					}
				}
			}
		} else if (cid === 0x03043003 || cid === 0x24003003) {
			const pos = this.rootParser.pos;
			this.rootParser.readByte();
			for (let i = 0; i < 3; i += 1) {
				this.rootParser.readStringLookback();
			}
			const gameClass = {
				id: cid
			};
			this.rootParser.pushInfo();
			gameClass.track_name = this.rootParser.readString();
			this.positions['track_name'] = this.rootParser.popInfo();
			this.rootParser.readByte();
			this.rootClasses.set(cid, gameClass);
			this.rootParser.pos = pos + size;
			return;
		} else if (cid === 0x03043005 || cid === 0x24003005) {
			this.__community = this.rootParser.readString();
		} else if (cid === 0x03093000 || cid === 0x2403f000) {
			const version = this.rootParser.readUint32();
			this.__replay_header_info.version = version;
			if (version >= 2) {
				for (let i = 0; i < 3; i += 1) {
					this.rootParser.readStringLookback();
				}
				this.rootParser.skip(4);
				this.__replay_header_info.nickname = this.rootParser.readString();
				if (version >= 6) {
					this.__replay_header_info.driver_login = this.rootParser.readString();
					this.rootParser.skip(1);
					this.rootParser.readStringLookback();
				}
			}
		} else if (cid === 0x03093002 || cid === 0x2403f002) {
			this.rootParser.skip(8);
			for (let i = 0; i < 4; i += 1) {
				this.rootParser.readString();
			}
		} else {
			this.rootParser.skip(size);
			return;
		}
		const consumed = this.rootParser.pos - startPos;
		if (consumed < size) {
			this.rootParser.skip(size - consumed);
		}
	}
	_readNode(classId, depth, reader, add = true) {
		let gameClass;
		if (classId === GbxType.CTN_GHOST || classId === GbxType.CTN_GHOST_OLD) {
			gameClass = new CGameCtnGhost(classId);
		} else if (classId === GbxType.GAME_GHOST) {
			gameClass = new CGameGhost(classId);
		} else if (classId === GbxType.REPLAY_RECORD || classId === GbxType.REPLAY_RECORD_OLD) {
			gameClass = new CGameReplayRecord(classId);
			if (this.__replay_header_info.nickname) {
				gameClass.nickname = this.__replay_header_info.nickname;
			}
			if (this.__replay_header_info.driver_login) {
				gameClass.driver_login = this.__replay_header_info.driver_login;
			}
		} else {
			gameClass = new CGameHeader(classId);
		}
		if (add) {
			this.classes.set(depth, gameClass);
		}
		const SKIP_MAGIC = 0x534b4950;
		let cid = 0;
		let oldCid = 0;
		while (reader.pos < reader.size) {
			oldCid = cid;
			cid = reader.readUint32();
			if (cid === 0xfacade01) {
				break;
			}
			let skipSize = -1;
			const skip = reader.readInt32();
			if (skip === SKIP_MAGIC) {
				skipSize = reader.readUint32();
			} else {
				reader.pos -= 4;
			}
			if (cid === 0x03093002 || cid === 0x2403f002) {
				const mapSize = reader.readUint32();
				reader.readBytes(mapSize);
			} else if (cid === 0x03093007) {
				reader.skip(4);
			} else if (cid === 0x03093014 || cid === 0x2403f014) {
				reader.skip(4);
				const numGhosts = reader.readUint32();
				for (let i = 0; i < numGhosts; i += 1) {
					const idx = reader.readInt32();
					if (idx >= 0 && !this.classes.has(idx)) {
						const childClassId = reader.readUint32();
						this._readNode(childClassId, idx, reader);
					}
				}
				reader.skip(4);
			} else if (cid === 0x3093015) {
				const idx = reader.readInt32();
				if (idx >= 0 && !this.classes.has(idx)) {
					const childClassId = reader.readUint32();
					this._readNode(childClassId, idx, reader);
				}
			} else if (cid === 0x03092005 || cid === 0x2401b005) {
				gameClass.race_time = reader.readUint32();
			} else if (cid === 0x03092008 || cid === 0x2401b008) {
				gameClass.num_respawns = reader.readUint32();
			} else if (cid === 0x03092009 || cid === 0x2401b009) {
				gameClass.light_trail_color = reader.readVec3();
			} else if (cid === 0x0309200a || cid === 0x2401b00a) {
				gameClass.stunts_score = reader.readUint32();
			} else if (cid === 0x0309200b || cid === 0x2401b00b) {
				const num = reader.readUint32();
				const cpTimes = [];
				for (let i = 0; i < num; i += 1) {
					cpTimes.push(reader.readUint32());
					reader.skip(4);
				}
				gameClass.cp_times = cpTimes;
			} else if (cid === 0x309200c || cid === 0x2401b00c) {
				reader.skip(4);
			} else if (cid === 0x309200e || cid === 0x2401b00e) {
				gameClass.uid = reader.readStringLookback();
				if (this.__replay_header_info.version !== undefined && this.__replay_header_info.version >= 8) {
					const pos = reader.pos;
					try {
						gameClass.login = reader.readString();
					} catch (err) {
						reader.pos = pos;
					}
				}
			} else if (cid === 0x309200f || cid === 0x2401b00f) {
				gameClass.login = reader.readString();
			} else if (cid === 0x3092010 || cid === 0x2401b010) {
				reader.readStringLookback();
			} else if (cid === 0x3092012 || cid === 0x2401b012) {
				reader.skip(20);
			} else if (cid === 0x3092013 || cid === 0x2401b013) {
				reader.skip(8);
			} else if (cid === 0x3092014 || cid === 0x2401b014) {
				reader.skip(4);
			} else if (cid === 0x3092015 || cid === 0x2401b015) {
				reader.readStringLookback();
			} else if (cid === 0x3092018 || cid === 0x2401b018) {
				reader.readStringLookback();
				reader.readStringLookback();
				reader.readStringLookback();
			} else if (cid === 0x3092019 || cid === 0x03092025 || cid === 0x2401b019 || cid === 0x2401b011) {
				Gbx.readGhostEvents(gameClass, reader, cid);
			} else if (cid === 0x309201c) {
				reader.skip(32);
			} else if (cid === 0x03093004 || cid === 0x2403f004) {
				reader.skip(16);
			} else if (cid === 0x0303f005) {
				Gbx.readGhost(gameClass, reader);
			} else if (cid === 0x0303f006) {
				reader.skip(4);
				Gbx.readGhost(gameClass, reader);
			} else if (skipSize !== -1) {
				reader.skip(skipSize);
				cid = oldCid;
			} else {
				return;
			}
		}
	}
	getClassesByIds(classIds) {
		const matches = [];
		for (const value of this.classes.values()) {
			if (classIds.includes(value.id)) {
				matches.push(value);
			}
		}
		for (const value of this.rootClasses.values()) {
			if (classIds.includes(value.id)) {
				matches.push(value);
			}
		}
		return matches;
	}
	findRawChunkId(chunkId) {
		const key = chunkId >>> 0;
		if (!this._chunkCache) {
			this._chunkCache = new Map();
		}
		if (this._chunkCache.has(key)) {
			const cachedOffset = this._chunkCache.get(key);
			if (cachedOffset < 0) {
				return null;
			}
			return this._createChunkReader(cachedOffset + 4);
		}
		const offset = this._scanForChunk(key);
		this._chunkCache.set(key, offset);
		if (offset < 0) {
			return null;
		}
		return this._createChunkReader(offset + 4);
	}
	_createChunkReader(offset) {
		const reader = new ByteReader(this.data);
		reader.pos = offset;
		return reader;
	}
	_scanForChunk(chunkId) {
		const bytes = this.data;
		if (!bytes || bytes.length < 4) {
			return -1;
		}
		const limit = bytes.length - 4;
		const b0 = chunkId & 0xff;
		const b1 = (chunkId >>> 8) & 0xff;
		const b2 = (chunkId >>> 16) & 0xff;
		const b3 = (chunkId >>> 24) & 0xff;
		let index = bytes.indexOf(b0);
		while (index !== -1 && index <= limit) {
			if (bytes[index + 1] === b1 && bytes[index + 2] === b2 && bytes[index + 3] === b3) {
				return index;
			}
			index = bytes.indexOf(b0, index + 1);
		}
		return -1;
	}
	static readGhostEvents(gameClass, reader, cid) {
		if (cid === 0x03092025) {
			gameClass.is_maniaplanet = true;
			reader.skip(4);
		}
		gameClass.events_duration = reader.readUint32();
		if (gameClass.events_duration !== 0) {
			reader.skip(4);
			const numControlNames = reader.readUint32();
			gameClass.control_names = [];
			for (let i = 0; i < numControlNames; i += 1) {
				const name = reader.readStringLookback();
				if (name !== '') {
					gameClass.control_names.push(name);
				}
			}
			if (gameClass.control_names.length === 0) {
				return;
			}
			const numEntries = reader.readUint32();
			reader.skip(4);
			for (let i = 0; i < numEntries; i += 1) {
				const time = reader.readUint32() - 100000;
				const nameIndex = reader.readByte();
				const eventName = gameClass.control_names[nameIndex];
				const enabled = reader.readUint16();
				const flags = reader.readUint16();
				gameClass.control_entries.push(new ControlEntry(time, eventName, enabled, flags));
			}
			gameClass.game_version = reader.readString();
			gameClass.exe_checksum = reader.readUint32();
			gameClass.os_kind = reader.readUint32();
			gameClass.cpu_kind = reader.readUint32();
			gameClass.race_settings_xml = reader.readString();
			reader.skip(4);
		}
	}
}
Gbx.readGhost = function(gameClass, reader) {
	const uncompressedSize = reader.readUint32();
	const compressedSize = reader.readUint32();
	reader.skip(compressedSize);
};

function tryParseOldGhost(gbx) {
	const ghost = new CGameCtnGhost(0);
	const loginParser = gbx.findRawChunkId(0x2401b00f);
	if (loginParser) {
		ghost.login = loginParser.readString();
	}
	const eventsParser = gbx.findRawChunkId(0x2401b011);
	if (eventsParser) {
		eventsParser.seenLoopback = true;
		Gbx.readGhostEvents(ghost, eventsParser, 0x2401b011);
		return ghost;
	}
	return null;
}

function getEventTime(event) {
	if (event.event_name === 'Respawn') {
		let time = Math.floor(event.time / 10) * 10;
		if (event.time % 10 === 0) {
			time -= 10;
		}
		return time;
	}
	return Math.floor(event.time / 10) * 10 - 10;
}

function findEventEnd(entries, target, fromIndex) {
	for (let i = fromIndex; i < entries.length; i += 1) {
		const event = entries[i];
		if (event.event_name === target.event_name) {
			return event;
		}
	}
	return null;
}

function shouldSkipEvent(event) {
	if (event.event_name === 'AccelerateReal' || event.event_name === 'BrakeReal') {
		return event.flags !== 1;
	}
	if (event.event_name === 'Steer') {
		return false;
	}
	if (event.event_name.startsWith('_Fake')) {
		return true;
	}
	return event.enabled === 0;
}

function eventToAnalogValue(event) {
	let value = (event.flags << 16) | event.enabled;
	if ((value & (1 << 23)) !== 0) {
		value -= (1 << 24);
	}
	return -value;
}

function formatInputs(ghost, options) {
	const decimal = !!(options && options.decimal);
	const relative = !!(options && options.relative);
	const separate = !!(options && options.separate);
	let isIface = false;
	let invertAxis = false;
	for (const event of ghost.control_entries) {
		if (event.time % 10 === 5 && event.event_name === '_FakeIsRaceRunning') {
			isIface = true;
		}
		if (event.event_name === '_FakeDontInverseAxis') {
			invertAxis = true;
		}
	}
	if (isIface) {
		for (const event of ghost.control_entries) {
			event.time -= 0xffff;
		}
	}
	const finishTime = ghost.race_time === 0xffffffff ? -1 : Math.floor(ghost.race_time / 10) * 10;

	const events = [];
	for (let i = 0; i < ghost.control_entries.length; i += 1) {
		const event = ghost.control_entries[i];
		if (shouldSkipEvent(event)) {
			continue;
		}
		let toEvent = findEventEnd(ghost.control_entries, event, i + 1);
		let isUnbound = false;
		let toTime;
		if (toEvent) {
			toTime = getEventTime(toEvent);
		} else {
			toTime = ghost.race_time;
			isUnbound = toTime === 0xffffffff;
		}
		let fromTime = getEventTime(event);
		if (fromTime < 0) {
			fromTime = toTime >= 0 ? 0 : -1;
		}
		fromTime = Math.floor(fromTime / 10) * 10;
		toTime = !isUnbound ? Math.floor(toTime / 10) * 10 : -1;
		let key = 'up';
		if (event.event_name === 'Accelerate' || event.event_name === 'AccelerateReal') {
			key = 'up';
		} else if (event.event_name === 'SteerLeft') {
			key = 'left';
		} else if (event.event_name === 'SteerRight') {
			key = 'right';
		} else if (event.event_name === 'Brake' || event.event_name === 'BrakeReal') {
			key = 'down';
		} else if (event.event_name === 'Respawn') {
			events.push({
				type: 'press',
				time: fromTime,
				key: 'enter'
			});
			continue;
		} else if (event.event_name === 'Steer') {
			let axis = eventToAnalogValue(event);
			if (invertAxis) {
				axis = -axis;
			}
			events.push({
				type: 'analog',
				time: fromTime,
				action: 'steer',
				axis
			});
			continue;
		} else if (event.event_name === 'Gas') {
			let axis = eventToAnalogValue(event);
			if (invertAxis) {
				axis = -axis;
			}
			events.push({
				type: 'analog',
				time: fromTime,
				action: 'gas',
				axis
			});
			continue;
		} else if (event.event_name === 'Horn') {
			continue;
		}
		if (isUnbound || toTime < 0 || toTime === finishTime) {
			events.push({
				type: 'press',
				time: fromTime,
				key
			});
		} else if (separate || relative) {
			events.push({
				type: 'press',
				time: fromTime,
				key
			});
			events.push({
				type: 'rel',
				time: toTime,
				key
			});
		} else {
			events.push({
				type: 'press_range',
				start: fromTime,
				end: toTime,
				key
			});
		}
	}
	const eventTime = (e) => (e.type === 'press_range' ? e.start : e.time);
	events.sort((a, b) => eventTime(a) - eventTime(b));
	let previousTime = null;
	const lines = [];
	for (const event of events) {
		const currentTime = eventTime(event);
		if (currentTime === finishTime) {
			continue;
		}
		const delta = previousTime === null ? currentTime : currentTime - previousTime;
		const currentValue = decimal ? currentTime / 1000.0 : currentTime;
		const deltaValue = decimal ? delta / 1000.0 : delta;
		let timeStr;
		if (relative) {
			if (previousTime === null) {
				timeStr = decimal ? currentValue.toFixed(2) : String(currentValue);
			} else if (decimal) {
				timeStr = '+' + deltaValue.toFixed(2);
			} else {
				timeStr = '+' + String(deltaValue);
			}
		} else {
			timeStr = decimal ? currentValue.toFixed(2) : String(currentValue);
		}
		if (event.type === 'analog') {
			lines.push(timeStr + ' ' + event.action + ' ' + event.axis + '\n');
		} else if (event.type === 'press' || event.type === 'rel') {
			lines.push(timeStr + ' ' + event.type + ' ' + event.key + '\n');
		} else if (event.type === 'press_range') {
			const startVal = decimal ? (event.start / 1000.0).toFixed(2) : String(event.start);
			const endVal = decimal ? (event.end / 1000.0).toFixed(2) : String(event.end);
			lines.push(startVal + '-' + endVal + ' press ' + event.key + '\n');
		}
		previousTime = currentTime;
	}
	return lines.join('');
}

function extractInputsFromBytes(bytes, options = {}) {
	const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	const gbx = new Gbx(data);
	const ghosts = gbx.getClassesByIds([GbxType.CTN_GHOST, GbxType.CTN_GHOST_OLD]);
	let ghost = ghosts.length > 0 ? ghosts[0] : tryParseOldGhost(gbx);
	if (!ghost) {
		return '';
	}
	return formatInputs(ghost, options);
}
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		extractInputsFromBytes
	};
}
if (typeof window !== 'undefined') {
	window.extractInputsFromBytes = extractInputsFromBytes;
}
