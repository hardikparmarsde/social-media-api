import jwt from "jsonwebtoken"

const auth = (req, res, next) => {
    
    try {
        const token = req.headers.authorization.split(" ")[1];
        let decodedData;

        decodedData = jwt.verify(token, 'instaAuth');
        req.userId = decodedData?.id;
        
        next();
    } catch (err) {

    }
}

export default auth;