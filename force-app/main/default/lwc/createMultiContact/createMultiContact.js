import { LightningElement, track } from 'lwc';
import saveContacts from '@salesforce/apex/ContactController.saveContacts';
import getContacts from '@salesforce/apex/ContactController.getContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class CreateMultiContact extends NavigationMixin(LightningElement) {

    // Shuru me ek khali contact form rakha
    @track contactList = [
        { FirstName: '', LastName: '', Email: '', Phone: '' }
    ];

    @track createdContacts = [];
    // DataTable ke liye columns ka list
    columns = [
        { label: 'First Name', fieldName: 'FirstName', type: 'text',length: 15},
        { label: 'Last Name', fieldName: 'LastName', type: 'text', length: 15},
        { label: 'Email', fieldName: 'Email', type: 'Email'},
        { label: 'Phone', fieldName: 'Phone', type: 'Phone',length: 10}
    ];

    // Agar createdContacts me koi data hai to true return karega
    get hasCreatedContacts() {
        return this.createdContacts.length > 0;
    }

    // Naya contact form add kare
    addContactForm() {
        let newContact = { FirstName: '', LastName: '', Email: '', Phone: '' };
        this.contactList.push(newContact);
    }

    // Contact form remove kare
    removeContactForm(event) {
        let index = event.currentTarget.dataset.index;
        this.contactList.splice(index, 1);
    }

    // Input box ka value update kare
    handleInputChange(event) {
        let index = event.target.dataset.index;   // kaun sa form
        let field = event.target.name;            // kaun sa field (FirstName, Email, etc.)
        let value = event.target.value;           // value jo user ne type ki

        this.contactList[index][field] = value;   // update field
    }

    // Save button par click hone par
    saveContactsHandler() {
        // Sare input fields valid hai ya nahi check karna
        let allValid = true;
        this.template.querySelectorAll('lightning-input').forEach(input => {
            if (!input.reportValidity()) {
                allValid = false;
            }
        });

        // Agar valid nahi to yahi stop
        if (!allValid) {
            return;
        }

        // Apex ko call karke data save karna
        saveContacts({ contactsToInsert: this.contactList })
            .then(result => {
                // Result ko store karna
                this.createdContacts = result;

                // Success message dikhana
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: result.length + ' contact(s) created successfully.',
                        variant: 'success'
                    })
                );

                // Form reset karna
                this.contactList = [{ FirstName: '', LastName: '', Email: '', Phone: '' }];
            })
            .catch(error => {
                // Error message dikhana
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating contacts',
                        message: error.body ? error.body.message : 'Unknown error',
                        variant: 'error'
                    })
                );
            });
        
        getContacts({ contactsToUpdate: this.createdContacts})
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Contacts updated successfully.',
                        variant: 'success'
                    })
                );
            }
            )
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating contacts',
                        message: error.body ? error.body.message : 'Unknown error',
                        variant: 'error'
                    })
                );
            }
        );

    }
}
