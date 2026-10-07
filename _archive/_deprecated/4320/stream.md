const { Readable } = require('node:stream');
const controller = new AbortController();
const read = new Readable({
    read(size) {
        // ...
    },
    signal: controller.signal,
});
// Later, abort the operation closing the stream
controller.abort();
const { Readable } = require('node:stream');

class Counter extends Readable {
    constructor(opt) {
        super(opt);
        this._max = 1000000;
        this._index = 1;
    }

    _read() {
        const i = this._index++;
        if (i > this._max)
            this.push(null);
        else {
            const str = String(i);
            const buf = Buffer.from(str, 'ascii');
            this.push(buf);
        }
    }
}
// `_source` is an object with readStop() and readStart() methods,
// and an `ondata` member that gets called when it has data, and
// an `onend` member that gets called when the data is over.

class SourceWrapper extends Readable {
    constructor(options) {
        super(options);

        this._source = getLowLevelSourceObject();

        // Every time there's data, push it into the internal buffer.
        this._source.ondata = (chunk) => {
            // If push() returns false, then stop reading from source.
            if (!this.push(chunk))
                this._source.readStop();
        };

        // When the source ends, push the EOF-signaling `null` chunk.
        this._source.onend = () => {
            this.push(null);
        };
    }
    // _read() will be called when the stream wants to pull more data in.
    // The advisory size argument is ignored in this case.
    _read(size) {
        this._source.readStart();
    }
}

const { Readable } = require('node:stream');
const fs = require('node:fs');

class ReadStream extends Readable {
    constructor(filename) {
        super();
        this.filename = filename;
        this.fd = null;
    }
    _construct(callback) {
        fs.open(this.filename, (err, fd) => {
            if (err) {
                callback(err);
            } else {
                this.fd = fd;
                callback();
            }
        });
    }
    _read(n) {
        const buf = Buffer.alloc(n);
        fs.read(this.fd, buf, 0, n, null, (err, bytesRead) => {
            if (err) {
                this.destroy(err);
            } else {
                this.push(bytesRead > 0 ? buf.slice(0, bytesRead) : null);
            }
        });
    }
    _destroy(err, callback) {
        if (this.fd) {
            fs.close(this.fd, (er) => callback(er || err));
        } else {
            callback(err);
        }
    }
}
const { Duplex } = require('node:stream');
const kSource = Symbol('source');

class MyDuplex extends Duplex {
    constructor(source, options) {
        super(options);
        this[kSource] = source;
    }

    _write(chunk, encoding, callback) {
        // The underlying source only deals with strings.
        if (Buffer.isBuffer(chunk))
            chunk = chunk.toString();
        this[kSource].writeSomeData(chunk);
        callback();
    }

    _read(size) {
        this[kSource].fetchSomeData(size, (data, encoding) => {
            this.push(Buffer.from(data, encoding));
        });
    }
}
