public with sharing class ContactController {
    @AuraEnabled
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
}
