/**
 * @description       :
 * @author            : edgar.lopez@salesforce.com
 * @group             :
 * @last modified on  : 02-10-2024
 * @last modified by  : edgar.lopez@salesforce.com
**/
public with sharing class HospitalMapController {

    @AuraEnabled(cacheable=true)
    public static HospitalDataWrapper getHospitalData() {
        Hospital__c hospital = [SELECT Id, Name FROM Hospital__c WHERE Name = 'ABC' LIMIT 1];

        // Check if the hospital exists
        if (hospital == null) {
            return null;
        }

        List<Andar__c> floors = [SELECT Id, Name FROM Andar__c WHERE Hospital__c = :hospital.Id];
        List<AndarWithRooms> andares = new List<AndarWithRooms>();

        // Query Quarto__c records and Leito__c records
        List<QuartoWithBeds> quartosComLeitos = new List<QuartoWithBeds>();
        for (Quarto__c quarto : [SELECT Id, Name, Andar__c FROM Quarto__c WHERE Andar__c IN :floors]) {
            List<LeitoWithColor> leitos = getLeitosWithColor(quarto.Id);
            quartosComLeitos.add(new QuartoWithBeds(quarto, leitos));
        }

        // Populate AndarWithRooms list
        for (Andar__c andar : floors) {
            List<QuartoWithBeds> quartosNoAndar = new List<QuartoWithBeds>();
            for (QuartoWithBeds quartoComLeitos : quartosComLeitos) {
                if (quartoComLeitos.quarto.Andar__c == andar.Id) {
                    quartosNoAndar.add(quartoComLeitos);
                }
            }
            andares.add(new AndarWithRooms(andar, quartosNoAndar));
        }

        // Return the related objects as part of the wrapper class
        return new HospitalDataWrapper(andares);
    }

    // Helper method to get LeitoWithColor list for a Quarto
    private static List<LeitoWithColor> getLeitosWithColor(Id quartoId) {
        List<LeitoWithColor> leitosWithColor = new List<LeitoWithColor>();
        List<Leito__c> leitos = [SELECT Id, Name, Quarto__c, Status__c, Color__c FROM Leito__c WHERE Quarto__c = :quartoId];

        for (Leito__c leito : leitos) {
            String statusLabel = getPicklistLabel('Leito__c', 'Status__c', leito.Status__c);
            leitosWithColor.add(new LeitoWithColor(leito, statusLabel));
        }

        return leitosWithColor;
    }

    // Helper method to get picklist label
    private static String getPicklistLabel(String objectApiName, String fieldApiName, String picklistValue) {
        Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap().get(fieldApiName).getDescribe();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();

        for (Schema.PicklistEntry picklistEntry : picklistValues) {
            if (picklistEntry.getValue().equals(picklistValue)) {
                return picklistEntry.getLabel();
            }
        }

        return null;
    }

    // Wrapper class for data structure
    public class HospitalDataWrapper {
        @AuraEnabled public List<AndarWithRooms> floors;

        public HospitalDataWrapper(List<AndarWithRooms> floors) {
            this.floors = floors;
        }
    }

    // Inner class to represent Andar__c records with associated rooms
    public class AndarWithRooms {
        @AuraEnabled public Andar__c andar;
        @AuraEnabled public List<QuartoWithBeds> rooms;

        public AndarWithRooms(Andar__c andar, List<QuartoWithBeds> rooms) {
            this.andar = andar;
            this.rooms = rooms;
        }
    }

    // Inner class to represent Quarto__c records with associated beds
    public class QuartoWithBeds {
        @AuraEnabled public Quarto__c quarto;
        @AuraEnabled public List<LeitoWithColor> beds;

        public QuartoWithBeds(Quarto__c quarto, List<LeitoWithColor> beds) {
            this.quarto = quarto;
            this.beds = beds;
        }
    }

    // Inner class to represent Leito__c records with associated color
    public class LeitoWithColor {
        @AuraEnabled public Leito__c leito;
        @AuraEnabled public String statusLabel;

        public LeitoWithColor(Leito__c leito, String statusLabel) {
            this.leito = leito;
            this.statusLabel = statusLabel;
        }
    }
}
