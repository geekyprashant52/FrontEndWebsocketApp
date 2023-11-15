import { LightningElement, track } from 'lwc';

export default class ClientPageForm extends LightningElement {

    @track btnQuizText = "Go to quiz page";
    @track welcomeText = "Welcome";
    
    @track clientName = "";
    @track clientPasscode = "adminPassCode";

    @track isShowErrorText = false;

    handleInputChange(event)
    {
        let targetName = event.target.name;
        if(targetName === "clientName")
        {
            this.clientName = event.target.value;
        }
        else if(targetName === "clientPasscode")
        {
            this.clientPasscode = event.target.value;
        }
    }

    getUniqueId()
    {
        const dateString = Date.now().toString(36);
        const randomness = Math.random().toString(36).substr(2);
        return dateString + randomness;
    };

    getCurrentTime = () => {
        return new Date().getTime();
    };

    handleNextBtnClick()
    {
        console.log("Btn clicked");
        let personObj = {
            name : this.clientName,
            passCode : this.clientPasscode,
            clientId : this.getUniqueId(),
            isOnline : true,
            isReady : false,
            time : this.getCurrentTime(),
            score : 0
        }
        let clientEvent = new CustomEvent("submit" , {
            detail:{
                data : personObj
            }
        })

        if(this.clientName.length > 0 && this.clientPasscode === "adminPassCode")
        {
            this.isShowErrorText = false;
            this.dispatchEvent(clientEvent);
        }
        else
        {
            this.isShowErrorText = true;
        }
    }

}