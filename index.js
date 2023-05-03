const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();


app.use(bodyParser.urlencoded({extended: true }));

const url = 'mongodb+srv://madhurmanekar:atlasuser01@nutri-poshan.t2pg1xv.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);

// Define a schema for the data
const InstituteSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    required: true
  },
  instituteEmail: {
    type: String,
    required: true
  },
  instituteAddress: {
    type: String,
    required: true
  },
  moderatorName: {
    type: String,
    required: true
  },
  moderatorEmail: {
    type: String,
    required: true
  },
  moderatorPhone: {
    type: String,
    required: true
  },
  loginPass: {
    type: String,
    required: true
  }
});

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.post('/signup', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('Nutri-Poshan').collection('registration');
    const result = await collection.insertOne(req.body);
    console.log(req.body);

    if (result && result.insertedId) {
      // res.status(200).send(`Inserted document with _id: ${result.insertedId}`);
      // res.status(200).redirect('./login.html'); // replace '/success' with your desired URL
      // alert(data.message);
     
      res.status(200).redirect('./login.html');// redirect to login page
      // res.status(200).json({ message: 'Signup Successful!' });
    } else {
      res.status(500).send('Error inserting document');
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting document');
  } finally {
    await client.close();
  }
});


app.post('/login', async (req, res) => {
  await client.connect();
  const db = client.db('Nutri-Poshan');
  const { username, password } = req.body;
  console.log(username);
  db.collection('registration').findOne({ "instituteName": username }, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else if (!user) {
      res.status(401).json({ success: false, message: 'Incorrect username or password' });
    } else {
      bcrypt.compare(password, user.loginPass, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'Internal server error' });
        } else if (!result) {
          res.status(401).json({ success: false, message: 'Incorrect username or password' });
        } else {
          res.status(200).json({ success: true, message: 'Login successful' });
        }
      });
    }
  });
});

// Start the server
  const server = app.listen(3000, () => {
    console.log(`Server started on port 3000`);
  });

// process.on('SIGINT', () => {
//   console.log('Received SIGTERM, shutting down server...');
//   server.close(() => {
//     console.log('Server has been shut down');
//     process.exit(0);
//   });
// });