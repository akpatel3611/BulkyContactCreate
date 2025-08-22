import { LightningElement, track } from 'lwc';
import saveContacts from '@salesforce/apex/ContactController.saveContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class CreateMultiContact extends NavigationMixin(LightningElement) {
    @track contactList = [{ FirstName: '', LastName: '', Email: '', Phone: '' }];
    @track createdContacts = [];
    @track draftContacts = [];
    @track isEditMode = false;

    // Table columns
    columns = [
        { label: 'Name', fieldName: 'recordLink', type: 'url', 
          typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' } },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' }
    ];

    // Add new contact form
    createEmptyContact() {
    return {
        FirstName: '',
        LastName: '',
        Email: '',
        Phone: ''
    };
}
addContactForm() {
    this.contactList = [...this.contactList, this.createEmptyContact()];
}


    removeContactForm(event) {
        let index = event.currentTarget.dataset.index;
        this.contactList.filter((_, i) => i !== index);
    }

    handleInputChange(event) {
        let index = event.target.dataset.index;
        let field = event.target.name; 
        this.contactList[index][field] = event.target.value;
    }

    // Save new contacts
    saveContactsHandler() {
        let allValid = true;
        this.template.querySelectorAll('lightning-input').forEach(input => {
            if (!input.reportValidity()) {
                allValid = false;
            }
        });
        if (!allValid) return;

        saveContacts({ contactsToInsert: this.contactList })
            .then(result => {
                this.createdContacts = result.map(rec => ({
                    ...rec,
                    recordLink: '/' + rec.Id,
                    Name: rec.FirstName + ' ' + rec.LastName
                }));

                this.showToast('Success', result.length + ' contact(s) created successfully.', 'success');
                this.contactList = [{ FirstName: '', LastName: '', Email: '', Phone: '' }];
            })
            .catch(error => this.showToast('Error', error.body ? error.body.message : 'Unknown error', 'error'));
    }

    // ------------------------------
    // EDIT MODE HANDLING
    // ------------------------------
    enableEditMode() {
        this.isEditMode = true;
        this.draftContacts = JSON.parse(JSON.stringify(this.createdContacts));
    }

    handleDraftChange(event) {
        let index = event.target.dataset.index;
        let field = event.target.name;
        this.draftContacts[index][field] = event.target.value;
    }

    saveEdits() {
        saveContacts({ contactsToInsert: this.draftContacts })
            .then(result => {
                this.createdContacts = result.map(rec => ({
                    ...rec,
                    recordLink: '/' + rec.Id,
                    Name: rec.FirstName + ' ' + rec.LastName
                }));

                this.showToast('Success', 'Contacts updated successfully.', 'success');
                this.isEditMode = false;
                this.draftContacts = [];
            })
            .catch(error => this.showToast('Error', error.body ? error.body.message : 'Unknown error', 'error'));
    }

    cancelEdits() {
        this.isEditMode = false;
        this.draftContacts = [];
        this.showToast('Info', 'Changes discarded.', 'info');
    }

    // Helper
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}