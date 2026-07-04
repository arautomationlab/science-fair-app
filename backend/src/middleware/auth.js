const jwt = require('jsonwebtoken');

// General Authentication
function authenticate(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

// Student Authentication
function authenticateStudent(req, res, next) {
    authenticate(req, res, () => {
        if (req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Student only.'
            });
        }
        next();
    });
}

// Teacher Authentication
function authenticateTeacher(req, res, next) {
    authenticate(req, res, () => {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Teacher only.'
            });
        }
        next();
    });
}

// Admin Authentication
function authenticateAdmin(req, res, next) {
    authenticate(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }
        next();
    });
}

module.exports = { 
    authenticate, 
    authenticateStudent, 
    authenticateTeacher, 
    authenticateAdmin 
};