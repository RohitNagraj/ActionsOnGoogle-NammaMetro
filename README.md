# ActionsOnGoogle-NammaMetro
An Actions on Google app for the Google Assistant that helps you with travelling in Namma Metro by providing related information.

# Invocation
Any phrase coupled with 'Namma Metro' should invoke the app.

# Destination
The app first asks for the destination which the user needs to feed in.

# Source
The app then asks for the source stop which again is fed in by the user.

# Output
The app then calculates the price, and also tells the user if he/she has to change the line or whether they can board a direct train.

# Backend
A firebase database contains all the fairs that are displayed by the app.
The firebase api key lives in an .env file in the source directory.
