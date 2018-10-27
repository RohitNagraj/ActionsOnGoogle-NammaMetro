// Copyright 2018, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Import the Dialogflow module and response creation dependencies
// from the Actions on Google client library.
const {
  dialogflow,
  BasicCard,
  Permission,
  Suggestions,
  Carousel,
  Image,
} = require('actions-on-google');

var firebase = require("firebase");

require('dotenv').config();

var config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId
};

firebase.initializeApp(config);

var database = firebase.database();


function writeUserData(userId, name, email) {
  database.ref(userId).set({
    username: name,
    email: email,
  });
}


// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Define a mapping of fake color strings to basic card objects.



// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Welcome', (conv) => {
  const name = conv.user.storage.userName;
  if (!name) {
    // Asks the user's permission to know their name, for personalization.
    conv.ask(new Permission({
      context: 'Hi there, to get to know you better',
      permissions: 'NAME',
    }));
  } else {
    conv.ask(`Hi again, ${name}. What's your favorite color?`);
  }
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    // If the user denied our request, go ahead with the conversation.
    conv.ask(`OK, no problem, Where would you like to go today?`);
    //conv.ask(new Suggestions('Blue', 'Red', 'Green'));
  } else {
    // If the user accepted our request, store their name in
    // the 'conv.user.storage' object for future conversations.
    conv.user.storage.userName = conv.user.name.display;
    conv.ask(`Thanks, ${conv.user.storage.userName}. ` +
      `Where would you like to go today?`);
  }
});

// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
let destination;
let srcline;
let destline;
app.intent('Destination', (conv, {PurpleLine,GreenLine}) => {
  console.log("Destination: " + destination);
	if(PurpleLine != "undefined" || GreenLine!= "undefined"){
		    	if(PurpleLine){
		    		destination=PurpleLine;
		    		destline = "purple";
		    	}
		    	else
		    	{
		    		destination = GreenLine;
		    		destline = "green";
		    	}
          console.log("Destination: " + destination);

		    conv.ask(`<speak>Which is the closest metro station to you?</speak>`);
		    conv.ask(new Suggestions('MG Road', 'Majestic', 'Yeshwantpur'));
	      conv.ask(new Image({
    		  url :'http://english.bmrc.co.in/AllImages/Gallery/3a0f42Gallery.jpg',
    		  alt :'Metro trains map',
  		}))
	}
  else{
    console.log("Destination failed");
  }
});

let sourcename;
let price;
app.intent('Source',(conv,{PurpleLine,GreenLine})=>{
  
  if(PurpleLine != "undefined" || GreenLine!= "undefined"){
    if(PurpleLine){
      sourcename=PurpleLine;
      srcline = "purple";
    }

    else if(GreenLine){
      sourcename=GreenLine;
      srcline = "green";
    }

    if(destination == "Kempegowda Majestic"){
      destline = srcline;
    }

    if(sourcename == "Kempegowda Majestic"){
      srcline = destline;
    }

    console.log("Source: " + sourcename);

    database.ref().child(sourcename).child(destination).on("value", function (snapshot) {
    price = snapshot.val();
    });

		if(srcline == destline)
		{
		conv.close(`<speak>You can board a direct train from ${sourcename} to ${destination}. The cost will be ${price} Rupees. Enjoy your ride.</speak>`);
		}
		
		else
		{
			if(srcline == "green")
			{
				conv.close(`<speak>You will have to change to purple line at Kempegowda Majestic Station. The cost will be ${price} Rupees. Enjoy your ride</speak>`);
			}
			else{
				conv.close(`<speak>You will have to change to green line at Kempegowda Majestic Station. The cost will be ${price} Rupees. Enjoy your ride.</speak>`);
			}
		}
  }
  else{
    console.log("Source failed");
  }
});
// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);