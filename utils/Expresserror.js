class Expresserror extends Error {
    constructor(status, message) {
        super(message);          // pass message to Error
        this.status = status;    // Express expects "status"
    }
}

module.exports = Expresserror;  // ✅ export it
