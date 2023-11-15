import { LightningElement, track } from 'lwc';

import { loadScript } from 'c/resourceLoader';
import SOCKET_IO_JS from '@salesforce/resourceUrl/SocketJS';
import WEBSOCKET_SERVER_URL from '@salesforce/label/c.Websocket_server_Url';

export default class ClientPageWCQuiz extends LightningElement {

    @track testName = "Test your general knowledge";

    //initialize it to true
    @track isShowWaitingtextSec = true;

    @track isShowClientForm = true;
    @track personObj;

    _socketIoInitialized = false;
    _socket;
    @track wsError;
    @track serverTime;

    @track newUserErrorText = "";


    @track questionTimeText = "";
    @track questionSeconds = 0;
    @track questionMilSeconds = 0;
    @track questionOriginalTime;

    @track currentQuestionObj;
    @track currentOptionsArr = [];
    @track leaderBoardList;
    @track selectedOptionsDivArr;

    @track intervalTimer;
    @track isAnswerSubmitted = false;


    rulesArr = [
      "The score calculation will be based on the correct answer as well as how quickly you have submitted it.",
      "Please do not refresh or exit the browser once a quiz has been started."
    ]


    connectedCallback()
    {
      // stop refresh page starts
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
      // stop refresh page ends
    }

    disconnectedCallback()
    {
      // stop refresh page starts
      window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
      // stop refresh page ends
    }

    renderedCallback()
    {
      
      

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
          console.error('loadScript error', error);
          this.wsError = 'Error loading socket.io';
        });
    }


    handleBeforeUnload(event) {
      // Your code to execute before the page is unloaded
      // For example, you can show a confirmation message
      const confirmationMessage = 'Are you sure you want to leave?';
      event.returnValue = confirmationMessage; // Standard for most browsers
      return confirmationMessage; // For some older browsers
    }

    // createOptionsArr(obj)
    // {
    //     let curObj = {
    //         name : 
    //     }
    // }


    

    initSocketIo(){
        this._socket = io.connect(WEBSOCKET_SERVER_URL);
        //this._socket = io.connect("ws://localhost:8282");
        if(this._socket != undefined)
        {
          this._socket.on("time", (timeString)=>
          {
              this.serverTime = timeString;
              //console.log(timeString);
          })

          this._socket.on("new-user-error" , (data)=>
          {
            this.newUserErrorText = data.message;
          })

          this._socket.on("new-user-proceed" , (data)=>{
            //here if a user joins successfully then we will show waiting screen
            console.log("New user can now proceed");
            if(this.personObj != undefined)
            {
              if(data.data.clientId === this.personObj.clientId)
              {
                this.isShowClientForm = false;
              }
            }
            
            
          })

          

          this._socket.on("quiz-start-bool", (data)=>
          {
            //data can be true/ false
            this.isShowWaitingtextSec = data;
            console.log("Quiz has been started")
          })

          this._socket.on("get-time" , (time)=>
          {
            // here we have to start progress bar for remaining time
            console.log("Time from server: " + JSON.parse(JSON.stringify(time)))
            this.questionTimeText = "";
            this.questionSeconds = 0;
            this.questionMilSeconds = 0;
            this.questionOriginalTime = time;
            this.startQuestionTimer(time);
          })

          this._socket.on("get-current-question" , (question)=>
          {
            this.isAnswerSubmitted = false;
            console.log(JSON.parse(JSON.stringify(question)))
            this.currentQuestionObj = question;

            //emptying optionsArr
            this.currentOptionsArr.length = 0;

            //remove css className from clicked options
            if(this.selectedOptionsDivArr != undefined)
            {
              for(let i=0; i<this.selectedOptionsDivArr.length; i++)
              {
                this.selectedOptionsDivArr[i].classList.remove("optionsWrapperDivNotavail");
                this.selectedOptionsDivArr[i].classList.remove("optionsWrapperDivClicked");
              }
            }
            if(question != undefined)
            {
              this.currentOptionsArr.push(question.Option_A__c)
              this.currentOptionsArr.push(question.Option_B__c)
              this.currentOptionsArr.push(question.Option_C__c)
              this.currentOptionsArr.push(question.Option_D__c)
            }
          })
        }

        this._socket.on("get-user", (data)=>
        {
           
            this.leaderBoardList = data
            console.log(data)
        })
      
        // ADDITIONAL SOCKET EVENT HANDLING WILL GO HERE
    }

    


    startQuestionTimer(time)
    {
        let sec = 0;
        let milSec = 0;

        this.intervalTimer = setInterval(() => {
            milSec++;
            this.questionMilSeconds++;
            if(sec >= time)
            {
                milSec = 0;
                clearInterval(this.intervalTimer);
            }
            if(milSec > 99)
            {
                sec++;
                milSec = 0;
            }
            this.questionSeconds = sec;

            this.questionTimeText = sec + ":" + milSec;
        }, 10);
    }

    getCurrentTime = () => {
        return new Date().getTime();
    };

    get getWaitingCount()
    {
      return this.leaderBoardList ? this.leaderBoardList.length : 0;
    }

    get getCompletedPercentage()
    {
        return (this.questionMilSeconds/(this.questionOriginalTime * 10)) * 10;
    }

    getCompletedPercentage()
    {
        return (this.questionMilSeconds/(this.questionOriginalTime * 10)) * 10;
    }

    get getProgressBarWidth()
    {
        return "width:" + this.getCompletedPercentage() + "%";
    }

    handleClientSubmitBtn(event)
    {
        
        this.personObj = event.detail.data;
        if(this._socket != undefined)
        {
            this._socket.emit("new-user", this.personObj);
        }
        console.log(JSON.parse(JSON.stringify(event.detail.data)));
    }


    handleOptionClick(event)
    {
      this.selectedOptionsDivArr = this.template.querySelectorAll(".optionsDiv");
      if(this.isAnswerSubmitted)
      {
        // make options non-clickable
        if(this.selectedOptionsDivArr != undefined)
        {
          for(let i=0; i<this.selectedOptionsDivArr.length; i++)
          {
            this.selectedOptionsDivArr[i].classList.add("optionsWrapperDivNotavail");
          }
        }
      }
      else
      {
        // make options clickable

        let current = event.target.innerHTML;
        if(this.selectedOptionsDivArr != undefined)
        {
          //ws data communication
          let dataObj = {
            answer : current,
            time : this.getCurrentTime(),
            personObj : this.personObj
          }
          this._socket.emit("set-answer" , dataObj);
          //ws data communication

          //makes options non-clickable
          this.isAnswerSubmitted = true;
          if(this.intervalTimer != undefined)
          {
            //stops the progressbar
            clearInterval(this.intervalTimer);
          }
          
          //handles color and behavior of clicked option
          for(let i=0; i<this.selectedOptionsDivArr.length; i++)
          {
            let selected = this.selectedOptionsDivArr[i].innerText;
            console.log("Selected " + selected + " Current " + current);
            if(selected === current)
            {
              this.selectedOptionsDivArr[i].classList.add("optionsWrapperDivClicked");
            }
            else
            {
              this.selectedOptionsDivArr[i].classList.remove("optionsWrapperDivClicked");
            }
            
          }
          
          if(this.isAnswerSubmitted)
          {
            // make options non-clickable
            if(this.selectedOptionsDivArr != undefined)
            {
              for(let i=0; i<this.selectedOptionsDivArr.length; i++)
              {
                this.selectedOptionsDivArr[i].classList.add("optionsWrapperDivNotavail");
              }
            }
          }
        }
      }
      
    }
}