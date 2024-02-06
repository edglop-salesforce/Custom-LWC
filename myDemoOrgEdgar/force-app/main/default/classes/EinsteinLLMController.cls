/**
 * @description       :
 * @author            : edgar.lopez@salesforce.com
 * @group             :
 * @last modified on  : 02-01-2024
 * @last modified by  : edgar.lopez@salesforce.com
**/
public class EinsteinLLMController {
    @AuraEnabled
    public static List<String> generateAnswers(List<String> questions) {
        List<String> answers = new List<String>();
        ConnectApi.EinsteinLlmGenerationsInput generationsInput = new ConnectApi.EinsteinLlmGenerationsInput();

        System.debug('Class called');
        System.debug(questions);
        for (String question : questions) {
            generationsInput.promptTextorId = question;
            ConnectApi.EinsteinLLMGenerationsOutput generationsOutput = ConnectApi.EinsteinLLM.generateMessages(generationsInput);
            ConnectApi.EinsteinLLMGenerationItemOutput response = generationsOutput.generations[0];
            System.debug(generationsOutput);
            answers.add(response.text);
            System.debug(response.text);
            //aprox call limit 100 per hour
            //answers.add(question + 'fake answer aijiosjaoijsiosjdo isjadio jsaiodj saio jdoasidj saoijdsaoi dji oasjdoiasj doijsa oidjsaoi djioas jdiosajdoijsadoi jsaoid jsaoidj oisaj doiasjdoi sajdoiasj doijasoidj asoi djaosij doiasj doias jdoiasjd oisajd oas ß');
        }

        System.debug(answers);

        return answers;
    }
}