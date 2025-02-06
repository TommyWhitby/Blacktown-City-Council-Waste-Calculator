// Constants and utility functions
const DEVELOPMENT_TYPES = {
    STANDARD_SINGLE: 'standard_single',
    MDH_7_OR_LESS: 'mdh_7_or_less',
    MDH_8_PLUS_LOOP: 'mdh_8_plus_loop',
    MDH_8_PLUS_NO_LOOP: 'mdh_8_plus_no_loop',
    RESIDENTIAL_FLAT: 'residential_flat',
    NEW_GEN_10_OR_LESS: 'new_gen_10_or_less',
    NEW_GEN_11_PLUS: 'new_gen_11_plus',
    TRAD_10_OR_LESS: 'trad_10_or_less',
    TRAD_11_PLUS: 'trad_11_plus'
};

const BIN_SIZES = {
    WASTE: [240, 1100],
    RECYCLING: [240],
    ORGANIC: [240]
};

class BaseCalculator {
    constructor() {
        this.calculatorNo = 0;
        this.numberOfUnits = 0;
        this.isSeniorsHousing = false;
        this.hasCompaction = false;

        this.allowedChoices = {
            canBeSeniorsHousing: false,
            allowsCompaction: false,
            allowsMultipleCollectionsPerWeek: false,
            allowsMultipleCollectionsPerFortnight: false
        };
        
        // Default properties
        this.binType = 'Individual';
        this.collectionType = 'Kerbside';
        
        // Generation rates (L/week)
        this.wasteGeneration = 0;
        this.recyclingGeneration = 0;
        this.organicsGeneration = 0;
        
        // Results storage
        this.results = {
            waste: {
                generation: 0,
                compactedGeneration: 0,
                binSize: 0,
                collectionsPerWeek: 1,
                numberOfBins: 0,
                spaceRequired: 0
            },
            recycling: {
                generation: 0,
                binSize: 0,
                collectionsPerFortnight: 1,
                numberOfBins: 0,
                spaceRequired: 0
            },
            organic: {
                generation: 0,
                binSize: 0,
                numberOfBins: 0,
                spaceRequired: 0
            },
            total: {
                numberOfBins: 0,
                spaceRequired: 0,
                bulkyWasteSpace: 0
            }
        };
    }

    calculateSpace(binSize, numberOfBins) {
        // Space calculation based on bin size
        const spacePerBin = binSize <= 240 ? 1.0 : 0.9;
        return spacePerBin * numberOfBins;
    }

    calculate() {
        this.calculateWaste();
        this.calculateRecycling();
        this.calculateOrganics();
        this.calculateTotals();
    }

    calculateWaste() {
        const totalWaste = this.wasteGeneration * this.numberOfUnits;
        const compactedWaste = this.hasCompaction ? totalWaste / 2 : totalWaste;
        
        this.results.waste.generation = totalWaste;
        this.results.waste.compactedGeneration = compactedWaste;
        
        // Determine bin size and number based on collection type
        if (this.collectionType === 'Onsite') {
            this.results.waste.binSize = 1100;
        } else {
            this.results.waste.binSize = 240;
        }
        
        this.results.waste.numberOfBins = Math.ceil(compactedWaste / (this.results.waste.binSize * this.results.waste.collectionsPerWeek));
        this.results.waste.spaceRequired = this.calculateSpace(this.results.waste.binSize, this.results.waste.numberOfBins);
    }

    calculateRecycling() {
        const totalRecycling = this.recyclingGeneration * this.numberOfUnits;
        this.results.recycling.generation = totalRecycling;
        this.results.recycling.binSize = this.collectionType === 'Onsite' ? 240 : 240;
        this.results.recycling.numberOfBins = Math.ceil(totalRecycling / (this.results.recycling.binSize * (this.results.recycling.collectionsPerFortnight / 2)));
        this.results.recycling.spaceRequired = this.calculateSpace(this.results.recycling.binSize, this.results.recycling.numberOfBins);
    }

    calculateOrganics() {
        if (this.organicsGeneration > 0) {
            const totalOrganics = this.organicsGeneration * this.numberOfUnits;
            this.results.organic.generation = totalOrganics;
            this.results.organic.binSize = 240;
            this.results.organic.numberOfBins = Math.ceil(totalOrganics / this.results.organic.binSize);
            this.results.organic.spaceRequired = this.calculateSpace(this.results.organic.binSize, this.results.organic.numberOfBins);
        }
    }

    calculateTotals() {
        this.results.total.numberOfBins = 
            this.results.waste.numberOfBins + 
            this.results.recycling.numberOfBins + 
            this.results.organic.numberOfBins;
            
        this.results.total.spaceRequired = 
            this.results.waste.spaceRequired + 
            this.results.recycling.spaceRequired + 
            this.results.organic.spaceRequired;
            
        // Set bulky waste space based on development type
        this.results.total.bulkyWasteSpace = this.getBulkyWasteSpace();
    }

    getBulkyWasteSpace() {
        return 0; // Override in child classes
    }
}

class StandardSingleCalculator extends BaseCalculator {
    constructor() {
        super();
        this.calculatorNo = 1;
        this.binType = 'Individual';
        this.collectionType = 'Kerbside';
        this.wasteGeneration = 240;
        this.recyclingGeneration = 120;
        this.organicsGeneration = 240;
        this.isSeniorsHousing = false;
    }
}

class MDH7OrLessCalculator extends BaseCalculator {
    constructor() {
        super();
        this.calculatorNo = 2;
        this.binType = 'Individual';
        this.collectionType = 'Kerbside';
        this.wasteGeneration = 240;
        this.recyclingGeneration = 120;
        this.organicsGeneration = 240;
    }
}

class MDH8PlusLoopCalculator extends BaseCalculator {
    constructor() {
        super();
        this.calculatorNo = 3;
        this.binType = 'Individual';
        this.collectionType = 'Onsite';
        this.wasteGeneration = 240;
        this.recyclingGeneration = 120;
        this.organicsGeneration = 0;
    }

    getBulkyWasteSpace() {
        return 4;
    }
}

class MDH8PlusNoLoopCalculator extends BaseCalculator {
    constructor() {
        super();
        this.calculatorNo = 4;
        this.binType = 'Communal';
        this.collectionType = 'Onsite';
        this.wasteGeneration = 240;
        this.recyclingGeneration = 120;
        this.organicsGeneration = 0;
    }

    getBulkyWasteSpace() {
        return 4;
    }
}

class ResidentialFlatCalculator extends BaseCalculator {
    constructor() {
        super();
        this.calculatorNo = 5;
        this.binType = 'Communal';
        this.collectionType = 'Onsite';
        this.wasteGeneration = 240;
        this.recyclingGeneration = 80;
        this.organicsGeneration = 0;
    }

    getBulkyWasteSpace() {
        return 4;
    }
}

class NewGen10OrLessCalculator extends BaseCalculator {
    constructor() {
        super();
        this.calculatorNo = 6;
        this.binType = 'Communal';
        this.collectionType = 'Kerbside';
        this.wasteGeneration = 110;
        this.recyclingGeneration = 90;
        this.organicsGeneration = 0;
    }
}

class NewGen11PlusCalculator extends BaseCalculator {
    constructor() {
        super();
        this.calculatorNo = 7;
        this.binType = 'Communal';
        this.collectionType = 'Onsite';
        this.wasteGeneration = 110;
        this.recyclingGeneration = 90;
        this.organicsGeneration = 0;
    }

    getBulkyWasteSpace() {
        return 502;
    }
}

class Trad10OrLessCalculator extends BaseCalculator {
    constructor() {
        super();
        this.calculatorNo = 8;
        this.binType = 'Communal';
        this.collectionType = 'Kerbside';
        this.wasteGeneration = 0.35;
        this.recyclingGeneration = 0.15;
        this.organicsGeneration = 0;
    }
}

class Trad11PlusCalculator extends BaseCalculator {
    constructor() {
        super();
        this.calculatorNo = 9;
        this.binType = 'Communal';
        this.collectionType = 'Onsite';
        this.wasteGeneration = 0.35;
        this.recyclingGeneration = 0.15;
        this.organicsGeneration = 0;
    }

    getBulkyWasteSpace() {
        return 502;
    }
}

// Factory function to create the appropriate calculator
function createCalculator(type) {
    let calculator;
    switch (type) {
        case DEVELOPMENT_TYPES.STANDARD_SINGLE:
            calculator = new StandardSingleCalculator();
            break;
        case DEVELOPMENT_TYPES.MDH_7_OR_LESS:
            calculator = new MDH7OrLessCalculator();
            break;
        case DEVELOPMENT_TYPES.MDH_8_PLUS_LOOP:
            calculator = new MDH8PlusLoopCalculator();
            break;
        case DEVELOPMENT_TYPES.MDH_8_PLUS_NO_LOOP:
            calculator = new MDH8PlusNoLoopCalculator();
            break;
        case DEVELOPMENT_TYPES.RESIDENTIAL_FLAT:
            calculator = new ResidentialFlatCalculator();
            break;
        case DEVELOPMENT_TYPES.NEW_GEN_10_OR_LESS:
            calculator = new NewGen10OrLessCalculator();
            break;
        case DEVELOPMENT_TYPES.NEW_GEN_11_PLUS:
            calculator = new NewGen11PlusCalculator();
            break;
        case DEVELOPMENT_TYPES.TRAD_10_OR_LESS:
            calculator = new Trad10OrLessCalculator();
            break;
        case DEVELOPMENT_TYPES.TRAD_11_PLUS:
            calculator = new Trad11PlusCalculator();
            break;
        default:
            throw new Error('Unknown development type');
    }
    return calculator;
}

export { DEVELOPMENT_TYPES, createCalculator };