require('dotenv').config();
const app = require('./app');
const log = console.log;
const PORT = process.env.PORT || 3456;

app.listen(PORT, (error) => {
    if (!error) {
        log(`Server running on ${PORT}`);
    }
    else {
        log(`Error occurred starting server -> ${error}`);
    }
});