// Inside the LWC JavaScript file
import { LightningElement, track } from 'lwc';
import generateAnswers from '@salesforce/apex/EinsteinLLMController.generateAnswers';

export default class RFPsolver_LWC extends LightningElement {
    questions = [];
    answers = [];
    @track uploadMessage = '';
    @track data = [];
    trimPhrase = "Salesforce concise answer (dont mention you are an AI and dont repeat the question, try to use exact values when possible)";
    @track columns = [
        { label: 'Question', fieldName: 'question', type: 'text' },
        { label: 'Answer', fieldName: 'answer', type: 'text' }
    ];

    handleFileChange(event) {
        console.log('File entered');
        const file = event.target.files[0];
        if (file) {
            console.log('File existe');
            this.uploadMessage = 'File uploaded successfully.';
            this.readCSVFile(file);
        }
    }

    readCSVFile(file) {
        const reader = new FileReader();

        reader.onload = () => {
            console.log('File leyendo');
            const content = reader.result;
            console.log(content);
            this.processCSVContent(content);
        };

        reader.readAsText(file);
    }

    processCSVContent(content) {
        console.log('Procesando');
        this.extractQuestionsFromCSV(content);

        console.log('Questions');
        console.log(this.questions);
        this.callApexMethod();
    }

    extractQuestionsFromCSV(content) {
        console.log('Extracting Questions');
        const lines = content.split('\n');
        console.log(lines);

        const size = lines.length; // Use lines.length instead of Object.keys(lines).length
        console.log('Size:', size);


        for (let i = 0; i < size; i++) {
            const questionMap = this.trimPhrase + lines[i].trim();
            console.log('Question Map:', questionMap);
            this.questions.push(questionMap);
        }

    }

    callApexMethod() {
        generateAnswers({ questions: this.questions })
            .then(result => {
                // Handle the result, update UI, etc.
                this.answers = result;
                console.log(this.answers);
            })
            .catch(error => {
                console.error('Error calling Apex method:', error);
            });
    }

    generateAndCopyTable() {
        // Assuming this.questions and this.answers are arrays
        this.generateTable();

        const table = this.template.querySelector('table');
        const range = document.createRange();
        range.selectNode(table);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            document.execCommand('copy');
            console.log('Table copied to clipboard');
        } catch (error) {
            console.error('Unable to copy table to clipboard', error);
        } finally {
            // Clear the selection
            selection.removeAllRanges();
        }
    }

    generateTable() {
        console.log('Generating table...');
        try {
            this.data = this.questions.map((question, index) => ({
                id: index,
                question: question.replace(this.trimPhrase, '').trim(),
                answer: this.answers[index]
            }));
        } catch (error) {
            console.error('Unable to copy table to clipboard', error);
        }
        console.log('Table generated:', this.data);
    }

    copyAnswers() {
        const answersText = this.data.map(row => row.answer).join('\n');
        this.copyTextToClipboard(answersText);
    }

    copyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            console.log('Answers copied to clipboard');
        } catch (error) {
            console.error('Unable to copy answers to clipboard', error);
        } finally {
            document.body.removeChild(textArea);
        }
    }

}