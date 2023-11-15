import { LightningElement, track } from 'lwc';
import { loadScript } from 'c/resourceLoader';
import SOCKET_IO_JS from '@salesforce/resourceUrl/SocketJS';
import WEBSOCKET_SERVER_URL from '@salesforce/label/c.Websocket_server_Url';

export default class WebsocketTest extends LightningElement {
    _socketIoInitialized = false;
    _socket;
    //WEBSOCKET_SERVER_URL = WEBSOCKET_SERVER_URL;
    @track serverTime;

    renderedCallback(){
        if (this._socketIoInitialized) {
          return;
        }
        this._socketIoInitialized = true;
    
        Promise.all([
          loadScript(this, SOCKET_IO_JS),
        ])
        .then(() => {
          this.initSocketIo();
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error('loadScript error', error);
          this.error = 'Error loading socket.io';
        });
      }
    
      initSocketIo(){
          // eslint-disable-next-line no-undef
          //this._socket = io.connect(WEBSOCKET_SERVER_URL);
          this._socket = io.connect("ws://localhost:8282");
          if(this._socket != undefined)
          {
            this._socket.on("time", (timeString)=>
            {
                this.serverTime = timeString;
                console.log(timeString);
            })

            this._socket.on("hello" , (message) => 
            {
                console.log(message);
            })
          }
        
          // ADDITIONAL SOCKET EVENT HANDLING WILL GO HERE
      }
}