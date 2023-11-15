public with sharing class WSQuizTestController {
    
    @AuraEnabled(cacheable=true)
    public static List<WSQuizTest__c> getTestData(){
        try {
            return [SELECT Id, Name, TestName__c FROM WSQuizTest__c];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}