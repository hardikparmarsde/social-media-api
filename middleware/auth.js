import jwt from "jsonwebtoken"

const auth = (req, res, next) => {
    
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: 'Unauthenticated' });
        let decodedData;

        decodedData = jwt.verify(token, 'instaAuth');
        req.userId = decodedData?.id;
        
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }
}

export default auth;