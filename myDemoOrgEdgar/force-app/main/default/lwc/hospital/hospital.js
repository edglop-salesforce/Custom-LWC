import { LightningElement, wire, track } from 'lwc';
import getHospitalData from '@salesforce/apex/HospitalMapController.getHospitalData';
import { NavigationMixin } from 'lightning/navigation';
import IconB from "@salesforce/resourceUrl/IconB";
import IconC from "@salesforce/resourceUrl/IconC";
import IconR from "@salesforce/resourceUrl/IconR";
import IconBR from "@salesforce/resourceUrl/IconBR";


const HOSPITAL_ABC = 'Hospital ABC';
const HOSPITAL_SAGRADO = 'Hospital Sagrado';

export default class Hospital extends NavigationMixin(LightningElement) {
    @track activeIndex = 0;
    @wire(getHospitalData)
    hospitalData;
    selectedHospital = HOSPITAL_ABC;

    Berço = IconB;
    Cama = IconC;
    Reservado = IconR;

    get hospitalOptions() {
        return [
            { label: HOSPITAL_ABC, value: HOSPITAL_ABC },
            { label: HOSPITAL_SAGRADO, value: HOSPITAL_SAGRADO },
        ];
    }

    handleHospitalSelection(event) {
        this.selectedHospital = event.detail.value;
        //If one wants to use a different record than ABC update this function and the Apex controller
    }

    handleOpenLeitoRecord(event) {
        const bedId = event.currentTarget.dataset.bedId;
        console.log('Open Bed Record ID');
        console.log(bedId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: bedId,
                actionName: 'view',
            },
        });
    }

    get bedClass(){
        console.log('COLOR');
        console.log(this.activeIndex);
        const beds = this.hospitalData.data.floors.flatMap(floor => floor.rooms.flatMap(room => room.beds));

        if (this.activeIndex >= 0 && this.activeIndex < beds.length) {
            const bed = beds[this.activeIndex];
            this.activeIndex = this.activeIndex + 1;
            console.log('Current Bed Name:', bed.leito.Name);
            switch (bed.statusLabel) {
                case 'Livre':
                    return 'available';
                case 'Ocupado':
                    return 'occupied';
                case 'Em Manutenção':
                    return 'maintenance';
                case 'Reservado':
                    return 'reserved';
                case 'Em Higienização':
                    return 'cleaning';
        }
        return 'available';
        }
    }

    iconsFunction(icons) {
        const randomIndex = Math.floor(Math.random() * icons.length);
        return icons[randomIndex];
    }

    get iconSRC1() {
        const icons = [IconB, IconC];
        return this.iconsFunction(icons);
    }

    get iconSRC2() {
        const icons = [IconR, IconBR];
        return this.iconsFunction(icons);
    }

}
