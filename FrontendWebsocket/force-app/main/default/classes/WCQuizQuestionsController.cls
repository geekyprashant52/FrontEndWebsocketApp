public with sharing class WCQuizQuestionsController {

    @AuraEnabled
    public static List<WSQuizQuestion__c> getQuestions(String testName)
    {
        try {
            return [SELECT Id, Name, Question__c, Option_A__c, 
                    Option_B__c, Option_C__c, Option_D__c, WSQuizTest__c, 
                    WSQuizTest__r.TestName__c, Answer__c, Answer_Text__c, Time_in_seconds__c
                    FROM WSQuizQuestion__c WHERE WSQuizTest__r.TestName__c = :testName];
        }  catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
    }
}