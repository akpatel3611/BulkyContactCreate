public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> saveContacts(List<Contact> contactsToInsert) {
        if (contactsToInsert == null || contactsToInsert.isEmpty()) {
            throw new AuraHandledException('No contacts to insert');
        }
        
        insert contactsToInsert;
        return [
            SELECT Id, FirstName, LastName, Email, Phone 
            FROM Contact 
            WHERE Id IN :contactsToInsert
        ];
    }
   @AuraEnabled (cacheable=true)
    public static List<Contact> getContacts(List<Contact> contactsToUpdate) {
        if (contactsToUpdate == null || contactsToUpdate.isEmpty()) {
            throw new AuraHandledException('No contacts to update');
        }
        // Assuming you want to return the contacts that were passed in
        return [
            SELECT Id, FirstName, LastName, Email, Phone 
            FROM Contact 
            WHERE Id IN :contactsToUpdate
        ];
    }
    
}