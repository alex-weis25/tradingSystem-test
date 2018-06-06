1. Setup Instructions

Start off with the usual:

`npm install`

To run the data-streaming service, run the following command:

`npm run start-streamer`

This will start up the streaming service on port 3030. Build the UI, and start it up with:

`npm run build`
`npm run start-prod`

The web application will then be available at http://localhost:8080
The core of the application is in the src/ folder (this is the only place you should need to make changes in). The front-end main file is src/client.js

2. Notes on update
- I created a throttle function that takes in a variable throttleSpeed and a callback (onUpdateReceived) and uses a setTimeout to check how much time has elapsed since the last state change and component rendering.
- To capture the data trends, I changed the 'rows' state value to an array of objects instead of just the most recent data feed. By doing so, I am able to store the current data received from the socket as well as the previous values for each cell. I also included logic to check whether or not there are current values on state or if state is empty, which has to do with my reconnect described below. To enhance the visualization of the data trends, I created two classes that represent if the previous value on state is greater than or less than the incoming value. The classes are then set on the individual cell and change the background color to match the direction (green = increasing values, red = decreasing values) of the values. One shortcoming of this approach is that the data set on state will not be the most recent value given the throttle delay. For example: if the data stream was 400 300 200 100 300 and state updated on the original 400 and final 300, the client would recieve a red updated cell even though the most recent change would be from 100 => 300, warranting a green cell. However, I think it makes more sense from the user's perspective to see color changes in accordance to the values displayed.
- When the server dies, there were two issues I had to address. First was making the client socket reconnect. I addressed this issue by passing in reconnection arguments to the initial socket declaration and creating a 'reconnected' listener that will make 50 attempts before it terminates. The second issue I needed to address was how to maintain my current state on reconnections and not lose the heat maps on the data tables. When the client reconnected, it would run the 'snapshot' event and resend data to my component. Upon receiving this data, I checked to see if state was empty (signifying a new connection) or if data already existed (signifying a reconnection) and set state appropriately.
