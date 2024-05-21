"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/sigin', (req, res) => {
    res.send('worker signin');
});
exports.default = router;
