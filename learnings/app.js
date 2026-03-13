const express = require('express');
const app = express();
const port = 3001;
app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});
app.get('/response', (req, res) => {
    try{
        res.setHeader(
            'Content-Type', 'application/json'
        );
        res.status(200).json({key: 'value'})
        
    }
    catch(err){
        console.log(err, 'error')
        if(err){
           res.status(500).json({message : err})     
        }
    }
} )


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})