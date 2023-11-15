import { LightningElement, track, wire } from 'lwc';
import websocketQuizQRCode from '@salesforce/resourceUrl/websocketQuizQRCode';
import getQuestions from '@salesforce/apex/WCQuizQuestionsController.getQuestions';
import getTestData from '@salesforce/apex/WSQuizTestController.getTestData';

import { loadScript } from 'c/resourceLoader';
import SOCKET_IO_JS from '@salesforce/resourceUrl/SocketJS';
import WEBSOCKET_SERVER_URL from '@salesforce/label/c.Websocket_server_Url';

//import apexMethodName from '@salesforce/apex/namespace.classname.apexMethodReference';
// Example :- import TRAILHEAD_LOGO from '@salesforce/resourceUrl/trailhead_logo';'

export default class AdminPage extends LightningElement {


    //websocket setup
    _socketIoInitialized = false;
    _socket;
    @track wsError;
    @track serverTime;

    websocketQuizQRCodeImg = websocketQuizQRCode
    @track btnQuizText = "Start Quiz";
    @track questionsList;
    @track testsList;
    @track questionListError;
    @track testListError;
    @track currentQuestion;
    @track currentQueNumber = -1;
    @track questionNumForDisplay = 1;
    @track isShowCurrentQueSec = false;
    @track isShowCompleteSection = false;

    @track comboBoxValue;
    @track questionTimeText = "";
    @track questionSeconds = 0;
    @track questionMilSeconds = 0;
    @track questionOriginalTime;
    @track isEnableSubmit = true;

    @track leaderBoardList;

    // @track leaderBoardList = [
    //     {
    //         name: "Prashant",
    //         score: 100
    //     },
    //     {
    //         name: "Bhavesh",
    //         score: 96
    //     },
    //     {
    //         name: "Amit",
    //         score: 92
    //     },
    //     {
    //         name: "Rushab",
    //         score: 90
    //     },
    //     {
    //         name: "Harsh",
    //         score: 88
    //     },
    //     {
    //         name: "Ankan",
    //         score: 86
    //     },
    //     {
    //         name: "Abhishek",
    //         score: 85
    //     },
    //     {
    //         name: "Shrikant",
    //         score: 84
    //     },
    //     {
    //         name: "Nayan",
    //         score: 80
    //     }
        
    // ];

    /*
    @track currentParticipantList = [
        {
            name: "Prashant",
        },
        {
            name: "Bhavesh",
        },
        {
            name: "Amit",
        },
        {
            name: "Rushab",
        },
        {
            name: "Harsh",
        },
        {
            name: "Ankan",
        },
        {
            name: "Abhishek",
        },
        {
            name: "Shrikant",
        },
        {
            name: "Nayan",
        }
    ]
    */


    // get questions data from database
    // @wire (getQuestions)
    // getquestionsList({data, error})
    // {
    //     if(data) {
    //         this.questionsList = data;
    //         this.questionListError = undefined;
    //         console.log(JSON.parse(JSON.stringify(this.questionsList)));
    //     }else {
    //         this.questionsList =undefined;
    //         this.questionListError = error;
    //     }
    // }

    
    
    
    
    
    
    
    
    
    //
    
    
    
    
    // get tests data from database
    @wire(getTestData)
    getTestData({data, error})
    {
        if(data) {
            this.testsList = data;
            this.testListError = undefined;
            console.log(JSON.parse(JSON.stringify(this.testsList)));
        }else {
            this.testsList = undefined;
            this.testListError = error;
        }
    }

    // websocket setup starts

    
    //WEBSOCKET_SERVER_URL = WEBSOCKET_SERVER_URL;
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
          console.error('loadScript error', error);
          this.wsError = 'Error loading socket.io';
        });
      }
    
      initSocketIo(){
          this._socket = io.connect(WEBSOCKET_SERVER_URL);
          //this._socket = io.connect("ws://localhost:8282");
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

            this._socket.on("get-user", (data)=>
            {
                this.leaderBoardList = data
                console.log(data)
            })

            
        
            


            
          }
        
          // ADDITIONAL SOCKET EVENT HANDLING WILL GO HERE
      }

      // Websocket setup ends


    //combobox setup
    get optionsForTestsData() {

        if(this.testsList != undefined)
        {
            let newArrayForCombobox = [];
            for(let i=0; i<this.testsList.length; i++)
            {
                let obj = {
                    label : this.testsList[i].TestName__c,
                    value : this.testsList[i].TestName__c,
                }
                newArrayForCombobox.push(obj);
            }
            return newArrayForCombobox;
        }
    }

    handleComboboxChange(event)
    {
        this.comboBoxValue = event.detail.value;
        this.resetVariables();

        if(this.comboBoxValue != undefined)
        {
            getQuestions({testName : this.comboBoxValue})
            .then((data)=>
            {
                this.isShowCompleteSection = true;
                this.questionsList = data;
                this.questionListError = undefined;
                console.log(JSON.parse(JSON.stringify(this.questionsList)));
            })
            .catch((error)=>
            {
                this.questionsList = undefined;
                this.questionListError = error;
            })
        }

        
        
    }


    /**
     * Loading sec starts
     */
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

    resetVariables()
    {
        this.isShowCompleteSection = false;
        this.isShowCurrentQueSec = false;
        this.currentQueNumber = -1;
        this.btnQuizText = "Start quiz";
        this.questionsList = undefined;
        this.questionNumForDisplay = 1;
        if(this._socket !== undefined)
        {
            // this emit will reset all data from the node server
            this._socket.emit("reset-test", null);
        }
    }


    startQuestionTimer(time)
    {
        let sec = 0;
        let milSec = 0;

        let timer = setInterval(() => {
            milSec++;
            this.questionMilSeconds++;
            if(sec >= time)
            {
                milSec = 0;
                this.template.querySelector(".quizButton").classList.remove("quizButtonDisable");
                this.isEnableSubmit = true;
                clearInterval(timer);
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
    

    /**
     * Loading sec ends
     */


    



    get getCurrentQuestion()
    {
        if(this.questionsList != undefined && this.currentQueNumber <= this.questionsList.length-1)
        {
            return this.questionsList[this.currentQueNumber];
        }
        return undefined;
    }

    get questionNumber()
    {
        return this.questionNumForDisplay + this.currentQueNumber;
    }

    get isShowQuestionSection()
    {
        return !!this.questionsList && !!this.isShowCurrentQueSec
    }

    getCurrentTime = () => {
        return new Date().getTime();
    };


    handleNextBtnClick()
    {
        
        if(this.questionsList != undefined && this.isEnableSubmit)
        {
            this.isShowCurrentQueSec = true;
            if(this.currentQueNumber < this.questionsList.length-3)
            {
                this.btnQuizText = "Next Question";
                //this.currentQuestion = this.questionsList[this.currentQueNumber];
                this.currentQueNumber += 1;
                this.questionOriginalTime = this.questionsList[this.currentQueNumber].Time_in_seconds__c;
                this.questionMilSeconds = 0;
                this.startQuestionTimer(this.questionOriginalTime);
                this.template.querySelector(".quizButton").classList.add("quizButtonDisable");
                this.isEnableSubmit = false;

                if(this._socket != undefined)
                {
                    //send current question to the server for other clients
                    this.sendCurrentQuestionToWS();
                }
                
            }
            else if(this.currentQueNumber < this.questionsList.length-2)
            {
                this.btnQuizText = "Last Question";
                this.currentQueNumber += 1;
                this.questionOriginalTime = this.questionsList[this.currentQueNumber].Time_in_seconds__c;
                this.questionMilSeconds = 0;
                this.startQuestionTimer(this.questionOriginalTime);
                this.template.querySelector(".quizButton").classList.add("quizButtonDisable");
                this.isEnableSubmit = false;

                if(this._socket != undefined)
                {
                    //send current question to the server for other clients
                    this.sendCurrentQuestionToWS();
                }
                
            }
            else if(this.currentQueNumber < this.questionsList.length-1)
            {
                this.btnQuizText = "End Quiz";
                this.currentQueNumber += 1;
                this.questionOriginalTime = this.questionsList[this.currentQueNumber].Time_in_seconds__c;
                this.questionMilSeconds = 0;
                this.startQuestionTimer(this.questionOriginalTime);
                this.template.querySelector(".quizButton").classList.add("quizButtonDisable");
                this.isEnableSubmit = false;

                if(this._socket != undefined)
                {
                    //send current question to the server for other clients
                    this.sendCurrentQuestionToWS();
                }
            }
            else
            {
                console.log("Questions ended!")
            }


            
            
            
        }

        
    }

    sendCurrentQuestionToWS()
    {
        if(this.questionsList != undefined && this.currentQueNumber <= this.questionsList.length-1)
        {
            // to start the quiz or not
            // here we have to send false
            this._socket.emit("isQuiz-start" , false);

            //send data to the server
            this._socket.emit("current-question", this.questionsList[this.currentQueNumber]);

            // get data from the server
            this._socket.on("user-connected", (message)=>
            {
                console.log(message);
            })

            let startTimeObj = 
            {
                questionOriginalTime : this.questionOriginalTime,
                questionStartTime : this.getCurrentTime()
            }
            this._socket.emit("set-time" , startTimeObj);
        }
    }



    //001f53 Dark blue(Navy blue)
    //03615b green color
}